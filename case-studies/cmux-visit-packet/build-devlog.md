# cmux build times: dev log

What was tried, what it showed, and what it ruled out. Negative results are kept on purpose. Protocol: [Tact#76](https://github.com/teamleaderleo/Tact/issues/76).

Machine for every number here unless stated: MacBook Air M5 (10 cores, 24 GB), macOS 26.6.2, **Xcode 27.0 / Swift 6.4**, one heavyweight build at a time, AC power. CI and the office Mac run Xcode 26.3 / 26.5, so absolute times do not transfer; before/after pairs on the Air do. Never add or multiply rows together.

Tools: `evidence/build-description/buildprofile.py` (parallelism timeline from any `.xcactivitylog`), `timings.py`, `slf.py`.

## 1. Baseline (upstream `main` `533c7cc343`, overnight 09-19)

| build | time |
|---|---|
| cold tagged Debug build | 694 s |
| no-op | ~11 s (`xcodebuild`), ~28 s through `reload.sh` |
| one-file edit, small app-target file | ~38 s (emit-module 13 s + planning 6.5 s are whole-module taxes) |
| one-file edit, local package | ~14 s |
| one-line edit inside `ContentView.swift` (17.8k lines) | ~123 s |

Cold build shape: ~90 s resolve/plan, ~450 s saturated, then `ContentView.swift` compiling alone ~50 s, then an ~88 s serial tail (helper Run Script 66 s, XCStrings 17 s, link, sign). 68% of the machine used. Idle gaps of 5/15/27 min never re-planned or recompiled the module (0/7).

App target = 84% of compile CPU (3,705 files; 2,480 compile tasks, 4,333 task-seconds). The cost is a **flat long tail**: `ContentView.swift` is the worst file at 118 s and is only 2.7%; the top 30 files are 9.4%. Splitting big files fixes the critical path and per-edit cost, not total CPU. Only a smaller app module does that.

Not a type-checker problem: slow type-check sites total 38 s module-wide, 2.2 s in `ContentView.swift`. One real hotspot: `BrowserPanelView.swift:1072` (6.8 s, one expression). Small SwiftUI files with extreme cost per line: `MarkdownPanelView` (11 s / 333 lines), `CustomSidebarPanelView` (5 s / 168 lines).

## 2. PR verdicts (Air vs Air)

| PR | result |
|---|---|
| #12976 (merged) stable project description | **win**: no-op 20.3 -> 10.7 s, edit 48.0 -> 39.0 s; "Create build description" 9.1 -> 0.19 s |
| #12985 incremental bundled resources | as first pushed: **+55 s regression** on every warm build (fingerprint ran `shasum` once per file over 5,901 ghostty files). Fixed (HEAD + diff + untracked key, batched): skip path ~0.3 s vs 1.6 s on main |
| #12972 diff sidecar skip | skips correctly; the phase only costs ~0.2 s warm, so **no material wall-clock change** |
| #12988 helper cache | hit 0.24 s vs miss 54 s; invalidation cases correct |
| #12973 local backend mode | workflow fix; full real build verified |
| #12971 `--build-only` | **found a bug**: it deleted the tagged app bundle. Fixed with a red-then-green test |
| #13022 (maintainers' integration of #12985/#12972/#12988) | its new in-process fingerprint: 0.55 s on the same tree; regression not present |

## 3. Docs that cost agents a cold build (#13033)

- The compile-only recipe pointed at `/tmp/cmux-<tag>` while `reload.sh` builds into `~/Library/Developer/Xcode/DerivedData/cmux-<tag>`: a second cold build. In the tag's real DerivedData it is 41 s, then 11 s.
- `xcodebuild -scheme cmux-unit ... build` compiles **zero test files** and reports success (`cmuxTests` is `buildForRunning="NO"`). The action that compiles tests is `build-for-testing` (957 test files, 153 s warm).
- Do not share the tag's DerivedData with the test build: a **failed** `build-for-testing` leaves an unsigned `cmuxTests.xctest` in the app bundle and the next app build fails at CodeSign.
- Xcode 27 only: `build-for-testing` fails on main with "unable to type-check in reasonable time" at `cmuxTests/CLISSHPTYAttachProbeReplyRegressionTests.swift:140`.

## 4. Xcode compilation cache

Settings: `COMPILATION_CACHE_ENABLE_CACHING`, a shared `COMPILATION_CACHE_CAS_PATH`, `SWIFT/CLANG_ENABLE_PREFIX_MAPPING`, `*_ENABLE_PROJECT_PREFIX_MAPPING`, `*_OTHER_PREFIX_MAPPINGS=<DerivedData>=/^derived`.

**4a. PathKit poisons it across DerivedData paths.** Same path: 108.7 s, 0 misses. New path: ~500 s, the whole app target missed. Cause: PathKit 1.0.1 declares `swift-tools-version:4.2`; Xcode builds Swift < 5 without explicit modules ("swift compiler caching requires explicit module build"), so its module key embeds the DerivedData path and poisons XcodeProj -> CMUXProjectModel -> the app target. Found by diffing two builds' cache keys with `llvm-cas`. `SWIFT_ENABLE_EXPLICIT_MODULES=YES` does not help. Issue: cmux#13037.

Fix path: vendoring PathKit worked (0 misses) but raised a SwiftPM identity-conflict warning. Final fix is a **SwiftPM mirror** to `manaflow-ai/PathKit` 1.0.2 (one manifest line changed), #13046. Validated through `reload.sh`, new tag + new DerivedData: **146.6 s, 3,270 replay hits / 0 misses**.

Still unsolved: sharing across *worktree* paths. An explicit `<worktree>=/^src` mapping breaks the C module `CmuxFoundationAtomicsC` (header not found).

**4b. What the cache is worth, through `reload.sh`, new tag each time, same day** (the machine was ~35% slower than overnight; compare within this table only):

| new tag, setup | time | replay hits / misses |
|---|---|---|
| no cache | 953 s | - |
| cache, no PathKit fix | 708 s | 765 / 2,503 |
| cache, PathKit fixed, sources unchanged | **157 s** | 3,270 / 0 |
| cache, one comment line added to a **package** file | **152 s** | 28 misses; app target fully hit |
| cache, one comment line added to an **app-target** file | 697 s | app target: 0 hits |

The app module is one cache unit: any edit inside it forfeits the whole module. A package edit that leaves the interface alone keeps everything downstream cached. (Tested with a comment; a real body edit is expected to behave the same, not yet measured.)

**4c. It destroys incremental builds (decisive).** In a warm tag with the cache on, no-op 27.8 s, then one comment line in a small app-target file: **603.9 s**, the entire app target recompiled (cache off: ~38 s, 3 files). So it must not be a `reload.sh` default. It is fine for CI (always clean builds) and one-shot builds.

**4d. Hybrid is dead.** Seed a tag with the cache on (135 s), then build the same tag with the cache off: everything recompiles (776 s), because the setting flip changes every compile command.

**4e. Slots (the default worth building).** A tag only changes bundle id, names and socket, none of which are Swift inputs. New tag into an already-warm DerivedData: **35.7 s, 0 Swift compiles** (vs 953 s fresh); no-op 26 s; switching back 26.9 s; a third tag carrying a one-line edit 59.1 s. **Middle case: same slot, one newer upstream commit merged (package interface change + pbxproj file-list change): 620.1 s, nearly everything recompiled.** So slots only pay off if kept warm at the code tasks start from. Design: [build-slots-design.md](build-slots-design.md). Cloning a DerivedData to a new path does not work (absolute paths; confirmed independently).

## 5. `ContentView.swift` split (#13048)

Pure move of the sidebar views into four files (17,847 -> 10,729 lines), character-identical on reassembly, five declarations lose `private`. First A/B (n=1 per row): edit in the sidebar 124.0 -> 74.9 s; edit at the top of `ContentView` 147.2 -> 97.7 s; no-op unchanged. After the split `ContentView.swift` still compiles in 120 s and `VerticalTabsSidebar.swift` in 103 s, so that is the next cut.

Things that hardcode `Sources/ContentView.swift` and broke CI: `scripts/check-sidebar-lazy-layout.py`, `.github/swift-warning-budget.tsv` (per-file counts). Fixed in the PR.

## 6. Harness mistakes (kept in the data)

- Sharing `-clonedSourcePackagesDirPath` across arms at different commits caused a 383 s whole-module rebuild (sample 036). Never share it.
- A/B probe #1 inserted a statement into single-expression functions: build failures in both arms.
- A/B probe #2 inserted a new file-scope `private func`: ~3,270 files rebuilt in **both** arms, so it measured nothing. A correct probe edits an existing function body (`_ = n` after a unique single-line `guard`).
- One sample's wall clock spans a closed-lid commute (1,831 s): invalid as a timing.
- A cache-populate build ran while other agents were building (load average 58): not quoted as cache overhead.
- One wrong inference, corrected: from a single CI run whose four cache restores all missed I claimed CI caches never hit. A sample of seven runs (office session) showed PR runs do restore a main-seeded Release cache; the variance comes from whole-module caching (one package edit cascaded; the app module alone was 29 of 33 min).
- zsh: `$var:word` applies history modifiers; write `${var}:word`. `pgrep -f name` in a wait loop matches itself; use `"[n]ame"`.

## 7. CI, from public job logs (not measured on the Air)

Run for #13007 (09-18): compile admission 1,015 s (compile 814 s, no compilation cache), six unit shards 601-2,360 s, release-build 1,978 s, package tests 1,054 s. `cli-pipe-regressions` builds with Xcode 16.4 / macOS 15.5 SDK and fails on `posix_spawn_file_actions_addfchdir`: the call is inside `#available(macOS 26, *)`, which is a runtime check; the symbol is missing from the old SDK at compile time.

## 8. Open

- Slots: seven-commit `main` replay done (see the design doc): 0-compile for commits outside the macOS build, 540 s for a low-level package interface change, 437 compiles when a file is added to the app target (not a whole-module rebuild). Still untested: same DerivedData from a different worktree path.
- `reload.sh` overhead outside `xcodebuild`: my `bash -x` trace was useless (reload.sh buffers its own output into a log, so the trace arrived in one lump). An independent measurement puts the script's own logic at ~1 s and the rest in helper/TUI install, app copy, signing and launch checks; #13087 skips those steps when the built app and the staged values are unchanged: warm no-op ~21 s -> ~11 s. Its first version keyed reuse on `git diff` and would have reused a stale app after a commit (caught by Greptile, not by my validation, which only tried an uncommitted edit); the key is now a fingerprint of the built app (Info.plist, signing seal, executables).
- Type-check hotspot splits (branch `perf/typecheck-hotspots`), measured with `-warn-long-expression-type-checking=200`: `BrowserPanelView.swift` goes from 4 slow sites (worst one expression, ~7-8 s) to 0. `MarkdownPanelView` and `CustomSidebarPanelView` had **no** site over 200 ms before the change, so their splits have no evidence; my per-file ranking of them came from a contended cold build. No measurable whole-build change. Next slow site: `SurfaceCatalog+CloudPorts.swift:37` (2.7 s).
- Restored DerivedData with new inodes (APFS clone at the same path): 0 recompiles with or without `IgnoreFileSystemDeviceInodeChanges` (39.3 / 41.4 s vs 26.7 s no-op). So inode churn is not why CI's restored DerivedData misses. Limits: same volume, Xcode 27.
- Corrected split A/B, n=2 per edit site per arm.
- Moving code out of the app module into packages: first extraction (`CmuxComputerUse`, 11 files) **does not build**: `AgentPIDProcessIdentity.swift` was a member of both the app and the CLI target, and the CLI does not link the new package. Lesson for every extraction: check target membership of each moved file (`grep -c "<file> in Sources" project.pbxproj`), not just who imports what. Same-file comment edit on the base, as an app-target file: 38.9 s; the package-side number is still missing.
- Remote compilation cache service for the fleet (`COMPILATION_CACHE_REMOTE_SERVICE_PATH`): untested.
- PathKit behaviour on Xcode 26.x, different DerivedData paths: untested (same-path replay with 0 misses is confirmed in CI on 26.5).
