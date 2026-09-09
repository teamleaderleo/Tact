import pathlib
import unittest

import sim


class AdversarialAttentionCompilerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = sim.load_config(pathlib.Path(__file__).with_name("scenarios.json"))

    def run_case(self, scenario_id):
        _, tasks = sim.generate_scenario(self.config, scenario_id)
        return sim.reducer(tasks), sim.audit_population(tasks)

    def test_normal_reduces_to_three_obligations_and_clean_audit(self):
        reduced, audit = self.run_case("normal")
        self.assertEqual(reduced["summary"]["workers"], 100)
        self.assertEqual(reduced["summary"]["human_obligations"], 3)
        self.assertEqual(audit["status"], "clear")

    def test_wrong_premise_is_invisible_to_reducer_but_visible_to_auditor(self):
        reduced, audit = self.run_case("wrong-premise")
        self.assertEqual(reduced["summary"]["human_obligations"], 3)
        self.assertIn("premise", {s["key"] for s in audit["alerts"]})

    def test_retry_storm_is_audited(self):
        _, audit = self.run_case("retry-storm")
        self.assertIn("retries", {s["key"] for s in audit["alerts"]})

    def test_verification_drop_is_audited(self):
        _, audit = self.run_case("verification-drop")
        self.assertIn("verification", {s["key"] for s in audit["alerts"]})

    def test_cost_spike_is_audited(self):
        _, audit = self.run_case("cost-spike")
        self.assertIn("burn", {s["key"] for s in audit["alerts"]})

    def test_stale_source_is_audited(self):
        _, audit = self.run_case("stale-source")
        self.assertIn("freshness", {s["key"] for s in audit["alerts"]})

    def test_split_decisions_are_merged_by_reducer_and_split_by_auditor(self):
        reduced, audit = self.run_case("split-decisions")
        self.assertEqual(reduced["summary"]["human_obligations"], 3)
        self.assertIn("fanin", {s["key"] for s in audit["alerts"]})

    def test_all_adversarial_catches_all_six_signals(self):
        _, audit = self.run_case("all-adversarial")
        self.assertEqual(
            {s["key"] for s in audit["alerts"]},
            {"premise", "retries", "verification", "burn", "freshness", "fanin"},
        )


if __name__ == "__main__":
    unittest.main()
