# Fast local verification: experiment findings

The implementation lives in [CMUX PR #13248](https://github.com/manaflow-ai/cmux/pull/13248),
branch `tools/verification-receipts`, at
`a1ca66f79139f92aa4df7c4d487c41c835ad5aca`.
The [contributor guide](https://github.com/manaflow-ai/cmux/blob/a1ca66f79139f92aa4df7c4d487c41c835ad5aca/docs/verification-receipts.md)
is the owning contract. This directory contains findings only.

The initial single-test receipt wrapper added little value to local iteration.
The useful integration is a **pre-build/pre-CI static preflight**, using the same
production checks locally and in CI:

```sh
python3 scripts/verify-local.py
python3 scripts/verify-local.py --only project --only test-wiring
python3 scripts/verify-local.py --receipt /tmp/cmux-preflight.json
python3 scripts/verify-local.py --swift-changed
python3 scripts/verify-local.py --only swift-syntax --swift-changed origin/main
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
- 42 focused tests passed across the receipt adapter and local command. They cover
  the real wiring failure/repair, zero-test rejection, source drift, interruption,
  bounded diagnostics, missing tools, schema refusal and command invocation.
- Existing CI routing tests pass. The workflow change and tooling tests retain
  Linux-only classification. CI calls the same preflight command.
- The older docs-auth CI example remains replayable: passing tests/job inside a
  failed workflow, with a checkout merge different from the PR head.
- A later real full preflight on observed HEAD `89116fba0e529543841be58894a39d9705d40a28`
  passed all eight checks, executing five normalizer tests and skipping zero, with
  21.494 seconds of child-command execution. Source remains dirty-qualified.

## Composition and discovery

`--swift-changed` selects current staged/unstaged/nonignored untracked Swift;
an explicit base ref adds committed changes since its merge-base. Automatic
selection excludes the managed `.glaeda/apple-build/` cache, which a real trial
otherwise selected as a generated Swift test runner. Explicit file selection is
still available.

`--swift-stdin0` accepts NUL-delimited checkout-relative paths and filters Swift;
`--receipt -` emits JSON on stdout with diagnostics on stderr. A real Git diff
pipeline selected and parsed five Swift files at observed HEAD
`89116fba0e529543841be58894a39d9705d40a28`, retaining dirty-source qualification;
`swift-selected.json` records that scope. An empty selection is `skipped` with
`reason: no_swift_inputs`, exits 0, and makes no parsing-pass claim. This does not
relax zero-executed-test rejection. Pipeline callers must use `pipefail` to retain
upstream failures.

Help now groups common checks, composition and execution controls. The testing
skill gives a short quick start, `--list` reveals underlying commands, and detailed
references cover scope and receipts. All 43 checked relative links and the skill
validator pass. A new skill index separates app operation from repository work.
The broader 22-skill audit found that Cloud VM's approximately 8,300-word entry
point concatenates two versions with conflicting plan guidance. The completed
consolidation is in [CMUX PR #13270](https://github.com/manaflow-ai/cmux/pull/13270),
including the duplicated references and a dedicated guest reference. The existing
CLI coverage guard passes and retains missing-required-file detection. The app's
separate bundled single-file prompt is unchanged.

## Final cleanup and token comparison

The verifier's review finding about absolute checkout paths is fixed: the actual
parser invocation and receipt now use `swiftc` and `./checkout-relative.swift`
arguments. Historical example normalization is explicitly labelled. All 42 focused
tests pass. The branch incorporates main `9e7d3be`, resolves the contributor-guide
conflict by keeping the central ladder, and links that ladder to automatic/piped
preflight. Both known review threads were answered and resolved.

[The per-file token report](token-counts.md) includes immutable source revisions,
new/expanded references, CLI help, JSON data and a reproducible counting command.
With `o200k_base`, the Cloud entry point falls 94.1%, the full Cloud Markdown
corpus falls 40.7% including moved content, and all measured instruction files
fall 24.5%. These are text-token counts, not billed usage or an assumption that
all references load on every task.

## Improvements grounded in recent iteration

The existing CI analysis owner's cached snapshot contained 787 runs/788 attempts
created between 2026-09-20 15:32:58Z and 17:30:00Z, spanning 11 human/bot actors.
It had 1,936 unique jobs, of which 18 were incomplete and excluded from duration
sums. These are observed runner durations, not billing or causal savings:

| Workflow | Runs | Observed completed-job runner minutes |
| --- | ---: | ---: |
| CI | 52 | 1,528.48 |
| Web complexity | 108 | 214.60 |
| Web complexity candidate | 48 | 121.22 |
| Web validation | 51 | 108.98 |
| CLA policy guard | 108 | 17.82 |

This reused the existing report owner's data rather than creating another
measurement lane. High trigger volume alone does not establish high cost.
Root causes were inspected for the specific examples below; this is not a
root-cause classification of every failed run.

- **Earlier useful failure:** [CI job 106117704441](https://github.com/manaflow-ai/cmux/actions/runs/35525568719/job/106117704441)
  spent 12m14s in app-host test compilation before failing on a Swift raw-string
  syntax error. The actual PR-head file reproduces that error with the parser in
  0.132s; the missing-backslash repair parses in 0.075s. These single parser
  observations do not prove typechecking, test execution or full CI checkout
  identity. The new `--swift` option and example receipts retain those limits.
- **Avoid redundant intermediate pushes:** our deliberately failing test-only
  [run 35525973719](https://github.com/manaflow-ai/cmux/actions/runs/35525973719)
  was cancelled after the fix arrived and received a review finding on that
  intermediate head. Instructions now retain separate regression/fix commits and
  local fail/pass proof, while allowing both commits to be pushed together.
  CI-only reproductions and final-head required checks remain authoritative.
- **Existing larger repairs:** [#13170](https://github.com/manaflow-ai/cmux/pull/13170)
  removes duplicated PR web validation; [#13171](https://github.com/manaflow-ai/cmux/pull/13171)
  narrows complexity-workflow checkouts. Their owners retain those changes.
- **Still open:** conservative path routing starts native jobs for this portable
  tooling/fixture/CONTRIBUTING change. A narrowly tested classification change is
  preferable to broadly exempting scripts or assuming zero native dependency.
- **One contributor guide:** [#13242](https://github.com/manaflow-ai/cmux/pull/13242)
  owns the contributor-wide ladder; #13248 owns the runnable preflight and its
  command reference. The duplicate change-to-check table was removed, and the
  command/policy integration was recorded on #13242.

Receipts retain dirty/unknown source qualifications. Matching HEAD observations
are not an exact snapshot. The preflight does not compile Swift, execute native
app tests, package an app or establish a tagged build/launch identity.

Remaining acceptance in [#83](https://github.com/teamleaderleo/Tact/issues/83):
immutable source execution, real tagged artifact handoff, selected/discovered
native-test inventories, physical interruption reconciliation, current review
imports, merge-group integration and a second-contributor product trial.
[#82](https://github.com/teamleaderleo/Tact/issues/82) retains its separate
rollout/cache/cost report and compatible shared reporting fields.
