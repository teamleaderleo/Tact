import dataclasses
import unittest

from execution_request import ExecutionRequest, ResolvedTarget, plan, observed_receipt

WORKSPACE = "11111111-1111-4111-8111-111111111111"
SURFACE = "22222222-2222-4222-8222-222222222222"
REQUEST = ExecutionRequest("work:review-cmux", "source:cmux-main", "CMUX review")
LOCAL = ResolvedTarget("local", "local", REQUEST.source_ref, "/Users/fixture/Projects/cmux", WORKSPACE)
CLOUD = ResolvedTarget("cloud", "fixture-machine", REQUEST.source_ref, "/home/fixture/cmux", WORKSPACE, "ws_fixture")


class ExecutionRequestTests(unittest.TestCase):
    def test_same_intent_uses_one_real_public_operation_for_two_paths(self):
        for target in (LOCAL, CLOUD):
            p = plan(REQUEST, target)
            self.assertEqual(p["call"], {"method": "surface.new_terminal", "params": {
                "machine": target.machine, "cwd": target.cwd, "name": REQUEST.label,
                "workspace_id": WORKSPACE, "open": True, "focus": True,
                **({"remote_workspace_id": "ws_fixture"} if target.kind == "cloud" else {}),
            }})
            self.assertFalse(p["automatic_retry"])
            self.assertNotIn("request_ref", p["call"]["params"])
            self.assertNotIn("command", p["call"]["params"])

    def test_source_resolution_cannot_silently_switch_repository(self):
        with self.assertRaises(ValueError):
            plan(REQUEST, dataclasses.replace(CLOUD, source_ref="source:other"))

    def test_no_implicit_remote_current_workspace(self):
        for remote in (None, "current", ""):
            with self.assertRaises(ValueError):
                plan(REQUEST, dataclasses.replace(CLOUD, remote_workspace_id=remote))

    def test_no_unsupported_lifecycle_security_scheduling_promises(self):
        for changes in ({"persistence": "resume-after-restart"}, {"capabilities": ("network-isolation",)},
                        {"return_policy": "background"}, {"placement_constraint": "cheapest"},
                        {"tool_kind": "codex"}, {"operation": "run-arbitrary-shell"}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                plan(dataclasses.replace(REQUEST, **changes), CLOUD)

    def test_local_and_cloud_identity_cannot_be_confused(self):
        for target in (dataclasses.replace(LOCAL, remote_workspace_id="ws_fixture"),
                       dataclasses.replace(CLOUD, machine="local"),
                       dataclasses.replace(LOCAL, local_workspace_id="CMUX review")):
            with self.assertRaises(ValueError):
                plan(REQUEST, target)

    def test_paths_are_target_specific_and_not_shell_interpolated(self):
        cwd = "/Users/fixture/a space/$(literal);'quote"
        self.assertEqual(plan(REQUEST, dataclasses.replace(LOCAL, cwd=cwd))["call"]["params"]["cwd"], cwd)
        for cwd in ("~/cmux", "cmux", "", "/a\x00b"):
            with self.assertRaises(ValueError):
                plan(REQUEST, dataclasses.replace(LOCAL, cwd=cwd))

    def response(self, target):
        return {"resource": "synthetic-owner-resource", "terminal_id": "synthetic-terminal",
                "machine": target.machine, "workspace_id": WORKSPACE, "surface_id": SURFACE,
                "remote_workspace_id": target.remote_workspace_id}

    def test_receipt_preserves_owner_identity_without_inventing_readiness(self):
        for target in (LOCAL, CLOUD):
            result = self.response(target)
            receipt = observed_receipt(plan(REQUEST, target), result, evidence_ref="fixture:successful-result")
            self.assertEqual(receipt["resource_ref"], result["resource"])
            self.assertEqual(receipt["request_ref"], REQUEST.request_ref)
            self.assertEqual(receipt["state"], "owner-reported-created-and-projected")
            self.assertEqual(receipt["agent_state"], "unknown")
            self.assertIsNone(receipt["runtime"]["generation"])
            self.assertIsNone(receipt["mutation_receipt"])
            self.assertIsNone(receipt["effective_capabilities"])
            self.assertFalse(receipt["replay_safe"])

    def test_partial_failure_is_not_a_successful_creation_receipt(self):
        for response in ({"error": "timeout"}, {}, {"resource": "orphaned-after-projection-failure"}):
            with self.assertRaises(ValueError):
                observed_receipt(plan(REQUEST, CLOUD), response, evidence_ref="fixture:failure")

    def test_receipt_rejects_wrong_placement_and_missing_evidence(self):
        for changes in ({"machine": "other"}, {"workspace_id": SURFACE}, {"remote_workspace_id": "ws_other"}):
            with self.assertRaises(ValueError):
                observed_receipt(plan(REQUEST, CLOUD), self.response(CLOUD) | changes, evidence_ref="fixture:mismatch")
        with self.assertRaises(ValueError):
            observed_receipt(plan(REQUEST, CLOUD), self.response(CLOUD), evidence_ref="")


if __name__ == "__main__":
    unittest.main()
