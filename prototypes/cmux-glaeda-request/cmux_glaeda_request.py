#!/usr/bin/env python3
"""Project one CMUX work object into Glaeda's bounded external request contract."""
from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import re

REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
OID_PATTERN = re.compile(r"^[a-f0-9]{40}$")
TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,127}$")
REUSE_HINTS = {"no_preference", "prefer_valid_reuse"}
SHA256_PATTERN = re.compile(r"^sha256:[a-f0-9]{64}$")
RECEIPT_STATES = {
    "planned",
    "refused",
    "ambiguous",
    "succeeded",
    "failed",
    "timed_out",
    "cleanup_incomplete",
}
RECEIPT_KEYS = {
    "document_type",
    "schema_version",
    "external_request_ref",
    "request_sha256",
    "correlation",
    "operation",
    "source",
    "state",
    "resolved_workload",
    "workload_receipt_sha256",
    "refusal_code",
    "authority",
}
ZERO_AUTHORITY = {
    "authorizes_execution": False,
    "authorizes_redispatch": False,
    "authorizes_host_selection": False,
    "authorizes_cleanup": False,
}


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

    def observe_receipt(self, receipt: dict[str, object]) -> "CmuxGlaedaObservation":
        request = self.request()
        expected_digest = "sha256:" + hashlib.sha256(
            canonical_document_bytes(request)
        ).hexdigest()
        expected_source = request["source"]
        expected_correlation = {"work_ref": self.work_ref}
        if (
            set(receipt) != RECEIPT_KEYS
            or receipt.get("document_type") != "glaeda-external-execution-receipt"
            or type(receipt.get("schema_version")) is not int
            or receipt.get("schema_version") != 1
            or receipt.get("external_request_ref") != self.request_ref
            or receipt.get("request_sha256") != expected_digest
            or receipt.get("correlation") != expected_correlation
            or receipt.get("operation") != "verify_focused"
            or receipt.get("source") != expected_source
            or receipt.get("authority") != ZERO_AUTHORITY
        ):
            raise ValueError("receipt does not correlate to this CMUX request")
        state = receipt.get("state")
        if not isinstance(state, str) or state not in RECEIPT_STATES:
            raise ValueError("receipt state is invalid")
        workload_digest = receipt.get("workload_receipt_sha256")
        if workload_digest is not None and (
            not isinstance(workload_digest, str)
            or not SHA256_PATTERN.fullmatch(workload_digest)
        ):
            raise ValueError("workload receipt digest is invalid")
        if state in {"succeeded", "failed", "timed_out", "cleanup_incomplete"} and (
            workload_digest is None
        ):
            raise ValueError("terminal receipt is missing workload evidence")
        return CmuxGlaedaObservation(
            work_ref=self.work_ref,
            state=state,
            request_sha256=expected_digest,
            workload_receipt_sha256=workload_digest,
        )


@dataclass(frozen=True)
class CmuxGlaedaObservation:
    work_ref: str
    state: str
    request_sha256: str
    workload_receipt_sha256: str | None


def canonical_document_bytes(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")


def canonical_bytes(value: object) -> bytes:
    return canonical_document_bytes(value) + b"\n"
