# Warm build slots for `reload.sh`: design

Status: proposal with first measurements. Open questions are marked **UNTESTED**. Numbers: MacBook Air M5, Xcode 27.0, through `scripts/reload.sh`, same day (2026-09-19). See [build-devlog.md](build-devlog.md) for how we got here.

## Problem

`reload.sh --tag <t>` derives the build folder from the tag (`~/Library/Developer/Xcode/DerivedData/cmux-<tag>`). Every agent task uses a new tag, so every task's first build is cold.

| first build of a new tag | time |
|---|---|
| today (fresh DerivedData) | **953 s** |
| Xcode compilation cache, sources identical to the cached build | 157 s |
| Xcode compilation cache, one app-target file edited | 697 s |
| **new tag built into an already-warm DerivedData** | **35.7 s**, 0 Swift files compiled |

The compilation cache is not a usable default: with it on, a one-line app-target edit in a warm tag takes 603.9 s instead of ~48 s (it re-runs the whole module), and turning it off again costs a full rebuild (776 s). It stays useful for CI and one-shot builds.

## What a tag actually changes

Bundle identifier, app/helper display names, the sidebar extension point id, the socket path, and state files. None of these are Swift compile inputs. Measured in one warm DerivedData:

| step | time | Swift compiles |
|---|---|---|
| no-op, same tag | 26.2 s | 0 |
| **switch to a new tag** | **35.7 s** | 0 (one new build description, plist + sign + copy) |
| no-op on the new tag | 25.8 s | 0 |
| switch back to the first tag | 26.9 s | 0 |
| third new tag that also carries a one-line edit | 59.1 s | 3 |
| one-line edit, same tag (comparator) | 48.3 s, 50.9 s | 3 |

So a tag switch costs about 10 s over a no-op, and switching back costs nothing extra.

**The middle case is much worse than the best case.** Same slot, task based on newer code (slot last built at A; task = A + one upstream `main` commit merged: 31 files, of which 5 app-target Swift files, 3 CLI files, a `project.pbxproj` change that adds files, `Localizable.xcstrings`, and an interface change in the low-level `CmuxControlSocket` package):

| step | time | Swift compiles |
|---|---|---|
| new tag on the newer code | **620.1 s** | 4,829 app-target + ~1,070 in packages: nearly everything |
| no-op after it | 30.3 s | 0 |

Still better than 953 s, but not by much. Five changed app files did not cause this; an interface change in a package that most of the app imports, and/or a changed file list for the app target, did (not yet separated: **UNTESTED** which of the two, and whether adding one file to the app target alone forces a whole-module rebuild). Either way the lesson is the same: a slot only pays off when it was last built on (nearly) the code the task starts from.

## Design

A **slot** is a pair that stays together for the life of the machine: a worktree directory and its DerivedData directory, e.g. `~/cmux-slots/3/src` + `~/cmux-slots/3/DerivedData`. A new task takes a free slot, checks its branch out **in that worktree**, and builds with its own tag into that slot's DerivedData. Xcode does an ordinary incremental build: it recompiles what differs between the slot's last commit and the task's commit.

Why the worktree is part of the slot: compile commands contain absolute source paths, so pointing a different checkout at a warm DerivedData is expected to invalidate everything (**UNTESTED** here: my attempt failed in the harness because the second worktree had no ghostty submodule; the claim rests on the independent DerivedData-clone result below). Cloning a DerivedData to a new path is already known not to work (absolute paths and build-description signatures; checked independently on another machine).

### Pieces

1. **Pool.** N slots per machine, N = the number of builds that machine runs at once (a laptop: 2-3; a fleet Mac: by cores and disk, ~7 GB per slot). Created lazily: the first build in a new slot is the only cold build that slot ever does.
2. **Lease.** `mkdir`-style lock per slot, holding the task id and pid, released on exit, stale after the pid dies. A slot is leased for the whole task, not per build, because the worktree holds the task's uncommitted edits.
3. **Selection.** Prefer the free slot whose last-built commit is closest to the task's base (`git merge-base` distance, or simply "most recently built on main"). Closest means the smallest incremental build.
4. **`reload.sh` change.** Today: `DERIVED_DATA` defaults to `tagged_derived_data_path "$TAG_SLUG"`. Proposed: if the checkout is inside a slot (a marker file, or `CMUX_SLOT_DIR`), default to the slot's DerivedData. `--derived-data` already exists and keeps working; nothing changes for a checkout that is not in a slot. This is a default, not a flag an agent has to know.
5. **Keeping slots warm is required, not optional.** The 620 s middle case means a slot left at an old commit is nearly worthless once `main` has changed a widely-imported package. An idle slot must fast-forward to `main` and rebuild in the background (on a fleet Mac: on every push to `main`, or every N minutes), and new tasks should branch from the commit their slot was last built at, or from the slot built closest to their base. Then a task's first build is the 36 s case plus its own edits.

### What stays per tag

Everything the tag exists for: bundle id, socket, state files, the app copy `cmux DEV <tag>.app`. `reload.sh` already copies the built app to a tag-named bundle, so two tags that used the same slot at different times each keep their own app bundle.

## Risks and what has to be checked

- **A running tagged app while another tag builds in the same slot.** By design this cannot happen (one lease per slot, per task). If a lease is ever broken, the second build would replace shared intermediates under a running app. **UNTESTED** with a live app: launching needs dev credentials that are deliberately not on the benchmark machine.
- **Stale tag bundles pile up** in a slot's `Build/Products`. Needs pruning when a lease is released.
- **Branch far from the slot's last commit**: cost approaches a cold build (measured: 620 s for one upstream commit that touched a low-level package). Never worse than today, but this is why idle warming is required.
- **Package graph changes** (`Package.resolved` differs between the slot's last commit and the task's): re-resolution, possibly a large rebuild (we saw 383 s from one such event). Slots make this rarer than fresh folders do, not more frequent.
- **Uncommitted leftovers** from the previous task in the slot's worktree. The lease release must leave the worktree clean (`git status` empty, or refuse to release).
- **Disk.** ~7 GB per slot, bounded by N. Today's behaviour is unbounded: one DerivedData per tag, deleted by hand.
- **`cleanup_incomplete_xcodebuild_outputs`** in `reload.sh` removes app bundles before a build; it must keep removing only the current tag's bundle.

## What this does not fix

- The app target is still one 3,700-file rebuild unit: a task that edits it pays ~40-60 s per edit, and ~120 s if the edit is in `ContentView.swift`. Splitting large files and moving code into packages is separate work.
- CI builds clean on ephemeral runners: slots do not apply. CI's lever is the compilation cache (always-clean builds lose nothing), which is already in place for Release and proposed for Debug.
- Cross-machine sharing: a remote compilation cache service is the only candidate, **UNTESTED**.

## How it composes with a merge queue

`main` moves about 5 times an hour (~3,500 commits in 30 days), so a slot warmed at `main` is stale within ~12 minutes on average, and any one of those commits can be the 620 s kind. Slots alone would keep a background warmer rebuilding almost constantly. The pieces that make it work together:

1. **Merge queue**: `main` advances in batches (1-2 times an hour instead of 5), so a warm slot stays valid several times longer.
2. **The queue's CI build is the trigger.** The `merge_group` run builds exactly the commit that becomes `main`. Seed CI's compilation cache from that run (today's proposal seeds from the push to `main`, which builds the same content a second time), and let the same event tell fleet warmers to fast-forward.
3. **A `warm-main` ref.** When a fleet warmer has finished building `main` in its idle slots it advances `refs/heads/warm-main` to that commit. Agents branch new tasks from `warm-main`, not from the tip. Every task's first build is then the 36 s case by construction; being a few minutes behind the tip costs nothing because the queue re-validates against the real tip at merge time, on CI machines.
4. **Cost**: each merge group is another CI run on the macOS runners that are already the bottleneck. It only nets out together with cancelling superseded runs, not routing docs/workflow-only changes to macOS, the Debug cache seed and balanced shards.

## Rollout

1. Land the `reload.sh` default behind the slot marker (no behaviour change outside slots) with a test that the DerivedData path resolves to the slot and that the lock is taken and released.
2. A small `scripts/slot.sh` (`acquire`, `release`, `status`, `prune`) so agents and humans use the same lease.
3. Try it on one fleet Mac for a day: record first-build time per task and the slot's commit distance. Decide N and whether idle warming is worth it from that data.
