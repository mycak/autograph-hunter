export const EU = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '));
export const PLAYERS = {zidane: 'Zinedine Zidane', ronaldo: 'Cristiano Ronaldo'};
export const AUTH = {verified:'Potwierdzony', probable:'Prawdopodobny', unverified:'Niezweryfikowany'};
export const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch { return ''; } };
export const isNew = (o, now=Date.now()) => now-Date.parse(o.firstSeen)>=0 && now-Date.parse(o.firstSeen)<48*3600e3;
export const isFresh = (o, now=Date.now()) => now-Date.parse(o.lastSeen)>=-300e3 && now-Date.parse(o.lastSeen)<72*3600e3;
export function validate(data) {
  if (!data || data.schemaVersion!==1 || !Array.isArray(data.offers) || data.offers.length>5000) throw Error('Oczekiwany obiekt schemaVersion: 1 i tablica offers (maks. 5000).');
  const ids = new Set();
  const urls = new Set();
  const money = x => typeof x==='number' && Number.isFinite(x) && x>=0 && x<=1e9;
  const offers = data.offers.map((o,i)=>{
    const fail = message => {throw Error(`Oferta ${i+1}: ${message}`);};
    if (!o || typeof o.id!=='string' || !o.id || o.id.length>200 || ids.has(o.id)) fail('nieprawidłowe lub powtórzone id.');
    if (!Object.hasOwn(PLAYERS,o.player) || !['card','shirt'].includes(o.category)) fail('nieznany piłkarz lub typ przedmiotu.');
    if (typeof o.title!=='string' || !o.title.trim() || o.title.length>500 || typeof o.source!=='string' || !o.source.trim() || o.source.length>80) fail('brak tytułu lub źródła.');
    const url=safeUrl(o.url);
    if (!url || urls.has(url)) fail('wymagany unikatowy adres HTTPS konkretnej oferty.');
    if (!money(o.price) || !/^[A-Z]{3}$/.test(o.currency || '')) fail('nieprawidłowa cena lub waluta.');
    for (const k of ['shipping','fees']) if (o[k]!==null && !money(o[k])) fail(`${k} musi być kwotą lub null (nieznane).`);
    if (![true,false,null].includes(o.shipsToPL) || !['fixed','auction'].includes(o.saleType)) fail('nieprawidłowa dostawa lub rodzaj sprzedaży.');
    if (!Object.hasOwn(AUTH,o.authenticity)) fail('nieprawidłowa ocena autentyczności.');
    if (o.authenticity==='verified' && (!safeUrl(o.evidenceUrl) || !o.evidenceNote || !Number.isFinite(Date.parse(o.verifiedAt)))) fail('potwierdzony autograf wymaga dowodu, notatki i daty weryfikacji.');
    if (!Number.isFinite(Date.parse(o.firstSeen)) || !Number.isFinite(Date.parse(o.lastSeen)) || Date.parse(o.firstSeen)>Date.parse(o.lastSeen)) fail('nieprawidłowe daty wykrycia i kontroli.');
    if (o.endAt && !Number.isFinite(Date.parse(o.endAt))) fail('nieprawidłowy termin końca oferty.');
    const history = o.history ?? [];
    if (!Array.isArray(history) || history.length>1500 || history.some(p=>!p || !money(p.price) || !Number.isFinite(Date.parse(p.at)))) fail('nieprawidłowa historia cen.');
    ids.add(o.id); urls.add(url);
    return {...o,url,image:safeUrl(o.image),history:[...history].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),sellerCountry:typeof o.sellerCountry==='string'?o.sellerCountry.toUpperCase():null};
  });
  return {...data, offers};
}
export function amount(o,rates={PLN:1}) {
  const rate=rates[o.currency];
  if (typeof rate!=='number' || !Number.isFinite(rate) || rate<=0) return null;
  return {pln:Math.round((o.price+(o.shipping??0)+(o.fees??0))*rate*100)/100,complete:o.shipping!==null && o.fees!==null};
}
export const isUnderBudget = (o,rates,limit=800) => {
  const cost=amount(o,rates);
  return o.saleType!=='auction' && cost!==null && cost.pln<limit;
};
export function drop(o) {
  const previous = o.history.length>1 ? o.history.at(-2).price : null;
  return previous>o.price ? {value:previous-o.price,percent:Math.round((previous-o.price)/previous*100),previous} : null;
}
export function ranked(data, {player,category,auth='all',eu=false,pl=true,newOnly=false,dropOnly=false,saleType='fixed',search='',sort='price'}={},now=Date.now()) {
  return data.offers.filter(o=>o.player===player && o.category===category && o.active!==false && (!o.endAt || Date.parse(o.endAt)>now) && isFresh(o,now)
    && (auth==='all'||o.authenticity===auth) && (!eu||EU.has(o.sellerCountry)) && (!pl||o.shipsToPL===true) && (!newOnly||isNew(o,now)) && (!dropOnly||drop(o))
    && (saleType==='all'||o.saleType===saleType) && o.title.toLocaleLowerCase('pl').includes(search.toLocaleLowerCase('pl')))
    .sort((a,b)=> sort==='newest' ? Date.parse(b.firstSeen)-Date.parse(a.firstSeen) : (amount(a,data.rates?.values)?.pln??Infinity)-(amount(b,data.rates?.values)?.pln??Infinity) || a.id.localeCompare(b.id)).slice(0,10);
}
