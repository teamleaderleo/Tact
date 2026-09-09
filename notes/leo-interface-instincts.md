# Leo's interface instincts

A working map of what Leo seems to like, hate, and repeatedly optimize for in software. These are observations and hypotheses to test, not a finished design doctrine.

The interesting part is the recurrence. The same preferences show up in chat apps, browsers, terminals, games, email, note-taking, calendars, operating-system settings, car websites, and agent workflows.

## Raw observations

### ChatGPT: focus, swipe, voice, disappearance

The ChatGPT app works well enough because the basic navigation stays direct: a sidebar can hold many conversations, a conversation can take full focus, and moving between the two feels lightweight.

Voice is more important than almost any visible part of the app. Press the microphone, talk, continue. At that point the phone stops feeling like a screen full of controls and becomes a device you speak through.

That suggests a strong preference:

> The best interface may be the one that successfully removes itself from the user's attention.

A visual UI is one possible control surface. Voice, direct manipulation, keyboard commands, search, automation, and persistent spatial arrangement can each make parts of the visible UI unnecessary.

### YouTube and YouTube Music: familiar consumption loops

YouTube and YouTube Music work because the hot path is obvious and habitual: find something, play it, move around, continue. The surrounding product has plenty of questionable choices, but the core interaction remains understandable enough that it rarely blocks the thing being consumed.

The lesson to investigate is the distinction between a product having cruft and its repeated-use loop remaining excellent enough to survive that cruft.

### Old Reddit: information first

Old Reddit exposes a lot at once. It is visually rough by contemporary standards, but links, titles, metadata, comments, nesting, and navigation are immediately present.

The density is useful because the information itself is the product.

A recurring Leo preference:

> Density can be calming when it reduces navigation and increases situational awareness.

The enemy is not density. The enemy is density without hierarchy.

### Safari on iPhone: default when the basics stay out of the way

Safari tends to win by being available, integrated, familiar, and sufficiently unobtrusive. This is a reminder that a product can earn loyalty by making ordinary use boringly dependable.

Novelty has to beat familiarity by enough to justify relearning.

### Edge: stable anchors and vertical tabs

Edge is acceptable because the layout establishes stable landmarks: extensions live above, vertical tabs live on the left, content lives in the center.

Tab groups are less appealing because they introduce another organizational concept into a place where simple spatial persistence often feels sufficient.

Potential principle:

> Stable location can beat another layer of organization.

### A 27-inch monitor as a spatial field

Full-screening everything wastes useful spatial memory. On a large monitor, partially exposed windows can act like physical bookmarks: an edge, title bar, or visible strip reminds you where an activity lives.

This is closer to a desk covered in papers than a stack of modal screens.

Interesting question:

> Can window position itself be a lightweight form of memory and navigation?

This preference should be studied beside dynamic ranking systems that constantly reorder information. Spatial memory and algorithmic importance can conflict.

### Dwarf Fortress: expert density, explicit instructions, muscle memory

Old ASCII-era Dwarf Fortress demanded odd key combinations and a large learned vocabulary. That could still be satisfying because the interface exposed enormous state, supported expert operation, and often showed relevant instructions alongside the current view.

Even after hundreds of hours, some commands were still forgotten. That is useful evidence against romanticizing keyboard fluency: expert systems can become inhabitable while still carrying needless memory tax.

Questions:

- Which commands genuinely become muscle memory?
- Which remain lookup-heavy forever?
- When is a visible hint worth permanent screen space?
- Can a system preserve expert speed while making forgotten actions locally discoverable?

### Battle Brothers and Mount & Blade: hot flows can rescue ugly UI

Some game interfaces are aesthetically or mechanically awkward yet remain lovable because the repeated flows work:

```text
open shop -> buy / sell -> leave
open inventory -> equip -> leave
open roster -> organize troops -> leave
```

The product's atmosphere also helps. Typography, framing, iconography, sound, texture, and pacing can make an interface feel part of the world.

Two useful lessons:

1. A rough interface can succeed when its hot flows are good.
2. Personality can make repeated interaction emotionally richer without improving raw task efficiency.

This is a strong counterexample to sterile minimalism as a universal goal.

### VS Code: power without opening every panel

VS Code is broadly fine, but too much simultaneous panel expansion becomes visual bookkeeping. There is a tension between being a power user in spirit and preferring the whole working field to remain comprehensible at a glance.

Power should not automatically mean accumulating more drawers, panes, inspectors, trees, and nested controls.

Potential principle:

> Power-user software does not have to mean memorizing more commands or opening more panels. Power can come from seeing more of the system at once.

### Discord as a personal notebook

Private Discord servers work surprisingly well as notes because capture is immediate, chronology is natural, channels provide only as much separation as needed, and search can recover old material later.

The organization can be mediocre because retrieval and context are good enough.

This maps closely onto ChatGPT conversations and append-only LLM workflows.

Strong preference:

> Capture first. Preserve chronology. Retrieve later. Spend little attention on filing unless filing earns its cost.

This deserves serious study. Many note products assume users want to maintain a beautiful knowledge taxonomy. Leo often wants the opposite: append, search, continue.

### Outlook: a simple split plus semantic cleanup

Focused / Other is useful because it provides one coarse attention split. The product accumulates plenty of Microsoft cruft, but the high-level triage remains understandable.

The junk-mail situation became bad enough that Leo built an LLM-backed process to semantically delete recurring low-value newsletters while preserving a junk folder worth occasionally inspecting.

That suggests a more general interaction pattern:

```text
large noisy stream
-> coarse machine triage
-> preserve uncertain / potentially useful material
-> human inspects a much smaller residue
```

This is the same funnel appearing in agent supervision, command output, notifications, and evidence selection.

### macOS Settings: continuity failures hurt

Apple software often looks composed while still containing frustrating interaction logic. Settings is a good source of examples: navigation paths can feel arbitrary, going back and forth can lose continuity, and transitions sometimes impose another wait or reload without giving the user anything semantically new.

Leo is unusually sensitive to latency that exposes an internal implementation boundary.

Potential principle:

> A backend boundary is not automatically a user-visible boundary.

If the user is continuing one thought, the product should try to preserve that continuity.

### Spreadsheets: useful and strangely joyless

Spreadsheet software is incredibly capable and often visually impersonal. That may be partly inherited from decades of convention, but it raises a useful question:

> Which serious tools could gain warmth, character, or pleasure without compromising density and precision?

A spreadsheet does not need to become whimsical. It also does not have to feel emotionally vacant by default.

### Google Calendar: accepted because calendars have to exist

Google Calendar is usable enough while still leaving substantial room for improvement. It is a useful candidate for redesign because the problem is familiar, spatial, recurring, multi-scale, and full of awkward state transitions.

Questions worth chasing:

- What is the calendar's true primary object: event, day, week, person, or commitment?
- How should quick capture differ from detailed planning?
- How much context should remain visible while editing one event?
- Which navigation steps exist because of implementation convenience instead of user intent?

### Car websites: stop performing the existence of the car

A recurring anti-pattern: enormous cinematic pages showing a car driving, rotating, glowing, or existing in scenic locations while basic specifications are buried.

A better page for Leo would surface:

- specifications;
- meaningful photography;
- dimensions and technical drawings;
- engineering decisions;
- designer commentary when it reveals intent;
- variants and tradeoffs;
- practical ownership facts.

Then stop.

> The user already knows the wheels spin.

This is a useful example of performative presentation consuming attention after its persuasive value is exhausted.

## Recurring principles hiding underneath

### 1. Expose useful state

Leo repeatedly prefers seeing enough of the world to remain oriented: vertical tabs, dense Reddit pages, multiple visible windows, Dwarf Fortress state, agent status, terminal output when it carries actual evidence.

The design question is not "how little can we show?"

It is:

> What state changes the user's understanding or next action, and how cheaply can we keep it available?

### 2. Delete ceremonial interaction

Extra confirmation screens, page transitions, nested organization, decorative product storytelling, and repetitive agent/tool calls all trigger the same reaction when they fail to protect a real boundary.

Before adding a step, ask:

- What consequence does this step protect?
- What uncertainty does it resolve?
- What useful choice does it expose?
- Can the system safely infer the answer?

### 3. Preserve continuity

A user may be following one thought across windows, tools, browser state, code, terminal output, voice, and agent work.

Reloads, modal detours, displaced targets, lost scroll position, forgotten context, and arbitrary navigation boundaries break the thought.

Continuity is an interaction property worth designing directly.

### 4. Hot flows outrank brochure cleanliness

A product can survive visual roughness when its repeated actions become quick, predictable, and legible.

Conversely, a gorgeous surface with annoying hot paths becomes unbearable.

Test the hundredth repetition.

### 5. Retrieval can beat filing

For many knowledge and communication tasks, the valuable sequence is:

```text
capture -> preserve -> search -> recover context
```

Perfect organization can become unpaid clerical work.

This becomes increasingly important when AI can retrieve semantically and synthesize current state from append-only history.

### 6. Spatial persistence is a feature

Where something lives can itself encode meaning. Constantly resorting, regrouping, or collapsing the world can destroy learned spatial memory.

Study when location should remain stable and when importance should override stability.

### 7. Density and calm are independent axes

A sparse interface can feel chaotic. A dense interface can feel calm.

Calm comes from hierarchy, predictability, stable anchors, proportion, and knowing where to look.

### 8. The best interface can disappear

Voice is the strongest current example. When the user can simply speak, much of the screen becomes irrelevant.

Other disappearing interfaces include:

- keyboard muscle memory;
- direct manipulation;
- automation;
- remembered spatial arrangement;
- search that removes navigation;
- defaults that eliminate configuration.

"No visible UI" can be the result of excellent interface design rather than absence of design.

### 9. Personality can earn loyalty

Games demonstrate this clearly. A tool can be efficient and still possess atmosphere, humor, texture, visual character, sound, and delight.

The question is whether personality cooperates with use.

### 10. Machine triage should make healthy things cheap to ignore

Outlook cleanup, command-output reduction, Cultist evidence selection, Stensibly state, and high-concurrency agents all point toward the same funnel:

```text
large noisy world
-> deterministic / semantic reduction
-> preserve evidence and uncertainty
-> surface meaningful exceptions
-> spend human attention deliberately
```

## Thunderdome: values that should fight

Tact should avoid turning these instincts into commandments. Put them against competing values and see where each wins.

### Density vs calm

How much useful state can remain visible before comprehension collapses?

Test dense interfaces with strong hierarchy against sparse interfaces requiring more navigation.

### Search vs organization

How far can append-and-retrieve scale before explicit organization starts paying for itself?

Compare Discord/chat-style chronology, folders, tags, graph systems, and machine-generated synthesis.

### Spatial memory vs dynamic ranking

Should a thing remain where the user left it, or move when its importance changes?

This is directly relevant to windows, tabs, notifications, feeds, and agent supervision.

### Personality vs invisibility

When should the product have an unmistakable voice? When should it disappear completely?

Compare games, professional tools, native OS surfaces, and deliberately expressive products.

### Keyboard fluency vs discoverability

How much remembered vocabulary can expert software reasonably demand?

Can local hints preserve discoverability without slowing experts?

### Voice vs direct manipulation

Voice can annihilate interface overhead for some tasks. For spatial editing, comparison, precision, or rapid repeated actions, direct manipulation may remain dramatically better.

Map which tasks belong to each medium.

### Automation vs inspectability

Semantic junk deletion is useful until the classifier makes an expensive mistake.

Ask:

- What evidence should remain inspectable?
- Which actions can be reversed?
- When does uncertainty deserve escalation?
- How should the automation explain itself without flooding the user?

### Customization vs coherent defaults

Terminal Kit exists because default interfaces cannot satisfy every serious user.

How much variation can a product support before it loses a coherent interaction language?

### Chronology vs synthesis

Append-only history preserves reality. Eventually somebody needs a current answer.

How should products compile "what is true now" without erasing the lineage that produced it?

### Persistence vs ephemerality

Which windows, tabs, chats, agents, receipts, searches, and intermediate states deserve to survive?

Persistent state is useful until it becomes debris.

### Animation vs immediate state change

Motion can explain causality and preserve spatial continuity. Repeated motion can make hot paths feel syrupy.

Test it at the hundredth repetition.

### Overview vs focus

Leo likes seeing the field. Deep work can benefit from one object occupying the entire field.

A great environment should make the transition between overview and focus cheap in both directions.

## What Leo should learn

The goal is not to cosplay a conventional product designer. Build enough formal craft that visceral judgment becomes precise diagnosis and reliable alternatives.

Areas worth deliberately acquiring:

- interaction design;
- information hierarchy;
- typography;
- spatial interfaces and window management;
- state and transition design;
- native desktop conventions;
- motion as explanation;
- accessibility;
- keyboard and pointer interaction;
- voice and multimodal interfaces;
- information visualization;
- design systems and when to violate them;
- prototyping in code;
- user observation and repeated-use testing.

Desired transition:

```text
"this feels like bullshit"
-> "the hierarchy has three competing primaries"
-> "the target moved after the user's action"
-> "this modal exposes a backend boundary with no user decision"
-> "this information is globally visible despite being locally relevant"
-> concrete alternatives
-> use them
-> revise judgment
```

The bullshit detector is the sensor. Craft makes it actionable.

## Products as curriculum

Use existing preferences as the training set instead of learning design only through canned exercises.

### ChatGPT

- Why does sidebar <-> focused conversation work?
- What does voice eliminate?
- Which transitions still feel heavier than the thought they represent?
- What should remain visually persistent when voice becomes primary?

### Edge

- Why do vertical tabs work for Leo?
- What does grouping add or subtract?
- Could persistent tab geography beat nested organization?

### macOS Settings

Map several frustrating journeys. Identify where continuity breaks, where navigation becomes illogical, and where waits expose implementation details.

Redesign one journey end to end.

### Outlook + semantic junk cleanup

Imagine semantic triage as a native interaction rather than an external cleanup bot.

What does the human see? What remains recoverable? What does uncertainty look like?

### Discord as notes

Treat the weird success seriously.

Study:

- zero-friction capture;
- chronology;
- search;
- conversational granularity;
- channels as lightweight partitioning;
- why strict taxonomy feels unnecessary;
- where the model breaks at larger scale.

### Dwarf Fortress

Study an expert interface that requires learning. Separate useful density from memory tax.

### Battle Brothers / Mount & Blade

Separate visually rough from interactionally bad. Identify the flows that remain satisfying and the atmosphere that makes the interface lovable.

### Google Calendar

Design a calendar around Leo's actual mental model rather than around inherited calendar conventions.

### Car product pages

Build the anti-bullshit car page: engineering, dimensions, specs, meaningful design story, useful photography, variants, done.

## The larger project: Leo's ideal computing environment

Eventually, design the environment Leo actually appears to want.

Ingredients:

```text
conversation
+ voice
+ browser
+ terminal
+ files
+ agents
+ persistent windows
+ spatial memory
+ semantic retrieval
+ append-only history
+ synthesized current state
+ explicit uncertainty
+ human attention routing
```

Questions:

- How does overview become focus and focus become overview?
- What stays visible at the edge of the screen?
- Which objects keep stable positions?
- Which things are searched instead of navigated to?
- What does voice own?
- What should agents do silently?
- What event deserves interruption?
- How does a task announce that human judgment is required?
- How much raw evidence remains one gesture away?
- How can personality exist without degrading heavy use?
- What should survive a restart, machine loss, or worker disappearance?

This may be the convergence point for Tact, Terminal Kit, Lazy Commander, Cultist, Stensibly, Glaeda, and the broader interest in terminal/browser/agent computing.

## One provisional thesis

> Expose useful state. Delete ceremonial interaction. Preserve continuity.

And another:

> Power-user software does not have to mean memorizing more commands. Power can come from seeing more of the system at once.

Both should remain vulnerable to counterexamples.
