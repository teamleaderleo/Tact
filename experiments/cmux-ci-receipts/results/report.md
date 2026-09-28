# CMUX CI consolidation: fixed-window receipts

Assembly started 2026-09-20T17:07:48.899118Z; cached endpoint fetch times (including earlier requests) are retained in JSON. Cohorts select run creation, not execution timestamps.

This is an observational comparison, not a causal savings percentage. Different changes, runners, rollout revisions, retries and workload mix remain confounders. Totals are lower bounds where step timing is absent. Each measured job execution is counted once; cancelled/retried/after-failure figures are overlapping subsets, never extra savings.

| Cohort (UTC, half-open) | Runs / attempts | Runner min | Merged PRs | Min / merged PR |
|---|---:|---:|---:|---:|
| before: 2026-09-20T07:00:00Z – 2026-09-20T08:00:00Z | 668 / 672 | 7,126.12 | 0 | unknown |
| after: 2026-09-20T13:00:00Z – 2026-09-20T14:00:00Z | 474 / 476 | 1,085.70 | 2 | 542.85 |

The denominator is every PR merged in that clock window, not changes whose runs form the numerator. This throughput ratio includes unmerged work and must not be read as the cost of a particular accepted change.

| Disjoint workload class | Before runner min | After runner min |
|---|---:|---:|
| pr_admission | 6,273.37 | 921.08 |
| merge_validation | 564.72 | 0.00 |
| nightly_release | 20.47 | 52.97 |
| seed | 0.00 | 0.00 |
| other | 267.57 | 111.65 |

| Observed CI attempt shape (not inferred policy) | Before | After |
|---|---:|---:|
| full_suite_steps_reached | 28 | 0 |
| compile_without_observed_unit_test_steps | 18 | 17 |
| unknown_or_routed_away | 6 | 9 |

No after-window CI attempt reached an app-host unit-test step. This removes the basis for claiming equivalent full-suite validation became cheaper. A compile-only execution shape may also reflect early failure; it is not independent proof of suite policy.


Runner time is first executed step start through job completion, excluding pre-step queue time; jobs without a closed interval are explicitly excluded. It is observed wall time, not billable minutes. Seed classification uses explicit refresh/seed/warmup job names before event classification; embedded caches in ordinary builds stay with their owner.

| Overlapping subset / waiting metric | Before | After |
|---|---:|---:|
| Cancelled attempts, runner min | 1,828.00 | 198.68 |
| Cancelled jobs, runner min | 752.95 | 108.12 |
| Retry attempts, runner min | 629.30 | 23.35 |
| Checkout steps, min | 663.40 | 318.02 |
| Latest CI status result, min (p50 / p95; n) | 32.58 / 81.61; 49 | 12.23 / 23.89; 24 |
| Latest compile result, min (p50 / p95; n) | 22.03 / 27.15; 29 | 21.42 / 23.70; 10 |
| Artifact download step, min (p50 / p95; n) | 0.20 / 10.35; 168 | 0.18 / 0.18; 1 |

Waiting is original run creation to the latest observed successful/failed result, including retry delay. Cancellations and runs without that result are censored, not zero. This is CI feedback wait, not PR-open-to-merge or queue residence. Artifact durations include setup/extraction/retry overhead; they are not wire throughput.

## Current configuration and rollout

Current main snapshot: `b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110` at 2026-09-20T16:59:42.632970Z. Current settings are not applied retroactively:

- `CI_CACHE_BACKEND`: `r2` (read, 2026-09-20T16:59:44.158864Z).
- `CI_PULL_REQUEST_SUITE`: `compile-only` (read, 2026-09-20T16:59:43.380268Z).
- `MACOS_RUNNER_15`: `warp-macos-15-arm64-6x` (read, 2026-09-20T16:59:44.925006Z).

Ruleset evidence: `{"enforcement": "active", "error": null, "fetched_at": "2026-09-20T16:59:45.721490Z", "merge_queue_rules": []}`.

| PR | State / merged at | Base | Merge revision |
|---|---|---|---|
| [#13083](https://github.com/manaflow-ai/cmux/pull/13083) | closed / 2026-09-20T00:19:56Z | main | `cbb347785e1efc07d41cd81d840a4a1f7bb5eede` |
| [#13117](https://github.com/manaflow-ai/cmux/pull/13117) | closed / 2026-09-20T09:01:14Z | main | `bd65a8a64ac50c585f108174119835b640b801f7` |
| [#13118](https://github.com/manaflow-ai/cmux/pull/13118) | closed / 2026-09-20T09:06:28Z | main | `9da8b07d68a1d564753869927c4dc43c85aa0193` |
| [#13160](https://github.com/manaflow-ai/cmux/pull/13160) | closed / 2026-09-20T09:06:05Z | main | `1cd76ebbdce8c33144c34c2ca26b681cf4bb94e0` |
| [#13168](https://github.com/manaflow-ai/cmux/pull/13168) | closed / 2026-09-20T10:18:11Z | main | `5fb6d8c69400fffc268e2e95c4475f18f1475e83` |
| [#13139](https://github.com/manaflow-ai/cmux/pull/13139) | closed / 2026-09-20T10:17:08Z | main | `a3480647a925f1e9af6e6be31fab1ba89438740a` |
| [#13122](https://github.com/manaflow-ai/cmux/pull/13122) | closed / 2026-09-20T10:53:37Z | main | `76d80b1363ebf7c84238f5e2640ca0949ddee154` |
| [#13175](https://github.com/manaflow-ai/cmux/pull/13175) | closed / 2026-09-20T08:08:04Z | ci-route-release-build | `a14fa0df901b92e0544bebdf4f4c7b0f36cb7bcf` |
| [#13111](https://github.com/manaflow-ai/cmux/pull/13111) | closed / 2026-09-20T10:58:02Z | main | `fcad43f22537659288b80b45058d0c506864b060` |
| [#13166](https://github.com/manaflow-ai/cmux/pull/13166) | closed / 2026-09-20T11:10:19Z | main | `14c3ca1c88d95ad15867f3c2689e2acc857a6669` |
| [#13165](https://github.com/manaflow-ai/cmux/pull/13165) | closed / 2026-09-20T13:05:37Z | main | `2a1d8d3780fea278958d67e736287e155bfb8890` |
| [#13123](https://github.com/manaflow-ai/cmux/pull/13123) | closed / 2026-09-20T15:33:09Z | main | `b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110` |
| [#13172](https://github.com/manaflow-ai/cmux/pull/13172) | open / not merged | main | `not landed` |
| [#13201](https://github.com/manaflow-ai/cmux/pull/13201) | open / not merged | main | `not landed` |
| [#13199](https://github.com/manaflow-ai/cmux/pull/13199) | closed / not merged | main | `not landed` |
| [#13204](https://github.com/manaflow-ai/cmux/pull/13204) | open / not merged | main | `not landed` |
| [#13235](https://github.com/manaflow-ai/cmux/pull/13235) | open / not merged | main | `not landed` |
| [#13170](https://github.com/manaflow-ai/cmux/pull/13170) | open / not merged | main | `not landed` |
| [#13171](https://github.com/manaflow-ai/cmux/pull/13171) | open / not merged | main | `not landed` |
| [#13176](https://github.com/manaflow-ai/cmux/pull/13176) | closed / 2026-09-20T10:33:25Z | main | `fdc63e9ec5f327aa3ba8d0a5fe38223709da5ccf` |
| [#13178](https://github.com/manaflow-ai/cmux/pull/13178) | closed / 2026-09-20T11:10:22Z | main | `9faf7264d2015fbd425c2b0f8052ff4222270fbc` |

The 09:30 runbook in #13182 is historical: #13168 subsequently introduced R2 support. A setting, merged code, successful seeding, a consumer restore and a measured saving are separate facts. #13175 merged into its parent #13122, not directly into main. #13199 was replaced by #13204; the fail-fast follow-up is #13235. Source snapshots at each CI/nightly head SHA record whether the cache action supports R2; `workflow_execution_sha` remains unknown where not independently exposed.

## Supplementary cold/warm and seed evidence

These runs are outside primary totals unless their creation falls inside a primary window. They are not an independent savings component to add to the cohort difference.

| Role | Run | Source revision | Observed runner min (all attempts/jobs) |
|---|---|---|---:|
| cold | [35500307901](https://github.com/manaflow-ai/cmux/actions/runs/35500307901) | `2c04b6a45c1e58d846204c415900640b5708bf85` | 33.25 |
| seed | [35501760164](https://github.com/manaflow-ai/cmux/actions/runs/35501760164) | `7d9a7f2cb013a1e08ae73c25b70d8adf7e8f69f3` | 45.08 |
| warm | [35501759139](https://github.com/manaflow-ai/cmux/actions/runs/35501759139) | `b6853ee7be09e598ef232cac8213db1c97b3ff65` | 7.50 |

For Release jobs 106050825352 → 106054654571, the first-step-to-completion intervals are 1,991 → 447 seconds: (1,991 − 447) / 1,991 = 77.55% less observed job time. The source revisions are in the table above. This reconciles the [#13168 PR claim](https://github.com/manaflow-ai/cmux/pull/13168) of 1,992 → 448 seconds under a slightly different job boundary. The unchanged-app-input claim comes from that PR; different SHAs alone cannot verify it.

Seed costs above are additional producer work; no population-level seed amortization or additive savings is claimed. Restore/save step overhead and outcomes are retained per job. Bytes, actual archive provenance and backend remain unknown for the timed pair because its build-job logs were unavailable.

A separate retained [failed-job log](https://github.com/manaflow-ai/cmux/actions/runs/35509887189/job/106076170670) from the earlier audit proves R2 prefix consumption, despite the compiler failure. Its original digest, bounded timestamped excerpt and parsed facts are in `fixtures/observed-r2.json` and receipts.external_observations; this is outside the primary cohorts:

- `actions_cache_backend_unverified`: `miss`; key `unknown`.
- `r2`: `prefix`; key `spm-5275da5c1ef1d746e717a7928184c0ee61f768267c1c9d35e5e7315f59adb474`.
- `r2`: `prefix`; key `xcode-compilation-test-macOS-ARM64-c4728a44cf18adc521070ca61d009904-f48ef36235584fdf41990995101dc54190d46622`.

## Evidence completeness

- after: run pagination complete=True; 35 jobs without measured closed execution intervals.
- before: run pagination complete=True; 65 jobs without measured closed execution intervals.
- Job-page failures: 0 attempts. Attempt-detail failures: 0.
- Job log coverage: `{"available": 3, "not_sampled": 3173, "request_failed": 14, "timeout_or_invalid_response": 2}`. Sampling: First and last executed CI admission/app-host/package/release or nightly job in each cohort × conclusion stratum, plus all executed supplementary-run jobs. Job IDs sorted numerically. No hit-rate extrapolation.
- Exact-head source snapshots: {'readable': 112, 'absent_at_readable_head': 48}. An absent action at a readable commit is historical implementation evidence, not a failed permission check.
- Per-attempt JSON retains executed and skipped steps, runner labels, outcomes, cache restore/save step overhead and allowlisted log receipts. A successful step does not prove a hit, a test count, an accepted baseline, or complete coverage. Test summaries may be nested; unique test counts and accepted/new-failure classification remain unknown.
- Artifact API inventories retain size, digest and expiry when exposed; archive contents were not downloaded. Producer provenance, seed age, archive/pointer integrity and fork write capability remain unverified without dedicated receipts. Raw logs, environments, URLs from logs and local paths are never published.
- Discarded merge-group identity and cancellation cause are unknown: cancelled status alone cannot establish queue removal. All cancelled and still-running merge jobs stay in the accounting; audit/queue-exit events are required to attribute waste.
- Monetary estimate: withheld. No verified contract/invoice or billable rounding evidence. Monetary estimates withheld; runner wall seconds are not billed seconds.

## Largest workflows by observed exposure

| Rank | Workflow | After runner min | Before runner min |
|---|---|---:|---:|
| 1 | `.github/workflows/ci.yml` | 519.03 | 5,969.27 |
| 2 | `.github/workflows/web-complexity-trusted.yml` | 140.02 | 222.90 |
| 3 | `.github/workflows/test-e2e.yml` | 75.47 | 52.22 |

Exposure is an upper bound for investigation, not avoidable cost. The three ranked residual problems are complexity checkout (#13171), artifact delivery (#13172 / #13201), and cancellation/merge-validation lifecycle (#13235). Concrete evidence and next actions are in [findings.md](../findings.md); its claims must point to these receipts or the dated upstream discussion. The collector has no dispatch, cancellation, settings-write, credential-write or production path.
