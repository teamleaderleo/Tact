# CMUX CI receipts (Tact #82)

From the repository root, replay the frozen, sanitized evidence and run the focused tests:

```sh
python3 experiments/cmux-ci-receipts/run.py
```

Python 3.10+ standard library only; no network, token or dependencies for replay. Outputs: [`results/report.md`](results/report.md), [`results/metrics.json`](results/metrics.json), [`results/receipts.json.gz`](results/receipts.json.gz). Read [findings.md](findings.md) for the ranked decisions.

To recollect the same declared cohorts with authenticated `gh` and GitHub read access:

```sh
python3 experiments/cmux-ci-receipts/run.py --collect
```

Only REST GETs are used. Run/job metadata, all attempts, job pages and relevant artifact inventories are paginated to exhaustion. Filtered run queries recursively bisect time at the 1,000-result ceiling; a single-second overflow fails visibly. There is no workflow dispatch, cancellation, repository/credential write, production command or third-party repository edit. `gh` handles authentication; tokens never enter the report.

The collector caches each endpoint, timestamp and error under ignored `.private/`. Repeating `--collect` resumes this snapshot; it does **not** refresh cached endpoints. `--collect --retry-metadata-errors` retries each cached transient metadata failure once and retains the prior error; it never retries cached log failures or 404s. For a new snapshot use `--cache /absolute/private/directory --output /absolute/report/directory` and keep the old evidence. Do not commit raw cache files. Content-minimized receipts contain original public run/job identities and outcomes, allowlisted log facts, exact source hashes and explicit nulls. They omit raw bodies, environments, local paths, signed URLs and raw logs. Disk use and API requests scale with all runs in the fixed windows; the full collection takes several minutes.

`cohort.json` declares equal half-open UTC windows, selected by workflow-run creation: September 20, 2026 07:00–08:00 and 13:00–14:00. All events, workflows, conclusions and attempts remain included. Three supplementary R2 runs are named separately. Jobs may complete after the cohort boundary. Source and settings API fetch timestamps can differ from job timestamps; current settings never establish historical execution.

Log collection is bounded and deterministic: first/last eligible job by numeric ID within cohort × job-conclusion, plus every executed supplementary-run job. Eligibility is CI/nightly admission, app-host, package, release, seed or changes jobs. Log errors and unsampled jobs remain distinct. This is not a representative cache-hit sample. Artifact inventories are collected for CI/nightly and supplementary runs; contents are not downloaded. Other workflows have full job/step metadata, but no artifact or exact-source inspection in this bounded slice.

Accounting sums first executed step start → job completion, once per run/attempt/job. Cancelled attempts, retry attempts and merge-group failure tails overlap; they never add to the total. Missing completion or step timing is unknown, not zero. Billable rounding, negotiated provider prices, storage/request charges and model spend are unavailable, so dollars are withheld. Runner classes use labels, not the current runner setting. Backend evidence comes from logs; provider labels alone cannot establish a storage backend.

CI feedback latency is original creation → latest observed successful/failed `ci-status` or compile result. It includes retry delay but censors cancellations/missing results. It does not measure PR-open-to-merge or administrative queue residence. Per-merged-PR ratios are clock-window throughput ratios, not linked change costs.

The normalizer keeps provider run/job/step outcomes separate from interpretations. Test counts, baseline acceptance, new failures, source checkout proof and producer provenance remain null without evidence. This is compatible with the additive verification-envelope work in [Tact #83](https://github.com/teamleaderleo/Tact/issues/83); it introduces no competing CI authority. A green step is not proof it selected tests. Observed app-host execution shape is not proof of the effective suite setting. Source at GitHub run `head_sha` is not necessarily the checkout or executing workflow SHA.

Existing owners: [cmux #13095](https://github.com/manaflow-ai/cmux/issues/13095), [#13182](https://github.com/manaflow-ai/cmux/issues/13182), [Tact #75](https://github.com/teamleaderleo/Tact/issues/75), [#80](https://github.com/teamleaderleo/Tact/issues/80). The previous broad CI-only audit is a cross-check, not a cohort merged into these totals. This experiment changes none of the upstream build, cache or failure-policy implementations.

The full content-minimized receipt is deterministic gzip JSON to keep this 3,192-job snapshot small. Inspect it with `gzip -dc experiments/cmux-ci-receipts/results/receipts.json.gz`. `metrics.json` stays uncompressed and readable. The retained R2 fixture is a separately identified prior-audit observation, with its original log digest and unknown download time; recollection does not relabel it as a fresh request.
