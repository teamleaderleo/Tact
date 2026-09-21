#!/usr/bin/env python3
"""Project one CMUX work object into Glaeda's bounded external request contract."""
from __future__ import annotations

from dataclasses import dataclass
import json
import re

REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
OID_PATTERN = re.compile(r"^[a-f0-9]{40}$")
TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,127}$")
REUSE_HINTS = {"no_preference", "prefer_valid_reuse"}


@dataclass(frozen=True)
class CmuxGlaedaExecution:
    """Caller-owned facts needed by the first Glaeda semantic operation."""

    request_ref: str
    work_ref: str
    repository: str
    commit: str
    tree: str
    reuse_hint: str = "prefer_valid_reuse"

    def request(self) -> dict[str, object]:
        if (
            not TOKEN_PATTERN.fullmatch(self.request_ref)
            or not TOKEN_PATTERN.fullmatch(self.work_ref)
        ):
            raise ValueError("invalid CMUX correlation")
        if not REPOSITORY_PATTERN.fullmatch(self.repository):
            raise ValueError("invalid repository identity")
        if not OID_PATTERN.fullmatch(self.commit) or not OID_PATTERN.fullmatch(self.tree):
            raise ValueError("invalid source identity")
        if self.reuse_hint not in REUSE_HINTS:
            raise ValueError("invalid reuse hint")
        return {
            "document_type": "glaeda-external-execution-request",
            "schema_version": 1,
            "external_request_ref": self.request_ref,
            "source": {
                "repository": self.repository,
                "commit": self.commit,
                "tree": self.tree,
            },
            "operation": "verify_focused",
            "requested_capability_class": "credentialless_project",
            "reuse_hint": self.reuse_hint,
            "correlation": {"work_ref": self.work_ref},
        }


def canonical_bytes(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"
