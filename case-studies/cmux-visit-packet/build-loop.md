# The build loop: 34 minutes to 22 seconds, and what it cost to get there

**Status:** 58 real build receipts from one Apple-silicon machine, 2026-09-12 to 2026-09-15, building this cmux fork.
**Method:** durations recorded by the build wrapper into `.glaeda/apple-build/run-*.log` during ordinary development. Not a benchmark — this is what the loop actually did while the sidebar work in [PR #57](https://github.com/teamleaderleo/cmux/pull/57) was being written.
**Reproduce:** [`evidence/build-times.py`](evidence/build-times.py).

---

## The measured loop

| | n | min | median | max |
| --- | ---: | ---: | ---: | ---: |
| all recorded builds | 58 | 22s | 100s | 2,019s |
| cold / new cache generation | 8 | 695s | 1,157s | 2,019s |
| dependency or broad change | 18 | — | 256s | — |
| **warm incremental** | **32** | **22s** | **32s** | **102s** |

**Cold median to warm median is 37×. Worst cold to best warm is 92×** — 34 minutes down to 22 seconds on the same machine, same target.

The important column is the one with 32 entries in it. More than half of all builds during this work were warm, and a warm build is 32 seconds. That is the difference between "make a change and see it" and "make a change and go do something else."

## Why this needed building at all

The naive loop is `xcodebuild` against `~/Library/Developer/Xcode/DerivedData`. It is slow in a specific, avoidable way: DerivedData is shared, implicitly keyed, and quietly invalidated. Switching branches, running a second build, or letting Xcode touch the project can drop you back to a 20–30 minute rebuild with no explanation and no receipt.

For this fork that is not an inconvenience, it is a blocker. cmux's native target depends on Ghostty, Sparkle, Sentry, and Iroh xcframeworks; a full resolve-and-build is the 2,019-second number above. Hitting that four times in a session is the session.

## What the setup actually is

The app declares a build profile in the checkout ([`glaeda.apple.json`](https://github.com/teamleaderleo/cmux/blob/codex/current-upstream-tact/glaeda.apple.json)), and `glaeda-apple` runs the project's own `scripts/reload.sh` against **caches it owns and keys explicitly**:

```jsonc
{
  "profiles": { "app": {
      "engine": "script",
      "executable": "scripts/reload.sh",
      "arguments": ["--tag", "glaeda-native",
                    "--derived-data", "{derived_data}",
                    "--no-global-cli-links"],
      "environment": {
        "CMUX_SOURCE_PACKAGES_DIR": "{source_packages}",
        "CMUX_BUILD_FILE_HASHING": "1",
        "CMUX_RELOAD_KEEP_RUNNING": "1",
        "CMUX_BUILD_BATCH_SIZE": "8"
      } } },

  "preparations": { "app": {
      "engine": "xcode", "project": "cmux.xcodeproj", "scheme": "cmux",
      "reuse": {
        "inputs": ["cmux.xcodeproj/project.pbxproj",
                   "cmux.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved",
                   "cmux.xcworkspace/contents.xcworkspacedata",
                   "Packages/**/Package.swift"],
        "required_files": [
          { "cache": "source_packages", "path": "workspace-state.json", "match": "exists" },
          { "cache": "source_packages",
            "path": "artifacts/sparkle/Sparkle/Sparkle.xcframework/Info.plist" }
        ] } } }
}
```

Three ideas are doing the work, and they are the transferable part:

1. **The cache key is derived, not assumed.** It hashes the checkout identity (device + inode), the profile, the probed toolchain, a generation label, and the recipe script's own bytes. Change the SDK, the script, or the machine and you get a *different* cache rather than a corrupted one. On disk that is `.glaeda/apple-build/cache/<key>/{derived_data,source_packages,module_cache,…}` — currently seven live generations, 603 MB to 5.8 GB each.

2. **Dependency resolution is a separate, skippable step with a declared validity contract.** `reuse.inputs` says what invalidates the resolved package graph; `required_files` says what must exist for the cached graph to be usable (`workspace-state.json`, each xcframework's `Info.plist`). If those hold, SwiftPM resolution is skipped entirely — which is most of the gap between the 256-second and 32-second rows.

3. **Every run leaves a receipt.** `last-run.json` records elapsed time, exit code, the commit before and after, whether the tree was clean, whether any result was reused, and a phase breakdown:

```json
{ "state": "completed", "exit_code": 0,
  "generation": "semantic-integration", "result_reuse": false,
  "elapsed_seconds": 2018.650794,
  "timings_seconds": { "admission_and_preparation": 1.223744,
                       "native_command": 2018.648485,
                       "completion_observation": 0.422448 },
  "source_before": { "commit": "381dc8091…", "clean": true },
  "source_after":  { "commit": "381dc8091…", "clean": true } }
```

That is the only reason this page can exist. The 58 data points were not collected for a demo; they are a by-product of the loop recording what it did. Interrupted runs get a `quarantine-<key>.json` rather than leaving a cache that silently lies.

## The safety property, observed live

While preparing this packet I rebuilt cmux against a patched dependency and got:

```json
{"schema_version": 1, "state": "refused",
 "reason": "cache was interrupted; choose a new --generation for a cold rebuild"}
```

An earlier build had been interrupted. Rather than reuse a cache it could not prove consistent, the runtime **refused and said what to do instead**. That is the third property above doing its job unprompted: the quarantine record was written when the interruption happened, and the next run read it.

The cost was real — a new generation means a genuinely cold build, back to the top row of the table. That is the trade being made deliberately: *losing acceleration state may cost time; it must not produce a wrong binary.*

It also exposed a gap on my side rather than Glaeda's: `tk cmux warm` passes no `--generation` through, so the remedy the refusal names is unreachable from the wrapper (terminal-kit [#50](https://github.com/teamleaderleo/terminal-kit/issues/50)). A correct refusal that the tooling cannot act on still reads like a crash.

## The loop, demonstrated on this packet's own work

Fixing the accessibility bug in [`accessibility-labels.md`](accessibility-labels.md) needed a cmux build against a patched `vendor/bonsplit`. That produced two receipts in the same generation:

| run | what changed | elapsed |
| --- | --- | ---: |
| first | new `a11y-verify` generation (cold) | **1,070s** |
| second | one line in one Swift file in a submodule | **73s** |

14×, in the same session, on the work this packet describes. The second run is the one that made the fix reviewable: the first attempt at the patch turned out to break an accessibility identifier, and at 73 seconds finding that out and re-verifying cost minutes rather than the rest of the evening.

Both receipts correctly recorded `"clean": false`, because the submodule pin was dirty at the time. That is the provenance working: neither number can later be mistaken for a build of committed source.

## The honest limits

- **Not a controlled benchmark.** These are real builds with real change sizes. The bucket boundaries (600s, 120s) are my labels on a natural distribution, not a protocol. The right claim is "this is what the loop did," not "warm builds are 37× faster than cold ones under matched conditions."
- **Cold is still cold.** Nothing here makes a first build fast. It makes the *second through fiftieth* fast, and it stops accidental invalidation from sending you back to the first.
- **It is one machine.** No claim about CI, other hardware, or other developers.
- **It buys disk.** Seven cache generations are tens of gigabytes. That is the trade.
- **`swift build` still reports a pre-existing `ghostty-internal.a` binary-name diagnostic** in this checkout; the Xcode path is what is measured here.

## Why this belongs in a conversation about cmux

Three reasons, in increasing order of interest:

1. **It is the contributor loop, concretely.** Tact #44 asks what the cheap deterministic contributor path is. The answer a newcomer currently gets is closer to the 2,019-second column than the 32-second one, and nothing in the repo tells them which one they are in or why.

2. **Receipts changed what could be argued.** Every number on this page exists because the build wrapper wrote JSON nobody asked it to write. That is the same claim Tact #52 makes about agent work: *the system should retain the causal history of what it did, so a question can be answered later instead of re-run.* This page is a small, boring proof that it pays.

3. **It generalises past builds.** "Derive the key, declare what invalidates it, keep the cold path complete, and leave a receipt" is the same shape as workspace restore, session resume, and agent context reuse — all things cmux already does, in places, without a uniform way to say what was reused and why.

## The unresolved questions for the room

- What is a founding-team member's actual median edit-to-see-it time on the native app today? If it is 32 seconds, this page is redundant and I would like to know what they did. If it is minutes, that is the highest-leverage thing an incoming contributor could fix, and it is invisible from outside.
- Is there an internal build-caching story already? `scripts/select-ci-xcode.sh` and the tagged DerivedData in `scripts/reload.sh` suggest parts of one.
- Would cmux want build receipts as a first-class artifact, or is that a developer-tools concern that should stay outside the product?

---

## Related

- terminal-kit [`docs/native-builds.md`](https://github.com/teamleaderleo/terminal-kit/blob/main/docs/native-builds.md) — `tk cmux warm|build|launch` and why warm and tagged builds are kept apart.
- [Glaeda](https://github.com/teamleaderleo/glaeda) — the runtime this build profile targets.
- Tact #44 (contributor loop), #52 (receipts and causal history).
