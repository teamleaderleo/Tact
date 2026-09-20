# Fast local verification: experiment findings

The implementation lives in [CMUX PR #13248](https://github.com/manaflow-ai/cmux/pull/13248),
branch `tools/verification-receipts`, at
`fde65a6d7ca5dc711fb47fe95c05f3e12c46444a`.
The [contributor guide](https://github.com/manaflow-ai/cmux/blob/fde65a6d7ca5dc711fb47fe95c05f3e12c46444a/docs/verification-receipts.md)
is the owning contract. This directory contains findings only.

The initial single-test receipt wrapper added little value to local iteration.
The useful integration is a **pre-build/pre-CI static preflight**, using the same
production checks locally and in CI:

```sh
python3 scripts/verify-local.py
python3 scripts/verify-local.py --only project --only test-wiring
python3 scripts/verify-local.py --receipt /tmp/cmux-preflight.json
```

It checks localization, project configuration, generated policy, test-target
wiring, package grouping and feature flags, and runs the project normalizer tests.
Failures show a diagnostic and focused rerun command. An actual temporary-Git
fixture proves the loop: an unwired Swift test fails with its filename; repairing
target membership makes the same command pass without a native build.

## Observed result

- Real full preflight on observed CMUX HEAD `543a7b4529929d8b04d885ad0f058da24874cc89`:
  eight checks passed, five normalizer tests executed, zero skipped. About 13 seconds
  of child-command execution on this Mac is one observation, not a benchmark.
- 28 focused tests passed across the receipt adapter and local command. They cover
  the real wiring failure/repair, zero-test rejection, source drift, interruption,
  bounded diagnostics, missing tools, schema refusal and command invocation.
- Existing CI routing tests pass. The workflow change and tooling tests retain
  Linux-only classification. CI calls the same preflight command.
- The older docs-auth CI example remains replayable: passing tests/job inside a
  failed workflow, with a checkout merge different from the PR head.

Receipts retain dirty/unknown source qualifications. Matching HEAD observations
are not an exact snapshot. The preflight does not compile Swift, execute native
app tests, package an app or establish a tagged build/launch identity.

Remaining acceptance in [#83](https://github.com/teamleaderleo/Tact/issues/83):
immutable source execution, real tagged artifact handoff, selected/discovered
native-test inventories, physical interruption reconciliation, current review
imports, merge-group integration and a second-contributor product trial.
[#82](https://github.com/teamleaderleo/Tact/issues/82) retains its separate
rollout/cache/cost report and compatible shared reporting fields.
