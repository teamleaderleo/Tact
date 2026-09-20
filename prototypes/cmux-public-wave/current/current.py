"""Bounded in-memory read model over CMUX surface.catalog plus explicit owner facts."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path


def instant(value):
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else None
    except (AttributeError, TypeError, ValueError):
        return None


def freshness(observed_at, now, source_state="current", reason=None):
    observed = instant(observed_at)
    age = (now - observed).total_seconds() if observed else None
    state = source_state if source_state in {"current", "stale", "unknown"} else "unknown"
    if age is None or age < 0:
        state, reason = "unknown", "missing_or_future_observation"
    elif age > 60 and state == "current":
        state, reason = "stale", "observation_older_than_60_seconds"
    return {"state": state, "observed_at": observed_at, "reason": reason}


def fields(source, names):
    return {name: source.get(name) for name in names}


def sidebar_facts(envelope):
    """Adapt the existing Codable sidebar workspace shape via exact projections."""
    result = []
    for workspace_index, workspace in enumerate(envelope.get("sidebar_workspaces") or []):
        refs = sorted({p["resource"] for p in envelope["catalog"].get("projections", []) or [] if p["workspace_id"] == workspace["id"]})
        for ref in refs:
            def add(kind, value, field):
                result.append({"resource_ref": ref, "kind": kind, "value": value,
                               "owner": "CmuxSidebarProviderWorkspace", "evidence": f"input#/sidebar_workspaces/{workspace_index}/{field}",
                               "freshness": "current", "observed_at": envelope.get("sidebar_observed_at")})
            if workspace.get("projectRootPath"):
                add("project", workspace["projectRootPath"], "projectRootPath")
            if workspace.get("unreadCount", 0) > 0:
                add("attention", "unread", "unreadCount")
            for url in workspace.get("pullRequestURLs", [])[:16]:
                add("pr", {"url": url, "association_scope": "workspace", "head_sha": None}, "pullRequestURLs")
    return result


def derive(envelope, now, limit=100):
    if not 1 <= limit <= 200:
        raise ValueError("limit must be 1..200")
    catalog = envelope["catalog"]
    observed = envelope.get("observed_at")
    cloud = {row["machine"]: row for row in catalog.get("cloud_states") or []}
    machines = {row["id"]: row for row in catalog.get("machines") or []}
    rows = []
    refs = set()
    facts = (envelope.get("facts") or []) + sidebar_facts(envelope)
    for resource_index, resource in sorted(enumerate(catalog.get("resources") or []), key=lambda pair: pair[1]["id"]):
        ref = resource["id"]
        if ref in refs:
            raise ValueError("ambiguous duplicate resource identity")
        refs.add(ref)
        machine = machines.get(resource["machine"], {})
        state = cloud.get(resource["machine"], {})
        local = machine.get("local") is True
        fresh = freshness(observed, now, "current" if local else state.get("freshness", "unknown"), state.get("stale_reason"))
        projections = [fields(p, ["resource", "workspace_id", "surface_id", "panel_id", "stable_surface_id", "stable_workspace_id", "remote_workspace_id", "remote_tab_id"]) for p in catalog.get("projections") or [] if p["resource"] == ref]
        stable_ids = {p["stable_surface_id"] for p in projections if p["stable_surface_id"]}
        # A restored local panel has one durable identity. A Cloud resource may
        # have many local projections: none of their identities names that resource.
        if local and len(stable_ids) > 1:
            raise ValueError("ambiguous durable local surface identity")
        durable_surface_id = next(iter(stable_ids)) if local and stable_ids else None
        receipts = [fields(p, ["kind", "resource", "remote_workspace_id", "remote_tab_id", "receipt"]) for p in state.get("pending_writes") or [] if p.get("resource") == ref]
        row = {"ref": ref, "identity_scope": "runtime_resource" if local else "provider_resource", "durable_work_ref": None, "durable_surface_id": durable_surface_id, "label": resource.get("title"),
               "hints": {"cwd": resource.get("detail") if resource.get("kind") == "terminal" else None, "repo": None, "project": None},
               "placement": {"kind": "local" if local else "cloud" if machine else "unknown", "machine": resource["machine"]},
               "projections": projections[:16], "agent": resource.get("agent"), "session": None,
               "lifecycle": resource.get("lifecycle"), "attention": [], "linked_pr_facts": [], "obligations": [],
               "freshness": fresh, "cursor": state.get("cursor"), "receipt_refs": receipts[:8],
               "evidence": [f"input#/catalog/resources/{resource_index}"],
               "truncation": {"projections": max(0, len(projections)-16), "receipts": max(0, len(receipts)-8), "facts": 0}}
        # Only exact owner-provided joins; never guess a repo, session, or obligation from prose.
        matching = [f for f in facts if f.get("resource_ref") == ref]
        row["truncation"]["facts"] = max(0, len(matching)-24)
        for fact in matching[:24]:
            if not fact.get("owner") or not fact.get("evidence"):
                raise ValueError("owner facts require owner and evidence")
            ff = freshness(fact.get("observed_at"), now, fact.get("freshness", "unknown"))
            entry = {"owner": fact["owner"], "value": fact.get("value"), "evidence": fact["evidence"], "freshness": ff}
            kind = fact.get("kind")
            if kind == "attention":
                row["attention"].append(entry)
                if ff["state"] == "current" and fresh["state"] == "current" and fact.get("value") in {"needs_input", "failure", "review_needed"}:
                    row["obligations"].append({"kind": fact["value"], "possible_human_obligation": True, "provenance": entry})
            elif kind == "pr":
                row["linked_pr_facts"].append(entry)
            elif kind in {"repo", "project"}:
                row["hints"][kind] = entry
            elif kind == "session":
                row["session"] = entry
        rows.append(row)
    return {"schema": "cmux-current-prototype/v1", "generated_at": now.isoformat(),
            "authority": "read_only_projection", "truncated": len(rows) > limit,
            "total_observed": len(rows), "items": rows[:limit]}


def render(payload):
    """Second consumer: accepts precisely the same payload emitted as JSON."""
    lines = []
    for row in payload["items"]:
        lines.append(f"{row['label']} [{row['placement']['kind']}; {row['freshness']['state']}] {row['ref']}")
        if row.get("durable_surface_id"):
            lines.append(f"  stable surface: {row['durable_surface_id']}")
        for projection in row.get("projections", []):
            if projection.get("stable_surface_id") or projection.get("stable_workspace_id"):
                lines.append(f"  projection {projection['panel_id']}: stable surface={projection.get('stable_surface_id') or 'unknown'} workspace={projection.get('stable_workspace_id') or 'unknown'}")
        for obligation in row["obligations"]:
            lines.append(f"  possible {obligation['kind']}: {obligation['provenance']['evidence']}")
    if payload["truncated"]:
        lines.append(f"Showing {len(payload['items'])} of {payload['total_observed']} observed resources")
    return "\n".join(lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--render-payload", action="store_true", help="Read already-derived JSON for the text consumer")
    parser.add_argument("--now", help="Explicit observation clock for reproducible fixtures")
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()
    if args.input.stat().st_size > 2_000_000:
        parser.error("input exceeds 2 MB; collect a narrower owner snapshot")
    data = json.loads(args.input.read_text())
    now = instant(args.now) if args.now else datetime.now(timezone.utc)
    if now is None:
        parser.error("--now requires an ISO8601 timestamp with timezone")
    payload = data if args.render_payload else derive(data, now, args.limit)
    print(json.dumps(payload, indent=2) if args.json else render(payload))
