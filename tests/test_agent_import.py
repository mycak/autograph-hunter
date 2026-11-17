import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from refresh import empty_data, run
spec=importlib.util.spec_from_file_location('agent_import',ROOT/'scripts/import-agent.py')
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class AgentImportTests(unittest.TestCase):
    def test_report_preserves_initial_detection_and_api_refresh_preserves_agent_status(self):
        offer=json.loads((ROOT/'site/data/example.json').read_text())['offers'][0]
        offer.update(source='eBay',id='ebay:v1|123|0',firstSeen='2026-11-16T08:00:00Z',lastSeen='2026-11-16T08:00:00Z')
        data=empty_data();data['offers']=[offer]
        report={**offer,'firstSeen':'2026-11-17T08:00:00Z','lastSeen':'2026-11-17T08:00:00Z','price':90}
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/'data.json';path.write_text(json.dumps(data))
            incoming=Path(temp)/'report.json';incoming.write_text(json.dumps({'schemaVersion':1,'offers':[report]}))
            m.import_report(incoming,path)
            changed=json.loads(path.read_text())
            self.assertEqual(changed['offers'][0]['firstSeen'],offer['firstSeen'])
            self.assertEqual(changed['offers'][0]['price'],90)
            self.assertEqual(changed['sources'][0]['agent']['offers'],1)
            def nbp(*args): return [{'effectiveDate':'2026-11-17','rates':[]}]
            from unittest.mock import patch
            with patch.dict('os.environ',{'EBAY_CLIENT_ID':'','EBAY_CLIENT_SECRET':''}):
                updated=run(path,fetch=nbp)
            self.assertEqual(updated['sources'][0]['agent'],changed['sources'][0]['agent'])
    def test_invalid_report_never_overwrites_existing_data(self):
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/'data.json';original=json.dumps(empty_data());path.write_text(original)
            incoming=Path(temp)/'report.json';incoming.write_text('{"schemaVersion":1,"offers":[{"id":"bad"}]}')
            with self.assertRaises(subprocess.CalledProcessError):m.import_report(incoming,path)
            self.assertEqual(path.read_text(),original)
