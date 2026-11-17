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
        self.assertEqual(len(calls),9)
        self.assertTrue(all('deliveryCountry' in u for u in calls[1:]))

if __name__=='__main__':unittest.main()
