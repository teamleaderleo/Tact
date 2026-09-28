"""Explicit join adapter from a read-side PR ledger to current-work owner facts."""
import argparse
import json
from pathlib import Path


def facts(ledger, resource_ref, expected_head):
    if not resource_ref or not expected_head:
        raise ValueError("an explicit resource and expected PR head are required")
    head_matches = ledger["head_sha"] == expected_head
    common = {"resource_ref": resource_ref, "owner": "pr_obligation_ledger_prototype",
              "observed_at": ledger.get("observed_at"), "freshness": "current" if head_matches else "stale"}
    result = [{**common, "kind": "pr", "value": {"url": ledger["pr"], "head_sha": ledger["head_sha"],
               "completion": ledger["completion"], "complete": ledger["complete"]}, "evidence": ledger["pr"]}]
    if head_matches:
        for row in ledger["obligations"]:
            if row["actionable"] is True and row["currentness"] == "current_head" and row["disposition"] == "needs_response":
                result.append({**common, "kind": "attention", "value": "review_needed", "evidence": row["evidence"][0]})
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--resource", required=True)
    parser.add_argument("--expected-head", required=True)
    args = parser.parse_args()
    print(json.dumps(facts(json.loads(args.input.read_text()), args.resource, args.expected_head), indent=2))
