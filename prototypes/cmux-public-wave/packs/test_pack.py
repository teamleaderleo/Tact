import json
import os
from pathlib import Path
import tempfile
import unittest

from pack import Conflict, Owner, apply, encoded, preview, rollback


class TransactionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.owner = Owner(Path(os.environ.get("CMUX_SOURCE_REPO", Path.home() / "Projects/cmux")))

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.target = self.root / "cmux.json"
        self.receipt = self.root / "receipt.json"
        self.manifest = json.loads(Path(__file__).with_name("quiet-review.json").read_text())

    def install(self):
        plan = preview(self.owner, self.target, self.manifest)
        return apply(self.owner, plan, self.receipt)

    def test_clean_install_verify_and_uninstall(self):
        result = self.install()
        self.assertEqual(result["state"], "verified")
        self.assertTrue(json.loads(self.target.read_text())["sidebar"]["showPullRequests"])
        rollback(self.receipt)
        self.assertFalse(self.target.exists())
        self.assertEqual(json.loads(self.receipt.read_text())["state"], "rolled_back")

    def test_jsonc_exact_undo_and_unrelated_action_preservation(self):
        raw = b'// preserve this comment\n{"actions":{"mine":{"type":"builtin","action":"cmux.newTerminal"}},"sidebar":{"showPorts":true}}\n'
        self.target.write_bytes(raw)
        self.install()
        self.assertIn("mine", json.loads(self.target.read_text())["actions"])
        rollback(self.receipt)
        self.assertEqual(self.target.read_bytes(), raw)

    def test_stale_preview_rejected_before_mutation(self):
        plan = preview(self.owner, self.target, self.manifest)
        self.target.write_text('{"sidebar":{"showPorts":true}}')
        raw = self.target.read_bytes()
        with self.assertRaises(Conflict):
            apply(self.owner, plan, self.receipt)
        self.assertEqual(self.target.read_bytes(), raw)
        self.assertFalse(self.receipt.exists())

    def test_rollback_does_not_erase_new_user_edit(self):
        self.install()
        self.target.write_text('{"sidebar":{"showPorts":true}}')
        raw = self.target.read_bytes()
        with self.assertRaises(Conflict):
            rollback(self.receipt)
        self.assertEqual(self.target.read_bytes(), raw)

    def test_unsupported_key_or_wrong_type_rejected(self):
        for settings in ({"sidebar.fake": True}, {"sidebar.showPorts": "true"},
                         {"automation.socketControlMode": "allowAll"}, {"sidebar.showPorts": 1}):
            with self.subTest(settings=settings):
                self.manifest["settings"] = settings
                with self.assertRaises(ValueError):
                    preview(self.owner, self.target, self.manifest)
                self.assertFalse(self.target.exists())

    def test_tampered_diff_is_not_applied(self):
        plan = preview(self.owner, self.target, self.manifest)
        plan["diff"] = "nothing changes"
        with self.assertRaises(Conflict):
            apply(self.owner, plan, self.receipt)

    def test_prepared_receipt_recovers_after_interrupted_application(self):
        plan = preview(self.owner, self.target, self.manifest)
        self.receipt.write_bytes(encoded({"plan": plan, "state": "prepared"}))
        self.owner.ns["atomic_write"](self.target, self.owner.proposed(None, self.manifest))
        rollback(self.receipt)
        self.assertFalse(self.target.exists())

    def test_prepared_receipt_recovers_before_application(self):
        plan = preview(self.owner, self.target, self.manifest)
        self.receipt.write_bytes(encoded({"plan": plan, "state": "prepared"}))
        rollback(self.receipt)
        self.assertFalse(self.target.exists())

    def test_two_packs_stack_and_uninstall_in_reverse(self):
        self.install()
        first = self.target.read_bytes()
        self.manifest = json.loads(Path(__file__).with_name("service-inspection.json").read_text())
        second = self.root / "second.json"
        apply(self.owner, preview(self.owner, self.target, self.manifest), second)
        self.assertTrue(json.loads(self.target.read_text())["sidebar"]["showPorts"])
        with self.assertRaises(Conflict):
            rollback(self.receipt)
        rollback(second)
        self.assertEqual(self.target.read_bytes(), first)
        rollback(self.receipt)
        self.assertFalse(self.target.exists())

    def test_unknown_existing_setting_fails_owner_validation(self):
        self.target.write_text('{"sidebar":{"madeUpSetting":true}}')
        with self.assertRaises(ValueError):
            preview(self.owner, self.target, self.manifest)

    def test_symlink_and_existing_receipt_rejected(self):
        other = self.root / "other.json"
        other.write_text('{}')
        self.target.symlink_to(other)
        with self.assertRaises(Conflict):
            preview(self.owner, self.target, self.manifest)
        self.target.unlink()
        self.receipt.write_text('{}')
        with self.assertRaises(Conflict):
            self.install()

    def test_receipt_cannot_replace_lock_file(self):
        self.receipt = self.root / ".cmux-pack.lock"
        with self.assertRaises(Conflict):
            self.install()
        self.assertFalse(self.target.exists())


if __name__ == "__main__":
    unittest.main()
