# Current upstream cmux audit — September 12, 2026

For #41, before the #36 surface navigator trial. This is a source/API audit;
it does not claim that every interaction passed a human dogfood session.

Upstream main was fetched at `e9ec596d12d854d6569b53b38bb21b62f8126d56`.
The former personal branch was 3,056 upstream commits behind, with 71 local
commits. It remains preserved on `codex/glaeda-apple-build`; the single canonical
checkout now uses `codex/current-upstream-tact`, starting from current upstream
and reapplying only the Glaeda build profile. None of the old UX patches were
blindly rebased. Build/launch verification is recorded in the trial README.

| Candidate | Current evidence and classification |
| --- | --- |
| Surface-first vertical navigation alongside horizontal tabs | **Prototype possible in user space.** Reactive JS sidebars expose workspaces and tabs, stable row identity, and direct actions. The trial changes the navigator, leaving native tabs intact. |
| Surface identity and cross-workspace focus | **Obsolete / wrong assumption in current docs.** Live verification found that `tabs[].surfaceId` is a Bonsplit UUID and returns not found from `surface.focus`. The handler indexes `ws.panels[surfaceID]`, accepting `tabs[].id`, which matches `surface.list`. Using this verified ID with the owning workspace now focuses the correct terminal in both directions. |
| Workspace groups, drag/reorder | **Prototype possible in user space.** `Examples/CustomSidebars/workspaces.js` implements grouped reordering and group actions. That is workspace ordering, not a license to reinterpret a surface drag. Our first trial deliberately has no drag operation. |
| Global surface search | **Partially solved.** `app.commandPaletteSearchesAllSurfaces` and the `panel-sessions.js` example exist. Trial adds local search with parent context; it makes no claim to replace the global palette. |
| Minimal mode and sidebar appearance | **Partially solved.** Current settings and native custom-sidebar surfaces supply substantial customization. Recheck the exact desired layout in a running build before proposing new chrome. |
| Experimental canvas | **Partially solved.** `docs/canvas-layout-design.md` and the `canvas` schema expose freeform layout, gap and snapping. This is not evidence that freeform layout improves task retrieval. Keep topology/recovery trials separate. |
| Selected tab vs keyboard-focused pane | **Still present as a research question; requires core patch for native tab treatment.** #38 and upstream #10023 need visual comparison on current Bonsplit. This navigator does not claim to fix native pane/tab styling. |
| File preview / Quick Look / open | **Partially solved.** Native preview sessions and Quick Look containers exist; file-outline keyboard selection/open routing exists. Transient Space inspection, in-place browsing and promotion of the exact preview need runtime verification before a patch. |
| Ordinary window/titlebar behavior | **Still present as an audit question.** No current regression claim: activation, double-click preferences, Spaces, inactive appearance and multi-display wake need physical tests. |
| Shortcut/action vocabulary | **Partially solved.** The schema has a shared action registry and configurable shortcuts. Consistency across each entry point needs action-specific testing. |
| Right sidebar/custom panels | **Prototype possible in user space.** The same custom file can be a left sidebar, pane, or right-side panel. Start as a pane so the user's normal navigator remains available. |
| Browser inspection / React Grab | **Partially solved.** Current controller exposes React Grab, browser snapshot, screenshot, console and error APIs. Exact selected-object handoff across tools remains the #39 question. |
| Network/console/screenshots by surface type | **Partially solved.** Browser APIs exist; do not assume every method applies to terminal or remote surfaces. Capability-specific runtime verification remains necessary. |
| Diff/source viewing | **Partially solved.** Existing preview/source surfaces are a starting point, not proof of one continuous browser→source→proof identity chain. |
| Sessions/checkpoints/resume | **Partially solved.** Vault checkpoint commands and agent-session tracking exist. Restoration semantics and source freshness must be tested separately from visual continuity. |
| Agent/team data | **Prototype possible in user space.** Workspace agent snapshots expose identity, activity, status and optional hosting surface. This is not an independent population audit; #40 still needs evidence beyond the reducer's own summaries. |
| Events/automation | **Partially solved.** `CmuxEventPublishing.swift` publishes surface focus and other events. Events alone do not prove durable delivery or a completed action. |
| Renderer reclamation/agent hibernation | **Fully converged upstream at the configuration/API level.** Both are in the current terminal schema. Measure restoration latency and memory with the intended workload before changing presets. |
| Composer stays off | **Fully converged upstream at the configuration level.** `showTextBoxOnNewTerminals` and `focusTextBoxOnNewTerminals` are available and Terminal Kit already sets them false. |
| Theme/scroll/shortcut customization | **Fully converged upstream at the configuration level.** Use current settings before carrying forward old fork patches. |

Primary source: [pinned upstream tree](https://github.com/manaflow-ai/cmux/tree/e9ec596d12d854d6569b53b38bb21b62f8126d56).
Relevant files: `docs/custom-sidebars.md`, `web/data/cmux.schema.json`,
`Examples/CustomSidebars/panel-sessions.js`, `Examples/CustomSidebars/workspaces.js`,
`Packages/macOS/CmuxSidebar/Sources/CmuxSidebar/Layout/CustomSidebarDataContextBuilder.swift`,
`Sources/TerminalController.swift`, `Sources/FileExplorerNSOutlineView.swift`,
`Sources/Panels/FilePreviewNativeViewSessions.swift`.

The strongest immediate experiment is #36: flat vs grouped access to the same
live surfaces. Grouping and density are independent toggles. Keep/Change/Reject
remains **unresolved** until Leo uses it; fixture tests cannot provide that judgment.

## Live verification addendum

The tagged app at `b1d62030f` built and passed strict signature verification.
Three sequential unchanged builds through Terminal Kit took 84.28, 47.39 and
45.56 seconds (median 47.39); the first upstream build took 1,362.62 seconds.
These are local wall-clock observations, not a controlled comparison against the
old fork. The new custom sidebar validated and rendered natively. Grouping,
density, live search, focus across two workspaces and the Default Workspaces
escape route were exercised. Native screenshots and accessibility state were
inspected during the session. The tagged app visibly labels itself as a dev build.

The identity mismatch above was found only through live interaction: the
initial source-doc-based prototype rendered correctly but its surface clicks
failed. The corrected fixture and real-runtime tests now encode the actual
dispatcher contract. This is evidence for keeping the #41 prerequisite, not
for treating a successful parser test as a successful interaction.
