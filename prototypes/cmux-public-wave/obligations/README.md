# Truthful PR obligation read side (upstream #13088)

Decision: **Tact executable prototype + regression fixtures**, attached as implementation evidence to the existing [upstream RFC #13088](https://github.com/manaflow-ai/cmux/issues/13088). Do not open a duplicate RFC, install a required check, or auto-reply/resolve from this slice.

```sh
python3 prototypes/cmux-public-wave/obligations/ledger.py prototypes/cmux-public-wave/obligations/fixtures/cmux-pr-13229.json
python3 prototypes/cmux-public-wave/obligations/ledger.py prototypes/cmux-public-wave/obligations/fixtures/cmux-pr-13240.json --agent teamleaderleo
python3 -m unittest discover -s prototypes/cmux-public-wave/obligations -v
```

Every record carries PR URL, observed head SHA, reviewer identity, thread/comment ID, kind, priority (when evidenced), actionable (true/false/unknown), latest reviewer comment, latest explicitly configured agent reply, outdated, resolved, disposition, currentness, observation timestamp, and direct source links. Replies and resolved status are separate facts. Neither proves a fix. A later reviewer comment invalidates an earlier reply. A review commit different from current head is `head_not_verified` even when GitHub has not marked its location outdated.

Kinds separate inline findings, outdated findings, summary/walkthrough, rate-limit/unavailable, exact duplicate, human review, CI failure/check, and branch/queue state. Rate-limit markers take precedence over summary markers (CodeRabbit can emit both in one comment). Duplicate means identical author + full body SHA256 within this PR observation; it does not merge semantically similar findings. `BLOCKED` branch state does not invent a queue membership or reason. Cancelled checks remain unknown, not green or failing by assumption. Explicit known bot/human actors are fixture policy; production should use GitHub actor types plus configured reviewer/agent identities. Unknown actors are not automatically labeled human.

## Real regression evidence

| Public history | Captured evidence | Regression |
| --- | --- | --- |
| [CMUX #13240](https://github.com/manaflow-ai/cmux/pull/13240), head `959dcea6585895f6f0a36b68c3214bc9f3299d53` | CodeRabbit thread `PRRT_kwDORDHQWM6kJuXt`, outdated + resolved, followed by teamleaderleo reply naming the new commit; human COMMENTED review | Preserve reply/resolution/outdated independently; no active finding and no inferred completed gate. |
| [CMUX #13229](https://github.com/manaflow-ai/cmux/pull/13229), head `d550afed709734a2e2b48747c650ea8de665e8d4` | Greptile P1 thread `PRRT_kwDORDHQWM6kI9Pj` unresolved/non-outdated; CodeRabbit summary+rate limit; two identical Cursor spend-limit notices; CI failures | Finding, unavailable reviewer, summary, duplicate, CI, and branch state remain distinct. |

Fixtures retain source IDs, direct comment URLs, commit SHAs, actual observation timestamp, <=900-character public excerpts, full-body SHA256, and marker-presence classification evidence. They deliberately select bounded history and non-success checks, so `complete:false` and `completion:unknown` are unconditional. They cannot certify that all reviewers finished or every obligation is known. No PR mutations occurred during capture.

Eight tests use those real observations plus explicitly synthetic follow-up/head-change/partial-page variants. Tests cover fresh versus outdated, reply ordering, explicit agent identity, bot summary and rate-limit precedence, duplicate notices, human review, CI/queue distinction, incomplete thread pagination, and truncation. A current-work adapter in `../current/link_ledger.py` joins only an explicit resource and expected head; it carries original evidence and source observation time.

## Reproduce a new capture

`capture.graphql` is the read-only query (50 threads/comments, 20 recent top-level comments/reviews). The original #13240 capture used the narrower 30/30/15/10 bounds; both fixtures declare incomplete coverage. Re-running today observes today's state, not the historical state in the fixture.

```sh
gh api graphql -F number=13229 -f query="$(cat prototypes/cmux-public-wave/obligations/capture.graphql)" > /tmp/cmux-pr-observation.json
gh pr view 13229 --repo manaflow-ai/cmux --json statusCheckRollup,mergeStateStatus,reviewDecision > /tmp/cmux-pr-check-observation.json
python3 prototypes/cmux-public-wave/obligations/capture_fixture.py --pr /tmp/cmux-pr-observation.json --checks /tmp/cmux-pr-check-observation.json --output /tmp/cmux-pr-fixture.json --observed-at '<actual ISO8601 capture time>'
```

For a production collector: paginate completely; pin/check head across all independent reads (thread and check fetches here were sequential, not atomic); preserve deleted/edited comments and source failures; configure actors; separate authoritative structured dispositions from textual claims; bound and label sampling. Do not strengthen this reducer into a gate until those guarantees exist. Native CMUX currently exports basic [linked PR info](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Packages/macOS/CmuxControlSocket/Sources/CmuxControlSocket/Coordinator/Sidebar/ControlSidebarPullRequestInfo.swift#L4), so review-history ownership is a real new adapter seam, not a field that can be truthfully synthesized from its existing badge.
