# Demonstrated interaction and limits

Technical pilot, September 20, 2026. Human trial explicitly deferred by the user. This record distinguishes observations, configured policy and interpretation.

## What ran

1. Claimed [#86](https://github.com/teamleaderleo/Tact/issues/86#issuecomment-5751200635) on `codex/attention-pilot-86`, base `2d01a831157adefe6293c67969801a6b1f753500`, in an owned Tact worktree.
2. Captured the fixed 14-PR public cohort twice: **16:51:25–16:54:09 UTC** and **16:58:44–17:00:25 UTC**. Full available public API histories remain in lossless fixtures. Current-head jobs, all available attempts, check output, timeline queue events and review facts are distinct inputs.
3. Ran the loopback prototype in the Codex browser. Confirmed 14 histories, 10 work lines and 14 separate decisions. Review headings name the actual finding, including “Workspace Target Is Lost,” rather than repeating a generic label.
4. Switched to the later observation. Confirmed the same 14 decisions and removal of #13216's missing-job uncertainty from the audit. The newly accessible run-job endpoint settled that fact without a new operator chore. Heads, states and `updated_at` values stayed stable across both observations. Original #12994 timeline and #13053 jobs also became accessible; those recovered original histories did not create duplicate work.
5. Clicked the #13210 finding's evidence link once. The browser reached `https://github.com/manaflow-ai/cmux/pull/13210#discussion_r4056868645`, with the named finding present in the public page. GitHub initially displayed the PR overview; the exact fragment is preserved, but automatic visual scroll-to-thread is provider-dependent. Returning restored the selected later observation and its 14 decisions.
6. Opened the independent audit and inspected separate measured counts, thresholds and source links. Captured `screenshots/decisions.png` and `screenshots/audit.png`. No human trial buttons were exercised or timing results fabricated.

The first new-tab link implementation did not produce a browser-observable evidence tab in this host. The pilot now uses ordinary same-tab links and persists the selected replay/view in the URL, so the navigation and return can be verified. The full public raw evidence remains replayable offline even if GitHub changes its rendering.

## Reference evaluation

| Observation | Expected / emitted decisions | Weighted omissions | False | Stale |
|---|---:|---:|---:|---:|
| 16:54:09 initial, corrected reducer | 14 / 14 | 0 / 47 | 0 | 0 |
| 17:00:25 later | 14 / 14 | 0 / 47 | 0 | 0 |

During local source review, the first implementation's `13216:missing` card was rejected as **one false human obligation**: the inaccessible job endpoint established a fact gap, not a decision requiring a person. The final reducer preserves missing facts in line coverage and the audit. `review_correction` in both references retains the rationale. This removes one unwarranted request for human action; it is not a measured human benefit.

The source-hash-bound decision logs are explicit and inspectable, but reviewed by the same Codex implementation agent after the initial projection. **They are non-blind regression references, not independent human adjudication.** The independent component is the audit's raw-fact selection path, not the reference reviewer.

The score penalizes an omitted P1 decision with weight 5, ordinary review disposition with 2, check recovery with 3, paired admin rollout with 5; transient provider-read recovery carries no human-obligation weight. A test removes the workspace-target P1 and observes a 5-point omission; another restores an original replacement PR and observes both false and stale penalties. None of these weights is a measured human cost.

Potential consequential omissions remain outside the labels: whether findings are substantively correct, privately configured review requirements, exact artifact identity, inaccessible/deleted events, unknown external prerequisites, current provider recovery and owner acceptance of rollout. The UI and audit keep these unknown. A successful check or merged PR cannot establish completion.

## Independent audit results

Initial raw capture: six exact failed-step-name clusters, one cancelled-time concern and two provider-limit groups. The cancelled subset contains **19 jobs / 10,733 wall seconds**, within **75,161 total observed job wall seconds**. These are bounded job durations, not billed seconds, savings or proven queue waste. Initial missing endpoints make the totals incomplete. Later capture metrics are retained separately in `results.json`; never add overlapping windows/observations.

There is no real zero-test execution finding or stale approval asserted for this cohort. Synthetic raw fixtures prove those selection paths, including the case where the reducer emits no decision but the audit alerts. The tests also show alerts clearing after a current-head approval/nonzero result, old failed checks being superseded, source drift requiring recapture, and explicit queue ejection/re-entry updating its obligation.

The audit is intentionally coarse: failures with the same step name can have different causes, closed histories can contain already-recovered failures, and a bot limit notice does not prove present unavailability. Its nine concerns have not earned interruption priority. Keep the audit as an inspection lens until human evaluation establishes a useful noise budget.

## Exports and host

#83's published verification envelope is consumed from PR #91 at `10bd22ea43deee076e4f54d2801d65e88fc6b08b`, with provenance and hash committed. Its three-test result remains unjoined because the head/job are outside this cohort. This validates ingestion without inventing coverage or exact-source acceptance.

#82's `metrics.json` and `cohort.json` are consumed from published PR #94 at `4d123a87ecf3957bcc287bd80bb09ae7dc5cafaf`, with source hashes committed. The adapter allowlists only fixed-window counts and durations. Their before/after windows are marked `different_cohort` and never alter the PR audit denominator. No private collection/cache payload is included. Both owner exports are bundled for offline use; their ongoing completion is not a startup dependency.

CMUX custom-sidebar contract inspected at #57 head `4c190f2c5b302bd4df4f6f66753976e2b7a5b491`:

- `docs/custom-sidebars.md`: JS scene files, hot reload, `openURL`, no network/filesystem/timers in the interpreter.
- `Packages/macOS/CmuxSwiftRenderUI/Sources/CmuxSwiftRenderUI/Runtime/SidebarJSRuntime.swift`: `openURL` becomes a host action.
- `Sources/CmuxSidebarActionDispatch.swift`: host dispatch opens URLs; command acceptance is distinct from provider readiness.
- `Sources/Workspace+CustomSidebarSnapshot.swift` and the custom-sidebar data-context builder: host-owned workspace/surface identity remains canonical.

The generated companion uses only the supported view/action subset and public links. No native installation/rendering claim is made: CLI validation returned **no live CMUX socket**. No new CMUX API has been demonstrated necessary. The local prototype supplies the working interaction now; verify native layout and links in an actual running host before proposing any gap.

## Human comparison, when resumed

No participants or human timing samples were collected. For a bounded trial, keep the same frozen observation and use the operator's ordinary GitHub/chat/tab stack as control; the frozen source packet remains available to distinguish historical facts from later live changes. Counterbalance control/treatment order to limit learning effects.

Ask the operator to establish the next action for (1) #13210 workspace target, (2) #13216's two distinct P1 findings, (3) paired #13117 rollout, and (4) the quiet #13240 resolved/outdated review. Then show the later observation and check whether unchanged decisions are needlessly revisited after provider coverage improves. An independent human reviewer should adjudicate the answer against the raw source packet before scoring correctness.

Record consequential omissions (weighted explicitly), false/stale decisions, unchanged-work checks, time to a correct next action, evidence opens, app/thread switches and total review/coordination time. The optional browser trial recorder stores timestamps and evidence clicks locally and can export JSON; no telemetry is sent. Record manual-control actions alongside it. Treat wrong decisions and missing evidence as failures even if the surface is faster.

Keep the simpler read-only surface or manual control if it wins. Current decision: **retain a runnable pilot; no claim that it reduces human effort, no automated policy, and no upstream API request yet.**
