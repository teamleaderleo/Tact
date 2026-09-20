import copy
import json
from pathlib import Path
import unittest
from ledger import project


def fixture(number):
    return json.loads((Path(__file__).parent / "fixtures" / f"cmux-pr-{number}.json").read_text())


class LedgerTests(unittest.TestCase):
    def test_real_outdated_resolved_replied_thread_is_not_active(self):
        p = project(fixture(13240), {"teamleaderleo"})
        row = next(r for r in p["obligations"] if r["kind"] == "outdated_finding")
        self.assertTrue(row["resolved"])
        self.assertTrue(row["reply_after_latest_reviewer"])
        self.assertFalse(row["actionable"])
        self.assertEqual(p["completion"], "unknown")

    def test_real_fresh_p1_and_rate_limit_summary_duplicates(self):
        p = project(fixture(13229))
        rows = p["obligations"]
        finding = next(r for r in rows if r["kind"] == "inline_finding")
        self.assertEqual(finding["priority"], "P1")
        self.assertTrue(finding["actionable"])
        self.assertFalse(finding["reply_after_latest_reviewer"])
        self.assertIn("summary_walkthrough", {r["kind"] for r in rows})
        duplicate = next(r for r in rows if r["kind"] == "duplicate")
        self.assertFalse(duplicate["actionable"])
        rate = next(r for r in rows if r["reviewer"] == "coderabbitai" and r["kind"] == "rate_limit_unavailable")
        self.assertEqual(rate["disposition"], "waiting_on_reviewer")

    def test_real_ci_failure_and_branch_are_distinct(self):
        rows = project(fixture(13229))["obligations"]
        self.assertTrue(any(r["kind"] == "ci_failure" and r["actionable"] for r in rows))
        self.assertTrue(any(r["kind"] == "queue_branch_state" and r["actionable"] is None for r in rows))
        cancelled = next(r for r in rows if r.get("conclusion") == "CANCELLED")
        self.assertIsNone(cancelled["actionable"])

    def test_real_human_review_not_bot_obligation(self):
        rows = project(fixture(13240))["obligations"]
        human = next(r for r in rows if r["kind"] == "human_review")
        self.assertEqual(human["reviewer"], "teamleaderleo")
        self.assertFalse(human["actionable"])

    def test_synthetic_followup_invalidates_previous_reply(self):
        pr = fixture(13240)
        thread = pr["reviewThreads"]["nodes"][0]
        thread.update(isResolved=False, isOutdated=False)
        reviewer = copy.deepcopy(thread["comments"]["nodes"][0])
        reviewer.update(id="synthetic-followup", createdAt="2026-09-21T00:00:00Z")
        thread["comments"]["nodes"].append(reviewer)
        row = next(r for r in project(pr, {"teamleaderleo"})["obligations"] if r["kind"] == "inline_finding")
        self.assertFalse(row["reply_after_latest_reviewer"])
        self.assertEqual(row["disposition"], "needs_response")

    def test_synthetic_head_change_never_claims_current_review(self):
        pr = fixture(13229)
        pr["headRefOid"] = "synthetic-new-head"
        row = next(r for r in project(pr)["obligations"] if r["kind"] == "inline_finding")
        self.assertEqual(row["currentness"], "head_not_verified")

    def test_partial_thread_is_unknown(self):
        pr = fixture(13229)
        pr["reviewThreads"]["nodes"][0]["comments"]["pageInfo"]["hasNextPage"] = True
        row = next(r for r in project(pr)["obligations"] if r["kind"] == "inline_finding")
        self.assertIsNone(row["actionable"])
        self.assertEqual(row["disposition"], "unknown")

    def test_agent_identity_is_explicit_and_output_bounded(self):
        rows = project(fixture(13240))["obligations"]
        row = next(r for r in rows if r["kind"] == "outdated_finding")
        self.assertIsNone(row["latest_agent_reply"])
        self.assertTrue(project(fixture(13240), limit=1)["truncated"])


if __name__ == "__main__":
    unittest.main()
