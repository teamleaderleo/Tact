# Live cmux surface navigator

Tact #36, grounded in the [current upstream audit](../../notes/current-upstream-cmux-2026-09-12.md).
This is a native custom-sidebar file, not a web mockup. It uses current cmux's
reactive JS scene runtime and real workspace/surface data.

Try **Flat / Grouped** and **Compact** independently. Search preserves owning
workspace context. Each row focuses its exact surface; missing surface IDs are
shown as unavailable and never substituted with panel IDs. Lists are paged at
40 surfaces with a visible total and page count. Ordering follows the host,
not recency, so incoming attention does not reorder learned targets.

Install the single `tact-surfaces.js` file in `~/.config/cmux/sidebars/`, then,
using the CLI for the intended tagged build:

```sh
cmux sidebar validate tact-surfaces
cmux sidebar open tact-surfaces
```

Opening as a pane retains the normal sidebar and horizontal tabs. Close that
trial pane to return to the baseline. The built-in sidebar picker can select
the file as a left sidebar later. Trial toggles are local to the mounted view;
reopening starts Flat with normal spacing. They do not change app preferences,
workspace membership, surface lifecycle, or native tab behavior.

This first experiment groups by existing workspace context. Arbitrary user
groups and cross-surface drag ordering are not implemented. A surface drag must
not silently become a workspace reorder. Search and pagination can hide a
selected row; the normal horizontal tabs remain available.

Validation:

```sh
node prototypes/cmux-surface-navigator/test.mjs
node prototypes/cmux-surface-navigator/test-runtime.mjs /path/to/current/cmux
```

Fixture checks cover duplicate labels, exact cross-workspace identity, missing
surface identity, search, 101-entry pagination, stable toggle identity and
page recovery after surfaces close. The second check loads the real upstream
sidebar prelude and verifies mounting, native Button nodes, exact focus actions,
stable node identity and disposal of closed rows. It runs in Node's VM, not
JavaScriptCore or the native renderer. Native rendering and live focus
verification are tracked separately from these checks.

Dogfood: find the same terminal/browser from each representation; compare flat
and grouped with identical data, then spacing independently. Include duplicate
names, splits, a closed surface, and more than 40 entries. Record wrong targets,
extra navigation steps and focus reacquisition. The `focused` snapshot reports
the active surface; it is not proof of a persistent selected-tab state in every
unfocused pane. Data refresh cadence and keyboard access are host capabilities.

Judgment: **Unresolved** pending human use. No speedup or preference claim yet.
