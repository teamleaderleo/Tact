import json
from pathlib import Path
import unittest
from conformance import Cursor, parse_resource, select_by_identity, join_restored_surface

class Conformance(unittest.TestCase):
    def setUp(self):
        self.fixtures = json.loads(Path(__file__).with_name('fixtures.json').read_text())

    def test_all_four_representatives(self):
        self.assertEqual({x['kind'] for x in self.fixtures['objects']},
                         {'local-terminal', 'resumable-agent-terminal', 'browser', 'cloud-terminal'})
        for row in self.fixtures['objects']:
            parse_resource(row['resource'])
            self.assertIn('durable_identity', row)
            self.assertIn('runtime_binding', row)
            self.assertIn('projection', row)

    def test_daemon_replacement_invalidates_receipt_even_higher_revision(self):
        old = Cursor.parse({'generation':'generation-A', 'revision':'4'})
        self.assertFalse(Cursor.parse({'generation':'generation-B','revision':'900'}).covers(old))
        self.assertTrue(Cursor.parse({'generation':'generation-A','revision':5}).covers(old))
        self.assertFalse(Cursor.parse({'generation':'generation-A','revision':3}).covers(old))

    def test_invalid_cursor_values(self):
        for value in (True, False, 1.5, -1, 2**64, '1.0', '-1', '١', None):
            with self.subTest(value=value), self.assertRaises(ValueError):
                Cursor.parse({'generation':'g', 'revision':value})

    def test_full_u64_without_float_loss(self):
        self.assertEqual(Cursor.parse({'generation':'g','revision':str(2**64-1)}).revision,2**64-1)

    def test_projection_reopen_preserves_cloud_resource(self):
        event = self.fixtures['transitions']['cloud_reproject']
        self.assertEqual(event['before']['resource'], event['after']['resource'])
        self.assertNotEqual(event['before']['panel_id'], event['after']['panel_id'])
        self.assertEqual(event['closed']['projections'], [])
        self.assertTrue(event['closed']['resource_alive'])

    def test_local_close_has_different_owner_semantics(self):
        event = self.fixtures['transitions']['local_close']
        self.assertFalse(event['catalog_resource_survives'])
        self.assertTrue(event['persisted_stable_identity_can_be_adopted_on_restore'])

    def test_restore_reacquires_binding_not_old_runtime(self):
        event = self.fixtures['transitions']['local_restore']
        current = join_restored_surface(event['before'], event['after'])
        self.assertNotEqual(event['before']['panel_id'], current['panel_id'])
        self.assertNotEqual(event['before']['resource'], current['resource'])
        public_only = dict(event['before']); public_only.pop('stable_surface_id')
        with self.assertRaises(ValueError): join_restored_surface(public_only, event['after'])

    def test_colliding_restore_identity_does_not_silently_select(self):
        event = self.fixtures['transitions']['local_restore']
        with self.assertRaises(ValueError):
            join_restored_surface(event['before'], event['after'] * 2)

    def test_names_never_become_identity(self):
        rows = self.fixtures['objects']
        with self.assertRaises(ValueError): select_by_identity(rows, 'Review')
        self.assertEqual(select_by_identity(rows, rows[0]['resource']), rows[0])

    def test_resource_key_may_contain_slash(self):
        self.assertEqual(parse_resource('local/browser/https://example.org/docs')[2], 'https://example.org/docs')

if __name__ == '__main__': unittest.main()
