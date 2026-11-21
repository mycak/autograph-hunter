import {amount,isFresh,safeUrl,EU} from './core.mjs?v=20261121-opportunities';

export const OPPORTUNITY_RULES={minimumDiscountPercent:20,minimumCheapestDiscountPercent:10,minimumComparables:3};
const median=values=>{const a=[...values].sort((a,b)=>a-b),i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2;};
const itemId=url=>{
  try{const u=new URL(url);return /(^|\.)ebay\.(com|pl|de|fr|it|es|co\.uk|com\.au|ca)$/.test(u.hostname)?u.pathname.match(/\/itm\/(?:[^/]+\/)?(\d+)(?:\/|$)/)?.[1]:null;}catch{return null;}
};
const fresh=(stamp,now)=>Number.isFinite(Date.parse(stamp))&&now-Date.parse(stamp)>=-300000&&now-Date.parse(stamp)<72*3600e3;

export function validateComparisons(input){
  if(input?.schemaVersion!==1||!Array.isArray(input.comparisons)||input.comparisons.length>5000)throw Error('Nieprawidłowy raport porównań cen.');
  const ids=new Set();
  for(const row of input.comparisons){
    if(typeof row.offerId!=='string'||ids.has(row.offerId)||typeof row.comparisonKey!=='string'||!row.comparisonKey.trim()||typeof row.matchDescription!=='string'||!row.matchDescription.trim()||!Number.isFinite(Date.parse(row.reviewedAt))||!['asking','sold'].includes(row.basis)||row.independentSellers!==true||!Array.isArray(row.comparables)||row.comparables.length>50)throw Error('Porównanie wymaga opisu zgodności, daty i niezależnych sprzedawców.');
    const physical=new Set();
    for(const c of row.comparables){
      const id=itemId(c.url);
      if(!id||physical.has(id)||!safeUrl(c.imageUrl)||typeof c.matchNote!=='string'||!c.matchNote.trim()||!Number.isFinite(Date.parse(c.checkedAt))||!Number.isFinite(c.price)||c.price<0||!(/^[A-Z]{3}$/.test(c.currency))||![true,false,null].includes(c.shipsToPL))throw Error('Nieprawidłowy lub powtórzony egzemplarz porównawczy eBay.');
      for(const field of ['shipping','fees'])if(c[field]!==null&&(!Number.isFinite(c[field])||c[field]<0))throw Error('Koszt porównania musi być kwotą lub null.');
      if(c.feeQuote!==undefined&&(!Number.isFinite(c.feeQuote?.value)||c.feeQuote.value<0||!/^[A-Z]{3}$/.test(c.feeQuote.currency)||c.fees===null))throw Error('Nieprawidłowa źródłowa wycena opłat.');
      if(row.basis==='sold'&&(c.saleConfirmed!==true||!Number.isFinite(Date.parse(c.soldAt))))throw Error('Sprzedaż wymaga potwierdzonej transakcji i daty.');
      physical.add(id);
    }
    ids.add(row.offerId);
  }
  return input;
}

export function opportunities(data,comparisons,{player='all',category='all',auth='all',maxPLN=null,eu=false}={},now=Date.now()){
  const rules=OPPORTUNITY_RULES,byId=new Map(data.offers.map(o=>[o.id,o])),results=[];
  for(const row of comparisons.comparisons){
    const o=byId.get(row.offerId),ownId=o&&itemId(o.url),cost=o&&amount(o,data.rates?.values);
    if(!o||o.source!=='eBay'||!ownId||o.active===false||o.saleType!=='fixed'||!isFresh(o,now)||(o.endAt&&Date.parse(o.endAt)<=now)||o.shipsToPL!==true||o.shipping===null||!o.sellerCountry||!cost||o.signatureEvidence?.visibleSignature!==true||!fresh(row.reviewedAt,now))continue;
    if((player!=='all'&&o.player!==player)||(category!=='all'&&o.category!==category)||(auth!=='all'&&o.authenticity!==auth)||(eu&&!EU.has(o.sellerCountry))||(maxPLN!==null&&cost.pln>maxPLN))continue;
    const seen=new Set([ownId]);
    const peers=row.comparables.filter(c=>{
      const id=itemId(c.url);
      if(!id||seen.has(id))return false;
      seen.add(id);
      return c.shipsToPL===true&&c.shipping!==null&&c.sellerCountry===o.sellerCountry&&(c.fees===null)===(o.fees===null)&&fresh(c.checkedAt,now)&&amount(c,data.rates?.values)!==null
        &&(row.basis==='sold'?c.saleConfirmed===true&&fresh(c.soldAt,now):c.active===true&&c.saleType==='fixed');
    });
    if(peers.length<rules.minimumComparables)continue;
    const values=peers.map(c=>amount(c,data.rates?.values).pln),reference=median(values),cheapest=Math.min(...values);
    if(reference<=0||cheapest<=0)continue;
    const discount=(reference-cost.pln)/reference*100,cheapestDiscount=(cheapest-cost.pln)/cheapest*100;
    if(discount+1e-8<rules.minimumDiscountPercent||cheapestDiscount+1e-8<rules.minimumCheapestDiscountPercent)continue;
    results.push({offer:o,comparison:row,peers,cost,reference,cheapest,discount,cheapestDiscount,saving:reference-cost.pln});
  }
  return results.sort((a,b)=>b.discount-a.discount||a.cost.pln-b.cost.pln||a.offer.id.localeCompare(b.offer.id));
}
