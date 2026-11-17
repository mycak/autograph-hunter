import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate,ranked,amount,isNew,drop,safeUrl} from '../site/core.mjs';
const now=Date.parse('2026-11-17T08:00:00Z');
const offer=(changes={})=>({id:'1',source:'Test',player:'zidane',category:'card',title:'Panini Zidane autograph',url:'https://example.com/item/1',image:null,price:100,currency:'EUR',shipping:10,fees:0,sellerCountry:'FR',shipsToPL:true,saleType:'fixed',authenticity:'verified',evidenceUrl:'https://example.com/cert/1',evidenceNote:'Checked signature certificate',verifiedAt:'2026-11-17T07:00:00Z',firstSeen:'2026-11-16T08:00:00Z',lastSeen:'2026-11-17T07:00:00Z',history:[],...changes});
const data=(offers)=>validate({schemaVersion:1,offers,rates:{values:{PLN:1,EUR:4,USD:3}}});
test('ranking compares converted item + delivery + fees, and caps each category at 10',()=>{
 const list=Array.from({length:12},(_,i)=>offer({id:String(i),url:`https://example.com/item/${i}`,price:i+100}));
 list.push(offer({id:'usd',url:'https://example.com/item/usd',price:100,currency:'USD',shipping:5,fees:0}));
 const r=ranked(data(list),{player:'zidane',category:'card'},now);
 assert.equal(r.length,10);assert.equal(r[0].id,'usd');assert.equal(amount(r[0],{USD:3}).pln,315);
});
test('default filter excludes unverified, unknown PL delivery, expired, stale, inactive, auctions and other players',()=>{
 const changes=[{}, {authenticity:'unverified'}, {shipsToPL:null}, {lastSeen:'2026-11-10T08:00:00Z',firstSeen:'2026-11-09T08:00:00Z'}, {endAt:'2026-11-16T09:00:00Z'}, {active:false}, {saleType:'auction'}, {player:'ronaldo'}];
 const list=changes.map((c,i)=>offer({...c,id:String(i),url:`https://example.com/${i}`}));
 assert.deepEqual(ranked(data(list),{player:'zidane',category:'card'},now).map(o=>o.id),['0']);
});
test('EU filter excludes GB and unknown countries; default filter can be relaxed',()=>{
 const list=[offer(),offer({id:'2',url:'https://example.com/2',sellerCountry:'GB'}),offer({id:'3',url:'https://example.com/3',sellerCountry:null,authenticity:'unverified',shipsToPL:null})];
 assert.equal(ranked(data(list),{player:'zidane',category:'card',eu:true},now).length,1);
 assert.equal(ranked(data(list),{player:'zidane',category:'card',auth:'all',pl:false},now).length,3);
});
test('NEW is measured from first detection and expires exactly at 48 hours',()=>{
 assert.equal(isNew(offer(),now),true);
 assert.equal(isNew(offer({firstSeen:'2026-11-15T08:00:00Z'}),now),false);
 assert.equal(isNew(offer({firstSeen:'2026-11-18T08:00:00Z'}),now),false);
});
test('unknown delivery never becomes zero or a complete total',()=>{
 assert.deepEqual(amount(offer({shipping:null,fees:null}),{EUR:4}),{pln:400,complete:false});
 assert.equal(amount(offer(),{}),null);
});
test('price drop uses original currency measurements rather than exchange-rate changes',()=>{
 const o=offer({price:80,history:[{at:'2026-11-16T00:00:00Z',price:100},{at:'2026-11-17T00:00:00Z',price:80}]});
 assert.deepEqual(drop(o),{value:20,percent:20,previous:100});
 assert.equal(drop(offer()),null);
});
test('imports reject unsafe URLs, duplicates, unsubstantiated verified labels and invalid prices',()=>{
 for(const change of [{url:'javascript:alert(1)'},{url:'https://user:pass@example.com/'},{price:-1},{price:'99'},{shipping:undefined},{shipsToPL:'yes'},{evidenceUrl:null},{verifiedAt:'invalid'},{history:[{price:Infinity,at:'today'}]}])assert.throws(()=>data([offer(change)]));
 assert.throws(()=>data([offer(),offer()]));
 assert.equal(safeUrl('javascript:alert(1)'), '');
 assert.doesNotThrow(()=>validate(JSON.parse(readFileSync(new URL('../site/data/example.json',import.meta.url)))));
});
