"""Pure read-side PR obligation projection. Does not reply, resolve, or gate merges."""
import argparse
import hashlib
import json
from pathlib import Path
from capture_fixture import signals

BOT_ACTORS = {"coderabbitai", "greptile-apps", "cursor", "github-actions", "chatgpt-codex-connector"}
HUMAN_ACTORS = {"teamleaderleo"}  # Explicit fixture identity, never infer human from not-in-bot-list.


def actor(comment):
    return (comment.get("author") or {}).get("login")


def stamp(comment):
    return comment.get("createdAt") or comment.get("submittedAt") or ""


def compact(comment):
    if comment is None:
        return None
    return {"id": comment["id"], "author": actor(comment), "at": stamp(comment),
            "url": comment.get("url"), "commit_sha": (comment.get("commit") or {}).get("oid"),
            "excerpt": (comment.get("body_excerpt") or comment.get("body") or "")[:900]}


def project(pr, agent_actors=(), limit=200):
    if not 1 <= limit <= 500:
        raise ValueError("limit must be between 1 and 500")
    rows = []
    observed = pr.get("fixture_provenance", {}).get("observed_at") or pr.get("observed_at")

    def base(identifier, reviewer, kind, url=None):
        return {"pr": pr["url"], "head_sha": pr["headRefOid"], "reviewer": reviewer,
                "thread_or_comment_id": identifier, "kind": kind, "priority": None,
                "actionable": None, "latest_reviewer_comment": None, "latest_agent_reply": None,
                "outdated": None, "resolved": None, "disposition": "unknown",
                "currentness": "unverified", "evidence": [url or pr["url"]], "observed_at": observed}

    for thread in pr.get("reviewThreads", {}).get("nodes", []):
        comments = sorted(thread.get("comments", {}).get("nodes", []), key=lambda c: (stamp(c), c["id"]))
        if not comments:
            continue
        reviewer = actor(comments[0])
        latest = next((c for c in reversed(comments) if actor(c) == reviewer), comments[0])
        reply = next((c for c in reversed(comments) if actor(c) in agent_actors and actor(c) != reviewer), None)
        kind = "outdated_finding" if thread["isOutdated"] else "human_review" if reviewer in HUMAN_ACTORS else "inline_finding"
        row = base(thread["id"], reviewer, kind, latest.get("url"))
        incomplete = thread.get("comments", {}).get("pageInfo", {}).get("hasNextPage", False)
        row.update(outdated=thread["isOutdated"], resolved=thread["isResolved"],
                   latest_reviewer_comment=compact(latest), latest_agent_reply=compact(reply),
                   actionable=None if incomplete else not thread["isOutdated"] and not thread["isResolved"],
                   reply_after_latest_reviewer=None if incomplete else bool(reply and stamp(reply) > stamp(latest)))
        sig = latest.get("signals", signals(latest.get("body", "")))
        row["priority"] = "P1" if "P1" in sig else "minor" if "minor" in sig else None
        row["currentness"] = "outdated" if row["outdated"] else "current_head" if (latest.get("commit") or {}).get("oid") == pr["headRefOid"] else "head_not_verified"
        # Resolution/reply/body prose do not prove a fix or a valid rationale.
        row["disposition"] = "unknown" if incomplete else "outdated" if row["outdated"] else "resolved_unverified" if row["resolved"] else "awaiting_disposition" if row["reply_after_latest_reviewer"] else "needs_response"
        rows.append(row)

    seen = {}
    for comment in sorted(pr.get("comments", {}).get("nodes", []), key=lambda c: (stamp(c), c["id"])):
        body = comment.get("body", "")
        sig = comment.get("signals", signals(body))
        kind = "rate_limit_unavailable" if "rate_limit" in sig else "summary_walkthrough" if "summary" in sig else "human_review" if actor(comment) in HUMAN_ACTORS else "unclassified_comment"
        row = base(comment["id"], actor(comment), kind, comment.get("url"))
        row["latest_reviewer_comment"] = compact(comment)
        digest = comment.get("body_sha256") or hashlib.sha256(body.encode()).hexdigest()
        key = (actor(comment), digest)
        if key in seen:
            row.update(kind="duplicate", duplicate_of=seen[key], actionable=False, disposition="not_actionable")
        else:
            seen[key] = comment["id"]
            if kind in {"rate_limit_unavailable", "summary_walkthrough"}:
                row.update(actionable=False, disposition="waiting_on_reviewer" if kind == "rate_limit_unavailable" else "not_actionable")
        rows.append(row)

    for review in pr.get("reviews", {}).get("nodes", []):
        row = base(review["id"], actor(review), "human_review" if actor(review) in HUMAN_ACTORS else "review_summary" if actor(review) in BOT_ACTORS else "unclassified_review", review.get("url"))
        row.update(review_state=review["state"], latest_reviewer_comment=compact(review),
                   actionable=review["state"] == "CHANGES_REQUESTED" if actor(review) in HUMAN_ACTORS else None)
        row["currentness"] = "current_head" if (review.get("commit") or {}).get("oid") == pr["headRefOid"] else "head_not_verified"
        rows.append(row)

    for index, check in enumerate(pr.get("checks", [])):
        conclusion = check.get("conclusion") or check.get("state")
        failed = conclusion in {"FAILURE", "TIMED_OUT", "ERROR", "ACTION_REQUIRED"}
        row = base(str(check.get("databaseId") or check.get("url") or check.get("detailsUrl") or f"observation-check-{index}"), check.get("name"), "ci_failure" if failed else "ci_check", check.get("detailsUrl") or check.get("targetUrl"))
        row.update(actionable=True if failed else False if conclusion in {"SUCCESS", "SKIPPED", "NEUTRAL"} else None,
                   conclusion=conclusion, disposition="investigate_ci" if failed else "unknown")
        rows.append(row)
    row = base(f"{pr['number']}:branch", None, "queue_branch_state")
    row.update(branch_state=pr.get("mergeStateStatus"), pr_state=pr.get("state"), disposition="unknown")
    rows.append(row)
    rows.sort(key=lambda r: (r["kind"], r["thread_or_comment_id"]))
    return {"schema": "cmux-pr-obligations-prototype/v1", "pr": pr["url"], "head_sha": pr["headRefOid"],
            "observed_at": observed, "completion": "unknown", "complete": False,
            "truncated": len(rows) > limit, "total_observed": len(rows), "obligations": rows[:limit]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--agent", action="append", default=[])
    parser.add_argument("--limit", type=int, default=200)
    args = parser.parse_args()
    if args.input.stat().st_size > 2_000_000:
        parser.error("input exceeds 2 MB; collect a narrower owner snapshot")
    print(json.dumps(project(json.loads(args.input.read_text()), args.agent, args.limit), indent=2))
