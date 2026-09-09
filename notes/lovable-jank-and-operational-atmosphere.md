# Lovable jank, operational atmosphere, and the hundredth repetition

This extends the Dwarf Fortress and Battle Brothers / Mount & Blade thread in [`leo-interface-instincts.md`](leo-interface-instincts.md): an interface can be objectively awkward in several dimensions and still become a beloved place to work inside.

The interesting question is where the affection comes from, which costs users forgive, and how serious software can borrow the useful parts without dressing work up as a game.

## Working claim

Usability and affection are separate axes.

An interface can score poorly on learnability, conventionality, visual polish, or click count while scoring highly on fluency, identity, continuity, and emotional attachment. Games make this unusually visible because people voluntarily spend hundreds of hours inside systems that would fail a conventional first-run usability review.

A useful distinction:

- **ceremonial atmosphere** adds steps, pauses, reveals, flourishes, or transitions;
- **operational atmosphere** lives inside actions the user already needed to perform.

Operational atmosphere survives repetition better. Typography, framing, iconography, sound, vocabulary, spatial arrangement, and responsive motion can all make a tool feel authored while adding almost zero interaction cost.

The hundredth repetition is the test.

## 1. Dwarf Fortress: a command language can become a place

Classic Dwarf Fortress is a useful extreme. The command vocabulary is huge, context-sensitive, and often strange. The old interface also did something generous: controls commonly appeared beside options or at the bottom of the active screen. The current wiki still documents this pattern, along with configurable key bindings and repeat behavior for commands.

The charm comes from more than difficulty. The interface lets a practiced player operate a vast simulation directly. Once a command is learned, there is often little ceremony between intent and execution.

This creates a productive split:

```text
cold command
-> recognition / local hint
-> deliberate invocation

hot command
-> remembered key
-> direct action
```

The lesson for expert software is **learned complexity can pay rent when it buys directness**.

A large vocabulary is survivable when:

- command meanings stay stable;
- the same key keeps the same semantic role inside a context;
- local hints appear near forgotten commands;
- repeated commands become direct invocations;
- state remains visible enough to understand the result;
- advanced users can keep operating without waiting for decorative transitions.

The weak version of expert software demands recall and calls the pain “power.” The stronger version lets recognition teach recall over time.

A useful design pattern is **subtitled muscle memory**: show the shortcut beside the visible action every time, let the user click at first, and allow repeated exposure to teach the direct path.

## 2. Battle Brothers: thematic chrome works best when it rides with operational improvement

Battle Brothers is almost a controlled experiment because the developers explicitly rebuilt its UI. Their beta announcement described a new visual language of wood, iron, and paper intended to support the atmosphere, while also promising greater responsiveness and smoother play. The same update added easy drag-and-drop movement between active company slots and reserve positions.

Player feedback captures the trade clearly. People praised the new interface as easier to read and more fitting to the atmosphere. The same thread also complained when enhanced-item highlighting blended into the brown palette and when screens loaded slowly.

That is the key territory: players will accept ornate framing and old-world material cues when the actual operations stay legible and responsive. The theme earns affection. It loses its privilege the moment brown-on-brown hides a critical state or a town screen makes the player wait.

A PC Gamer review gives the other half of the picture. The reviewer found company management and inventory clunky, and discovered formation control only after several hours. The fantasy remained compelling while the management layer still carried real interaction debt.

Two lessons:

1. **Theme can amplify a good loop; it cannot redeem a repeated bad loop forever.**
2. **Visual identity has an operational budget.** Contrast, target size, load time, and state recognition stay inside that budget.

For serious software, “wood, iron, and paper” translates into authored typography, strong icon families, a distinct density philosophy, precise motion, domain vocabulary, restrained sound, and a recognizable material treatment. The serious product keeps the semantics of work visible.

## 3. Mount & Blade: unique fantasy creates a jank allowance, repeated clerical clicking spends it

Mount & Blade: Warband has an unusually strong core fantasy: travel, recruit, trade, fight, capture, loot, recover, repeat. The battle and campaign loops are distinctive enough that players tolerate menus with obvious rough edges.

Reviews from the period repeatedly call out the same class of pain:

- opening a party screen, selecting a companion, choosing “talk,” then drilling toward equipment;
- moving through party members one at a time for gear comparison;
- looting items individually;
- manually compacting inventory because sorting and take-all actions are absent.

This exposes the limit of lovable jank.

Players forgive awkwardness around a unique activity because the unique activity pays them back. Repeated clerical work receives far less grace. Clicking twenty loot items by hand has no fantasy value after the first few battles.

A rough formula:

```text
jank allowance
= uniqueness of payoff
+ predictability
+ recoverability
+ atmosphere
+ learned fluency
- repetition tax
- latency
- hidden state
- inconsistency
```

This is useful for productivity tools because serious users also tolerate weird software when it gives them rare power. The tolerance is valuable product capital. Spend it on capability that genuinely needs complexity. Preserve it everywhere else.

## 4. Crusader Kings III: immersion can mean continuity and overview

Paradox's console UI work for Crusader Kings III is a cleaner example of strategy-game thinking. The team wrote that players wanted large amounts of information close at hand, that rapid movement among menus, map, and popups was central to play, and that fullscreen menus could break immersion. Their console solution used a command bar, radials, quick access, and focus switching so the map stayed part of the interaction.

This suggests a broader definition of immersion.

Immersion is often treated as visual fiction: holograms, parchment, wrist computers, animated panels. Strategy games show another version: **the user remains inside one continuous decision field**.

A management interface can feel deeply immersive because:

- the overview survives while detail opens;
- current state remains spatially nearby;
- the user can switch focus cheaply;
- active processes stay reachable;
- the interface preserves the sense of one coherent world.

This carries directly into serious work. A project view, source file, run, ticket, conversation, or calendar can remain visible while a detail panel opens. Continuity itself can supply atmosphere because the product feels like one place instead of a pile of unrelated screens.

## 5. Dead Space: diegesis is strongest when state lives where the user expects it

Dead Space became the canonical diegetic-UI example because critical interface elements exist inside the fiction: health appears on Isaac's suit, holographic panels project in world space, and interaction prompts attach to objects. Dino Ignacio's GDC talk on the series describes the interface's evolution toward a diegetic and immersive result.

The useful principle goes deeper than “make the UI look like it belongs in the world.”

**Put state and action close to the object they concern.**

Health on the suit works because health belongs to the body. A door control on the door works because the action belongs to the door. A projected inventory works because the player reads it as equipment carried by the character.

Serious software has its own version of diegesis:

- a failed check shows its retry and logs beside the failed check;
- a comment lives beside the text it refers to;
- an invoice exposes payment state beside the invoice;
- a deployment shows rollback beside that deployment;
- a task exposes ownership, blockers, and completion beside the task;
- an agent run exposes evidence and intervention controls beside that run.

Call this **semantic diegesis**. The product feels “of the world” because controls attach to the domain objects that give them meaning.

This can create strong identity with zero fantasy skin.

## 6. Prey: immersive presentation and input consistency are independent

Prey offers a great pair of observations.

Its in-world computers and fabrication screens keep the player connected to Talos I. A Game Maker's Toolkit note calls out how these interactions frame the physical terminal instead of throwing the player into a detached menu. That makes the station feel like a workplace with actual equipment.

At the same time, PC reviews complained about inconsistent keyboard and mouse behavior: right click exiting some screens, Escape exiting others, keyboard-only actions where a click feels obvious, and menu controls tied awkwardly to gameplay bindings.

The lesson is clean: **fictional coherence and operational coherence are separate jobs**.

A menu can feel perfectly native to the fictional world while making the user's hands stumble. A serious product can have beautiful conceptual integrity and still lose people through inconsistent Escape behavior, mismatched shortcuts, moving targets, and modality surprises.

The hand learns conventions even when the eye enjoys novelty.

## 7. RPG inventory grids: tactile allocation versus analytical work

Grid inventories are memorable because they turn capacity into a spatial problem. Deus Ex, Prey, Resident Evil, and many survival games make items feel physical: a rifle occupies more room than a stim, stacks consume visible cells, and rearranging gear becomes a little packing ritual.

That can be excellent when allocation itself is part of the decision.

The same grid becomes weak when the user needs to answer analytical questions:

- which item has the best value-to-weight ratio?
- which five characters need upgrades?
- what can be sold in bulk?
- which items are duplicates?
- what changed since the previous trip?

Here a dense table, sortable list, filter, comparison view, or bulk action often beats the tactile metaphor.

This yields a useful rule:

> Keep the physical metaphor for decisions where physical arrangement carries meaning. Switch to an analytical surface when comparison, filtering, or bulk operation becomes the job.

A strong product can have both. Games sometimes cling to the backpack fantasy during spreadsheet tasks. Serious software can avoid that trap by giving users a one-gesture analytical escape hatch.

## 8. Hot flows deserve a different design standard

A hot flow is a sequence the user repeats enough that tiny costs compound.

Examples from games:

```text
select unit -> issue order -> inspect result
open inventory -> equip -> close
open shop -> compare -> buy / sell -> leave
select army -> move -> confirm
loot -> sort -> continue
```

Examples from work:

```text
open task -> change owner -> continue
review diff -> comment -> next file
inspect run -> retry -> continue
triage email -> archive -> next
open event -> edit time -> save
find document -> copy value -> return
```

Hot flows should receive:

- direct shortcuts;
- stable targets;
- minimal blocking animation;
- preserved selection and scroll state;
- cheap reversal;
- batch actions when repetition becomes mechanical;
- defaults that remember legitimate intent;
- local context with little navigation.

Cold depth can tolerate more hierarchy because the user visits it occasionally and benefits from labels, explanations, and browsing.

This is a better split than “simple versus advanced.” Frequency changes the ergonomics.

## 9. Muscle memory is a product asset

HCI research gives useful support for what games teach experientially.

A study comparing keyboard shortcuts with menu selection found a crossover after roughly 200 responses: practice made direct keyboard invocation quicker, and trained participants largely chose to keep using shortcuts. Research on spatially stable interfaces also shows why automatic reordering can be expensive: moving items removes predictability and can force visual search where learned location previously worked.

Recent work on adaptive menus likewise reports increased cognitive load and memorization demand when visual properties keep changing compared with a static baseline.

The product implication:

**Stable command geography compounds in value.**

For high-frequency controls, prefer:

- fixed location;
- fixed command name;
- fixed shortcut;
- consistent exit behavior;
- consistent modifier behavior;
- suggestions that highlight instead of relocate.

An adaptive system can still help. It can spotlight, prefill, suggest, rank in a separate region, or offer a command palette. Moving the user's learned target should carry a high bar.

## 10. What “jank” users forgive

The lovable cases share several properties.

### Forgivable jank

- unconventional visual style;
- high information density;
- a learning curve that unlocks real speed or power;
- old-fashioned controls with stable semantics;
- eccentric terminology that becomes memorable;
- rough edges outside the hottest loops;
- small visual quirks inside a coherent visual language;
- complexity that reflects genuine domain complexity.

### Expensive jank

- the same unnecessary click repeated hundreds of times;
- inconsistent input behavior across adjacent screens;
- hidden bulk actions;
- targets that move after learning;
- animation that blocks input;
- loading delays during tiny transitions;
- low-contrast styling on critical state;
- modal chains that erase context;
- decorative metaphors that conceal the underlying object;
- irreversible action with weak feedback.

A lovable product still benefits from fixing expensive jank. Affection gives the team permission to preserve character, not permission to preserve waste.

## 11. Thematic chrome should ride for free

The safest way to give serious software personality is to put character into pixels and timing the user already needed.

Good candidates:

- typography;
- spacing and density;
- icon silhouette and stroke language;
- panel edges and materials;
- selected-state treatment;
- microcopy and domain vocabulary;
- transitions that explain where an object went;
- sound for completion, arrival, or consequence;
- subtle animation during unavoidable waits;
- empty states that teach the domain;
- illustrations at genuinely idle moments;
- visible history and artifacts that make the work feel tangible.

Riskier candidates:

- animated doors before every panel;
- fake physical controls that reduce target size;
- ornamental fonts in data-heavy regions;
- simulated machinery for simple binary actions;
- camera travel as menu navigation;
- delayed reveals for ordinary state;
- forced “world” metaphors during bulk work.

A useful standard:

> Character should cost almost zero extra gestures in the hot path.

Save ceremony for boundaries that deserve emotional weight: completing a long project, shipping, deleting important work, handing off responsibility, entering a genuinely different mode, or reviewing a meaningful milestone.

## 12. Menus can feel like part of the world without cosplay

Serious software already has a world. It contains people, documents, runs, commits, incidents, invoices, appointments, contracts, assets, messages, decisions, and history.

A menu feels native to that world when it uses the same nouns and verbs the user uses in the domain.

Weak abstraction:

```text
Actions
  Process
  Manage
  Configure
  More
```

Domain-native language:

```text
Run again
View failed checks
Compare with previous run
Open artifact
Assign reviewer
Roll back
```

Visual identity can grow from the domain as well. A source-control tool can foreground diffs and lineage. A finance tool can make reconciliation and provenance visually distinctive. An agent workspace can make active work, evidence, uncertainty, and intervention feel like tangible objects.

The product gains atmosphere because its world has internal coherence.

## 13. When immersive presentation hurts operation

Immersive presentation becomes expensive when it interferes with one of five jobs.

### Scanning

The user needs to inspect many items quickly. Ornamental type, low contrast, irregular spacing, and oversized art reduce throughput.

### Comparison

The user needs aligned values, differences, or before/after state. A plain table often wins.

### Bulk action

The user wants to apply one decision across many objects. Physical metaphors can turn one operation into twenty drags.

### Recovery

The user made a mistake or followed the wrong branch. The product should preserve Back, Undo, Escape, history, and prior selection faithfully.

### Expert repetition

The user already knows what they want. Blocking transitions and forced reveals become friction with every pass.

A mature interface can move between an atmospheric object view and a brutally efficient analytical view. The switch should feel like changing lenses on the same domain.

## 14. A serious-software translation

The game lessons can become a compact product doctrine.

### Give hot verbs permanent homes

Identify the ten actions that dominate real use. Keep their names, positions, and shortcuts stable across releases whenever possible.

### Let visible controls teach shortcuts

Show the shortcut beside the command. Avoid making experts hunt through a preference page for the vocabulary the interface could teach in context.

### Keep theme outside the critical contrast channel

Texture, color, illustration, and animation can carry identity. Critical status should remain unmistakable under bad lighting, fatigue, color-vision differences, and peripheral attention.

### Use domain objects as the visual anchor

Put actions beside the thing they change. Keep evidence beside the claim it supports. Keep history beside the current state it explains.

### Add an analytical escape hatch

Every object-rich interface should answer: how does a user compare ten of these, sort them, filter them, or act in bulk?

### Spend ceremony on consequence

A satisfying completion sound after a meaningful delivery can become beloved. A 400 ms slide animation before every ordinary edit becomes syrup by lunchtime.

### Preserve a little eccentricity

Some beloved software has memorable oddities. Keep eccentricity when it improves recognition, communicates authorship, or creates affection at negligible operating cost.

### Measure affection separately from speed

A faster interface can feel sterile. A slower interface can feel delicious for the first five uses. Test both performance and desire to return after repeated sessions.

## 15. Experiments worth running

### A. Price thematic chrome at the hundredth repetition

Build one hot flow three ways:

1. neutral, immediate;
2. visually distinctive with identical interaction timing;
3. visually distinctive with added transition ceremony.

Run each for 10, 50, and 100 repetitions. Measure completion time, errors, perceived friction, recall, and preference. Repeat after a week.

The interesting result would be a version that increases affection while keeping performance flat.

### B. Stable commands versus adaptive reordering

Create a 20-command menu with a changing task distribution.

Compare:

1. fixed positions;
2. frequency-based reordering;
3. fixed positions plus adaptive highlighting / suggestions.

Run long enough for location learning to emerge. The key measure is performance after the task distribution changes.

### C. Semantic diegesis plus an analytical escape hatch

Pick a serious object such as an agent run, deployment, invoice, or task.

Build:

- an object-native view where status, history, evidence, and actions live around the object;
- a one-keystroke analytical view for comparison and bulk operations across many objects.

Test whether users retain orientation while moving between the two.

## Sources / references

- Existing Tact synthesis: [`notes/leo-interface-instincts.md`](leo-interface-instincts.md)
- Dwarf Fortress Wiki, controls and in-context command labels: https://dwarffortresswiki.org/Controls
- Dwarf Fortress Wiki, configurable key bindings and repeat styles: https://www.dwarffortresswiki.org/index.php/Interface.txt
- Battle Brothers developer UI beta announcement: https://battlebrothersgame.com/ui-released-beta-branch/
- Battle Brothers player feedback on readability, atmosphere, highlighting, and loading: https://battlebrothersgame.com/forums/topic/beta-ui-my-first-impressions/
- PC Gamer, Battle Brothers review: https://www.pcgamer.com/battle-brothers-review/
- Mount & Blade: Warband review with inventory / loot interaction examples: https://squackle.com/21322/supchron/games/mount-blade-war-band-pc-review/
- Paradox, Crusader Kings III console UI/UX dev diary: https://www.paradoxinteractive.com/games/crusader-kings-iii/news/console-dev-diary-3-uiux-and-controls
- GDC Vault, Dino Ignacio, *Crafting Destruction: The Evolution of the Dead Space User Interface*: https://www.gdcvault.com/play/1017723/Crafting-Destruction-The-Evolution-of
- Game Maker's Toolkit notes on Prey's in-world screens and weapon wheel: https://www.patreon.com/GameMakersToolkit/posts/thoughts-on-prey-11185984
- PC Gamer, Prey PC interface inconsistencies: https://www.pcgamer.com/prey-pc-performance-and-settings-analysis/
- Advait Sarkar, *Should Computers Be Easy To Use? Questioning the Doctrine of Simplicity in User Interface Design*: https://arxiv.org/abs/2306.01643
- Tak, Westendorp, and van Rooij, shortcut practice crossover study: https://pubmed.ncbi.nlm.nih.gov/26651347/
- Spatially stable interfaces and revisitation: https://openreview.net/pdf?id=fCBIfLCpD1
- Adaptive menu performance / cognitive-load study: https://doi.org/10.1016/j.jss.2025.112598

— Mallow 🐝
