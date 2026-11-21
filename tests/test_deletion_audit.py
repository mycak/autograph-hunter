import importlib.util
import pathlib
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('deletion_audit', pathlib.Path(__file__).resolve().parents[1] / 'scripts/audit-ebay-deletions.py')
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


class DeletionAuditTests(unittest.TestCase):
    def test_matches_case_insensitively_and_preserves_uncertainty(self):
        def lookup(item):
            if item == 'missing':
                raise RuntimeError('Provider unavailable')
            return {'seller': {'username': 'Seller'}}
        plan = AUDIT.audit([{'notification_id': 'case', 'username': 'SELLER'}], ['known', 'missing'], lookup)
        self.assertEqual(plan['requests'][0]['matchedListingIds'], ['ebay:known'])
        self.assertEqual(plan['unresolvedListingIds'], ['ebay:missing'])
        self.assertEqual(plan['requests'][0]['disposition'], 'operator_review_required')
        self.assertNotIn('SELLER', str(plan))

    def test_private_output_permissions_and_repo_refusal(self):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / 'private.json'
            path.write_text('old')
            path.chmod(0o644)
            AUDIT.private_write(path, {'requests': []})
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        with self.assertRaises(ValueError):
            AUDIT.private_write(AUDIT.ROOT / 'unsafe.json', {})
