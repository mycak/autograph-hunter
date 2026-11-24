import {validate,ranked,PLAYERS,AUTH,amount,isNew,isFresh,drop,safeUrl,isUnderBudget,FAVORITE_PLAYERS} from './core.mjs?v=20261121-opportunities';
import {opportunities,validateComparisons} from './opportunities.mjs?v=20261121-opportunities';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>Number.isFinite(Date.parse(s))?new Intl.DateTimeFormat('pl-PL',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(s)):'Brak';
const price=(n,c='PLN')=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:c}).format(n);
const STORAGE='autograph-hunter:v1';
let server,data,local=false,comparisons={schemaVersion:1,comparisons:[]},comparisonError=null;
const boardDefs=[['zidane','card','05','KARTY TOPPS / PANINI'],['zidane','shirt','05','PODPISANE KOSZULKI'],['ronaldo','card','07','KARTY TOPPS / PANINI'],['ronaldo','shirt','07','PODPISANE KOSZULKI'],['nazario','card','09','KARTY TOPPS / PANINI'],['nazario','shirt','09','PODPISANE KOSZULKI']];
function filters(){const f=new FormData($('filters'));return {search:f.get('search'),source:f.get('source'),auth:f.get('auth'),saleType:f.get('saleType'),sort:f.get('sort'),pl:f.has('pl'),eu:f.has('eu'),newOnly:f.has('newOnly'),dropOnly:f.has('dropOnly')};}
function offerHtml(o,index){
  const cost=amount(o,data.rates?.values),d=drop(o);
  return `<article class="offer${isUnderBudget(o,data.rates?.values)?' under-budget':''}"><span class="offer-rank">${String(index+1).padStart(2,'0')}</span>${o.image?`<img class="offer-image" src="${esc(o.image)}" loading="lazy" referrerpolicy="no-referrer" alt="Zdjęcie przedmiotu: ${esc(o.title)}">`:`<div class="offer-image offer-placeholder" aria-hidden="true">${o.category==='card'?'▤':'♜'}</div>`}<div><div class="offer-tags">${isNew(o)?'<span class="badge new" title="Nowo wykryta w ostatnich 48 godzinach">NEW</span>':''}${d?`<span class="badge drop">↘ ${d.percent}% PRICE DROP</span>`:''}${o.saleType==='auction'?'<span class="badge auction">AUKCJA</span>':''}</div><h4><a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${esc(o.title)} ↗</a></h4><p class="offer-meta">${esc(o.source)} · ${esc(o.sellerCountry??'Kraj nieznany')} · ${o.shipsToPL===true?'Dostawa do PL':o.shipsToPL===false?'Bez dostawy do PL':'Dostawa do ustalenia'}</p><span class="auth-label ${esc(o.authenticity)}">${esc(AUTH[o.authenticity])}</span><details><summary>Dowody i ostatnia kontrola</summary><p>${esc(o.evidenceNote||'Brak zweryfikowanych dowodów autentyczności podpisu.')} ${safeUrl(o.evidenceUrl)?`<a href="${esc(safeUrl(o.evidenceUrl))}" target="_blank" rel="noopener noreferrer">Zobacz dowód ↗</a>`:''}</p><p>Kontrola oferty: ${date(o.lastSeen)}${o.verifiedAt?` · Weryfikacja podpisu: ${date(o.verifiedAt)}`:''}</p></details><div class="costs">${price(o.price,o.currency)} + dostawa ${o.shipping===null?'?':price(o.shipping,o.currency)} + opłaty ${o.fees===null?'?':o.feeQuote?price(o.feeQuote.value,o.feeQuote.currency):price(o.fees,o.currency)}</div><div class="offer-price"><span class="price">${cost?`${cost.complete?'':'<small>od </small>'}${price(cost.pln)}`:`${price(o.price,o.currency)} <small>brak kursu PLN</small>`}</span><button class="history-button" data-history="${esc(o.id)}">Historia ↗</button></div>${d?`<p class="costs">Obniżka ${price(d.value,o.currency)}; poprzednia cena ${price(d.previous,o.currency)}.</p>`:''}</div></article>`;
}
function renderOpportunities(){
  const form=$('opportunity-filters'),f=new FormData(form),all=opportunities(data,comparisons);
  const selected=form.elements.player.value,players=[...new Set(all.map(x=>x.offer.player))];
  const options='<option value="all">Wszyscy z okazjami</option>'+players.map(p=>`<option value="${esc(p)}">${esc(PLAYERS[p])}</option>`).join('');
  if(form.elements.player.innerHTML!==options){form.elements.player.innerHTML=options;form.elements.player.value=players.includes(selected)?selected:'all';}
  const max=f.get('maxPLN'),filtered=opportunities(data,comparisons,{player:form.elements.player.value,category:f.get('category'),auth:f.get('auth'),maxPLN:max!==''?Number(max):null});
  $('opportunity-status').textContent=comparisonError?'Porównania są chwilowo niedostępne. Rankingi ulubionych poniżej nadal działają.':`${filtered.length} ${filtered.length===1?'oferta spełnia':'ofert spełnia'} warunki.${comparisons.checkedAt?' Ostatnia kontrola: '+date(comparisons.checkedAt)+'.':''}`;
  $('opportunity-list').innerHTML=filtered.length?filtered.map(({offer:o,comparison:c,peers,cost,reference,discount,cheapestDiscount,saving},i)=>`<article class="opportunity-card"><header><span class="badge drop">−${Math.floor(discount)}% wobec ${c.basis==='sold'?'sprzedaży':'mediany ofert'}</span><h3>${esc(PLAYERS[o.player])}</h3></header>${offerHtml(o,i)}<div class="comparison-summary"><p>Mediana ${c.basis==='sold'?'potwierdzonych sprzedaży':'cen ofertowych'}: <strong>${cost.complete?'':'od '}${price(reference)}</strong></p><p>Różnica wobec mediany: ${price(saving)} · ${Math.floor(cheapestDiscount)}% poniżej najtańszego porównania.</p><details><summary>Porównania i zgodność (${peers.length})</summary><p>${esc(c.matchDescription)}</p><ul>${peers.map(p=>`<li><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${price(amount(p,data.rates?.values).pln)} — ${c.basis==='sold'?'sprzedaż':'oferta eBay'}</a><span> · kontrola ${date(p.checkedAt)}</span><p>${esc(p.matchNote)}</p></li>`).join('')}</ul><p>${cost.complete?'Uwzględniono zapisane koszty dostawy i opłat.':'Nieznane opłaty, w tym import, nie są uwzględnione; porównujemy zgodny zakres kosztów.'}</p></details></div></article>`).join(''):`<div class="opportunity-empty"><strong>${all.length?'Brak okazji spełniających te filtry.':'Brak potwierdzonych odchyleń ceny.'}</strong><p>${all.length?'Zmień filtry, aby zobaczyć pozostałe przedmioty.':'Pokażemy tu wyłącznie przedmioty spełniające warunki porównania. Oferty bez wystarczających dowodów cenowych nie trafiają do tej sekcji.'}</p></div>`;
}
function render(){
  renderOpportunities();
  const favorites=(data.favoritePlayers??FAVORITE_PLAYERS).filter(p=>Object.hasOwn(PLAYERS,p));
  $('favorite-list').innerHTML=favorites.map(p=>`<a href="#${p}-card"><span aria-hidden="true">★</span> ${esc(PLAYERS[p])}</a>`).join('');
  const sourceSelect=$('filters').elements.source,selectedSource=sourceSelect.value;
  const sourceOptions='<option value="all">Wszystkie źródła</option>'+[...new Set(data.offers.map(o=>o.source))].sort((a,b)=>a.localeCompare(b,'pl')).map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');
  if(sourceSelect.innerHTML!==sourceOptions){sourceSelect.innerHTML=sourceOptions;sourceSelect.value=[...sourceSelect.options].some(o=>o.value===selectedSource)?selectedSource:'all';}
  const f=filters(),active=data.offers.filter(o=>o.active!==false && isFresh(o) && (!o.endAt||Date.parse(o.endAt)>Date.now()));
  $('offer-count').innerHTML=`${String(active.length).padStart(2,'0')}<span>/ aktywnych ofert</span>`;
  $('updated').textContent=data.updatedAt?date(data.updatedAt):'Jeszcze nie uruchomiono';
  $('rate-date').textContent=data.rates?.date?`Kursy NBP: ${data.rates.date}`:'Brak kursów walut';
  const working=(data.sources??[]).some(s=>s.status==='ok');
  const agentScans=(data.sources??[]).filter(s=>s.agent?.checkedAt).sort((a,b)=>Date.parse(b.agent.checkedAt)-Date.parse(a.agent.checkedAt));
  const unverified=active.filter(o=>o.authenticity==='unverified').length;
  $('show-candidates').hidden=!unverified || f.auth==='all';
  $('show-candidates').textContent=`Pokaż znalezione propozycje (${unverified} do weryfikacji) →`;
  $('notice').className='notice';
  $('notice').textContent=local?'Oglądasz lokalny import zapisany w tej przeglądarce. Dane serwera pozostają bez zmian.':working?'Dane z ostatniego skanu. Ocena podpisu wymaga oddzielnej weryfikacji; sprawdź status każdego źródła poniżej.':active.length?'Wczytano oferty z importu. Automatyczne pobieranie nie jest aktywne; aktualność i dowody sprawdzisz przy każdej ofercie.':'Ranking czeka na dane. Automatyczne pobieranie ofert nie jest jeszcze aktywne — eBay wymaga kluczy API, a pozostałe źródła obsługują import ręczny. Możesz już importować, filtrować i porównywać własne oferty.';
  if(!local && agentScans.length && active.length) $('notice').textContent=`Ostatni przegląd agentowy: ${date([agentScans[0].agent.checkedAt,...comparisons.comparisons.map(c=>c.reviewedAt)].sort((a,b)=>Date.parse(b)-Date.parse(a))[0])}. W bazie ${active.length} aktualnych propozycji z obejrzanym podpisem. Widoczny podpis nie oznacza potwierdzonej autentyczności.`;
  $('boards').innerHTML=boardDefs.map(([player,category,num,label])=>{
    const offers=ranked(data,{...f,player,category}),hasAny=data.offers.some(o=>o.player===player&&o.category===category);
    const query=`${PLAYERS[player]} ${category==='card'?'(Topps,Panini) autograph':'signed jersey'}`;
    return `<section id="${player}-${category}" class="board" aria-label="${PLAYERS[player]} — ${label}"><header class="board-header"><span class="board-num">${num}</span><div class="board-title"><h3>${PLAYERS[player]}</h3><p>${label}</p></div><span class="board-count">${offers.length} / 10</span></header>${offers.length?offers.map(offerHtml).join(''):`<div class="empty"><div class="empty-icon" aria-hidden="true">${category==='card'?'▤':'♜'}</div><strong>${hasAny?'Brak ofert spełniających filtry':'Czekamy na pierwszy egzemplarz.'}</strong><p>${hasAny?'Zmień filtry lub zaktualizuj dane. Pokazujemy świeże oferty zgodne z wybranymi filtrami. Zaznacz „Dostawa do Polski”, aby ograniczyć wyniki do ofert z potwierdzoną dostawą.':player==='nazario'?'Oferty R9 pojawią się po pierwszym skanie cen, dostawy i zdjęć podpisów.':'Tutaj pojawi się ranking prawdziwych ofert. Bez przykładowych cen i fikcyjnych ogłoszeń.'}</p><a href="https://www.ebay.pl/sch/i.html?_nkw=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer">Szukaj ręcznie na eBay ↗</a></div>`}</section>`;
  }).join('');
  $('source-list').innerHTML=(data.sources??[]).map(s=>`<article class="source"><h3>${safeUrl(s.url)?`<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`:esc(s.name)}</h3><span class="source-status ${s.status==='ok'||s.agent?'ok':''}">${s.agent?'● Skan agentowy':s.status==='ok'?'● Sprawdzono':s.status==='agent_scheduled'?'◷ Zaplanowany skan agentowy':s.status==='error'?'● Błąd pobierania':s.status==='credentials_required'?'○ Wymaga kluczy API':'○ Import ręczny'}</span>${s.agent?`<p>${esc(s.agent.message)} Ostatnia kontrola: ${date(s.agent.checkedAt)}.</p>`:''}<p>${esc(s.message??'Nie podłączono automatycznej integracji.')}</p>${s.checkedAt?`<p>Próba API: ${date(s.checkedAt)}</p>`:''}${s.lastSuccessAt?`<p>Udany skan API: ${date(s.lastSuccessAt)}</p>`:''}</article>`).join('');
}
function showHistory(id){
  const o=data.offers.find(o=>o.id===id);if(!o)return;
  const h=o.history,values=h.map(p=>p.price),min=Math.min(...values),max=Math.max(...values);
  const pts=h.map((p,i)=>`${15+(h.length>1?i/(h.length-1):.5)*470},${135-(max===min?.5:(p.price-min)/(max-min))*110}`).join(' ');
  $('history-content').innerHTML=`<p class="eyebrow">PRICE HISTORY</p><h2>${esc(o.title)}</h2><p>Historia ceny przedmiotu w ${esc(o.currency)}, bez dostawy i opłat. Kurs waluty nie wpływa na wykrywanie obniżek.</p>${h.length>1?`<svg class="chart" viewBox="0 0 500 160" role="img" aria-label="Wykres ceny przedmiotu; dokładne wartości w tabeli poniżej"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2"/>${h.map((p,i)=>`<circle cx="${pts.split(' ')[i].split(',')[0]}" cy="${pts.split(' ')[i].split(',')[1]}" r="3" fill="currentColor"/>`).join('')}</svg>`:'<p>Za mało punktów do wykresu. Zmiana ceny pojawi się po kolejnym pomiarze.</p>'}<table><thead><tr><th>Data pomiaru</th><th>Cena</th></tr></thead><tbody>${h.map(p=>`<tr><td>${date(p.at)}</td><td>${price(p.price,o.currency)}</td></tr>`).join('')||'<tr><td colspan="2">Brak pomiarów</td></tr>'}</tbody></table>`;
  $('history-dialog').showModal();
}
$('filters').addEventListener('input',()=>data&&render());
$('filters').addEventListener('reset',()=>setTimeout(()=>data&&render(),0));
$('filters').addEventListener('submit',e=>e.preventDefault());
$('opportunity-filters').addEventListener('input',()=>data&&renderOpportunities());
$('opportunity-filters').addEventListener('submit',e=>e.preventDefault());
$('opportunity-list').addEventListener('click',e=>{const b=e.target.closest('[data-history]');if(b)showHistory(b.dataset.history);});
$('boards').addEventListener('click',e=>{const b=e.target.closest('[data-history]');if(b)showHistory(b.dataset.history);});
$('import-open').addEventListener('click',()=>$('import-dialog').showModal());
$('show-candidates').addEventListener('click',()=>{ $('filters').elements.auth.value='all';render();$('rankings').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); });
$('import-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>5e6)throw Error('Plik jest za duży (maks. 5 MB).');
    const incoming=validate(JSON.parse(await file.text()));
    const candidate={...data,offers:incoming.offers};
    localStorage.setItem(STORAGE,JSON.stringify(candidate));data=candidate;local=true;render();$('import-message').textContent=`Zaimportowano ${data.offers.length} ofert. Aby zobaczyć niepotwierdzone podpisy, zmień filtr autentyczności.`;
  }catch(err){$('import-message').textContent=`Import nie powiódł się: ${err.message}`;}
  e.target.value='';
});
$('restore').addEventListener('click',()=>{try{localStorage.removeItem(STORAGE);data=server;local=false;render();$('import-message').textContent='Przywrócono dane serwera.';}catch{$('import-message').textContent='Nie udało się zmienić pamięci przeglądarki.';}});
$('export').addEventListener('click',()=>{if(!data)return;const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='autograph-hunter.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
try{
  const r=await fetch('./data/offers.json',{cache:'no-store'});if(!r.ok)throw Error('Serwer nie udostępnił danych.');server=validate(await r.json());data=server;
  try{const saved=localStorage.getItem(STORAGE);if(saved){data={...server,offers:validate(JSON.parse(saved)).offers};local=true;}}catch{$('import-message').textContent='Nie udało się odtworzyć lokalnego importu. Wczytano dane serwera.';}
  try{const response=await fetch('./data/opportunity-comparisons.json',{cache:'no-store'});if(!response.ok)throw Error('Brak danych porównawczych');comparisons=validateComparisons(await response.json());}catch{comparisonError=true;}
  render();setInterval(render,60000);
}catch(err){$('notice').className='notice error';$('notice').textContent=`Nie udało się załadować rankingów: ${err.message} Odśwież stronę, aby spróbować ponownie.`;}
