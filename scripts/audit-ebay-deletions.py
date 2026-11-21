"""Privately compare deletion requests with sellers of stored eBay listings.

This produces an operator review plan, never completes requests or changes offers.
All output files must stay outside the public repository.
"""
import argparse
import base64
import concurrent.futures
import json
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ITEM = re.compile(r'ebay:(v1\|\d+\|\d+)')


def inventory(root, extra_paths=()):
    ids = set()
    # Include old and inactive records, not just today's published JSON.
    history = subprocess.run(['git', 'log', '--all', '--format=', '-p', '--', '*.json'],
                             cwd=root, check=True, capture_output=True, text=True).stdout
    ids.update(ITEM.findall(history))
    for directory in [root / 'site', *extra_paths]:
        for path in Path(directory).rglob('*.json'):
            if any(x in path.parts for x in ['node_modules', '.git']):
                continue
            ids.update(ITEM.findall(path.read_text(errors='replace')))
    return sorted(ids)


def private_write(path, value):
    path = Path(path).resolve()
    if path.is_relative_to(ROOT):
        raise ValueError('Private audit output must be outside the repository')
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    os.fchmod(descriptor, 0o600)
    with os.fdopen(descriptor, 'w') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def audit(cases, item_ids, get_item, historical_owner=None):
    owners, unresolved, historical = {}, [], []
    def inspect(item_id):
        try:
            item = get_item(item_id)
            username = item.get('seller', {}).get('username')
            return item_id, username.casefold() if username else None
        except Exception:
            return item_id, None
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for item_id, owner in pool.map(inspect, item_ids):
            if owner:
                owners.setdefault(owner, []).append('ebay:' + item_id)
            elif historical_owner and item_id.split('|')[1] == historical_owner.get('itemId') and historical_owner.get('username'):
                owners.setdefault(historical_owner['username'].casefold(), []).append('ebay:' + item_id)
                historical.append('ebay:' + item_id)
            else:
                unresolved.append('ebay:' + item_id)
    return {
        'checkedAt': datetime.now(timezone.utc).isoformat(),
        'inventoryCount': len(item_ids),
        'resolvedCount': len(item_ids) - len(unresolved),
        'unresolvedListingIds': unresolved,
        'historicalOwnerListingIds': historical,
        'requests': [{
            'notificationId': case['notification_id'],
            'matchedListingIds': owners.get((case.get('username') or '').casefold(), []),
            'disposition': 'operator_review_required',
        } for case in cases],
        'limitations': [
            'Matching uses current seller usernames, not immutable eBay account IDs.',
            'Historical owner evidence can predate an account rename and requires operator review.',
            'Unresolved listings prevent a complete no-stored-data conclusion.',
            'Remote Actions artifacts, remote-only Git history and other backups require separate checks.',
            'This plan never certifies erasure or changes request status.',
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cases', required=True, type=Path)
    parser.add_argument('--scan-path', action='append', default=[], type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--owner-evidence', type=Path, help='Private, dated owner evidence for an unavailable item')
    args = parser.parse_args()
    env = dict(line.split('=', 1) for line in (ROOT / '.env').read_text().splitlines()
               if line and not line.startswith('#') and '=' in line)
    def fetch(url, headers, body=None):
        with urlopen(Request(url, data=body, headers=headers), timeout=30) as response:
            return json.load(response)
    token = fetch('https://api.ebay.com/identity/v1/oauth2/token', {
        'Authorization': 'Basic ' + base64.b64encode((env['EBAY_CLIENT_ID'] + ':' + env['EBAY_CLIENT_SECRET']).encode()).decode(),
        'Content-Type': 'application/x-www-form-urlencoded',
    }, urlencode({'grant_type': 'client_credentials', 'scope': 'https://api.ebay.com/oauth/api_scope'}).encode())['access_token']
    def get_item(item_id):
        return fetch('https://api.ebay.com/buy/browse/v1/item/' + quote(item_id, safe=''), {
            'Authorization': 'Bearer ' + token, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE',
        })
    historical_owner = json.loads(args.owner_evidence.read_text()) if args.owner_evidence else None
    plan = audit(json.loads(args.cases.read_text()), inventory(ROOT, args.scan_path), get_item, historical_owner)
    private_write(args.out, plan)
    print(json.dumps({'inventoried': plan['inventoryCount'], 'resolved': plan['resolvedCount'],
                      'unresolved': len(plan['unresolvedListingIds']),
                      'requests': len(plan['requests']),
                      'requestsWithMatches': sum(bool(x['matchedListingIds']) for x in plan['requests'])}))


if __name__ == '__main__':
    main()
