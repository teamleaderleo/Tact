# Handoff: the cmux work

Written 2026-09-18 for whoever picks this up next. Scope is **cmux, terminal-kit and Glaeda only** — Leo cut everything else. Read [Tact#68](https://github.com/teamleaderleo/Tact/issues/68) before writing anything into these repos; it is the house style and it is enforced.

## Where things stand

| thread | state | next action |
| --- | --- | --- |
| Visit runsheet | [Tact#67](https://github.com/teamleaderleo/Tact/issues/67) + [README.md](README.md) | keep #67 as the order of the day; the packet pages are §6 support |
| Visit packet | [Tact PR#58](https://github.com/teamleaderleo/Tact/pull/58), branch `packet/cmux-visit` | unmerged, so every packet link resolves only on the branch |
| Conversation sidebar + Spaces navigator | [cmux#57](https://github.com/teamleaderleo/cmux/pull/57), 173 files | demo the running app, never the diff |
| Per-folder "new chat" | merged into the #57 branch as `4c190f2c5` | done and verified |
| Fork CI runner policy | [cmux#59](https://github.com/teamleaderleo/cmux/pull/59), extracted from #57 | policy-caused failures fixed in `a51ff43deb`; what is still red fails identically on the bare base `e9ec596d1` (see the PR body). Not merged: merging alone does not shrink #57, because GitHub diffs against the merge base until the new base is merged into `codex/current-upstream-tact` |
| Fork main upstream sync | [cmux#58](https://github.com/teamleaderleo/cmux/pull/58), 4,239 commits, 12 conflicts | unmerged; **no app build has been run against the merge result** |
| `CMUX_RELOAD_KEEP_RUNNING` | upstream [manaflow-ai/cmux#12962](https://github.com/manaflow-ai/cmux/pull/12962), branch `contrib/reload-keep-running`; fork #60 closed | open; cubic's two findings fixed; **no full tagged app build has run on it**, and none can on upstream `main` until #12973 or `--prod-auth` |
| Tagged builds outside hq | upstream [manaflow-ai/cmux#12973](https://github.com/manaflow-ai/cmux/pull/12973) | open. Since upstream `3a114bef2f`, `reload.sh --tag` exits in 0.5 s without a `cmuxterm-hq` checkout; the PR adds `CMUX_DEV_BACKEND_MODE=local`. **Any build of a branch on current upstream `main` hits this gate** — a sub-second failure is the gate, not the build |
| Root agent notes | upstream [manaflow-ai/cmux#12964](https://github.com/manaflow-ai/cmux/pull/12964) | open; verbatim moves out of the root `CLAUDE.md`, 21.3 KB → 14.4 KB |
| Workspace templates | [terminal-kit#51](https://github.com/teamleaderleo/terminal-kit/pull/51) | unmerged |
| Spaces design argument | [Tact#71](https://github.com/teamleaderleo/Tact/issues/71) | open question for the founders, not a task |
| Local build loop | [Tact#74](https://github.com/teamleaderleo/Tact/issues/74) | root cause posted there (three malformed `project.pbxproj` objects); Codex is continuing the build-time work |
| Accessibility fix | upstream [manaflow-ai/bonsplit#243](https://github.com/manaflow-ai/bonsplit/pull/243), one line; fork [bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1), [Tact#64](https://github.com/teamleaderleo/Tact/issues/64) | upstream PR open, cubic clean. Fork #1 is stacked on the unrelated `showsTabCloseButton` commit, so a fresh branch went upstream. The #57 build pins the fixed submodule already |

## The running dev build

`/Applications/cmux.app` is **upstream release v0.64.25** and contains none of the fork work. The fork build is a separate bundle id (`com.cmuxterm.app.debug.glaeda.native`) with a red THIS IS A DEV BUILD marker:

```bash
cd ~/Projects/cmux
open -n ".glaeda/apple-build/cache/dccae76e*/derived_data/Build/Products/Debug/cmux DEV glaeda-native.app"
```

Its CLI, which talks to that instance over a Unix socket and needs no auth:

```bash
CLI=".glaeda/apple-build/cache/dccae76e*/derived_data/Build/Products/Debug/cmux DEV glaeda-native.app/Contents/Resources/bin/cmux"
CMUX_QUIET=1 "$CLI" tree            # windows → workspaces → panes → surfaces
CMUX_QUIET=1 "$CLI" workspace list
CMUX_QUIET=1 "$CLI" workspace create --cwd ~/Projects/Tact --command codex --focus true
```

Rebuild:

```bash
glaeda-apple warm --project /Users/leoli/Projects/cmux --profile app
```

## Driving and photographing the live UI

The probes are in [`evidence/live-ui/`](evidence/live-ui/). Compile with `swiftc -O <file>.swift -o <name>`. The calling process must be trusted for Accessibility.

- `winlist` — window ids and titles via CoreGraphics.
- `axread <pid>` — every AXButton with title, description, identifier, size.
- `axpress <pid> "<label>" [n]` — AXPress the nth element matching a description, identifier or title. `AXACTION=AXShowMenu` presses a different action.
- `axpoint <windowId> <x> <y>` — what element is at a window-relative point.
- `axclick <windowId> <x> <y>` — a real click, then restores the cursor. Needed for anything the JS sidebar renders, because those are not AX elements.
- `crop <in> <out> <x> <y> <w> <h>` — no PIL or ImageMagick on this machine, and `sips --cropOffset` does not crop where you expect.

Screenshot without disturbing the session: `screencapture -x -o -l<windowId>`. It captures occluded windows without raising them.

`tk customization off|on` flips the cmux.json profile; cmux hot-reloads the file, so no restart.

## What is blocked

Opening PRs against `manaflow-ai/*` worked on 2026-09-18 once Leo said go ahead in chat: push the branch to the fork over SSH, then `gh pr create --repo manaflow-ai/<repo> --head teamleaderleo:<branch>`. It is still publishing, so ask first.

**Pushing a branch based on `upstream/main` over HTTPS is rejected** — the OAuth token lacks `workflow` scope and such a branch carries `.github/workflows/` files. Push over SSH instead: `git push git@github.com:teamleaderleo/cmux.git <branch>`.

## Measurements that already exist — do not redo them

- 58 build receipts, 2026-09-12 → 09-15: warm median **32 s** (n=32, min 22 s), cold/new-cache median **~19 min** (1,157 s), worst **34 min** (2,019 s). Those warm builds contained real changes.
- A **no-op** build on the current tree: **~97-101 s**. An earlier 64 s figure in [Tact#74](https://github.com/teamleaderleo/Tact/issues/74) was a single unreliable reading; two clean measurements gave 100.7 s and 97.4 s.
- **Root cause, found and fixed:** three malformed objects in `cmux.xcodeproj/project.pbxproj` make Xcode synthesize nondeterministic guids into the project PIF, so the build-description signature never matches and Xcode re-plans every build. Fixing all three: **~97-101 s → ~72-75 s**, with build-description reuse confirmed across successive builds. Fixing only one of the three is not enough. Details and the three objects: [Tact#74](https://github.com/teamleaderleo/Tact/issues/74#issuecomment-5737520409).
- `Localizable.xcstrings` is 15.4 MB; `xcstringstool compile --dry-run` takes ~21 s on it purely to enumerate output paths. That is the single biggest item the build-description cache skips.
- The **CodeSign cascade is not a cost** — all 7 steps total 1.67 s. The six re-running script phases total ~14.6 s, and 12.5 s of that is the unnamed `'Run Script'` phase rebuilding `bin/ghostty` and `bin/cmux-cua`. That phase declares zero inputs and outputs and is the top remaining target, untested.
- Removing `alwaysOutOfDate = 1` from `Write Extension Point` and `Build Diff Sidecar` **does not help**. That experiment failed; the cheap answer is ruled out.
- `Compress Markdown Viewer Assets` runs in 0.07 s standalone and has its own content cache. It is not the cost.
- Per-step timings come from parsing the `.xcactivitylog` (gzip + Apple SLF0; a `*` token carries `TaskMetrics` JSON with `wcDuration` in microseconds). No `-showBuildTimingSummary` needed.
- `AppDelegate.swift`: 32.4% inside `#if DEBUG`; 72 members / 2,749 lines of named test scaffolding, 71 of 72 gated.
- 128 default chords over 43 keys; 13 chords carry two actions; cmux resolves them with `when` clauses.
- 7 of 7 surface tab-bar buttons announced an SF Symbol name before [bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1).

The warm numbers come through Glaeda, a build-cache wrapper Leo maintains. They are **not** what a contributor following `AGENTS.md` verbatim would see. Say so whenever the number is quoted.

## Traps that have already cost time

**A diff against the fork's `main` is meaningless.** Fork `main` sits on a much older upstream, so `cmux#57` rendered as 5,280 files / +1.17M. Diff against the real merge base, `base/upstream-e9ec596d` (= `e9ec596d12`). Same mistake in reverse: `git diff upstream/main HEAD` shows upstream's newer work as fork deletions.

**`gh pr view 57` inside `~/Projects/cmux` resolves to `manaflow-ai/cmux`, not the fork.** Always pass `--repo teamleaderleo/cmux`.

**`ls` is aliased to eza and `tk` to `terminal-update`.** Use `/bin/ls` in scripts.

**A Glaeda cache generation can disappear under you.** A build expected to be warm took 19 minutes because the generation changed from `tiles-cleanup` to `default` after quarantined generations were removed. Nothing in the output distinguishes a 30-second build from a 20-minute one until it finishes. Each generation is ~8 GB; there are several. **Do not delete anything under `.glaeda/`.**

**Reconstructing a terminal's command from the process table leaks secrets.** An agent surface's real invocation carries a per-session socket path, an auth token and an owner pid. `terminal-kit`'s template tool detects that shape and refuses to store it. Keep that behavior in anything similar.

**Editing `cmux.xcodeproj/project.pbxproj` does not invalidate the Glaeda cache key** (verified), but a build after a project edit costs ~115 s instead of 64 s.

**Anything the JS sidebar renders is invisible to accessibility.** Rows and the new per-folder plus come back as `AXGroup` with no description; the native controls beside them (`New chat`, search, provider picker) are proper `AXButton`s with descriptions. Not a regression — it is how `ConversationSidebar.js` renders. Use `axclick` for those.

## Two method failures worth not repeating

An earlier pass claimed cmux had 13 undeclared chord collisions resolved by statement order. Wrong on every count — cmux implements the VS Code `when`-clause model, with `bindingsCollide`, dead-binding refusal, a Settings rejection banner and tests. The cause was asserting a mechanism was absent after reading one screenshot and one function, without grepping for it. The corrected page is [shortcut-namespace.md](shortcut-namespace.md).

The first accessibility patch passed all 223 Bonsplit tests and still broke `paneTabBarControl.*` identifiers. A unit suite cannot see what the accessibility tree exposes. Only reading the live tree caught it — hence `evidence/live-ui/`.

## Writing debt

First-person agent claims were removed from the packet pages on 2026-09-18 (`build-loop.md`, `shortcut-namespace.md`, `sidebar-density.md`, the README index row) and from Tact #59, #64 and #74. The README's **Say:** and **Ask:** lines stay first person; they are Leo's spoken lines.
