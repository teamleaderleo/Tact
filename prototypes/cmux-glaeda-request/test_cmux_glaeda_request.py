#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import fields
import json
from pathlib import Path
import unittest

from cmux_glaeda_request import CmuxGlaedaExecution, canonical_bytes


class ProjectionTests(unittest.TestCase):
    def fixture(self) -> CmuxGlaedaExecution:
        return CmuxGlaedaExecution(
            request_ref="cmux:exec:1050:fixture-1",
            work_ref="cmux:work:1050",
            repository="teamleaderleo/glaeda",
            commit="0409c2f4e82385d0770bb2b34f34fd3e6e2dbc36",
            tree="03613a93ce152aefddbb246613084705043b1397",
        )

    def test_matches_glaeda_repository_fixture(self) -> None:
        expected = Path(__file__).with_name("request.json").read_bytes()
        self.assertEqual(canonical_bytes(self.fixture().request()), expected)

    def test_cmux_projection_has_only_caller_neutral_execution_fields(self) -> None:
        request = self.fixture().request()
        encoded = canonical_bytes(request)
        self.assertEqual(
            {field.name for field in fields(CmuxGlaedaExecution)},
            {"request_ref", "work_ref", "repository", "commit", "tree", "reuse_hint"},
        )
        def field_names(value: object) -> set[str]:
            if isinstance(value, dict):
                return set(value) | {
                    child
                    for nested in value.values()
                    for child in field_names(nested)
                }
            if isinstance(value, list):
                return {
                    child
                    for nested in value
                    for child in field_names(nested)
                }
            return set()

        forbidden = {
            "cwd",
            "workspace",
            "workspace_id",
            "surface",
            "surface_id",
            "terminal",
            "terminal_id",
            "machine",
            "machine_id",
            "backend",
            "focus",
            "attention",
            "argv",
            "environment",
        }
        self.assertTrue(forbidden.isdisjoint(field_names(request)))

    def test_operation_and_capability_are_fixed_by_this_integration(self) -> None:
        request = self.fixture().request()
        self.assertEqual(request["operation"], "verify_focused")
        self.assertEqual(
            request["requested_capability_class"], "credentialless_project"
        )

    def test_invalid_source_and_reuse_are_rejected_before_transport(self) -> None:
        invalid_source = self.fixture()
        invalid_source = CmuxGlaedaExecution(
            invalid_source.request_ref,
            invalid_source.work_ref,
            invalid_source.repository,
            "main",
            invalid_source.tree,
        )
        with self.assertRaisesRegex(ValueError, "source"):
            invalid_source.request()

        invalid_reuse = self.fixture()
        invalid_reuse = CmuxGlaedaExecution(
            invalid_reuse.request_ref,
            invalid_reuse.work_ref,
            invalid_reuse.repository,
            invalid_reuse.commit,
            invalid_reuse.tree,
            "force_reuse",
        )
        with self.assertRaisesRegex(ValueError, "reuse"):
            invalid_reuse.request()


if __name__ == "__main__":
    unittest.main()
