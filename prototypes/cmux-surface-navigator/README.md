# Live cmux surface navigator

Tact #36, grounded in the [current upstream audit](../../notes/current-upstream-cmux-2026-09-12.md).
This is a native custom-sidebar file, not a web mockup. It uses current cmux's
reactive JS scene runtime and real workspace/surface data.

Try **Flat / Grouped** and **Compact** independently. Search preserves owning
workspace context. Each row focuses its exact API target; missing IDs are
shown as unavailable. Lists are paged at
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

For persistent navigation across workspaces, select `tact-surfaces` in the
sidebar picker (or `cmux sidebar select tact-surfaces`). Right-click the sidebar
toggle and choose **Default Workspaces** to restore the baseline. Both directions
were verified in the tagged app. A pane belongs to its workspace and disappears
when navigating away; the left sidebar is the useful daily-use trial location.

### Current upstream identity mismatch

At upstream `e9ec596d`, the docs recommend `tabs[].surfaceId`, but that is a
Bonsplit tab UUID. The running `surface.focus` API rejects it as not found.
`TerminalController+ControlSurfaceContext.swift` indexes `ws.panels[surfaceID]`,
so it accepts `tabs[].id`, matching `surface.list`'s `id`. The prototype uses
that verified mapping, with the explicit owning workspace ID. It does not guess
between both namespaces or retry against an unrelated target. Revalidate this
mapping when upgrading cmux; the docs and dispatcher currently disagree.

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

Live verification on macOS 26.6.2, tagged cmux `b1d62030f`: native sidebar
validation passed; both layout toggles, live search, cross-workspace terminal
focus in both directions, narrow control labels and baseline restoration were
checked through native accessibility state and screenshots. A temporary
diagnostic proved the documented ID failed; it was removed after fixing the
mapping. The trial is installed and selected only in the isolated tagged app.
Light appearance, VoiceOver and broader keyboard traversal remain untested.

Dogfood: find the same terminal/browser from each representation; compare flat
and grouped with identical data, then spacing independently. Include duplicate
names, splits, a closed surface, and more than 40 entries. Record wrong targets,
extra navigation steps and focus reacquisition. The `focused` snapshot reports
the active surface; it is not proof of a persistent selected-tab state in every
unfocused pane. Data refresh cadence and keyboard access are host capabilities.

Judgment: **Unresolved** pending human use. No speedup or preference claim yet.

## Home / Triage extension (#37)

Home follows host surface order, with agent-state salience on the existing rows.
Triage projects the same objects into Needs input and Unknown state sections;
All states also includes Working, Idle, Ended (outcome unknown), and No agent
signal. Routine work is quiet by default. Flat/Grouped applies to Home; Compact
applies to both. Pagination controls appear only when needed. Search filters the
current mode and retains its query when switching; mode changes reset the page.

Agents join only through the explicit `agent.panelId` → `tab.id` relation.
Unlinked agents are counted without inventing a target. Workspace unread counts
are not assigned to an arbitrary surface. Multiple sessions on one surface show
the highest-priority reported state and an agent count. This is a status
projection, not an obligation compiler or independent audit. Exported snapshots
may be delayed or bounded; no complete/fresh fleet-coverage claim is made.

The Home mode adds no persisted ordering: explicit host/user reordering still
changes it. Reopening the view resets Home, normal density, Flat, and focused
Triage filtering. Returning to Home preserves the current local controls.

September 12 extension verification: latest upstream was fetched at
`942c24e25b36f7046200260f80955da742d56bf2`; the specific sidebar runtime, docs,
data builder, agent projection and focus handler were unchanged from the prior
audited upstream. Fixture and actual-runtime tests cover mode identity, stable
Home positions during agent-state changes, quiet filtering, unknown states,
missing links, search, section ordering and exact focus. The tagged native app
passed validation/reload, Home/Triage toggles, All states, empty/search states,
terminal focus and narrow rendering. The live app had one terminal and no tracked
agents; status transitions are runtime-fixture evidence, not real-fleet dogfood.

See the [inquiry map](../../notes/cmux-inquiry-map-2026-09-12.md) for comparison
questions and existing causal-debugging / adversarial-audit work. Judgment remains
**Unresolved** until human use, including whether a separate Triage mode earns its
switching cost.
