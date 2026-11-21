"""Daily data refresh. Standard library only; never scrape blocked marketplaces."""
import argparse
import base64
import copy
import json
import os
from pathlib import Path
import re
import sys
import unicodedata
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'site/data/offers.json'

def watchlist():
    return json.loads((ROOT/'site/data/watchlist.json').read_text())

def excluded_offer(offer):
    """Keep reviewed false positives out of both API and agent imports."""
    exclusions=json.loads((ROOT/'site/data/excluded-offers.json').read_text())
    blocked={e['itemId'] for e in exclusions if e['source']=='eBay'}
    item_id=re.search(r'/itm/(?:[^/]+/)?(\d+)',offer.get('url',offer.get('itemWebUrl','')))
    return bool(item_id and item_id[1] in blocked)

SOURCES = [
    ('eBay', 'https://www.ebay.pl', 'credentials_required', 'Oficjalne Browse API. Dodaj klucze produkcyjne w sekretach repozytorium.'),
    ('Vinted', 'https://www.vinted.pl', 'manual', 'Import ręczny; automatyczny dostęp nie został podłączony.'),
    ('OLX', 'https://www.olx.pl', 'manual', 'Import ręczny; automatyczny dostęp nie został podłączony.'),
    ('Allegro', 'https://allegro.pl', 'manual', 'Import ręczny; integracja API nie została podłączona.'),
    ('Allegro Lokalnie', 'https://allegrolokalnie.pl', 'agent_scheduled', 'Codzienny skan agentowy o 08:00 czasu polskiego. Karty i koszulki; wymagane zdjęcie podpisu. Pierwszy skan jeszcze nie został wykonany.'),
    ('Catawiki', 'https://www.catawiki.com', 'agent_scheduled', 'Codzienny skan agentowy o 08:00 czasu polskiego. Aukcje w osobnym filtrze, bez alertu okazji na podstawie bieżącej stawki. Pierwszy skan jeszcze nie został wykonany.'),
    ('COMC', 'https://www.comc.com', 'agent_scheduled', 'Codzienny skan agentowy o 08:00 czasu polskiego. Karty Topps/Panini; cena z dostawą do Polski i znanymi opłatami. Pierwszy skan jeszcze nie został wykonany.'),
    ('Fanatics Collect', 'https://www.fanaticscollect.com', 'manual', 'Import ręczny kart i aukcji.'),
    ('Icons.com', 'https://www.icons.com', 'agent_scheduled', 'Codzienny skan agentowy o 08:00 czasu polskiego. Koszulki wszystkich trzech piłkarzy; pomijaj wyprzedane i niepodpisane produkty.'),
    ('All Star Signings', 'https://allstarsignings.com', 'agent_scheduled', 'Codzienny skan agentowy o 08:00 czasu polskiego. Koszulki wszystkich trzech piłkarzy; sprawdzaj wariant, zdjęcie podpisu i koszty importu.'),
    ('Colectin', 'https://www.colectin.com', 'manual', 'Import ręczny; certyfikat dodany przez sprzedawcę wymaga kontroli.'),
    ('MySlabs', 'https://www.myslabs.com', 'manual', 'Import ręczny; grading karty nie zawsze obejmuje podpis.'),
    ('Goldin', 'https://goldin.co', 'manual', 'Import ręczny; uwzględnij prowizję domu aukcyjnego.'),
    ('Whatnot', 'https://www.whatnot.com', 'manual', 'Import ręczny aukcji i sprzedaży na żywo.'),
    ('SportsMemorabilia', 'https://www.sportsmemorabilia.com', 'manual', 'Import ręczny podpisanych pamiątek.'),
]

def stamp():
    return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')

def request_json(url, headers=None, body=None):
    request = Request(url, data=body, headers={'Accept':'application/json', 'User-Agent':'AutographHunter/1.0', **(headers or {})})
    with urlopen(request, timeout=30) as response:
        return json.load(response)

def empty_data():
    return {'schemaVersion':1, 'updatedAt':None, 'rates':{'date':None,'values':{'PLN':1}},
            'offers':[], 'sources':[dict(name=n,url=u,status=s,message=m,checkedAt=None,lastSuccessAt=None) for n,u,s,m in SOURCES]}

def money(value):
    result = float(value)
    if result < 0 or result > 1e9 or result != result:
        raise ValueError('Invalid amount')
    return result

def source_amount(value):
    """Keep original listing currency so marketplace conversions do not manufacture price drops."""
    if value.get('convertedFromValue') is not None and value.get('convertedFromCurrency'):
        return money(value['convertedFromValue']),value['convertedFromCurrency']
    return money(value['value']),value['currency']

def normalize_ebay(item, player, category, now):
    if excluded_offer(item):
        return None
    title = item.get('title', '')
    low = title.lower()
    # Search results can contain unrelated items, facsimiles, and blank cards.
    if re.search(r'\b(facsimile|reprint|unsigned|non auto|no auto|preprint|pre-print|printed signature|digital card|autopen|machine signed|signature style|ohne autogramm)\b', low):
        return None
    if not re.search(r'\b(auto(?:graph(?:ed)?)?|autogramm|handsigniert|signiert|signed|signature[s]?)\b', low):
        return None
    if player == 'zidane' and 'zidane' not in low:
        return None
    identity = ''.join(c for c in unicodedata.normalize('NFKD', low) if not unicodedata.combining(c))
    nazario = bool(re.search(r'\b(nazario|r9|fenomeno)\b', identity))
    if player == 'ronaldo' and ('cristiano' not in low or 'ronaldo' not in low or nazario):
        return None
    if player == 'nazario' and ('ronaldo' not in low or not nazario or re.search(r'\b(cristiano|cr7)\b', identity)):
        return None
    if category == 'card' and not any(b in low for b in ['topps', 'panini']):
        return None
    if category == 'shirt':
        if not any(b in low for b in ['shirt', 'jersey', 'trikot']) or re.search(r'\b(poster|print|photo|foto|druck|plakat)\b',low):
            return None
    if 'FIXED_PRICE' not in item.get('buyingOptions', []):
        return None
    p = item.get('price')
    if not p or not item.get('itemId') or not item.get('itemWebUrl'):
        return None
    price,currency = source_amount(p)
    shipping = None
    for option in item.get('shippingOptions', []):
        cost = option.get('shippingCost', {})
        if cost.get('value') is not None:
            val,cost_currency=source_amount(cost)
            if cost_currency != currency:
                continue
            shipping = val if shipping is None else min(shipping, val)
    return dict(id='ebay:'+item['itemId'], source='eBay', player=player, category=category,
                title=title, url=item['itemWebUrl'], image=item.get('image',{}).get('imageUrl'),
                price=price, currency=currency, shipping=shipping, fees=None,
                sellerCountry=item.get('itemLocation',{}).get('country'), shipsToPL=None,
                saleType='fixed', authenticity='unverified', evidenceUrl=None, verifiedAt=None,
                evidenceNote='Pobrano przez API; opis sprzedawcy ani program eBay nie potwierdzają podpisu.',
                firstSeen=now,lastSeen=now,active=False,signatureReviewRequired=True,
                endAt=item.get('itemEndDate'),history=[])

def collect_ebay(client, secret, now, fetch=request_json):
    credentials=base64.b64encode((client+':'+secret).encode()).decode()
    token=fetch('https://api.ebay.com/identity/v1/oauth2/token',
                {'Authorization':'Basic '+credentials,'Content-Type':'application/x-www-form-urlencoded'},
                urlencode({'grant_type':'client_credentials','scope':'https://api.ebay.com/oauth/api_scope'}).encode())['access_token']
    headers={'Authorization':'Bearer '+token, 'X-EBAY-C-MARKETPLACE-ID':'EBAY_DE',
             'X-EBAY-C-ENDUSERCTX':'contextualLocation=country%3DPL'}
    found={}
    favorites=watchlist()
    for player in favorites['favoritePlayers']:
        name=favorites['players'][player]['query']
        for category, terms in [('card','(Topps,Panini) (autograph,auto,signed,signature,autogramm)'),('shirt','(signed,autograph,autogramm,signiert) (shirt,jersey,trikot)')]:
            for offset in range(0,1000,200):
                params={'q':name+' '+terms,'filter':'buyingOptions:{FIXED_PRICE},deliveryCountry:PL',
                        'sort':'price','limit':200,'offset':offset}
                payload=fetch('https://api.ebay.com/buy/browse/v1/item_summary/search?'+urlencode(params),headers)
                # Never report an API-level failure as an empty successful result.
                if payload.get('errors') or any(w.get('errorId') in [12004,12006] for w in payload.get('warnings',[])):
                    raise ValueError('eBay rejected a search parameter')
                for item in payload.get('itemSummaries',[]):
                    offer=normalize_ebay(item,player,category,now)
                    if offer:
                        found[offer['id']]=offer
                if not payload.get('next'):
                    break
    return list(found.values())

def merge(previous, incoming, now):
    offers={o['id']:copy.deepcopy(o) for o in previous if not excluded_offer(o)}
    by_url={o['url']:o['id'] for o in offers.values()}
    for offer in incoming:
        if excluded_offer(offer):
            continue
        old=offers.get(offer['id'])
        if old is None and offer['url'] in by_url:
            old=offers[by_url[offer['url']]]
        current=copy.deepcopy(offer)
        if old:
            current['id']=old['id']
            current['firstSeen']=old['firstSeen']
            history=copy.deepcopy(old.get('history',[])) if old['currency']==current['currency'] else []
            # Preserve reviewed evidence only while the identity of the item is unchanged.
            if not current.get('signatureEvidence') and current.get('authenticity')=='unverified' and all(old.get(k)==current.get(k) for k in ['title','url','image','player','category']):
                for key in ['authenticity','evidenceUrl','evidenceNote','verifiedAt']:
                    if key in old:
                        current[key]=old[key]
        else:
            history=copy.deepcopy(current.get('history',[]))
        if not history or history[-1].get('at') != current['lastSeen']:
            history.append({'at':current['lastSeen'],'price':current['price']})
        current['history']=history[-1500:]
        offers[current['id']]=current
        by_url[current['url']]=current['id']
    # Missing from a bounded search is not proof an item sold. UI excludes stale items after 72h.
    return sorted(offers.values(), key=lambda o:o['id'])

def run(path=DATA, import_path=None, fetch=request_json, candidates_path=None):
    data=json.loads(path.read_text()) if path.exists() else empty_data()
    now=stamp()
    data['updatedAt']=now
    data['favoritePlayers']=watchlist()['favoritePlayers']
    try:
        table=fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json')[0]
        data['rates']={'date':table['effectiveDate'],'values':{'PLN':1,**{r['code']:r['mid'] for r in table['rates']}}}
        data['rates']['status']='ok'
    except Exception:
        data['rates']['status']='error'
        print('NBP: refresh failed; preserving previous exchange rates.',file=sys.stderr)
    if import_path:
        incoming=json.loads(Path(import_path).read_text())['offers']
        data['offers']=merge(data['offers'],incoming,now)
    client,secret=os.getenv('EBAY_CLIENT_ID'),os.getenv('EBAY_CLIENT_SECRET')
    source=next(s for s in data['sources'] if s['name']=='eBay')
    source['checkedAt']=now
    if client and secret:
        try:
            offers=collect_ebay(client,secret,now,fetch)
            # API is a discovery stage, never a substitute for visual review.
            # Preserve published prices, lastSeen and evidence until an agent reviews the offer.
            if candidates_path:
                target=Path(candidates_path)
                target.parent.mkdir(parents=True,exist_ok=True)
                target.write_text(json.dumps({'schemaVersion':1,'collectedAt':now,
                    'favoritePlayers':data['favoritePlayers'],'offers':offers},ensure_ascii=False,indent=2)+'\n')
            source.update(status='ok',message=f'Browse API: {len(offers)} kandydatów do kontroli zdjęć. Maks. 1000 wyników na kategorię. Publikacja i alerty dopiero po sprawdzeniu podpisu przez agenta.',lastSuccessAt=now)
        except Exception:
            # No exception body or request headers: they may contain credentials.
            source.update(status='error',message='Pobranie eBay nie powiodło się. Zachowano wcześniejsze dane; sprawdź klucze i dostęp produkcyjny Browse API.')
            print('eBay: refresh failed; preserving previous listings.',file=sys.stderr)
    else:
        source.update(status='credentials_required',message='Pobieranie przez API nieaktywne: brak EBAY_CLIENT_ID / EBAY_CLIENT_SECRET. Dostęp produkcyjny Browse API może wymagać zatwierdzenia przez eBay.')
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix('.tmp')
    temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    temp.replace(path)
    print('Data updated. eBay status: '+source['status'])
    return data

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--import-file',type=Path)
    parser.add_argument('--candidates-file',type=Path,help='Private review report; API candidates are never published as active offers')
    args=parser.parse_args()
    if args.import_file:
        # A single validator is shared with the UI and validates before any file writes.
        import subprocess
        subprocess.run(['node',str(ROOT/'scripts/validate.mjs'),str(args.import_file)],check=True)
    run(import_path=args.import_file,candidates_path=args.candidates_file)
