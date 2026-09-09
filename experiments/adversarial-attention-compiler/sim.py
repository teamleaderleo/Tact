#!/usr/bin/env python3
"""Adversarial attention compiler simulation.

The reducer and auditor intentionally consume the same raw task population through
separate functions. The reducer compiles work into commitments, blockers, human
obligations, and decision packets. The auditor ignores reducer output and computes
population signals directly from task/receipt facts.
"""
from __future__ import annotations

import argparse
import json
import math
import pathlib
from dataclasses import asdict, dataclass
from typing import Any, Iterable

ROOT = pathlib.Path(__file__).resolve().parent
DEFAULT_SCENARIOS = ROOT / "scenarios.json"


@dataclass
class Task:
    id: str
    worker_id: str
    commitment_id: str
    commitment_title: str
    state: str
    blocker_id: str | None
    premise_id: str
    premise_valid: bool
    source_id: str
    source_age_hours: int
    attempts: int
    verified: bool
    expected_cost: float
    actual_cost: float
    decision_group: str | None
    decision_key: str | None
    local_summary: str
    receipts: list[dict[str, Any]]


OBLIGATION_TEMPLATES = {
    "api-contract": {
        "id": "O-api",
        "title": "Choose API compatibility behavior",
        "kind": "product decision",
        "why": "Public contract · downstream work is waiting · two viable interpretations",
        "commitment_id": "C2",
        "recommended": "Preserve current empty-page behavior for one release and deprecate explicitly.",
        "consequences": ["A: preserve compatibility; migration cost later", "B: simplify now; immediate client break risk"],
    },
    "research-conclusion": {
        "id": "O-research",
        "title": "Review research conclusion",
        "kind": "judgement",
        "why": "Competing interpretations can redirect the next implementation wave",
        "commitment_id": "C5",
        "recommended": "Keep the narrow claim and run one more discriminator before promotion.",
        "consequences": ["Accept: downstream plan proceeds", "Hold: 6 tasks wait for one more discriminator"],
    },
    "deploy-reconcile": {
        "id": "O-deploy",
        "title": "Reconcile deployment attempt",
        "kind": "recovery",
        "why": "Provider effect is ambiguous · retry could duplicate an external effect",
        "commitment_id": "C8",
        "recommended": "Read provider state before any replay.",
        "consequences": ["Settled: close recovery", "Absent: replay exact command identity", "Ambiguous: keep blocked"],
    },
}


def load_config(path: pathlib.Path = DEFAULT_SCENARIOS) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def deterministic_fraction(i: int, salt: int) -> float:
    return ((i * 37 + salt * 19) % 101) / 100.0


def base_tasks(config: dict[str, Any]) -> list[Task]:
    tasks: list[Task] = []
    global_i = 0
    for commitment in config["commitments"]:
        for local_i in range(commitment["count"]):
            global_i += 1
            state = "settled" if deterministic_fraction(global_i, 1) < 0.62 else "executing"
            blocker_id = None
            decision_group = None
            decision_key = None

            if commitment["id"] == "C2" and local_i < 11:
                state = "waiting"
                blocker_id = "B-api-choice"
                decision_group = "api-contract"
                decision_key = "pagination-compatibility"
            elif commitment["id"] == "C5" and local_i < 6:
                state = "waiting"
                blocker_id = "B-research-judgement"
                decision_group = "research-conclusion"
                decision_key = "evidence-threshold"
            elif commitment["id"] == "C8" and local_i == 0:
                state = "waiting"
                blocker_id = "B-deploy-reconcile"
                decision_group = "deploy-reconcile"
                decision_key = "provider-effect-reconciliation"
            elif commitment["id"] == "C3" and local_i < 4:
                state = "waiting"
                blocker_id = "B-registry-window"

            attempts = 2 if global_i in {9, 44, 77, 92} else 1
            verified = global_i not in {18, 67, 94, 99}
            expected = round(0.8 + (global_i % 7) * 0.17, 2)
            actual = round(expected * (1.04 if attempts == 1 else 1.12), 2)
            premise_id = f"P-{((global_i - 1) % 9) + 1}"
            source_id = f"SRC-{((global_i - 1) % 12) + 1}"
            source_age = 2 + ((global_i * 7) % 36)

            local_summary = {
                "settled": "candidate settled under standing policy",
                "executing": "work progressing inside current policy",
                "waiting": "waiting on a recorded clearing condition",
            }[state]

            receipts = make_receipts(
                task_id=f"T{global_i:03d}", worker_id=f"W{global_i:03d}", state=state,
                attempts=attempts, verified=verified, premise_id=premise_id,
                premise_valid=True, source_id=source_id, source_age_hours=source_age,
                expected_cost=expected, actual_cost=actual,
            )
            tasks.append(Task(
                id=f"T{global_i:03d}", worker_id=f"W{global_i:03d}",
                commitment_id=commitment["id"], commitment_title=commitment["title"],
                state=state, blocker_id=blocker_id, premise_id=premise_id,
                premise_valid=True, source_id=source_id, source_age_hours=source_age,
                attempts=attempts, verified=verified, expected_cost=expected,
                actual_cost=actual, decision_group=decision_group,
                decision_key=decision_key, local_summary=local_summary, receipts=receipts,
            ))
    assert len(tasks) == config["worker_count"]
    return tasks


def make_receipts(**facts: Any) -> list[dict[str, Any]]:
    task_id = facts["task_id"]
    attempts = facts["attempts"]
    verified = facts["verified"]
    return [
        {"type": "source", "id": f"R-{task_id}-source", "exact": {
            "premise_id": facts["premise_id"], "premise_valid": facts["premise_valid"],
            "source_id": facts["source_id"], "source_age_hours": facts["source_age_hours"],
        }},
        {"type": "command", "id": f"R-{task_id}-verify", "exact": {
            "command": f"tact-sim verify --task {task_id}", "attempts": attempts,
            "exit_code": 0,
            "stdout": f"PASS {task_id} after {attempts} attempt{'s' if attempts != 1 else ''}; verification={'present' if verified else 'omitted'}",
        }},
        {"type": "result", "id": f"R-{task_id}-result", "exact": {
            "worker_id": facts["worker_id"], "state": facts["state"], "verified": verified,
            "expected_cost": facts["expected_cost"], "actual_cost": facts["actual_cost"],
        }},
    ]


def refresh_receipts(task: Task) -> None:
    task.receipts = make_receipts(
        task_id=task.id, worker_id=task.worker_id, state=task.state,
        attempts=task.attempts, verified=task.verified, premise_id=task.premise_id,
        premise_valid=task.premise_valid, source_id=task.source_id,
        source_age_hours=task.source_age_hours, expected_cost=task.expected_cost,
        actual_cost=task.actual_cost,
    )


def apply_mutations(tasks: list[Task], mutations: Iterable[str]) -> None:
    for mutation in mutations:
        if mutation == "wrong-premise":
            for task in tasks[:80]:
                task.premise_id = "P-SHARED-WRONG"
                task.premise_valid = False
        elif mutation == "retry-storm":
            for task in tasks[:60]:
                task.attempts = 4
                task.local_summary = "succeeded after local retry policy"
        elif mutation == "verification-drop":
            for task in tasks[:42]:
                task.verified = False
        elif mutation == "cost-spike":
            for task in tasks[:70]:
                task.actual_cost = round(task.expected_cost * 2.4, 2)
        elif mutation == "stale-source":
            for task in tasks[:75]:
                task.source_id = "SRC-SHARED-STALE"
                task.source_age_hours = 480
        elif mutation == "split-decisions":
            api_tasks = [t for t in tasks if t.decision_group == "api-contract"]
            midpoint = math.ceil(len(api_tasks) / 2)
            for i, task in enumerate(api_tasks):
                task.decision_key = "pagination-empty-page" if i < midpoint else "error-envelope-contract"
        else:
            raise ValueError(f"unknown mutation: {mutation}")
    for task in tasks:
        refresh_receipts(task)


def generate_scenario(config: dict[str, Any], scenario_id: str) -> tuple[dict[str, Any], list[Task]]:
    scenario = next((s for s in config["scenarios"] if s["id"] == scenario_id), None)
    if scenario is None:
        raise KeyError(f"unknown scenario {scenario_id!r}")
    tasks = base_tasks(config)
    apply_mutations(tasks, scenario["mutations"])
    return scenario, tasks


def reducer(tasks: list[Task]) -> dict[str, Any]:
    """Compile raw state. Deliberately fans decisions in only by decision_group."""
    commitments: list[dict[str, Any]] = []
    for commitment_id in sorted({t.commitment_id for t in tasks}):
        members = [t for t in tasks if t.commitment_id == commitment_id]
        blockers: dict[str, list[Task]] = {}
        for task in members:
            if task.blocker_id:
                blockers.setdefault(task.blocker_id, []).append(task)
        commitments.append({
            "id": commitment_id, "title": members[0].commitment_title, "total": len(members),
            "settled": sum(t.state == "settled" for t in members),
            "executing": sum(t.state == "executing" for t in members),
            "waiting": sum(t.state == "waiting" for t in members),
            "workers": len({t.worker_id for t in members}),
            "blockers": [{
                "id": blocker_id, "affected": len(blocked),
                "clearing_condition": clearing_condition(blocker_id),
                "human_owned": blocker_id != "B-registry-window",
            } for blocker_id, blocked in sorted(blockers.items())],
        })

    grouped: dict[str, list[Task]] = {}
    for task in tasks:
        if task.decision_group:
            grouped.setdefault(task.decision_group, []).append(task)

    obligations: list[dict[str, Any]] = []
    for group, members in grouped.items():
        template = OBLIGATION_TEMPLATES[group]
        obligations.append({
            **template, "group": group, "affected_tasks": len(members),
            "workers": len({t.worker_id for t in members}),
            "compiled_decision_key": members[0].decision_key,
            "receipt_ids": [r["id"] for t in members[:3] for r in t.receipts[-1:]],
        })
    obligations.sort(key=lambda x: {"recovery": 0, "product decision": 1, "judgement": 2}[x["kind"]])
    return {
        "commitments": commitments,
        "obligations": obligations,
        "summary": {
            "workers": len({t.worker_id for t in tasks}), "tasks": len(tasks),
            "commitments": len(commitments), "settled": sum(t.state == "settled" for t in tasks),
            "executing": sum(t.state == "executing" for t in tasks),
            "waiting": sum(t.state == "waiting" for t in tasks),
            "human_obligations": len(obligations),
        },
    }


def clearing_condition(blocker_id: str) -> str:
    return {
        "B-api-choice": "choose API compatibility behavior",
        "B-research-judgement": "review evidence threshold and conclusion",
        "B-deploy-reconcile": "read provider state and settle the exact effect",
        "B-registry-window": "registry maintenance window clears automatically",
    }[blocker_id]


def percentile(values: list[int], p: float) -> float:
    ordered = sorted(values)
    idx = min(len(ordered) - 1, max(0, math.ceil(p * len(ordered)) - 1))
    return float(ordered[idx])


def audit_population(tasks: list[Task]) -> dict[str, Any]:
    """Independent population audit computed directly from raw facts/receipts."""
    n = len(tasks)
    premise_counts: dict[str, int] = {}
    source_counts: dict[str, int] = {}
    for task in tasks:
        premise_counts[task.premise_id] = premise_counts.get(task.premise_id, 0) + 1
        source_counts[task.source_id] = source_counts.get(task.source_id, 0) + 1

    dominant_premise, dominant_premise_count = max(premise_counts.items(), key=lambda kv: kv[1])
    dominant_source, dominant_source_count = max(source_counts.items(), key=lambda kv: kv[1])
    invalid_premise_share = sum(not t.premise_valid for t in tasks) / n
    retry_ratio = sum(max(t.attempts - 1, 0) for t in tasks) / n
    p95_attempts = percentile([t.attempts for t in tasks], 0.95)
    verification_coverage = sum(t.verified for t in tasks) / n
    burn_ratio = sum(t.actual_cost for t in tasks) / sum(t.expected_cost for t in tasks)
    stale_tasks = [t for t in tasks if t.source_age_hours >= 72]
    stale_share = len(stale_tasks) / n
    stale_source_concentration = 0.0
    if stale_tasks:
        stale_counts: dict[str, int] = {}
        for task in stale_tasks:
            stale_counts[task.source_id] = stale_counts.get(task.source_id, 0) + 1
        stale_source_concentration = max(stale_counts.values()) / n

    fan_in: dict[str, set[str]] = {}
    for task in tasks:
        if task.decision_group and task.decision_key:
            fan_in.setdefault(task.decision_group, set()).add(task.decision_key)
    heterogeneous_groups = {g: sorted(keys) for g, keys in fan_in.items() if len(keys) > 1}

    signals = [
        signal("premise", "Premise concentration",
               "alert" if invalid_premise_share >= 0.25 else ("watch" if dominant_premise_count / n >= 0.65 else "clear"),
               f"{dominant_premise_count / n:.0%} dominant · {invalid_premise_share:.0%} known-invalid",
               f"Largest premise cluster is {dominant_premise} across {dominant_premise_count}/{n} tasks."),
        signal("retries", "Retry pressure",
               "alert" if retry_ratio >= 0.50 or p95_attempts >= 4 else ("watch" if retry_ratio >= 0.20 else "clear"),
               f"{retry_ratio:.2f} retries/task · p95 {p95_attempts:.0f} attempts",
               "Counts repeated attempts even when the final local result is healthy."),
        signal("verification", "Verification coverage",
               "alert" if verification_coverage < 0.80 else ("watch" if verification_coverage < 0.90 else "clear"),
               f"{verification_coverage:.0%} independently verified",
               "Coverage is measured over the raw task population, independent of parent green state."),
        signal("burn", "Compute burn",
               "alert" if burn_ratio >= 1.60 else ("watch" if burn_ratio >= 1.30 else "clear"),
               f"{burn_ratio:.2f}× expected",
               "Actual synthetic compute cost divided by task-level expected cost."),
        signal("freshness", "Stale-source concentration",
               "alert" if stale_source_concentration >= 0.50 else ("watch" if stale_share >= 0.25 else "clear"),
               f"{stale_share:.0%} stale · {stale_source_concentration:.0%} one stale source",
               f"Largest source overall is {dominant_source} across {dominant_source_count}/{n}; stale threshold is 72h."),
        signal("fanin", "Fan-in integrity", "alert" if heterogeneous_groups else "clear",
               "; ".join(f"{g}: {len(keys)} decisions" for g, keys in heterogeneous_groups.items()) if heterogeneous_groups else "1 decision boundary per merge group",
               json.dumps(heterogeneous_groups, sort_keys=True) if heterogeneous_groups else "Raw decision keys agree inside every reducer merge group."),
    ]
    alerts = [s for s in signals if s["level"] == "alert"]
    watches = [s for s in signals if s["level"] == "watch"]
    return {
        "signals": signals, "alerts": alerts, "watches": watches,
        "status": "alert" if alerts else ("watch" if watches else "clear"),
        "compact": f"{len(signals) - len(alerts) - len(watches)}/{len(signals)} clear · {len(alerts)} alert · {len(watches)} watch",
    }


def signal(key: str, label: str, level: str, value: str, detail: str) -> dict[str, str]:
    return {"key": key, "label": label, "level": level, "value": value, "detail": detail}


def render_grid(tasks: list[Task]) -> str:
    lines = ["WORKER GRID · 100 task/worker rows", "worker task commitment state attempts verify cost premise source"]
    for t in tasks:
        lines.append(f"{t.worker_id:<5} {t.id:<5} {t.commitment_id:<3} {t.state:<9} a{t.attempts:<2} {'✓' if t.verified else '·'} ${t.actual_cost:>4.2f} {t.premise_id:<14} {t.source_id}")
    return "\n".join(lines)


def render_reduced(reduced: dict[str, Any]) -> str:
    s = reduced["summary"]
    lines = ["REDUCED COMMITMENT / DECISION UI", f"{s['workers']} workers · {s['commitments']} commitments · {s['human_obligations']} human obligations", "", "COMMITMENTS"]
    for c in reduced["commitments"]:
        blockers = ", ".join(f"{b['affected']}→{b['clearing_condition']}" for b in c["blockers"]) or "—"
        lines.append(f"{c['id']} {c['title']:<22} settled {c['settled']:>2}/{c['total']:<2} exec {c['executing']:>2} wait {c['waiting']:>2} · blockers {blockers}")
    lines += ["", "HUMAN OBLIGATIONS"]
    for i, o in enumerate(reduced["obligations"], start=1):
        lines += [f"{i}. {o['title']}", f"   {o['why']}", f"   {o['affected_tasks']} tasks · compiled key {o['compiled_decision_key']}"]
    return "\n".join(lines)


def render_audit(audit: dict[str, Any], verbose: bool = False) -> str:
    lines = [f"INDEPENDENT POPULATION AUDIT · {audit['compact']}"]
    surfaced = audit["signals"] if verbose else [s for s in audit["signals"] if s["level"] != "clear"]
    if not surfaced:
        lines.append("all six population signals within the experiment's normal band")
    for s in surfaced:
        lines.append(f"{s['level'].upper():<5} {s['label']}: {s['value']}")
        if verbose:
            lines.append(f"      {s['detail']}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", default="normal")
    parser.add_argument("--view", choices=["grid", "reduced", "audit", "all", "json"], default="all")
    parser.add_argument("--audit-all", action="store_true")
    parser.add_argument("--scenarios", type=pathlib.Path, default=DEFAULT_SCENARIOS)
    args = parser.parse_args()
    config = load_config(args.scenarios)
    scenario, tasks = generate_scenario(config, args.scenario)
    reduced = reducer(tasks)
    audit = audit_population(tasks)
    if args.view == "json":
        print(json.dumps({"scenario": scenario, "tasks": [asdict(t) for t in tasks], "reduced": reduced, "audit": audit}, indent=2))
        return 0
    print(f"SCENARIO: {scenario['label']}\n{scenario['description']}\n")
    if args.view in {"grid", "all"}:
        print(render_grid(tasks)); print("\n" + "=" * 96 + "\n")
    if args.view in {"reduced", "all"}:
        print(render_reduced(reduced)); print("\n" + "=" * 96 + "\n")
    if args.view in {"audit", "all"}:
        print(render_audit(audit, verbose=args.audit_all))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
