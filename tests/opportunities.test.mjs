import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {opportunities,validateComparisons,OPPORTUNITY_RULES} from '../site/opportunities.mjs';
import {PLAYERS,FAVORITE_PLAYERS,amount} from '../site/core.mjs';
const stamp='2026-11-21T10:00:00Z',now=Date.parse(stamp);
const o={id:'ebay:v1|100000000001|0',source:'eBay',player:'figo',category:'card',url:'https://www.ebay.com/itm/100000000001',price:50,currency:'EUR',shipping:10,fees:null,sellerCountry:'DE',shipsToPL:true,saleType:'fixed',active:true,lastSeen:stamp,authenticity:'unverified',signatureEvidence:{visibleSignature:true}};
const peer=(id,price)=>({id:String(id),url:`https://www.ebay.de/itm/${id}`,price,currency:'EUR',shipping:10,fees:null,sellerCountry:'DE',shipsToPL:true,active:true,saleType:'fixed',checkedAt:stamp,imageUrl:'https://i.ebayimg.com/photo.jpg',matchNote:'Same year, base, raw autograph.'});
const row={offerId:o.id,comparisonKey:'2025-Panini-base-Figo-raw',matchDescription:'Identical base card and autograph, three other sellers.',reviewedAt:stamp,basis:'asking',independentSellers:true,comparables:[peer(100000000002,90),peer(100000000003,100),peer(100000000004,110)]};
const d=changes=>({offers:[{...o,...changes}],rates:{values:{EUR:4,PLN:1}}});
const c=changes=>validateComparisons({schemaVersion:1,comparisons:[{...row,...changes}]});
test('28 monitored players retain exactly three favorites',()=>{
 const watch=JSON.parse(readFileSync(new URL('../site/data/watchlist.json',import.meta.url)));
 assert.equal(watch.monitoredPlayers.length,28);assert.equal(new Set(watch.monitoredPlayers).size,28);
 assert.deepEqual(watch.favoritePlayers,FAVORITE_PLAYERS);
 assert.deepEqual(Object.fromEntries(Object.entries(watch.players).map(([id,p])=>[id,p.name])),PLAYERS);
 for(const [key,value] of Object.entries(OPPORTUNITY_RULES))assert.equal(watch.opportunityRules[key],value);
});
test('only documented deviations qualify, using price plus shipping and converted costs',()=>{
 const [x]=opportunities(d(),c(),{},now);assert.equal(x.reference,440);assert.equal(x.cost.pln,240);assert.equal(x.peers.length,3);
 assert.equal(opportunities(d({price:95}),c(),{},now).length,0);
 assert.equal(opportunities(d({source:'COMC'}),c(),{},now).length,0);
 assert.equal(opportunities(d(),{schemaVersion:1,comparisons:[]},{},now).length,0);
});
test('overpriced outliers cannot manufacture a deal beside a near-identical lowest price',()=>{
 const comparison=c({comparables:[peer(100000000002,51),peer(100000000003,200),peer(100000000004,300)]});
 assert.equal(opportunities(d(),comparison,{},now).length,0);
});
test('twenty percent threshold is inclusive and does not round a smaller discount up',()=>{
 assert.equal(opportunities(d({price:78}),c(),{},now).length,1);
 assert.equal(opportunities(d({price:78.01}),c(),{},now).length,0);
});
test('unknown shipping, mismatched cost scope and countries, expired or insufficient comparisons are excluded',()=>{
 for(const change of [{shipping:null},{shipsToPL:null},{saleType:'auction'},{active:false},{lastSeen:'2026-11-01T00:00:00Z'},{sellerCountry:'US'},{fees:0},{endAt:'2026-11-20T00:00:00Z'}])assert.equal(opportunities(d(change),c(),{},now).length,0);
 for(const change of [{shipping:null},{sellerCountry:'US'},{fees:0},{active:false},{checkedAt:'2026-11-01T00:00:00Z'}])assert.equal(opportunities(d(),c({comparables:row.comparables.map((p,i)=>i===0?{...p,...change}:p)}),{},now).length,0);
 assert.equal(opportunities(d(),c({comparables:row.comparables.slice(0,2)}),{},now).length,0);
});
test('duplicate physical items and claiming unconfirmed sales are rejected',()=>{
 assert.throws(()=>c({comparables:[...row.comparables,{...row.comparables[0],url:row.comparables[0].url+'?tracking=duplicate'}]}));
 assert.throws(()=>c({basis:'sold'}));
 assert.throws(()=>c({independentSellers:false}));
 assert.equal(opportunities(d(),c({comparables:[...row.comparables.slice(0,2),{...row.comparables[2],url:o.url}]}),{},now).length,0);
});
test('filters act on actual opportunities without altering favorite rankings',()=>{
 assert.equal(opportunities(d(),c(),{player:'figo',category:'card',maxPLN:240},now).length,1);
 for(const f of [{player:'messi'},{category:'shirt'},{auth:'verified'},{maxPLN:239}])assert.equal(opportunities(d(),c(),f,now).length,0);
});
test('an import fee quoted in PLN stays in PLN when the item exchange rate changes',()=>{
 const item={...o,feeQuote:{value:10.95,currency:'PLN'},fees:2.7375};
 assert.deepEqual(amount(item,{EUR:4,PLN:1}),{pln:250.95,complete:true});
 assert.deepEqual(amount(item,{EUR:5,PLN:1}),{pln:310.95,complete:true});
 assert.equal(amount(item,{EUR:5}),null);
});
