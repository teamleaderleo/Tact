# CMUX verification handoff: findings and owner

The runnable implementation lives in [CMUX PR #13248](https://github.com/manaflow-ai/cmux/pull/13248),
branch `tools/verification-receipts`, initial implementation head
`c98504e3d88e68f7838ee21c6d8abb51e608ccc5`, based on
`b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110`.
Tact [#83](https://github.com/teamleaderleo/Tact/issues/83) owns the experiment
and remaining acceptance; [#82](https://github.com/teamleaderleo/Tact/issues/82)
retains its independent CI rollout/cache/cost report. This directory no longer
carries a duplicate adapter or test suite.

From the CMUX PR checkout:

```sh
python3 tests/test_verification_receipt.py
python3 scripts/verification_receipt.py local
python3 scripts/verification_receipt.py replay-ci tests/fixtures/verification_receipt/examples/ci-input.json
```

The [CMUX contract and reproduction guide](https://github.com/manaflow-ai/cmux/blob/c98504e3d88e68f7838ee21c6d8abb51e608ccc5/docs/verification-receipts.md)
describes the versioned evidence envelope, source qualifications, per-phase
checks, test counts and separate produced/launched artifacts. `CONTRIBUTING.md`
links the command and the existing workflow-guard-tests job runs its tests.

## Observations

- 14 focused adapter tests passed, including the four requested failure fixtures,
  actual tracked source mutation during execution with unchanged HEAD, and the
  contributor command invoked from another working directory.
- The real local docs-auth workflow/config recipe executed three tests with zero
  skips at observed CMUX HEAD `2889b72b866edfef0ac260f922fd2cf9f88906a3`.
  Before/after source observations were dirty. Matching HEADs do not establish
  exact source throughout execution. No compilation, deployment, packaging or
  launch is implied by these tests.
- [CI run 35523305193/job 106111086646](https://github.com/manaflow-ai/cmux/actions/runs/35523305193/job/106111086646)
  ran the same three tests successfully inside a failed workflow. Its observed
  checkout merge `25930fe8a91012ad178343016774d6850d5fd3db` differs from PR head
  `e0deb0e897e58de722015e714700b2ec6c220bc6`. Original provider conclusions,
  unknown after-source/workflow revision and count limitations remain visible.
- Neither example produced or launched an app. Wrong-tag artifact evidence is
  a synthetic fixture, not physical UI verification.

The initial Tact implementation was the wrong integration boundary: contributors
should use CMUX's own commands and test wiring. It was moved without changing
Glaeda's latest-source/coalescing semantics, Stensibly's reservation/settlement
ownership, or existing CI/merge authority. Shared fields were coordinated with
#82. Native owners were informed; no native build slot was used.

Remaining acceptance: immutable exact-source execution, real tagged build/launch
identity, selection/discovery inventories, submission-to-execution branch change,
physical interruption reconciliation, provider review/current-head refresh,
merge-group integration, and five bounded changes reproduced by another
contributor. Fixtures establish the adapter's qualifications, not completion of
those physical cases.
