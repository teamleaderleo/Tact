"""Real owner execution plus explicitly synthetic, source-shaped read examples."""
import json
import unittest

from run import HERE, between, command

BUILD = None  # Set by run.py after immutable source/digest validation.
TYPESCRIPT = None


class ProductionOwners(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if BUILD is None:
            raise RuntimeError("Use run.py --sources-root PATH; owner checks must not silently skip")

    def cpp(self, name, sources):
        overlay = BUILD / "cmux-browser/overlay"
        binary = BUILD / name
        command(["clang++", "-std=c++20", "-O0", "-I", str(overlay),
                 *[str(overlay / source) for source in sources], "-o", str(binary)])
        output = command([str(binary)])
        print(f"\n{name}: {output.strip()}", flush=True)

    def test_browser_projection_movement_restart_and_duplicate_titles(self):
        self.cpp("window_model", ["chrome/browser/cmux_term/" + file for file in
                                 ("window_model.cc", "window_model_test.cc")])

    def test_terminal_recovery_reacquires_binding_without_recreation(self):
        self.cpp("terminal_recovery", [
            "chrome/services/cmux_terminal_renderer/public/cpp/cmux_terminal_host_protocol.cc",
            "chrome/browser/cmux_term/cmux_terminal_recovery.cc",
            "chrome/browser/cmux_term/cmux_terminal_recovery_test.cc"])

    def test_browser_wire_parser(self):
        self.cpp("tui_protocol", ["chrome/browser/cmux_term/" + file for file in
                                  ("cmux_tui_protocol.cc", "cmux_tui_protocol_test.cc")])

    def test_browser_projection_close_reopen_from_retained_canonical_graph(self):
        self.cpp("browser_rematerialization", [
            "chrome/browser/cmux_term/window_model.cc", str(HERE / "browser_cases.cc")])

    def test_native_resource_cursor_restore_and_agent_identity(self):
        native = BUILD / "cmux/Sources"
        model = (native / "Surfaces/SurfaceCatalogModel.swift").read_text()
        managed = (native / "SurfaceResumeBindingSnapshot+ManagedSessionIdentity.swift").read_text()
        # Unmodified complete declarations, not Python reimplementations.
        source = "import Foundation\nimport CoreFoundation\n"
        source += model.split("/// A daemon entity not yet modeled", 1)[0]
        source += "enum CloudVMRemoteMutationReceiptDecision" + between(
            model, "enum CloudVMRemoteMutationReceiptDecision", "/// A local read-your-write receipt.")
        source += managed.split("extension SurfaceResumeBindingSnapshot", 1)[0]
        source += (native / "SessionRestoreIdentityExclusions.swift").read_text()
        source += (HERE / "native_cases.swift").read_text()
        driver = BUILD / "native.swift"
        driver.write_text(source)
        binary = BUILD / "native"
        command(["swiftc", "-parse-as-library", str(driver), "-o", str(binary)])
        output = command([str(binary), str(HERE / "fixtures.json")])
        self.assertIn("native identity cases passed", output)

    def test_elatura_navigation_fence_and_domain_boundary(self):
        source = BUILD / "elatura/packages/core/src"
        generated = BUILD / "elatura-js"
        # Transpile only: this fixture does not claim to typecheck Elatura.
        command([str(TYPESCRIPT), "--noCheck", "--target", "es2022", "--module", "esnext",
                 "--outDir", str(generated), *[str(path) for path in sorted(source.glob("*.ts"))]])
        (generated / "package.json").write_text('{"type":"module"}\n')
        output = command(["node", str(HERE / "elatura_cases.mjs"),
                          str(generated), str(HERE / "fixtures.json")])
        self.assertIn("Elatura identity cases passed", output)


class SanitizedShapes(unittest.TestCase):
    """These are manufactured snapshots, NOT native persistence/daemon execution."""
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((HERE / "fixtures.json").read_text())

    def test_local_catalog_cannot_join_restored_stable_identity(self):
        before, after = self.data["local_restore"]["catalogs"]
        stable = self.data["local_restore"]["persisted_stable_surface_id"]
        self.assertNotEqual(before[0]["id"], after[0]["id"])
        self.assertFalse(any(row["id"] == before[0]["id"] for row in after))
        self.assertNotIn(stable, json.dumps(before + after))
        # Two equal labels leave the lost join ambiguous; name matching cannot recover it.
        self.assertEqual(len([row for row in after if row["title"] == before[0]["title"]]), 2)

    def test_close_reopen_shapes_do_not_promise_local_process_survival(self):
        local = self.data["close_reopen"]["local"]
        remote = self.data["close_reopen"]["remote"]
        self.assertEqual(local["closed"], [])
        self.assertNotEqual(local["before"]["id"], local["reopened"]["id"])
        self.assertEqual(remote["before"]["id"], remote["closed"]["id"])
        self.assertFalse(remote["closed"]["open"])
        self.assertEqual(remote["before"]["id"], remote["reopened"]["id"])
        self.assertNotEqual(remote["before"]["open_surface_ids"],
                            remote["reopened"]["open_surface_ids"])

    def test_domains_and_work_relationship_are_explicit(self):
        binding = self.data["browser_lane_binding"]
        self.assertEqual(set(binding["generations"]), {"application", "daemon", "work_authority"})
        self.assertIsNone(binding["generations"]["work_authority"])
        self.assertIsNone(binding["work_item_ref"])
        self.assertTrue(binding["surface"]["backend_resource_id"].startswith("tab_"))
        self.assertNotEqual(binding["surface"]["backend_resource_id"], binding["lane_ref"])
