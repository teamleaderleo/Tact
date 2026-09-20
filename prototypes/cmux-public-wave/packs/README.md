# Local settings-pack transaction

Decision: **Tact prototype**, with two small declarative workflow presets. This
does not add `cmux pack` to CMUX. Source inspected at
[`ad34966d0641efcacc436ecd264fda9105285c49`](https://github.com/manaflow-ai/cmux/commit/ad34966d0641efcacc436ecd264fda9105285c49)
(2026-09-20).

`quiet-review.json` keeps PR/notification metadata and reduces other sidebar
details. `service-inspection.json` exposes paths, ports, logs, and notifications.
These are small presets for two workflows, not complete workspace recipes or the
visual Midnight/Ember packs discussed in Tact #77.

## One existing owner

The prototype loads the **pinned upstream** settings helper directly from a local
Git object, reuses its JSONC parser, nested setter, validator and atomic writer,
and reads the same revision's schema and generated setting-path reference. It
does not execute code from a pack, download dependencies, or modify that checkout.

- [Settings helper](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/skills/cmux-settings/scripts/cmux-settings)
- [Config schema](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/web/data/cmux.schema.json)
- [Customization owner/scope guidance](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/skills/cmux-customization/SKILL.md)

Only schema-backed boolean `sidebar.*` preferences are accepted. Other owners
(actions, shortcuts, layouts, sidebars, themes) remain outside this transaction
until their validation and rollback semantics can be demonstrated. Existing
unrelated config sections survive application.

## Reproduce on a disposable profile

From this directory, using a CMUX checkout containing the pinned Git object:

```sh
python3 pack.py --cmux-repo /path/to/cmux inspect quiet-review.json
python3 pack.py --cmux-repo /path/to/cmux preview quiet-review.json \
  --profile /path/to/disposable-profile --plan /path/to/private-plan.json
# Read the complete diff printed above before choosing to apply.
python3 pack.py --cmux-repo /path/to/cmux apply /path/to/private-plan.json \
  --receipt /path/to/private-receipt.json
python3 pack.py --cmux-repo /path/to/cmux uninstall /path/to/private-receipt.json
CMUX_SOURCE_REPO=/path/to/cmux python3 -m unittest discover -s . -p 'test_*.py' -v
```

There is deliberately no implicit real-user profile. Plans/receipts contain exact
prior config bytes for undo and should stay private; they are created with private
file permissions. Do not publish them from a real profile. The checked-in demos
and test fixtures contain no user config.

`preview` inspects and validates before writing the plan and prints the exact
byte diff, including comment/format normalization performed by the existing
helper. `apply` re-derives that preview against current bytes, refuses drift,
persists a prepared receipt, delegates the one config write, validates and reads
back, then marks the receipt verified. `uninstall` and `rollback` are the same
operation. They restore byte-exact prior state, or remove a newly created config.
A prepared receipt can recover an interrupted install before or after the write.
Later edits cause rollback to stop; uninstall cannot silently erase user changes.
Layered installs must be undone in reverse order.

Verification here is **config-owner validation/readback**, not native UI effective
state. The normal CMUX file watcher owns live reload. No test installs these presets
into the user's running app, and no native visual verification is claimed.

## Observed gap and promotion decision

The audited settings helper's checkout mode scans literal dotted paths from
`Sources/CmuxSettingsJSONPathSupport.swift`; after catalog extraction, that file
contains no literal `sidebar.*` paths. It returns a nonempty but incomplete path
set and rejects valid sidebar settings. The installed helper's generated
`references/all-keys.md` does include them. This prototype explicitly uses that
existing reference and validates changed boolean types against the schema; it
does not silently disable validation. Reproduce via `test_owner_path_drift.py`.

The helper defect is tracked in [CMUX #13243](https://github.com/manaflow-ai/cmux/issues/13243), with a production fix in [PR #13250](https://github.com/manaflow-ai/cmux/pull/13250). Six subprocess regressions verify checkout/installed parity, fallback, and actual CLI output against the schema. The schema guard exposed 51 missing reference paths; the production repair restores them and all six tests pass. Keep the installer in
Tact until native effective-state readback and a supported multi-owner transaction
exist. No new pack engine or marketplace RFC is justified by these two presets.

## Limits

- One-file transaction, not all-or-nothing changes across owners.
- Advisory locking serializes this installer only. An editor or native writer can
  race the check/write interval; use disposable/quiescent profiles for this proof.
- `.cmux-pack.lock` and the private audit receipt remain after undo; installed
  config is removed/restored. They are transaction infrastructure, not pack state.
- File permissions follow the upstream private atomic writer; byte-exact rollback
  does not claim to restore filesystem ACLs, extended attributes or metadata.
- Receipts are trusted local artifacts, not signed bundles accepted from others.
- Native reload, UI result, layered defaults and project/global effective merging
  still need native integration before shipping.
