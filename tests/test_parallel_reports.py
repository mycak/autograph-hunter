import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('parallel_reports',ROOT/'scripts/merge-agent-reports.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class ParallelReportsTests(unittest.TestCase):
    def test_conflicting_agent_reports_do_not_overwrite_previous_combination(self):
        sample=json.loads((ROOT/'site/data/example.json').read_text())
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder);a=p/'a.json';b=p/'b.json';out=p/'combined.json'
            a.write_text(json.dumps(sample));b.write_text(json.dumps(sample));out.write_text('preserve me')
            with self.assertRaisesRegex(ValueError,'duplicate listing'):m.combine([a,b],out)
            self.assertEqual(out.read_text(),'preserve me')
            other=json.loads(json.dumps(sample));other['offers'][0]['id']='other-source'
            other['offers'][0]['url']='https://example.com/other-item'
            b.write_text(json.dumps(other))
            self.assertEqual(m.combine([a,b],out),2)
            self.assertEqual(len(json.loads(out.read_text())['offers']),2)
