"""Sanitize already fetched public PR observations; no network or mutations."""
import datetime
import argparse
import hashlib
import json
from pathlib import Path


def signals(body):
    text = body.lower()
    return [name for name, present in {
        "rate_limit": any(s in text for s in ["rate limited by", "review limit reached", "spend limit reached"]),
        "summary": any(s in text for s in ["summarize by coderabbit.ai", "greptile_summary"]),
        "P1": 'alt="P1"' in body,
        "minor": "🟡 Minor" in body,
    }.items() if present]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr", type=Path, required=True, help="Raw GraphQL response captured with capture.graphql")
    parser.add_argument("--checks", type=Path, required=True, help="Raw gh pr view --json statusCheckRollup,mergeStateStatus,reviewDecision result")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--observed-at", required=True, help="Actual capture timestamp, ISO8601 with timezone")
    args = parser.parse_args()
    if datetime.datetime.fromisoformat(args.observed_at.replace("Z", "+00:00")).tzinfo is None:
        parser.error("--observed-at must include timezone")
    p = json.loads(args.pr.read_text())["data"]["repository"]["pullRequest"]
    if p:
        connections = [p["comments"], p["reviews"]] + [t["comments"] for t in p["reviewThreads"]["nodes"]]
        for connection in connections:
            for comment in connection["nodes"]:
                body = comment.pop("body")
                comment.update(body_sha256=hashlib.sha256(body.encode()).hexdigest(), body_excerpt=body[:900], signals=signals(body))
        checks = json.loads(args.checks.read_text())
        p["checks"] = [c for c in checks["statusCheckRollup"] if c.get("conclusion") in ["FAILURE", "TIMED_OUT", "CANCELLED"]][:8]
        p["reviewDecision"] = checks["reviewDecision"]
        p["fixture_provenance"] = {
            "observed_at": args.observed_at,
            "source": "GitHub GraphQL pullRequest + gh pr view statusCheckRollup",
            "bounded_selection": True, "complete": False,
            "notes": "Recent comments/reviews and first 50 threads; selected non-success checks only. Excerpts <=900 chars; original body SHA256 and classifier marker presence retained. Never certify completion from this fixture."
        }
        args.output.write_text(json.dumps(p, indent=2) + "\n")
