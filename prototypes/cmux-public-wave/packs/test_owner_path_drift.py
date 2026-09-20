"""Evidence of the existing owner gap, distinct from transaction tests."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

from pack import BASE, Owner


class OwnerPathEvidence(unittest.TestCase):
    def test_extracted_sidebar_paths_missing_from_checkout_scanner(self):
        repo = Path(os.environ.get("CMUX_SOURCE_REPO", Path.home() / "Projects/cmux"))
        owner = Owner(repo)
        raw = subprocess.check_output(["git", "-C", str(repo), "show",
                                       f"{BASE}:Sources/CmuxSettingsJSONPathSupport.swift"])
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "paths.swift"
            path.write_bytes(raw)
            checkout_paths = owner.ns["supported_paths_from_source"](path)
        self.assertTrue(checkout_paths, "empty scan would exercise a different defect")
        self.assertNotIn("sidebar.showPorts", checkout_paths)
        self.assertIn("sidebar.showPorts", owner.ns["supported_paths"]())
        self.assertEqual(owner.schema["properties"]["sidebar"]["properties"]["showPorts"]["type"], "boolean")
