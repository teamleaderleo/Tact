# Native macOS interaction after the hundredth use

A study of Finder, Safari, System Settings, Spotlight, Mission Control, menus, sheets, sidebars, titlebars, drag and drop, keyboard navigation, motion, window behavior, accessibility, and current AppKit / SwiftUI conventions.

The useful question for Tact is smaller than “what does Apple do?”

> Which Mac behaviors become better because you use them every day, which ones keep charging rent, and which conventions are worth carrying into terminal-kit?

This note uses Apple’s current 2026 design guidance and macOS 27 developer material alongside the instincts already captured in Tact and the interaction direction in terminal-kit.

## The Mac idea worth stealing

The best Mac interactions treat windows, files, selections, commands, and workspaces as durable objects while the user changes viewpoint.

A file can be selected in a background Finder window and dragged into the active one. A window can move between Spaces. A sheet belongs to one parent window while the rest of the app remains available. A command can live in a toolbar, menu bar, shortcut, and context menu without becoming four different concepts. A good Mac app can quit and restore to the same useful state later.

That creates a specific kind of continuity:

```text
same object
+ stable identity
+ several ways to reach it
+ spatial persistence
+ immediate feedback
= the computer feels like a place instead of a sequence of pages
```

This is the Mac convention I would protect most aggressively.

## What feels excellent after repeated daily use

### Finder: direct manipulation plus deep fallback paths

Finder is full of old seams and weird history, yet several interactions become excellent through repetition.

**The sidebar acts like pinned geography.** Favorites are user-chosen, draggable, reorderable, resizable, collapsible, and removable without moving the underlying file. The position becomes memory. This is more valuable than a “smart” sidebar that constantly reorders itself.

**Quick Look is an almost perfect repeated-use interaction.** Select something, press Space, inspect it, press Space or Esc, continue. It preserves the file’s location and selection while temporarily expanding the amount of information available. The preview can grow to full screen without turning inspection into a navigation journey.

**Drag and drop respects objecthood.** Files can move between windows, folders, the desktop, apps, and Spaces. macOS also supports background-window dragging: selected content in an inactive window can be dragged without first activating that window. That small rule is unusually good because it removes a ceremonial click from a continuous physical action.

**Modifier keys deepen the same gesture.** Option changes a same-container move into a copy. The pointer and drag image communicate the result. The gesture stays the gesture; expertise adds precision.

**Context menus stay contextual.** Right-clicking a file gives nearby actions. The main menu still owns the complete command vocabulary. This lets the pointer path stay short without making right-click the only doorway to a capability.

What terminal-kit should steal:

- persistent user-ordered sidebar destinations;
- Space for preview where terminal semantics allow it;
- drag a proven path into another terminal, workspace, sidebar target, Dock target, or Finder;
- background-window drag behavior where native APIs permit it;
- spring-loaded navigation while dragging over folders or workspace targets;
- preserve selection after a successful drop so the user can immediately continue acting on the result;
- path context menus with Open, Preview, Copy Path, Reveal in Finder, Open in New Surface, and task-specific actions.

Terminal-kit already points in this direction in `docs/interaction-model.md`. The next step is to make the interactions feel like one continuous manipulation instead of shell text acquiring a few mouse commands.

### Safari: a hot path with transferable muscle memory

Safari’s durable value on Mac comes from the boring verbs being cheap:

```text
Cmd-L -> address/search
Cmd-T -> new tab
Cmd-W -> close
Cmd-Shift-T -> reopen
Cmd-F -> find
Ctrl-Tab -> next tab
```

Those commands transfer from browsers and many Mac apps. The basic tab model survives because the user can operate it through pointer, keyboard, menus, drag, and sidebar views.

Safari also exposes a useful customization lesson. Users can choose separate versus compact tabs, decide whether tabs replace windows, choose whether new tabs become active, and enable `Cmd-1` through `Cmd-9` tab switching. The product keeps a coherent vocabulary while allowing several daily-use preferences.

The weaker area is organizational layering. Tab Groups, Profiles, pinned content, windows, history, and sidebar collections can become extra concepts around a hot path that often only needs “these tabs are here.” Tact’s existing preference for stable anchors over another organizational layer applies directly.

What terminal-kit should steal:

- preserve browser/Finder keyboard expectations wherever they map cleanly;
- make reopen-last-closed a first-class recovery gesture;
- let users choose tab/workspace switching styles without changing the core object model;
- keep the common path flatter than the full organizational model;
- provide optional grouping as a power layer, never as a tollbooth on opening, switching, or closing a surface.

### Spotlight: search becomes an action surface

Spotlight is one of the strongest current examples of interface disappearing into intent.

`Cmd-Space`, type, arrows, Return, gone.

Current Spotlight goes beyond finding apps and files. It has browse modes for Applications, Files, Actions, and Clipboard; keyboard shortcuts `Cmd-1` through `Cmd-4`; Quick Look with Space; reveal-in-Finder; action execution; Clipboard history; and user-defined quick keys for actions.

The interaction is powerful because search and action share one temporary surface. The user can stay on the keyboard, the existing desktop remains behind it, and Escape restores the previous world immediately.

There is a terminal-kit lesson here:

> A command palette should feel like Spotlight with domain knowledge, not like a settings page that happens to have search.

A strong `tk` launcher could support:

```text
Cmd-Space-like summon
-> type workspace / command / file / agent / action
-> local results immediately
-> arrows to inspect
-> Space to preview
-> Return to act
-> Esc to disappear
```

Then add expert acceleration:

- quick keys for repeated actions;
- recent actions with stable names;
- scope keys for Workspaces / Files / Agents / Commands;
- local results before remote enrichment;
- aliases learned from use;
- zero page transition for common actions.

### Mission Control: overview as spatial memory

Mission Control succeeds when the user remembers a window approximately: “upper left, big browser, narrow terminal beside it.” It turns the current desktop into a single spatial field, keeps Spaces visible along the top, and supports dragging windows between Spaces.

The important quality is correspondence. The overview represents windows that already exist. It does not convert them into rows in a management database.

That suggests a direction for `terminal-kit overview`:

- preserve actual relative window and pane positions where possible;
- animate from the current window geometry into the overview and back;
- allow arrow-key navigation based on spatial neighbors;
- let pointer selection target the visible representation directly;
- allow dragging a workspace or window representation to another Space / project region;
- show enough agent/task state to disambiguate windows without covering the preview;
- keep the selected object visually continuous during zoom-in.

A calm list is useful as a fallback. A spatial overview should remain spatial.

### Menu bars: the complete command vocabulary

The Mac menu bar is one of Apple’s best power-user conventions.

A good Mac app can expose the whole command set there, including actions duplicated in toolbars and context menus. Keyboard shortcuts are visible beside the commands. Menu validation can update availability and titles to reflect current state. The toolbar can then stay selective because it never has to carry every command.

This creates a valuable hierarchy:

```text
menu bar = complete vocabulary
keyboard = repeated vocabulary
toolbar = frequent visible vocabulary
context menu = nearby vocabulary
command palette = searchable vocabulary
```

These should usually be several doors into the same actions.

For terminal-kit / cmux, command implementations should ideally have one canonical action model that feeds menu items, shortcuts, palette results, context menus, and buttons. A command should keep its name and semantics across surfaces.

### Sheets: locality is the useful part

A native Mac sheet belongs to one parent window. The parent dims; the sheet carries a short scoped task; other windows in the app can remain usable.

That spatial attachment is excellent. The user can see what the decision applies to.

The daily-use lesson is equally important: repeated utilities deserve panels, inspectors, popovers, or persistent panes. Apple’s current guidance explicitly recommends a panel when people repeatedly provide input and observe results.

Use a sheet for:

- save / export choices;
- one consequential scoped decision;
- attaching or selecting something for the current object;
- short configuration tied to one window.

Use a panel / inspector / inline region for:

- logs;
- search and replace;
- repeated task controls;
- agent status;
- filters the user adjusts while watching results;
- anything that benefits from staying visible while the main content remains interactive.

### Sidebars: stable geography beats dashboard ambition

Current Apple guidance treats Mac sidebars as user-customizable navigation with system accent color, hide/show behavior, resizing, and at most a shallow hierarchy.

The parts worth preserving are:

- user ordering;
- stable sections;
- direct dragging;
- collapsible groups;
- resize and hide/show;
- shallow hierarchy;
- selection that remains obvious when the window becomes inactive;
- system-aware icon sizing and accent behavior.

Terminal-kit should resist turning the sidebar into a telemetry wall. Branch, PR, directory, ports, agents, notifications, test status, and progress can all be useful, yet persistent rows need a strict budget.

A useful rule:

> Navigation owns the row. Status can annotate it. Status should rarely become another navigation layer.

Let the sidebar answer “where am I and where can I go?” Put detailed live state in an inspector, Dock, popover, or overview.

### Titlebars and toolbars: native chrome earns trust through physics

Mac windows carry years of learned behavior in their frame:

- traffic-light controls;
- dragging the titlebar;
- double-click behavior configured by the user;
- window activation;
- zoom/full screen behavior;
- toolbar customization and overflow;
- active/inactive appearance;
- system materials and accessibility adaptations.

Apple’s guidance is strong here: avoid custom window frames that imitate system controls. The imitation has to reproduce a huge amount of behavior to feel right.

Use the real frame. Put personality inside it.

Good places for authorship:

- toolbar composition;
- accent color;
- custom symbols;
- content flowing beneath the modern sidebar / toolbar materials;
- restrained materials;
- window titles that communicate the object or task;
- live task state beside the title when it earns the space;
- app-specific controls that still use native hit testing, focus, hover, and keyboard semantics.

macOS 27 adds new AppKit corner-concentricity APIs and refinements to Liquid Glass, including subtle interactive response for appropriate glass controls. Those are useful finishing tools after the interaction works.

### Contextual menus: pointer acceleration, never secret capability

Apple’s current guidance is unusually clear: contextual menus should contain the actions most relevant to the selected object, stay short, keep submenu depth shallow, and expose the same commands elsewhere in the app.

For terminal-kit, right-clicking a proven filesystem path could be excellent because the context is strong. Right-clicking arbitrary terminal text should remain conservative.

A path menu could include:

```text
Open
Preview
Open in New Surface
Copy Path
Reveal in Finder
---
Run Here / Set Working Directory (when meaningful)
---
Task-specific actions
```

Hide irrelevant actions instead of presenting a graveyard of disabled rows.

### Keyboard navigation: every pointer path should have a serious keyboard sibling

Mac software rewards users who accumulate muscle memory. That only works when apps respect standard shortcuts.

Terminal-kit already has the right instinct with `Cmd-T`, `Cmd-W`, `Cmd-Shift-T`, browser-style tab cycling aliases, and ordinary clipboard/edit behavior.

Extend that philosophy:

- preserve standard commands before inventing new ones;
- put shortcuts beside menu commands;
- use Command as the primary custom modifier;
- reserve Option for power variants;
- support Full Keyboard Access;
- keep focus rings meaningful;
- make Tab order follow the visual/semantic flow;
- ensure dynamic AppKit interfaces recalculate the key view loop (`autorecalculatesKeyViewLoop`);
- give forgotten commands local discoverability through menus, tooltips, palette search, and `tk keys`.

A command that deserves daily use can earn a shortcut. A command used twice a month can remain searchable.

### Native motion: explain causality, then get out of the way

Apple’s current motion guidance says two things that fit Tact extremely well:

1. feedback animation should be brief and precise;
2. frequent UI interactions usually deserve little custom motion, and people should be able to act before animation finishes.

Motion earns its keep when it answers “where did that go?”

Good examples for terminal-kit:

- overview zooms from the real window into its spatial thumbnail and back;
- closing a surface contracts toward the place it can be reopened from;
- dragging a workspace gives continuous insertion feedback;
- a sidebar collapse preserves the content’s visual location;
- a detachable popover becomes a panel with a smooth size/position transition.

Bad repeated-use motion:

- every tab switch crossfades through a decorative transition;
- command palette rows bounce on selection;
- a spinner replaces useful old content during every refresh;
- opening a sidebar performs a long easing sequence;
- success animations delay the next command.

Use animation as a map, acknowledgement, or state explanation. Let repeated actions interrupt or outrun it.

## Latency that harms continuity

Leo’s System Settings complaint points at a broader class of failure: latency becomes especially irritating when the user has already supplied enough information for the next state.

### 1. Navigation that reloads a concept the user was already inside

If Back means “return to the previous settings pane,” the app should preserve:

- scroll position;
- selection;
- expanded disclosure state;
- text-entry state when safe;
- loaded content that remains valid;
- the visual target the user came from.

System Settings does have Back/Forward history, including a press-and-hold history list, but the history refreshes each time the app opens. More importantly, the mental cost comes from panes that feel reconstructed instead of revisited.

A better rule for Tact:

> Back should feel like returning to a place, not asking the app to build that place again.

### 2. Continuous interactions that cross a process or network boundary

Drag, resize, scroll, selection, hover, and window movement must remain local. Apple’s responsiveness guidance notes that people are especially sensitive to delay and irregularity in continuous interactions; even around 50 ms can become perceptible in direction changes during a drag.

Any remote query required to decide whether the pointer can keep moving is already in the wrong layer.

For terminal-kit:

- drag feedback from local state;
- workspace selection from resident state;
- sidebar disclosure from local state;
- palette first results from a local index;
- remote GitHub / agent metadata enriches after the stable target is already visible.

### 3. Whole-surface replacement during refresh

Keep useful old content visible while updating the parts that changed.

Prefer:

```text
current content
+ small local loading indicator
+ incremental changed values
```

over:

```text
current content disappears
-> spinner
-> whole surface reappears
```

The first preserves the user’s visual anchors. The second makes every refresh feel like navigation.

### 4. Work launch with no immediate object

Starting a task may take time. The interface should create the task’s visible identity immediately:

```text
user starts task
-> workspace / receipt / row exists immediately
-> title and state appear
-> process boot continues
-> details fill in
```

This lets the user move on. The delay belongs to the task, not the act of creating the task.

### 5. Theme or configuration changes that restart the world

terminal-kit already has a strong instinct here: reload live tmux/cmux/Ghostty configuration while preserving sessions, panes, scrollback, and running programs.

Keep pushing toward appearance changes that apply in place. A theme picker that destroys workspace state is a customization bug.

## Spatial behaviors that feel native

The Mac repeatedly rewards these spatial rules:

### Selection stays where the user left it

Changing focus between windows can alter selection appearance, but the selected object survives. That enables background dragging and quick return.

### Windows remain user-owned objects

Users move and resize windows; apps remember where practical; relaunch restores useful state. New windows appear because they preserve context or enable parallel work.

### Transient UI points back to its source

Popover arrows, attached sheets, contextual menus, toolbar menus, and drag images all communicate where an interaction came from.

### Overview preserves correspondence

Mission Control scales windows down instead of abstracting them into unrelated cards. The thumbnail still looks like the window.

### Hidden regions return predictably

A sidebar hides and reappears in the same place. A toolbar returns at the edge. A menu opens from the item that summoned it.

### Drag targets react before drop

Insertion markers, highlights, spring loading, scrolling, pointer badges, and drag images keep the manipulation continuous.

### Active and inactive states remain legible

macOS uses window activation state as real information. Modern macOS 27 materials and sidebar icons continue adapting their emphasis when a window becomes inactive.

For terminal-kit, this could become a quiet but powerful language:

- key workspace: full accent and task detail;
- visible inactive workspace: reduced emphasis while preserving identity;
- blocked workspace: one persistent state mark;
- completed workspace: calm completion state, no celebratory takeover;
- background agent activity: visible only where it changes the next action.

## Conventions worth respecting

These conventions have enormous accumulated value:

1. **Real native windows and traffic lights.** Let macOS own window movement, resize, activation, zoom, full screen, Spaces, accessibility, and restoration semantics.
2. **Standard keyboard commands.** `Cmd-C/V/A/Z`, `Cmd-T/W`, `Cmd-F`, `Cmd-L` where applicable, Escape, arrows, Space for Quick Look-style preview, and menu-visible shortcuts.
3. **Menu bar completeness.** Every meaningful command has a discoverable home even when the toolbar hides or changes.
4. **Toolbar selectivity.** Frequent actions visible; the menu owns the long tail; system overflow handles narrow windows.
5. **Context menu locality.** Nearby relevant actions, shallow submenus, same commands available elsewhere.
6. **Finder-like drag semantics.** Direct manipulation, Option-copy conventions, continuous feedback, undo when practical.
7. **Sidebar geography.** User-orderable, resizable, hideable, shallow, stable.
8. **Sheet attachment.** Modal tasks visibly belong to one parent window.
9. **Multiple windows as a real feature.** Open a new window when parallel context helps; restore it after relaunch.
10. **Accessibility settings as first-class environment.** Reduce Motion, Reduce Transparency, Increase Contrast, Show Borders, system accent, VoiceOver, Full Keyboard Access.
11. **Native selection and focus.** Let key/inactive windows, focus rings, and keyboard loops behave like Mac controls.
12. **System-provided full screen.** Preserve the green-button / View menu / `Ctrl-Cmd-F` model.

## Conventions worth breaking

Apple’s conventions are strongest when they encode learned behavior. They deserve less loyalty when they encode implementation history or cross-platform compromise.

### Break iPhone-shaped navigation on a large Mac display

A Mac can show more state simultaneously. Prefer one well-composed split view or inspector over repeated push-navigation through narrow panes.

For terminal-kit, a workspace with browser + terminal + task state can often remain one coherent field instead of turning each subtool into a destination page.

### Break reload-heavy settings behavior

Settings should apply in place when feasible. Preserve the current location and show the effect immediately. Search should jump directly to the actual control, ideally highlighting it briefly.

### Break hidden-only discoverability for important expert actions

Context menus are excellent accelerators. A capability that changes daily work deserves a menu command, shortcut, visible control, or searchable command as well.

### Break animation defaults on the hundredth-use path

Even beautiful system-like motion can become syrup. Repeated navigation can snap or use near-instant continuity motion while rarer spatial transitions receive more explanation.

### Break the assumption that every status deserves a badge

Badges accumulate. Use them for state that changes action. Healthy background work can stay quiet.

### Break rigid sidebar taxonomy

Let users pin and reorder the things they actually visit. Prefer stable user geography to a designer’s perfect folder theory.

### Break modal settings and inspectors

If the user changes a value while watching the main content, use a panel, popover, inline inspector, or Dock surface. Save sheets for short scoped decisions.

### Break visually generic “native” styling when character can live safely at the edges

Native interaction does not require anonymous appearance. Keep the physics and semantics; author the typography, accent, materials, symbols, density, background treatment, selection treatment, sounds, and optional ornament.

## Where personality can enter

The safest place for personality is where it adds recognition or pleasure while preserving interaction expectations.

### 1. Selection and active-state treatment

A workspace could carry a distinctive accent wash, icon tint, or tiny animated state mark while standard focus and selection semantics remain intact.

### 2. Workspace identity

Let users give workspaces colors, symbols, short names, or tiny emblems. A repeated spatial environment benefits from landmarks.

### 3. Theme systems that reach across tools

terminal-kit already treats theme as a system spanning Ghostty, tmux, sidebar, `bat`, Delta, and other surfaces. Keep extending semantic theme roles rather than painting each component independently.

Useful roles:

```text
background
raised surface
sidebar material
primary text
secondary text
selection
focus
success
warning
blocked
accent
muted border
```

Then map the current theme into those roles.

### 4. Native materials used sparingly

Liquid Glass, vibrancy, accent color, hover response, and macOS 27 interactive glass can make the workspace feel alive. Use them on controls and boundaries where the system semantics already support them.

### 5. Sound as optional confirmation

A quiet optional sound can make task completion, failure, or attention requests legible from the edge of awareness. Give it a global mute and per-event controls.

### 6. Idle / inactive states

An inactive workspace can become visually quieter without losing its layout. Personality can appear through a tiny emblem, title treatment, or ambient state marker instead of a large notification.

### 7. Empty states and recovery states

These occur less frequently and can carry more voice. “No tasks need you” can be warm, strange, or funny because the user is between hot-path actions.

## Delightful customization worth building

### Workspace appearance presets

Save density, theme, sidebar width, Dock width, font, and overview style as named presets:

```text
Focus
Review
Agents
SSH
Tiny Laptop
27-inch Command Center
```

Switch in place.

### User-editable sidebar geography

Pin folders, repos, agents, task groups, ports, or views. Drag to order. Allow section creation. Keep automatic suggestions separate from the user’s chosen order.

### Toolbar customization

Let the standard Mac toolbar model do its job: users add, remove, and rearrange secondary items while a few leading navigation controls remain fixed.

### Quick keys

Borrow the new Spotlight idea. Let a user assign `rv`, `pr`, `ag`, `ssh`, or another tiny mnemonic to a command/workspace/action. Show suggested quick keys after repeated use.

### Command aliases learned from use

If the user repeatedly types “logs” to reach a test watcher, offer to bind that term to the action. Keep the canonical command name intact.

### Per-workspace accent and icon

A tiny visual token can make Mission-Control-style overview dramatically easier to scan.

### Motion intensity

Offer something like:

```text
Motion: Reduced / Native / Expressive
```

“Native” follows system Reduce Motion and standard AppKit/SwiftUI behavior. Expressive adds optional workspace zoom or ornament. Reduced collapses spatial motion to fades / immediate changes.

### Sidebar density

Small / medium / large rows already exist as a Mac idea. terminal-kit can respect the system preference by default and expose an app-specific override for people who want more information density.

### Theme rotation with memory

terminal-kit already supports deterministic daily rotation. Extend it with “keep this one” and “never show this one again,” turning randomization into taste learning.

## Ridiculous but plausible experiment: Window Familiar Spirits

Tact already contains the excellent “cats on macOS windows” idea. Push it one click further into tasteful insanity.

Build a native overlay companion that treats application windows as habitats.

Implementation sketch:

```text
Accessibility API + CoreGraphics window list
-> observe visible app windows and their frames
-> correlate focused / minimized / moved / resized state
-> create transparent borderless NSPanel overlays
-> keep overlays click-through
-> join appropriate Spaces behavior
-> update positions from window events
-> remove overlays immediately when the host window disappears
```

Behavior modes:

**Tasteful**

- two tiny cat ears barely peeking over the focused window;
- a tail curls around one bottom corner of a long-running workspace;
- sleeping cat silhouette on an inactive window after ten minutes;
- ears flatten once when a task fails;
- one paw appears near a notification badge that genuinely needs attention.

**Demented**

- every workspace has a different cat species;
- cats migrate to the newly focused window via a short arcing hop;
- a build failure causes a cat to knock a tiny ornamental cup off the titlebar;
- a very long-running agent grows progressively more cats until completion;
- opening Mission Control reveals the entire feline ecosystem at once;
- a “cat gravity” slider controls whether tails hang from the nearest physical screen edge;
- Option-clicking the menu-bar cat opens a taxonomy of every cat currently attached to a process.

**Absolutely essential constraints**

- overlays ignore mouse events;
- overlays stay outside the accessibility tree unless they expose a real command;
- Reduce Motion turns migration into immediate repositioning;
- Reduce Transparency / Increase Contrast yield readable simplified art;
- zero effect on host-window activation, drag, resize, Spaces, full screen, or keyboard focus;
- instant global disable shortcut;
- CPU/GPU budget low enough to leave running all day.

This experiment is ridiculous enough to expose real craft. If the cats survive daily use, the implementation will have solved window tracking, inactive-state behavior, motion, accessibility, occlusion, Spaces, personality budgets, and the difference between attachment and interruption.

## Concrete directions for terminal-kit

### `tk overview`

Turn it into a first-class Mac overview surface:

- real geometry where possible;
- stable workspace order;
- spatial arrow navigation;
- click to zoom;
- Escape returns exactly where the user came from;
- agent/task metadata appears as annotation, never as card chrome that overwhelms the window preview;
- preserve previews across refreshes;
- no remote dependency for pointer/keyboard navigation.

### Files sidebar

Move closer to Finder behavior:

- user-pinned roots;
- drag reorder;
- spring-open folders;
- Quick Look;
- Open / Preview / Copy Path / Reveal in Finder context menu;
- background-window drag;
- selection survives preview and drop;
- keyboard navigation equal to pointer navigation.

### Command palette

Move closer to Spotlight behavior:

- one temporary summon gesture;
- local results as the user types;
- scopes for files / workspaces / actions / agents;
- preview with Space;
- act with Return;
- dismiss with Escape;
- quick keys;
- recently used actions;
- semantic aliases;
- remote enrichment after immediate local matches.

### Agent/work state

Treat tasks as durable Mac objects:

- visible identity appears immediately at launch;
- status updates in place;
- receipt / logs open in inspector or Dock surface;
- task can detach into its own window when deep inspection starts;
- state survives quit/relaunch;
- completed tasks remain recoverable without occupying prime navigation space.

### Native app layer

If cmux gains more AppKit/SwiftUI surfaces:

- prefer `NavigationSplitView`, `List`, native menus/commands, `NSToolbar` / SwiftUI toolbar APIs, standard windows, and system focus before custom drawing;
- use AppKit when terminal/window precision needs exact behavior;
- use SwiftUI where its scene, menu, toolbar, sidebar, accessibility, and state-restoration conventions already solve the problem;
- bridge between them freely instead of forcing the entire app into one framework religion.

The current AppKit direction from WWDC26 is especially relevant: gesture recognizers over old tracking loops, correct keyboard navigation, graceful termination, state restoration, and native macOS 27 visual adaptation.

## Accessibility as interaction quality

Accessibility should be treated as a pressure test for whether the interaction has real semantics.

### Keyboard

Every frequent pointer action should have a keyboard path. Full Keyboard Access should traverse custom controls in a sensible order. Dynamic views need correct focus recalculation.

### VoiceOver

Window titles, sidebar rows, controls, progress, task state, and drag/drop alternatives need meaningful accessibility labels and actions. A row containing “repo / branch / agent / blocked” should expose the important semantics instead of reading every decorative token.

### Motion

Follow Reduce Motion. Replace big spatial transitions with short fades or immediate changes. Avoid repetitive peripheral motion.

### Transparency and contrast

Liquid Glass adapts to Reduce Transparency and Increase Contrast. Custom materials and overlays should do the same. macOS 27 also exposes Show Borders behavior that custom controls can respect.

### Control sizing

Apple’s current HIG lists 28 × 28 pt as the default macOS control size and 20 × 20 pt as a minimum. Dense terminal UI can stay compact while maintaining reliable hit targets.

### Drag/drop alternatives

Every drag action needs another path: menu command, keyboard action, copy/move command, or accessible drag/drop descriptors where appropriate.

### User color choices

System accent is part of the Mac user’s environment. Fixed colors should communicate specific meaning; decorative identity can adapt to the chosen accent.

## A small doctrine for Tact

A native-feeling Mac product seems to emerge from a few recurring behaviors:

```text
keep objects alive
keep positions learnable
respond immediately
restore state
let pointer and keyboard coexist
show commands in familiar places
attach transient UI to its source
use motion to explain travel
let the user customize repeated-use surfaces
put personality at the edges of the work
```

Apple is strongest when it treats the Mac as a persistent workspace full of manipulable things.

Apple is weakest when a Mac app behaves like a sequence of freshly loaded destinations.

For terminal-kit, the opportunity is unusually good because the raw ingredients already exist: long-lived terminals, workspaces, panes, files, agents, browser surfaces, task receipts, themes, and window layouts. The design work is to make those things feel locally present, spatially memorable, immediately manipulable, and pleasurable enough to inhabit all day.

## Experiments worth running

1. **Finder path handling:** implement one proven-path interaction end to end: hover -> context menu -> Quick Look -> drag into another surface -> undo/recovery.
2. **Overview correspondence:** compare current overview against a geometry-preserving Mission-Control-style prototype; test which window users can reacquire faster.
3. **Settings continuity:** build one terminal-kit settings surface that applies changes live and preserves scroll/selection across every navigation action.
4. **Spotlight palette:** prototype a summon-and-dismiss action surface with local search, Space preview, Return action, Esc dismissal, and two quick keys.
5. **Detachable inspector:** make one transient task popover detach into a persistent panel without losing state.
6. **Hundred tab switches:** compare instant, 80 ms spatial, and 180 ms decorative transitions over repeated use.
7. **State restoration:** kill and relaunch the native layer repeatedly; restore windows, selection, sidebar width, active workspace, and inspector state.
8. **Accessibility pass:** operate the same workflow with pointer, keyboard only, Full Keyboard Access, VoiceOver, Reduce Motion, and Increase Contrast.
9. **User geography:** let a user manually arrange workspace/sidebar items for a week; compare against automatic recency sorting.
10. **Cats:** run Tasteful mode for a week. Any cat that becomes irritating gets demoted. Any cat that becomes a beloved landmark earns promotion.

## Sources

Primary Apple references:

- [Designing for macOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos)
- [Windows](https://developer.apple.com/design/human-interface-guidelines/windows)
- [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)
- [Menus](https://developer.apple.com/design/human-interface-guidelines/menus)
- [Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus)
- [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Modality](https://developer.apple.com/design/human-interface-guidelines/modality)
- [Drag and drop](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop)
- [Keyboards](https://developer.apple.com/design/human-interface-guidelines/keyboards)
- [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [File management](https://developer.apple.com/design/human-interface-guidelines/file-management)
- [Going full screen](https://developer.apple.com/design/human-interface-guidelines/going-full-screen)
- [Understanding user interface responsiveness](https://developer.apple.com/documentation/xcode/understanding-user-interface-responsiveness)
- [Modernize your AppKit app — WWDC26](https://developer.apple.com/videos/play/wwdc2026/289/)
- [What’s new in SwiftUI — WWDC26](https://developer.apple.com/videos/play/wwdc2026/269/)
- [Windows — SwiftUI](https://developer.apple.com/documentation/swiftui/windows)
- [Building and customizing the menu bar with SwiftUI](https://developer.apple.com/documentation/swiftui/building-and-customizing-the-menu-bar-with-swiftui)
- [NavigationSplitView](https://developer.apple.com/documentation/swiftui/navigationsplitview)

Product behavior references:

- [Customize the Finder sidebar on Mac](https://support.apple.com/guide/mac-help/customize-the-finder-sidebar-on-mac-mchl83c9e8b8/mac)
- [Quick Look on Mac](https://support.apple.com/guide/mac-help/mh14119/mac)
- [Safari keyboard shortcuts and gestures](https://support.apple.com/guide/safari/cpsh003/mac)
- [Safari Tabs settings](https://support.apple.com/guide/safari/ibrw1045/mac)
- [Search with Spotlight](https://support.apple.com/guide/mac-help/mchlp1008/mac)
- [Spotlight actions and quick keys](https://support.apple.com/guide/mac-help/mchl4953dfeb/mac)
- [Spotlight Clipboard history](https://support.apple.com/guide/mac-help/mchl40d5b86b/mac)
- [Mission Control](https://support.apple.com/guide/mac-help/mh35798/mac)
- [System Settings history](https://support.apple.com/guide/mac-help/mchldfdf4f86/mac)

Nearby Tact / terminal-kit notes:

- [`notes/leo-interface-instincts.md`](leo-interface-instincts.md)
- [`notes/authorship-and-product-design.md`](authorship-and-product-design.md)
- [`terminal-kit/docs/interaction-model.md`](https://github.com/teamleaderleo/terminal-kit/blob/main/docs/interaction-model.md)
- [`terminal-kit/docs/ricing-roadmap.md`](https://github.com/teamleaderleo/terminal-kit/blob/main/docs/ricing-roadmap.md)

— Pip 🐇
