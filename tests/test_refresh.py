import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('refresh',Path(__file__).resolve().parents[1]/'scripts/refresh.py')
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
NOW='2026-11-17T08:00:00Z'

class PipelineTests(unittest.TestCase):
    def test_expanded_scan_checks_all_28_players_without_changing_favorites(self):
        calls=[]
        def fetch(url,headers=None,body=None):
            calls.append(url)
            return {'access_token':'test'} if 'oauth2' in url else {'itemSummaries':[]}
        config=m.watchlist()
        self.assertEqual(len(config['monitoredPlayers']),28)
        self.assertEqual(config['favoritePlayers'],['zidane','ronaldo','nazario'])
        self.assertEqual(m.collect_ebay('id','secret',NOW,fetch,player_ids=config['monitoredPlayers']),[])
        self.assertEqual(len(calls),57)
        self.assertTrue(any('David+Beckham' in url for url in calls))
    def test_new_player_identity_cannot_be_assigned_from_query_alone(self):
        for player,title in [('messi','Topps Lionel Messi autograph'),('kaka','Panini Kaká auto'),('roberto-carlos','Topps Roberto Carlos autograph')]:
            candidate=m.normalize_ebay({**self.item(),'title':title},player,'card',NOW)
            self.assertEqual(candidate['player'],player)
            self.assertIs(candidate['active'],False)
            self.assertIsNone(m.normalize_ebay(self.item(),player,'card',NOW))
    def test_reviewed_unsigned_patch_cannot_return_from_api_or_merge(self):
        item=self.item()
        item.update(itemWebUrl='https://www.ebay.com/itm/800895835045',title='Zinedine Zidane /10 Patch Juventus UEFA Topps 2025-26 Museum Collection Auto')
        self.assertIsNone(m.normalize_ebay(item,'zidane','card',NOW))
        offer=m.normalize_ebay(self.item(),'zidane','card',NOW)
        offer['url']=item['itemWebUrl']
        self.assertEqual(m.merge([offer],[offer],NOW),[])
    def item(self):
        return {'itemId':'v1|123|0','title':'Panini Zidane autograph','itemWebUrl':'https://www.ebay.com/itm/123','buyingOptions':['FIXED_PRICE'],'price':{'value':'100','currency':'EUR'},'shippingOptions':[{'shippingCost':{'value':'10','currency':'EUR'}}],'itemLocation':{'country':'FR'}}
    def test_only_relevant_signed_items_and_never_auto_verified(self):
        o=m.normalize_ebay(self.item(),'zidane','card',NOW)
        self.assertEqual(o['authenticity'],'unverified')
        self.assertIsNone(o['fees'])
        for title in ['Panini Zidane unsigned','Topps Zidane autograph reprint','Panini Zidane no auto','Panini Zidane printed signature','Ronaldo autograph Panini']:
            item=self.item();item['title']=title
            self.assertIsNone(m.normalize_ebay(item,'zidane','card',NOW))
        self.assertIsNone(m.normalize_ebay({**self.item(),'title':'Panini Ronaldo autograph'},'ronaldo','card',NOW))
    def test_original_currency_prevents_marketplace_conversion_price_drops(self):
        item={**self.item(),'price':{'value':'120','currency':'EUR','convertedFromValue':'100','convertedFromCurrency':'GBP'},
            'shippingOptions':[{'shippingCost':{'value':'12','currency':'EUR','convertedFromValue':'10','convertedFromCurrency':'GBP'}}]}
        candidate=m.normalize_ebay(item,'zidane','card',NOW)
        self.assertEqual((candidate['price'],candidate['shipping'],candidate['currency']),(100,10,'GBP'))
        self.assertIs(candidate['active'],False)
    def test_merge_preserves_first_detection_and_price_history(self):
        o=m.normalize_ebay(self.item(),'zidane','card','2026-11-15T08:00:00Z')
        first=m.merge([], [o], NOW)
        changed={**o,'price':80,'firstSeen':NOW,'lastSeen':NOW}
        result=m.merge(first,[changed],NOW)[0]
        self.assertEqual(result['firstSeen'],'2026-11-15T08:00:00Z')
        self.assertEqual([p['price'] for p in result['history']],[100,80])
        self.assertEqual(len(m.merge([result],[changed],NOW)[0]['history']),2)
        # A currency change starts a new history rather than manufacturing a price drop.
        changed['currency']='USD'
        self.assertEqual(len(m.merge([result],[changed],NOW)[0]['history']),1)
    def test_changed_item_identity_removes_previously_reviewed_evidence(self):
        o=m.normalize_ebay(self.item(),'zidane','card',NOW)
        old={**o,'authenticity':'verified','evidenceNote':'Checked','evidenceUrl':'https://example.com/cert','verifiedAt':NOW}
        self.assertEqual(m.merge([old],[o],NOW)[0]['authenticity'],'verified')
        changed={**o,'title':'Topps Zidane autograph'}
        self.assertEqual(m.merge([old],[changed],NOW)[0]['authenticity'],'unverified')
    def test_new_agent_review_can_downgrade_and_replace_old_evidence(self):
        o=m.normalize_ebay(self.item(),'zidane','card',NOW)
        old={**o,'authenticity':'verified','evidenceNote':'Previously checked certificate',
            'evidenceUrl':'https://example.com/old-cert','verifiedAt':NOW}
        reviewed={**o,'active':True,'signatureEvidence':{'visibleSignature':True,
            'imageUrl':'https://example.com/signature.jpg','note':'Signature on lower card edge'},
            'evidenceNote':'Current review found a certificate discrepancy; verification withdrawn',
            'authenticity':'unverified','evidenceUrl':None,'verifiedAt':None}
        result=m.merge([old],[reviewed],NOW)[0]
        self.assertEqual(result['authenticity'],'unverified')
        self.assertEqual(result['evidenceNote'],reviewed['evidenceNote'])
        self.assertIsNone(result['verifiedAt'])
    def test_bounded_search_never_marks_missing_items_as_sold(self):
        o=m.normalize_ebay(self.item(),'zidane','card',NOW)
        self.assertEqual(m.merge([o],[],NOW),[o])
    def test_api_failure_keeps_previous_listings_and_reports_error(self):
        import json
        d=m.empty_data();d['offers']=[m.normalize_ebay(self.item(),'zidane','card',NOW)]
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)/'offers.json';p.write_text(json.dumps(d))
            def fail(*args,**kwargs): raise RuntimeError('DO NOT LOG SECRET')
            with patch.dict('os.environ',{'EBAY_CLIENT_ID':'x','EBAY_CLIENT_SECRET':'y'}):
                result=m.run(p,fetch=fail)
            self.assertEqual(result['offers'],d['offers'])
            self.assertEqual(result['sources'][0]['status'],'error')
            self.assertNotIn('DO NOT LOG SECRET',p.read_text())
    def test_search_paginates_and_deduplicates(self):
        calls=[]
        def fetch(url,headers=None,body=None):
            calls.append(url)
            if 'oauth2' in url:return {'access_token':'test'}
            if 'offset=0' in url:return {'itemSummaries':[self.item()],'next':'next'}
            return {'itemSummaries':[self.item()]}
        found=m.collect_ebay('id','secret',NOW,fetch)
        self.assertEqual(len(found),1)
        self.assertEqual(len(calls),13)
        self.assertTrue(any('Nazario' in u and 'Ronaldo' in u for u in calls))
        self.assertTrue(all('deliveryCountry' in u for u in calls[1:]))

    def test_api_candidates_never_replace_published_photo_review_or_last_seen(self):
        import json
        old={**m.normalize_ebay(self.item(),'zidane','card',NOW),'active':True,
            'signatureEvidence':{'visibleSignature':True,'imageUrl':'https://example.com/reviewed.jpg','note':'Signature on lower edge'}}
        d=m.empty_data();d['offers']=[old]
        def fetch(url,headers=None,body=None):
            if 'nbp.pl' in url:return [{'effectiveDate':'2026-11-20','rates':[]}]
            if 'oauth2' in url:return {'access_token':'test'}
            return {'itemSummaries':[{**self.item(),'price':{'value':'20','currency':'EUR'}}]}
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)/'offers.json';p.write_text(json.dumps(d));review=Path(temp)/'candidates.json'
            with patch.dict('os.environ',{'EBAY_CLIENT_ID':'id','EBAY_CLIENT_SECRET':'secret'}):
                result=m.run(p,fetch=fetch,candidates_path=review)
            self.assertEqual(result['offers'],[old])
            candidates=json.loads(review.read_text())['offers']
            self.assertEqual(len(candidates),1)
            self.assertIs(candidates[0]['active'],False)
            self.assertIs(candidates[0]['signatureReviewRequired'],True)
            self.assertEqual(candidates[0]['price'],20)
            self.assertEqual(result['sources'][0]['status'],'ok')

    def test_nazario_and_cristiano_do_not_mix(self):
        for name in ['Ronaldo Nazário', 'Ronaldo Nazario', 'Ronaldo R9', 'Ronaldo Fenômeno']:
            item={**self.item(),'title':f'Panini {name} autograph'}
            self.assertEqual(m.normalize_ebay(item,'nazario','card',NOW)['player'],'nazario')
            self.assertIsNone(m.normalize_ebay(item,'ronaldo','card',NOW))
        for name in ['Cristiano Ronaldo', 'Ronaldo', 'Cristiano Ronaldo Nazario dual', 'Ronaldo R9 CR7 dual']:
            item={**self.item(),'title':f'Topps {name} autograph'}
            self.assertIsNone(m.normalize_ebay(item,'nazario','card',NOW))
        item={**self.item(),'title':'Cristiano Ronaldo signed jersey'}
        self.assertEqual(m.normalize_ebay(item,'ronaldo','shirt',NOW)['player'],'ronaldo')
        item['title']='Ronaldo Nazário signed Brazil jersey'
        self.assertEqual(m.normalize_ebay(item,'nazario','shirt',NOW)['category'],'shirt')

if __name__=='__main__':unittest.main()
