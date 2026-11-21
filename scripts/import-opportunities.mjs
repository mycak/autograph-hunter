import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validate,FAVORITE_PLAYERS} from '../site/core.mjs';
import {validateComparisons,opportunities} from '../site/opportunities.mjs';

// Reports contain reviewed listings and their evidence. API discovery files cannot use this path.
const reports=process.argv.slice(2);
if(!reports.length)throw Error('Podaj raporty agenta: offers + comparisons.');
const dataPath=fileURLToPath(new URL('../site/data/offers.json',import.meta.url));
const comparisonPath=fileURLToPath(new URL('../site/data/opportunity-comparisons.json',import.meta.url));
const data=validate(JSON.parse(readFileSync(dataPath))),comparison=validateComparisons(JSON.parse(readFileSync(comparisonPath)));
const incoming=[],rows=[],ids=new Set(),comparisonsSeen=new Set();
for(const path of reports){
  const report=JSON.parse(readFileSync(path));
  const offers=validate({schemaVersion:1,offers:report.offers}).offers;
  const reviews=validateComparisons({schemaVersion:1,comparisons:report.comparisons}).comparisons;
  for(const o of offers){
    if(o.source!=='eBay'||FAVORITE_PLAYERS.includes(o.player)||ids.has(o.id))throw Error('Raport okazji musi dotyczyć odrębnych ofert eBay poza ulubionymi.');
    ids.add(o.id);incoming.push(o);
  }
  for(const row of reviews){
    if(comparisonsSeen.has(row.offerId))throw Error('Powtórzone porównanie.');
    comparisonsSeen.add(row.offerId);rows.push(row);
  }
}
const offerMap=new Map(data.offers.map(o=>[o.id,o]));
for(const o of incoming){
  const old=offerMap.get(o.id),history=old?.currency===o.currency?[...(old.history??[])]:[...(o.history??[])];
  if(!history.length||history.at(-1).at!==o.lastSeen)history.push({at:o.lastSeen,price:o.price});
  offerMap.set(o.id,{...o,firstSeen:old?.firstSeen??o.firstSeen,history:history.slice(-1500)});
}
const rowMap=new Map(comparison.comparisons.map(r=>[r.offerId,r]));
for(const row of rows){if(!ids.has(row.offerId))throw Error('Porównanie bez sprawdzonej oferty w raporcie.');rowMap.set(row.offerId,row);}
for(const o of incoming)if(!comparisonsSeen.has(o.id))throw Error('Oferta bez porównań.');
const now=new Date().toISOString();
const next=validate({...data,updatedAt:now,offers:[...offerMap.values()]});
const nextComparison=validateComparisons({schemaVersion:1,checkedAt:now,comparisons:[...rowMap.values()]});
const eligible=new Set(opportunities(next,nextComparison).map(x=>x.offer.id));
if(incoming.some(o=>!eligible.has(o.id)))throw Error('Raport nie spełnia warunków odchylenia ceny lub kosztów. Dane bez zmian.');
// Validate everything before either staged file is replaced. Publish both in one Git commit.
for(const [path,value] of [[dataPath,next],[comparisonPath,nextComparison]])writeFileSync(path+'.tmp',JSON.stringify(value,null,2)+'\n');
renameSync(dataPath+'.tmp',dataPath);renameSync(comparisonPath+'.tmp',comparisonPath);
console.log(`Imported ${incoming.length} reviewed eBay opportunities.`);
