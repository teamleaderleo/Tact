# Build-description cache: scripts and raw results

Supporting material for [build-loop.md](../../build-loop.md) and the comments on Tact#74.
Measured 2026-09-18 on one Apple-silicon Mac (M5, Xcode 27.0). The write-up lives in the
issue; this directory is only what is needed to re-run it.

## Finding in one paragraph

Malformed objects in `cmux.xcodeproj/project.pbxproj` make Xcode synthesize fresh guids
every time the project loads. The PIF digest changes, the build-description cache never
hits, and every build re-plans: ~27 s `Create build description` plus ~20 s of XCStrings
output-path computation on a no-op. `upstream/main` has two of the anomalies (an orphaned
`PBXFileReference` for `Resources/bin/open`, and an `en` variant-group child without
`en.lproj/`). The fork has a third (duplicate object id `D0F102000000000000000001`).

| tree | no-op build |
| --- | --- |
| fork, pristine | 100.7 s, 97.4 s |
| orphan fixed only | 93.9 s, 93.6 s (still re-planning) |
| all three fixed | 101.6 s (first, re-plans once), then 74.6 s, 72.2 s |

Upstream fix: manaflow-ai/cmux#12976. Fork equivalent: teamleaderleo/cmux#69.

## Scripts

| file | what it does |
| --- | --- |
| `slf.py` | Tokenizer for Apple's SLF0 format (the gzip'd `.xcactivitylog`). |
| `timings.py <log.xcactivitylog>` | Per-tool wall clock from `TaskMetrics.wcDuration`. Works on any build Xcode already produced; no `-showBuildTimingSummary` needed. |
| `buildprofile.py <log.xcactivitylog> [--wall S]` | Where a build's wall clock went: parallelism timeline, serial stretches, slowest single tasks, share of the machine used, task-seconds by target. Works on any existing log, no rebuild. Task timestamps are completion times, so intervals are `[end - duration, end]`. |
| `anom3.py <project.pbxproj>` | Finds duplicate object ids, orphaned file references, and variant-group children missing their `.lproj/` prefix. |
| `variant.py <project.pbxproj>` | Dumps just the `PBXVariantGroup` objects. |
| `pifloop.sh <worktree> <derived-data> <n> <label>` | Loads the project `n` times with `xcodebuild -showBuildSettings` and counts distinct `PROJECT@` entries in the PIF cache. One key means the cache can hit. ~10 s per load after the first; no build. **Deletes `<derived-data>` first.** |
| `apply_fix.py <repo-root>` | Applies the three-part pbxproj fix. `verified_fix.diff` is the resulting diff against the fork. |

A fresh worktree cannot load the project without `vendor/bonsplit` initialised and a
`GhosttyKit.xcframework` present (symlinking the main checkout's is enough).

## Results

- `results/pif_*.txt`: `pifloop.sh` output for pristine `upstream/main` (3 loads, 3 keys),
  orphan-only (5, 5), duplicate id re-injected on top of the fix (3, 3), and the fix
  branch (3 loads here, 7 in the issue, 1 key).
- `results/build_*.json`: Glaeda receipts behind the table above. `source_after.clean`
  is `false` on the fix runs because the fix was applied to the working tree.
- `results/bd*_before.txt`, `bd*_after.txt`: `.xcbuilddata` listings around a no-op build.
  `bd_*` (pristine) gains a new description each build; `bd4_*` (all fixed) does not.

Not kept: the raw PIF and manifest dumps (~100 MB). `xcodebuild -dumpPIF` regenerates them.

## Still unmeasured

- Wall clock on a tree based on `upstream/main` (the numbers above are on the fork).
- The unnamed `Run Script` phase (12.5 s, no declared inputs or outputs).
- The ~24 s of `reload.sh` outside `xcodebuild`.
- Whether a compilation cache shared across tags (`COMPILATION_CACHE_ENABLE_CACHING` plus a
  common `COMPILATION_CACHE_CAS_PATH`) shortens the ~19 min cold build a new tag pays.
