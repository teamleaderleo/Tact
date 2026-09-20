import copy
from datetime import datetime, timezone
import json
from pathlib import Path
import unittest
from current import derive, render
from link_ledger import facts

NOW = datetime(2026, 9, 20, 15, 0, tzinfo=timezone.utc)


class CurrentTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((Path(__file__).parent / "fixture.json").read_text())

    def test_same_payload_json_and_text(self):
        payload = derive(self.data, NOW)
        self.assertIn("possible needs_input", render(json.loads(json.dumps(payload))))
        row = next(r for r in payload["items"] if r["placement"]["kind"] == "local")
        self.assertEqual(row["ref"], "local/terminal/panel-a")
        self.assertEqual(row["identity_scope"], "runtime_resource")
        self.assertIsNone(row["durable_work_ref"])

    def test_stale_cloud_never_becomes_current_obligation(self):
        row = next(r for r in derive(self.data, NOW)["items"] if r["placement"]["kind"] == "cloud")
        self.assertEqual(row["freshness"]["state"], "stale")
        self.assertEqual(row["obligations"], [])
        self.assertEqual(row["cursor"], {"generation": "example-g1", "revision": "17"})

    def test_old_local_capture_does_not_assert_live_attention(self):
        later = NOW.replace(hour=16)
        self.assertTrue(all(not r["obligations"] for r in derive(self.data, later)["items"]))

    def test_missing_timestamp_and_future_are_unknown(self):
        for value in [None, "2027-01-01T00:00:00Z"]:
            self.data["observed_at"] = value
            self.assertEqual(derive(self.data, NOW)["items"][0]["freshness"]["state"], "unknown")

    def test_missing_provenance_rejected(self):
        self.data["facts"][0].pop("owner")
        with self.assertRaises(ValueError):
            derive(self.data, NOW)

    def test_bounded_and_deterministic(self):
        first = derive(self.data, NOW, 1)
        self.data["catalog"]["resources"].reverse()
        reordered = derive(self.data, NOW, 1)
        # Row order is deterministic; JSON pointers follow actual source positions.
        self.assertEqual(first["items"][0]["ref"], reordered["items"][0]["ref"])
        self.assertNotEqual(first["items"][0]["evidence"], reordered["items"][0]["evidence"])
        self.assertTrue(first["truncated"])

    def test_duplicate_resource_rejected(self):
        self.data["catalog"]["resources"].append(copy.deepcopy(self.data["catalog"]["resources"][0]))
        with self.assertRaises(ValueError):
            derive(self.data, NOW)

    def test_local_durable_identity_survives_runtime_rebinding(self):
        projection = self.data["catalog"]["projections"][0]
        projection.update(stable_surface_id="stable-surface-a", stable_workspace_id="stable-workspace-a")
        before = next(r for r in derive(self.data, NOW)["items"] if r["placement"]["kind"] == "local")
        self.data["catalog"]["resources"][0]["id"] = "local/terminal/new-panel"
        projection.update(resource="local/terminal/new-panel", panel_id="new-panel", surface_id="new-panel", workspace_id="new-workspace")
        payload = json.loads(json.dumps(derive(self.data, NOW)))
        after = next(r for r in payload["items"] if r["placement"]["kind"] == "local")
        self.assertNotEqual(before["ref"], after["ref"])
        self.assertEqual(before["durable_surface_id"], after["durable_surface_id"])
        self.assertEqual(after["projections"][0]["stable_workspace_id"], "stable-workspace-a")
        self.assertIsNone(after["durable_work_ref"])
        self.assertIn("local/terminal/new-panel", render(payload))
        self.assertIn("stable surface: stable-surface-a", render(payload))
        self.assertIn("workspace=stable-workspace-a", render(payload))

    def test_cloud_projection_identity_never_becomes_resource_identity(self):
        self.data["catalog"]["projections"].extend([
            {"resource": "example-vm/terminal/t1", "panel_id": "p1", "stable_surface_id": "s1", "stable_workspace_id": "w1"},
            {"resource": "example-vm/terminal/t1", "panel_id": "p2", "stable_surface_id": "s2", "stable_workspace_id": "w2"},
        ])
        payload = json.loads(json.dumps(derive(self.data, NOW)))
        cloud = next(r for r in payload["items"] if r["placement"]["kind"] == "cloud")
        self.assertEqual(cloud["ref"], "example-vm/terminal/t1")
        self.assertIsNone(cloud["durable_surface_id"])
        self.assertIsNone(cloud["durable_work_ref"])
        self.assertEqual([p["stable_surface_id"] for p in cloud["projections"]], ["s1", "s2"])
        self.assertIn("projection p2: stable surface=s2 workspace=w2", render(payload))

    def test_old_catalog_has_no_invented_durable_identity(self):
        local = next(r for r in derive(self.data, NOW)["items"] if r["placement"]["kind"] == "local")
        self.assertIsNone(local["durable_surface_id"])
        self.assertIsNone(local["projections"][0]["stable_surface_id"])

    def test_conflicting_local_durable_identity_rejected(self):
        first = self.data["catalog"]["projections"][0]
        first["stable_surface_id"] = "s1"
        self.data["catalog"]["projections"].append(dict(first, stable_surface_id="s2"))
        with self.assertRaisesRegex(ValueError, "ambiguous durable"):
            derive(self.data, NOW)

    def test_browser_detail_is_not_cwd(self):
        self.data["catalog"]["resources"][0]["kind"] = "browser"
        row = next(r for r in derive(self.data, NOW)["items"] if r["placement"]["kind"] == "local")
        self.assertIsNone(row["hints"]["cwd"])

    def test_existing_sidebar_shape_joins_only_exact_workspace(self):
        self.data["sidebar_observed_at"] = self.data["observed_at"]
        self.data["sidebar_workspaces"] = [{"id": "workspace-example", "projectRootPath": "/example", "unreadCount": 2, "pullRequestURLs": ["https://github.com/manaflow-ai/cmux/pull/13229"]}]
        rows = derive(self.data, NOW)["items"]
        local = next(r for r in rows if r["placement"]["kind"] == "local")
        cloud = next(r for r in rows if r["placement"]["kind"] == "cloud")
        self.assertEqual(local["hints"]["project"]["value"], "/example")
        self.assertEqual(local["linked_pr_facts"][0]["value"]["association_scope"], "workspace")
        self.assertEqual(cloud["linked_pr_facts"], [])

    def test_ledger_join_needs_explicit_head_and_freshness(self):
        ledger = {"head_sha": "head-a", "observed_at": self.data["observed_at"], "pr": "https://example.test/pr/1", "completion": "unknown", "complete": False,
                  "obligations": [{"actionable": True, "currentness": "current_head", "disposition": "needs_response", "evidence": ["https://example.test/thread/1"]}]}
        self.assertEqual(len(facts(ledger, "local/terminal/panel-a", "head-a")), 2)
        self.assertEqual(len(facts(ledger, "local/terminal/panel-a", "head-b")), 1)
        self.data["facts"] = facts(ledger, "local/terminal/panel-a", "head-a")
        local = next(r for r in derive(self.data, NOW)["items"] if r["placement"]["kind"] == "local")
        self.assertEqual(local["obligations"][0]["kind"], "review_needed")

    def test_null_optional_collections_and_resolvable_pointer(self):
        self.data["catalog"]["cloud_states"] = None
        self.data["catalog"]["projections"] = None
        payload = derive(self.data, NOW)
        for row in payload["items"]:
            index = int(row["evidence"][0].rsplit("/", 1)[1])
            self.assertEqual(row["ref"], self.data["catalog"]["resources"][index]["id"])


if __name__ == "__main__":
    unittest.main()
