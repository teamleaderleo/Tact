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

## Design

A **slot** is a pair that stays together for the life of the machine: a worktree directory and its DerivedData directory, e.g. `~/cmux-slots/3/src` + `~/cmux-slots/3/DerivedData`. A new task takes a free slot, checks its branch out **in that worktree**, and builds with its own tag into that slot's DerivedData. Xcode does an ordinary incremental build: it recompiles what differs between the slot's last commit and the task's commit.

Why the worktree is part of the slot: compile commands contain absolute source paths, so pointing a different checkout at a warm DerivedData is expected to invalidate everything (**UNTESTED, being measured**: same DerivedData, different worktree path). Cloning a DerivedData to a new path is already known not to work (absolute paths and build-description signatures; checked independently on another machine).

### Pieces

1. **Pool.** N slots per machine, N = the number of builds that machine runs at once (a laptop: 2-3; a fleet Mac: by cores and disk, ~7 GB per slot). Created lazily: the first build in a new slot is the only cold build that slot ever does.
2. **Lease.** `mkdir`-style lock per slot, holding the task id and pid, released on exit, stale after the pid dies. A slot is leased for the whole task, not per build, because the worktree holds the task's uncommitted edits.
3. **Selection.** Prefer the free slot whose last-built commit is closest to the task's base (`git merge-base` distance, or simply "most recently built on main"). Closest means the smallest incremental build.
4. **`reload.sh` change.** Today: `DERIVED_DATA` defaults to `tagged_derived_data_path "$TAG_SLUG"`. Proposed: if the checkout is inside a slot (a marker file, or `CMUX_SLOT_DIR`), default to the slot's DerivedData. `--derived-data` already exists and keeps working; nothing changes for a checkout that is not in a slot. This is a default, not a flag an agent has to know.
5. **Keeping slots warm.** Optional: an idle slot fast-forwards to `main` and builds, so the next task's diff is small. Cheap on a fleet Mac; skip on laptops.

### What stays per tag

Everything the tag exists for: bundle id, socket, state files, the app copy `cmux DEV <tag>.app`. `reload.sh` already copies the built app to a tag-named bundle, so two tags that used the same slot at different times each keep their own app bundle.

## Risks and what has to be checked

- **A running tagged app while another tag builds in the same slot.** By design this cannot happen (one lease per slot, per task). If a lease is ever broken, the second build would replace shared intermediates under a running app. **UNTESTED** with a live app: launching needs dev credentials that are deliberately not on the benchmark machine.
- **Stale tag bundles pile up** in a slot's `Build/Products`. Needs pruning when a lease is released.
- **Branch far from the slot's last commit** (old release branch, big refactor): cost approaches a cold build. It is never worse than today. **Being measured**: same slot, newer `main` merged in (31 files changed).
- **Package graph changes** (`Package.resolved` differs between the slot's last commit and the task's): re-resolution, possibly a large rebuild (we saw 383 s from one such event). Slots make this rarer than fresh folders do, not more frequent.
- **Uncommitted leftovers** from the previous task in the slot's worktree. The lease release must leave the worktree clean (`git status` empty, or refuse to release).
- **Disk.** ~7 GB per slot, bounded by N. Today's behaviour is unbounded: one DerivedData per tag, deleted by hand.
- **`cleanup_incomplete_xcodebuild_outputs`** in `reload.sh` removes app bundles before a build; it must keep removing only the current tag's bundle.

## What this does not fix

- The app target is still one 3,700-file rebuild unit: a task that edits it pays ~40-60 s per edit, and ~120 s if the edit is in `ContentView.swift`. Splitting large files and moving code into packages is separate work.
- CI builds clean on ephemeral runners: slots do not apply. CI's lever is the compilation cache (always-clean builds lose nothing), which is already in place for Release and proposed for Debug.
- Cross-machine sharing: a remote compilation cache service is the only candidate, **UNTESTED**.

## Rollout

1. Land the `reload.sh` default behind the slot marker (no behaviour change outside slots) with a test that the DerivedData path resolves to the slot and that the lock is taken and released.
2. A small `scripts/slot.sh` (`acquire`, `release`, `status`, `prune`) so agents and humans use the same lease.
3. Try it on one fleet Mac for a day: record first-build time per task and the slot's commit distance. Decide N and whether idle warming is worth it from that data.
