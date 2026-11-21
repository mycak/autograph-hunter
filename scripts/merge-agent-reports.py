"""Validate independent market reports and combine them without modifying published data."""
import argparse
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def combine(paths, output):
    offers, ids, urls = [], set(), set()
    for path in paths:
        subprocess.run(['node', str(ROOT/'scripts/validate.mjs'), str(path)], check=True)
        report = json.loads(Path(path).read_text())
        for offer in report['offers']:
            if offer['id'] in ids or offer['url'] in urls:
                raise ValueError('Conflicting reports: duplicate listing '+offer['id'])
            ids.add(offer['id']); urls.add(offer['url']); offers.append(offer)
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix('.tmp')
    temp.write_text(json.dumps({'schemaVersion':1,'offers':offers},ensure_ascii=False,indent=2)+'\n')
    temp.replace(output)
    return len(offers)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('reports', nargs='+', type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    print('Combined reviewed offers:', combine(args.reports, args.out))
