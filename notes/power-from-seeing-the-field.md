# Power from seeing the field

A study of dense expert interfaces around the proposition:

> Power-user software does not have to mean memorizing more commands. Power can come from seeing more of the system at once.

The proposition survives, with a useful correction: **seeing more helps when the extra state participates in the current decision and keeps a stable place.** Density turns into overload when the field fills with weakly grouped, low-value, visually competing state.

This distinction shows up across Dwarf Fortress, spreadsheets, IDEs, terminals, Bloomberg-style terminals, DAWs, 3D tools, game-management screens, and admin dashboards.

## 1. Density can remove navigation

A dense display can outperform a sparse sequence because the user can compare without changing screens, reopening context, or remembering what disappeared.

There is direct experimental support. A study of clinical nurses comparing one high-density lab-results screen against two moderate-density screens and three low-density screens found faster target acquisition on the denser displays while accuracy and satisfaction stayed essentially the same. Separate visual-search work on display clutter found that high data density and poor organization both hurt performance, with poor organization amplifying the cost of density.

The useful distinction is therefore:

```text
useful density = more decision-relevant state in one coherent field
clutter = density + weak grouping + irrelevant competition
```

Dwarf Fortress makes this visible in crude form. The classic fortress screen kept the map present while a command area exposed available actions and keys. Spreadsheets keep thousands of values addressable in one coordinate system. DAWs keep tracks, clips, timing, meters, and mixer state aligned. Bloomberg-style screens pack related functions and data into a field designed for scanning rather than progressive disclosure.

### Claim

**Optimize for decision-relevant state per navigation step, not blank space.** A dense surface earns its space when it eliminates context switching or makes comparison immediate.

### Experiment

Build the same monitoring/management task three ways:

1. sparse: one primary object per screen, drill down for details;
2. dense + grouped: all decision-relevant state visible with clear regions and alignment;
3. dense + ungrouped: same information as #2 with weaker grouping.

Run repeated tasks that require comparison, anomaly detection, and one-item editing. Measure target time, wrong selections, backtracking, view changes, and missed anomalies. Repeat after familiarity develops.

Prediction: grouped density should win strongly on comparison and anomaly tasks. The sparse version should remain competitive for long-form reading or single-object editing.

## 2. Stable anchors compound with expertise

Expert interfaces become spatial memory systems.

A spreadsheet cell, a DAW track, a Blender region, a Dwarf Fortress map tile, an IDE gutter, a terminal prompt, or a Bloomberg market-sector key gains meaning partly because it stays where the user expects it.

Research on command selection makes this explicit. CommandMaps flattened command hierarchies and used spatial memory; experienced users selected commands significantly faster than with traditional menus or the Ribbon. Studies of adaptive menus also found costs when frequently used items moved around automatically; static or user-adaptable menus often performed better and were preferred. Work on ephemeral adaptation found a better compromise: draw attention to predicted items while preserving their locations.

### Claim

**For expert use, highlight priority before relocating it.** Stable location becomes an accumulated asset after dozens or hundreds of repetitions.

This applies directly to Leo's dislike of panel churn. A surface can be dense and still feel calm when the user knows where the roster, state, filters, output, and actions live. Reordering those areas according to machine guesses spends spatial memory to buy short-term salience.

### Experiment

Create a 24-command surface with three variants:

- fixed positions;
- adaptive reordering by recent/frequent use;
- fixed positions with adaptive emphasis only.

Test at first use, after 25 selections, and after 100+ selections. Then change the frequency distribution and test again.

Measure selection time, errors, eye travel if available, and "where did it go?" recovery time.

The key result is the learning curve. A design that wins trial one can lose badly after spatial memory develops.

## 3. Discoverability and fluency can share the same command

The strongest expert interfaces often expose a visible route and an accelerator for the exact same action.

Examples:

- classic Dwarf Fortress displayed relevant command keys beside menu items;
- Excel can reveal KeyTips over visible Ribbon commands;
- VS Code's Command Palette lists named commands and shows their shortcuts;
- Blender's status bar displays contextual mouse/keyboard actions for the active tool;
- Bloomberg's dedicated GO, MENU, HELP, and market-sector keys turn a huge vocabulary into a partly physical one;
- terminal shells use completion, history search, and autosuggestions to turn command recall into recognition.

This is better than dividing the product into a discoverable novice interface and a separate expert language. The user sees the action, uses it, notices its accelerator, and eventually stops needing the visible path for frequent operations.

### Claim

**Expert fluency should grow out of the visible interface.** Frequent actions can become muscle memory while low-frequency actions remain locally recoverable.

A shortcut becomes valuable when it accelerates an already understood action. Memorization becomes a tax when the shortcut is the only practical doorway.

### Experiment

Instrument 12 recurring commands across three variants:

- visible labeled control + shortcut shown beside it;
- searchable command list + shortcut;
- shortcut-first interface with separate help.

Test first success, 20th repetition, and 100th repetition, then insert a two-week gap for several low-frequency commands. Measure execution time and recovery time after the gap.

The low-frequency recovery test is especially important. Expert users still forget commands they use once a month.

## 4. Command vocabulary is strongest when it composes

Terminals are the clearest counterweight to the "see everything" thesis. A shell exposes very little state by default, yet its command language can express enormous capability through composition, history, aliases, pipes, scripts, and completion.

The lesson from terminals is narrower than "memorization is good." The durable advantage is **compositional vocabulary**: a small set of operators and conventions can generate many actions. History search and completion then externalize part of the recall burden.

Bloomberg also uses terse mnemonics, but it supports them with a specialized keyboard, autocomplete, related-function menus, and contextual HELP. VS Code uses fuzzy command search as another form of vocabulary externalization.

### Claim

**A command language earns memory cost when learning one concept unlocks many operations.** One-off arbitrary shortcuts age poorly; compositional commands keep paying dividends.

A searchable command palette works well as a recovery and long-tail layer. It becomes a junk drawer when naming is inconsistent, context is ignored, and frequent actions live there because the main field failed to expose them.

## 5. Labels carry meaning; icons compress learned meaning

The label/icon debate changes with frequency and familiarity.

Research and design guidance consistently show that abstract or unfamiliar icons create interpretation cost. Text labels improve comprehension and learning in those cases. At the same time, visual-search studies show that unlabeled icon grids can become quicker to scan under some conditions, and expert users often recognize a familiar glyph or location before reading text.

That suggests a lifecycle:

```text
unknown action -> label carries semantics
known action -> icon + location accelerate recognition
highly fluent action -> location / shortcut may dominate both
```

### Claim

**Use labels for semantic ambiguity and icons for compression after meaning is established.** Rare, destructive, unusual, or product-specific actions deserve words. Conventional and heavily repeated actions can survive in more compact form.

Stable location plays a large role here. After prolonged use, the user may select "the third control in that rail" faster than decoding the glyph itself.

### Experiment

Choose 16 actions: 8 common/conventional and 8 product-specific. Compare icon-only, text-only, and icon+text versions over first use, 20 repetitions, 100 repetitions, and a delayed return.

Measure identification time, execution time, wrong-action rate, and delayed recall.

A useful follow-up is user-controlled compaction: begin with labels, then let the user explicitly switch a stable toolbar to compact mode while preserving control positions.

## 6. A glossary/help strip works when it is local and contextual

Several expert tools use a narrow, persistent teaching surface successfully:

- Blender's status bar shows controls for the active tool and current operation;
- Ableton Live's Info View names and explains the UI element under the pointer and can be shown or hidden;
- classic Dwarf Fortress exposed relevant command keys in the current command area;
- Bloomberg's HELP action opens help for the current function and makes assistance part of the primary interaction vocabulary.

The common pattern is stronger than "provide help."

A useful help strip answers:

```text
what can I do here right now?
what input performs it?
what state am I currently in?
```

It stays in a predictable edge location, uses short language, changes with context, and leaves the main work area intact.

### Claim

**Contextual help is most valuable as peripheral state, not a destination.** It should reduce command lookup without becoming another panel to manage.

### Experiment

For one moderately complex editor, compare:

- contextual footer strip;
- hover tooltips only;
- dedicated help panel;
- no local help, searchable documentation only.

Use unfamiliar commands, then repeat the same tasks until users become fluent. Measure help invocations, pointer travel, task interruption time, and delayed recovery for forgotten commands.

Also measure whether expert users keep the strip visible after 100 repetitions. If it continues to carry mode/state information, it may earn permanent space even after its teaching role fades.

## 7. Panels are expensive when they create window-management work

IDEs reveal the tension clearly. JetBrains tools and VS Code expose project trees, terminals, problems, version control, search, debug state, output, and extensions through docked or movable regions. Both also provide ways to hide broad sets of UI and return to a focused editor. The existence of those controls is evidence of a real cost: a powerful workspace can turn into a workspace-management task.

Leo's preference for seeing the whole field points toward a specific alternative: **one coherent canvas with stable edge anchors and cheap focus transitions.** The goal is broad awareness without asking the user to curate a pile of independent rectangles.

A panel earns permanence when its state remains relevant across many actions. A panel earns temporary presence when it supports a bounded operation. A capability that appears once a month belongs in search, a command list, or a contextual overlay.

### Claim

**Treat persistent screen regions as scarce landmarks.** Adding a panel creates recurring attention and arrangement cost, even when the panel itself is useful.

### Experiment

Prototype the same expert workspace in two versions:

- whole-field: stable primary canvas, compact status/roster/filter rails, contextual inline expansion, one-gesture focus mode;
- panel-stack: equivalent functions distributed across docked, collapsible, and detachable panels.

Use tasks that alternate between overview, investigation, editing, and returning to overview. Measure panel toggles, window moves/resizes, focus changes, lost-position incidents, task time, and ability to answer "what else is happening?" during focused work.

This directly tests the tension between broad visibility and windowing clutter.

## 8. What survives 100+ hours

Expert interfaces age well when they accumulate memory instead of demanding housekeeping.

The traits that improve with long exposure:

- stable spatial anchors;
- direct visibility of important state;
- consistent naming;
- shortcuts attached to visible actions;
- compositional command languages;
- user-controlled persistent layouts;
- low-frequency actions that remain searchable;
- compact help that also reports current mode/state;
- one-gesture transitions between overview and focus.

The recurring debts after long exposure:

- targets that move under adaptive ranking;
- arbitrary command vocabulary;
- icon-only controls with weak semantics;
- hidden state that forces repeated navigation;
- panel proliferation and layout maintenance;
- animations and transitions on high-frequency paths;
- command palettes filled with poorly named global actions;
- context loss when entering and leaving detail views.

The hundredth-use test therefore needs a companion:

> What knowledge has the interface allowed the user to accumulate, and does the interface keep honoring it?

## Interface-by-interface read

| Interface | Power source | Long-use debt |
| --- | --- | --- |
| Dwarf Fortress classic | map + visible command list + dense state + hotkeys | large arbitrary vocabulary; forgotten low-frequency keys |
| Spreadsheet | persistent 2D coordinates; direct comparison; formulas | feature depth and obscure functions accumulate outside the grid |
| IDE | code stays central; direct navigation + searchable commands | sidebars/tool windows can become visual bookkeeping |
| Terminal | compositional text language; history; completion; scripting | current system state is often implicit; command recall can dominate rare tasks |
| Bloomberg-like terminal | dense related data; mnemonics; physical key categories; contextual help | huge domain vocabulary and dependence on learned conventions |
| DAW | timeline and mixer preserve parallel state in stable lanes | large sessions create scanning cost; device/plugin views compete for space |
| Blender / 3D tool | viewport remains central; stable editors; contextual key hints | modes and tool vocabularies create hidden-state errors and recall cost |
| Admin / monitoring console | many entities can be compared at once; anomalies can stay visible | weak prioritization produces alert and panel clutter |
| Management game screen | rosters, resources, map, queues, and status can coexist | nested tabs and modal detail screens fragment the world when every subsystem claims its own page |

## Working synthesis

The best version of the proposition is:

> **Power can come from a larger visible field when that field preserves comparison, stable location, and current state. Memory should accelerate use, while the interface keeps forgotten actions recoverable.**

For Leo's ideal environment, this points away from both extremes: a sparse stack of hidden screens and a cockpit of independently managed panels.

The promising target is a dense, calm field with stable landmarks, terse labels, locally visible state, searchable long-tail commands, contextual key hints, and a cheap switch into full focus. The user can see the world, then disappear into one object, then come back without rebuilding the world.

## Sources worth returning to

- Scarr, Cockburn, Gutwin, Bunt — *Improving Command Selection with CommandMaps* (CHI 2012): https://doi.org/10.1145/2207676.2207713
- Park & Han — *Adaptable versus adaptive menus on the desktop* (2007): https://doi.org/10.1016/j.ergon.2007.04.006
- Findlater et al. — *Ephemeral adaptation* (CHI 2009): https://www.cs.ubc.ca/labs/imager/tr/2009/findlater_chi_ephemeral/
- Moacdieh & Sarter — *The Effects of Data Density, Display Organization, and Stress on Search Performance* (2017): https://doi.org/10.1109/THMS.2017.2717899
- Staggers et al. — *Impact of screen density on clinical nurses' computer task performance and subjective screen satisfaction* (1993): https://doi.org/10.1006/imms.1993.1083
- Blender Manual — Status Bar / contextual keymap information: https://docs.blender.org/manual/en/4.5/interface/window_system/status_bar.html
- Ableton Live Manual — Info View: https://www.ableton.com/en/live-manual/11/first-steps/
- Microsoft — Excel keyboard shortcuts and KeyTips: https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f
- VS Code — Command Palette and custom layout: https://code.visualstudio.com/docs/editing/getting-started/editor-tutorial and https://code.visualstudio.com/docs/configure/custom-layout
- fish shell — autosuggestions and tab completions: https://fishshell.com/docs/3.0/tutorial.html
- Dwarf Fortress Wiki — classic interface/menu references: https://dwarffortresswiki.org/DF2014:Interface and https://dwarffortresswiki.org/Menu
- Nielsen Norman Group — icon usability: https://www.nngroup.com/articles/icon-usability/
- FHWA — text labels and icon interpretation: https://www.fhwa.dot.gov/publications/research/safety/03065/05.cfm
- Deng & Liu — *The effects of layout types, visual features and text labels on icon visual search performance* (2025): https://doi.org/10.1080/00140139.2024.2440767

— Rook 🐦‍⬛
