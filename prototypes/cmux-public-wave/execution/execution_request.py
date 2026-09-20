"""Pure intent compiler for two existing CMUX paths; never executes a plan.

The same public surface.new_terminal owner already supports local and Cloud.
This experiment adds caller intent and explicit source resolution, not a backend.
"""
from dataclasses import dataclass, asdict
from pathlib import PurePosixPath
from typing import Literal
from uuid import UUID

BASE_SHA = "ad34966d0641efcacc436ecd264fda9105285c49"


@dataclass(frozen=True)
class ExecutionRequest:
    request_ref: str
    source_ref: str
    label: str
    operation: str = "open-project-terminal"
    tool_kind: str = "interactive-shell"
    capabilities: tuple[str, ...] = ("interactive-terminal", "cwd")
    persistence: str = "backend-default"
    return_policy: str = "open-and-focus"
    placement_constraint: str = "explicit-target"


@dataclass(frozen=True)
class ResolvedTarget:
    """Caller-supplied resolution, not proof that a checkout exists or is current."""
    kind: Literal["local", "cloud"]
    machine: str
    source_ref: str
    cwd: str
    local_workspace_id: str
    remote_workspace_id: str | None = None


def plan(request: ExecutionRequest, target: ResolvedTarget) -> dict:
    if not request.request_ref.strip() or not request.source_ref.strip():
        raise ValueError("request_ref and source_ref are required correlation references")
    if request.source_ref != target.source_ref:
        raise ValueError("target resolution belongs to another source")
    if request.operation != "open-project-terminal" or request.tool_kind != "interactive-shell":
        raise ValueError("only open-project-terminal with the backend default shell is proven")
    if set(request.capabilities) - {"interactive-terminal", "cwd"}:
        raise ValueError("unproven capability request")
    if request.persistence != "backend-default":
        raise ValueError("cross-restart or agent-resume guarantees are not shared")
    if request.return_policy != "open-and-focus":
        raise ValueError("local provider creation currently focuses its initial pane")
    if request.placement_constraint != "explicit-target":
        raise ValueError("no automatic placement or scheduling")
    if not target.cwd or not PurePosixPath(target.cwd).is_absolute() or "\x00" in target.cwd:
        raise ValueError("cwd must be an absolute path resolved for this target")
    UUID(target.local_workspace_id)  # Require an exact projection destination, not a display name.
    if target.kind == "local":
        if target.machine != "local" or target.remote_workspace_id is not None:
            raise ValueError("local target must not carry Cloud workspace identity")
    elif target.kind == "cloud":
        if not target.machine.strip() or target.machine == "local":
            raise ValueError("Cloud requires an existing machine identity")
        if not target.remote_workspace_id or not target.remote_workspace_id.strip() or target.remote_workspace_id == "current":
            raise ValueError("Cloud requires an exact existing remote workspace identity")
    else:
        raise ValueError("only the current local and CMUX Cloud paths are proven")

    params = {
        "machine": target.machine,
        "cwd": target.cwd,
        "name": request.label,
        "workspace_id": target.local_workspace_id,
        "open": True,
        "focus": True,
    }
    if target.remote_workspace_id is not None:
        params["remote_workspace_id"] = target.remote_workspace_id
    return {
        "schema": "tact.execution-plan/1",
        "base_sha": BASE_SHA,
        "request": asdict(request),
        "target": asdict(target),
        "call": {"method": "surface.new_terminal", "params": params},
        "automatic_retry": False,
        "preconditions": [
            "caller verified the source checkout and cwd on the selected target",
            "local projection destination exists and backend policy allows creation",
            "Cloud machine/workspace already exist; backend owns connection and wake behavior",
        ],
    }


def observed_receipt(execution_plan: dict, result: dict, *, evidence_ref: str) -> dict:
    """Project an actual successful socket RESULT; no socket envelopes or errors.

    A returned resource establishes owner-reported creation, not process readiness,
    persistence, resumability, or a reusable mutation authorization.
    """
    if not evidence_ref.strip():
        raise ValueError("receipt requires a reference to the observed response")
    required = ("resource", "terminal_id", "machine", "workspace_id", "surface_id")
    if any(not isinstance(result.get(k), str) or not result[k] for k in required):
        raise ValueError("successful open result is incomplete")
    target = execution_plan["target"]
    if result["machine"] != target["machine"]:
        raise ValueError("response machine differs from the selected target")
    if result["workspace_id"].lower() != target["local_workspace_id"].lower():
        raise ValueError("response projection differs from the selected destination")
    if target["kind"] == "cloud" and result.get("remote_workspace_id") != target["remote_workspace_id"]:
        raise ValueError("response remote workspace differs from the selected destination")
    return {
        "schema": "tact.execution-receipt/1",
        "request_ref": execution_plan["request"]["request_ref"],
        "source_ref": execution_plan["request"]["source_ref"],
        "state": "owner-reported-created-and-projected",
        "resource_ref": result["resource"],
        "placement": {"kind": target["kind"], "machine": result["machine"],
                      "remote_workspace_id": result.get("remote_workspace_id")},
        "projection": {"workspace_id": result["workspace_id"], "surface_id": result["surface_id"]},
        "runtime": {"terminal_id": result["terminal_id"], "generation": None},
        "effective_capabilities": None,
        "agent_state": "unknown",
        "persistence": "backend-default-unverified",
        "mutation_receipt": None,
        "cursor": None,
        "evidence_refs": [evidence_ref],
        "replay_safe": False,
    }
