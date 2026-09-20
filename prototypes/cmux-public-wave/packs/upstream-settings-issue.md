## Problem

At current main `ad34966d0641efcacc436ecd264fda9105285c49` (2026-09-20), running the bundled `cmux-settings` helper **from a checkout** rejects valid sidebar keys such as `sidebar.showPorts`. The installed-skill path reference contains those same keys.

The helper's `supported_paths()` prefers scanning `Sources/CmuxSettingsJSONPathSupport.swift` whenever that file exists. After settings catalog extraction, the source references `SidebarCatalogSection` rather than literal `"sidebar.showPorts"` strings. The scanner returns a nonempty but incomplete list, so validation reports valid keys as unknown instead of falling back to the generated reference.

Source:

- [Checkout selection and scanner](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/skills/cmux-settings/scripts/cmux-settings#L215)
- [Catalog-backed sidebar source](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/CmuxSettingsJSONPathSupport.swift#L8)
- [Generated key reference](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/skills/cmux-settings/references/all-keys.md)

## Reproduction

In a checkout at that revision, using a disposable config:

```sh
printf '%s\n' '{"sidebar":{"showPorts":true}}' > /tmp/cmux-settings-sidebar-repro.json
python3 skills/cmux-settings/scripts/cmux-settings \
  --file /tmp/cmux-settings-sidebar-repro.json validate
```

Expected: the schema-backed boolean key is accepted.

Actual source behavior: `unknown settings keys: sidebar.showPorts`; exit 1. This blocks consumers which correctly insist on owner validation before applying a settings preset.

The [pinned-source regression evidence](https://github.com/teamleaderleo/Tact/blob/codex/cmux-public-wave-20260920/prototypes/cmux-public-wave/packs/test_owner_path_drift.py) verifies that the checkout scanner produces a nonempty set missing this key, while both schema and generated reference include it. The adjacent pack transaction suite exercises the helper validator with the generated reference and passes.

## Narrow fix direction

Make checkout and installed helper validation read the same complete canonical setting-path set (schema/catalog-generated reference), and cover a catalog-extracted sidebar key in both modes. Do not disable validation or invent a second pack-specific list. The transaction prototype remains in Tact; this issue is only the existing settings helper defect discovered while testing it.
