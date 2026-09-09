# Contrarian review: where Leo's design instincts break

The notes have a coherent taste. That is exactly why they are dangerous.

A personal preference repeated across ten examples can start to feel like a law of interface design. Most of the current Tact claims are strongest for one unusually specific user: a sighted, expert, keyboard-and-pointer-heavy, large-screen, single-user operator with high domain familiarity, strong search habits, a long-lived working set, tolerance for dense state, and enough repetition for spatial and command memory to compound.

That user is Leo.

Designing a great personal computing environment around that user is a worthy project. Generalizing those preferences into products for other people requires much harsher tests.

The recurring failure mode across the repository is **converting a successful expert adaptation into a universal principle**. Leo has learned to make Discord act like a notebook, window slivers act like bookmarks, terminals act like compositional interfaces, dense screens act like calm fields, and voice act like a clutch. Those are real techniques. They also depend on learned habits, hardware, context, ability, and temperament.

The review below attacks the doctrine and keeps the parts that survive.

## 1. “Show more state” can turn the product into somebody else's memory test

[`leo-interface-instincts.md`](leo-interface-instincts.md) and [`power-from-seeing-the-field.md`](power-from-seeing-the-field.md) are right that hidden state creates navigation and reconstruction cost. They understate the opposite cost: **visible state has to be parsed, classified, and ignored correctly**.

A dense field works for an expert because the expert already knows:

- which regions matter;
- which values are normal;
- which labels can be skipped;
- which state changes deserve action;
- where to look first;
- what can safely remain peripheral.

A novice sees the same field and gets twenty equally plausible starting points.

Counterexamples:

- A tax form that exposes every conditional field at once creates work before the user knows which fields apply.
- A permissions editor that shows every capability simultaneously can make scope harder to understand than a guided role-first flow.
- A mobile interface cannot preserve a desktop-sized field without turning state into tiny targets or scrolling debt.
- A screen reader serializes a visual field. “Seeing everything at once” becomes listening through everything in sequence unless the semantics support efficient navigation.
- A monitoring console with every healthy metric visible makes anomaly detection worse when normal state occupies most of the attention budget.
- A rare high-stakes workflow can benefit from staged disclosure because the user has little or no accumulated fluency to exploit.

The dangerous phrase is “decision-relevant state.” Relevance changes by skill level and by stage of the task. A field can contain information that will become relevant three decisions later and still tax the present decision.

### What survives

Expose state that explains the current choice, consequence, anomaly, or object relationship. Keep adjacent evidence cheap to summon. Dense comparison views can be excellent when comparison is the job.

Treat density as a mode with a constituency, not a moral virtue. Test novice, expert, small-screen, low-vision, keyboard-only, and screen-reader use separately.

## 2. “Organization barely matters if search works” collapses the difference between private recall and shared meaning

[`append-only-memory-and-computed-present.md`](append-only-memory-and-computed-present.md) already walks this claim back toward shallow stable anchors. It should go further.

Search is excellent for retrieval when the user can formulate the query and accepts probabilistic ranking. Organization does several jobs search cannot quietly replace:

- tells another person what belongs together;
- creates a browsable map before anybody knows what query to type;
- supports complete-set inspection;
- gives access-control and ownership boundaries a home;
- establishes canonical names;
- communicates lifecycle: draft, active, archived, shipped;
- lets a newcomer learn the domain vocabulary;
- supports coordination when several people need the same conceptual partitions;
- makes absence legible: “this release has no migration plan” is easier to see when a migration-plan slot exists.

A personal Discord server can survive mediocre filing because the author remembers why `random` contains the important thing. A team of forty people inherits none of that private context.

Semantic search adds another failure: plausible omission. “Show me all release decisions” sounds complete while a ranker can silently miss one. A folder, table, checklist, or typed collection can make completeness inspectable.

The repository also treats organization as clerical overhead while simultaneously inventing **tasks, commitments, project regions, stable anchors, decision packets, attention queues, and current-state projections**. Those are organization. They are simply organization the system performs or organization Leo likes.

### What survives

Make capture cheap. Delay fine-grained filing. Let repeated use reveal which categories deserve durable names. Use machine assistance to propose organization.

For shared work, complete sets, governance, onboarding, permissions, or long-lived coordination, explicit organization earns its keep early.

A stronger claim is:

> Charge organization cost where shared meaning, completeness, or future action repays it. Avoid charging it reflexively at capture time.

## 3. “Delete ceremonial interaction” can delete consent, scope, and deliberation

The current notes use “ceremony” as a bucket for confirmations, transitions, organizational steps, and repeated tool calls. Some of those steps are waste. Some are the product's only moment of deliberate human control.

Counterexamples:

- sending an email to 20,000 customers;
- publishing a package;
- granting an agent production credentials;
- moving money;
- rotating a key;
- deleting a shared dataset;
- force-pushing a protected branch;
- merging a legal or policy change;
- approving medication or an irreversible clinical action;
- dispatching an external operation whose response may be lost.

Undo cannot recover every external effect. Reversibility also has gradients: deleting a local note and recalling a public message carry wildly different recovery costs.

The valuable step is often a **staging surface** that shows exact target, scope, consequence, and authority. A generic “Are you sure?” dialog is weak. A deploy review that says “production, 43 services, irreversible database migration, rollback unavailable after step 2” is doing real work.

Ceremony can also serve collaboration. An approval step can create a durable handoff boundary and make responsibility explicit. Removing it can turn “fluid” interaction into ambiguous authority.

### What survives

Delete duplicate acknowledgement and backend-driven page hopping on reversible, low-consequence repeated paths.

Keep explicit staging where consequence, external side effects, security, privacy, cost, irreversible transitions, or responsibility changes deserve deliberate review.

The better question is:

> What human commitment becomes true after this step?

If the answer is meaningful, the step may be doing more than slowing the user down.

## 4. “The best interface disappears” becomes hostile when the user needs to learn, recover, or explain

An interface that recedes after expertise can feel wonderful. An interface that starts invisible can feel like a room with unlabeled doors.

Visible interfaces do more than accept input. They advertise capability, teach vocabulary, expose current state, provide recovery paths, and create shared reference points.

Counterexamples:

- gesture-only mobile features that users never discover;
- hidden keyboard commands that disappear from memory after a month;
- voice systems where the user has no idea which phrasings work;
- automation that succeeds silently until the first failure, at which point nobody knows where to inspect it;
- adaptive systems whose inferred behavior has no visible representation to correct;
- support and collaboration, where “click the third control in this panel” depends on a stable visible contract.

Invisible interaction also shifts burden from recognition to recall. That is a bad trade for infrequent users and anyone returning after a gap.

### What survives

Let learned hot paths recede from attention. Keep the underlying command, state, target, and recovery path visible or summonable.

The strongest disappearing interface is one that **can reappear exactly when doubt begins**.

## 5. Stable spatial position is a private memory technique, not a universal identity system

[`spatial-memory-overview-and-edge-bookmarks.md`](spatial-memory-overview-and-edge-bookmarks.md) makes the best case in the repository for spatial persistence. The bounded warm-working-set argument survives. The generalization needs tighter limits.

Coordinates are fragile across:

- laptop versus external monitor;
- different screen sizes and aspect ratios;
- localization and text expansion;
- browser zoom and Dynamic Type equivalents;
- accessibility magnification;
- responsive layouts;
- remote desktop sessions;
- window restoration onto a missing display;
- shared work where two users have different arrangements;
- data sets large enough that a stable field becomes archaeology.

Stable location can also preserve a bad arrangement forever. A user who drags six forgotten tasks to the edge has created six durable pieces of debris. Spatial memory compounds value and clutter with equal enthusiasm.

There is a deeper product problem: location is weak semantic identity. “The thing at upper left” works for one person's current desk. “Payments migration” survives relocation, another device, and another collaborator.

### What survives

Stable user-owned geography is excellent for a bounded warm set revisited frequently. Preserve topology where the user has invested memory. Let salience change before location.

Every spatial object still needs a semantic identity that survives movement, device changes, accessibility changes, and sharing.

Space should accelerate retrieval. It should never become the only address.

## 6. Dense interfaces can be better — for the people who already know how to read them

Old Reddit, Dwarf Fortress, Bloomberg-style terminals, DAWs, spreadsheets, and IDEs are useful examples. They are also a spectacularly self-selecting sample.

People who remain in Dwarf Fortress long enough to praise its information density have already survived its learning curve. A Bloomberg terminal is embedded in training, professional vocabulary, specialized hardware, and repeated daily use. Old Reddit users who love old Reddit are a constituency, not a random cross-section of users.

Density has real costs:

- novice scanning;
- touch targeting;
- low vision;
- visual fatigue;
- competing selection scopes;
- translation expansion;
- peripheral distraction;
- mode confusion;
- accidental action when multiple nearby controls look equally active.

A dense interface can also conceal bad prioritization behind expert pride. “I can handle it” is weaker evidence than “the interface helps the intended population perform the task with fewer errors.”

### What survives

Dense, grouped fields can dominate for comparison, monitoring, editing across many related objects, and expert repeated work.

Offer density deliberately. Let users compact after meaning is learned. Preserve labels for rare or dangerous actions. Measure error rate and reacquisition after a gap, not only speed after training.

## 7. Voice can replace pieces of UI. Voice cannot carry the whole job.

[`voice-multimodal-and-disappearing-interfaces.md`](voice-multimodal-and-disappearing-interfaces.md) already contains the right correction: speech carries intent well while another medium carries reference, precision, memory, and evidence.

Push harder on the boundary.

Voice is serial. Visual interfaces can support parallel scanning and comparison. Voice also exists in a social environment and inherits every problem of that channel:

- shared offices;
- public transit;
- confidential work;
- background conversation;
- accents and code-switching;
- speech disabilities;
- speech fatigue;
- hearing disabilities;
- exact identifiers and symbols;
- interruptions from other people;
- poor discoverability of command vocabulary;
- ambiguous deictic references;
- inability to skim a long spoken answer.

Voice can feel magical for composition because natural language already lives there. It becomes absurd when the user has to serialize coordinates, code, filenames, or a comparison table into speech.

### What survives

The “microphone as clutch” idea is strong:

```text
select / look at the referent
-> speak intent
-> show exact interpretation or receipt
-> act
-> repair locally with pointer, keyboard, or speech
```

Voice should compete with typing for intent capture and steering. It should cooperate with visible UI for state, exactness, comparison, history, and recovery.

## 8. “Personality should survive” needs a category test

The game examples are emotionally persuasive and weakly generalized.

Atmosphere is part of the utility of Battle Brothers, Mount & Blade, and Dwarf Fortress. A game succeeds partly by making the player inhabit a world. A database console, tax portal, security incident tool, hospital workstation, or production deployment surface has a different emotional contract.

Personality can create costs:

- humor lands badly during failure;
- anthropomorphic agents can inflate trust beyond competence;
- decorative motion becomes visual noise during incident response;
- a strong brand voice can make serious users feel trapped inside somebody else's persona;
- cultural references age or travel poorly;
- playful error messages can hide exact corrective action;
- mandatory whimsy becomes exhausting faster than its designer expects.

The “Window Familiar Spirits” cats are an excellent personal experiment because the user explicitly opted into the joke. They would be a terrible default for a general-purpose professional tool.

### What survives

Personality works best when it contributes recognition, identity, pleasure, or atmosphere without requiring the user to emotionally engage with it.

Good territory:

- opt-in themes;
- workspace identity;
- low-frequency empty states;
- restrained sound;
- visual landmarks;
- texture around the work.

Use precise, emotionally neutral language for consequential errors, permissions, money, security, medical states, and irreversible actions.

The strongest test is simple:

> Can the user keep the product's competence while turning the personality down to zero?

If yes, the personality probably survived honestly.

## 9. “100 agents should feel like three decisions” can create a beautifully calm lie

[`when-100-agents-feel-like-three-decisions.md`](when-100-agents-feel-like-three-decisions.md) has a strong primary view: commitments, exception fan-in, decision packets, exact receipts. The dangerous leap is assuming that human relevance always compresses to explicit decisions.

Sometimes the population is the signal.

Examples:

- 80 agents independently converged on the same wrong premise;
- 60 “healthy” workers are burning money because a planner fragmented work badly;
- many small retries reveal a systemic provider problem before any one task crosses an escalation threshold;
- all agents used the same stale source and therefore agree confidently;
- a green parent summary hides correlated coverage gaps;
- one agent family is consistently slower or riskier, indicating a capability problem;
- the system quietly narrows solution diversity until every result looks consistent for the wrong reason.

A calm reducer can produce **automation complacency**. Humans lose the ability to notice weak signals because the product only shows exceptions after its own classifier decides they are exceptional.

Watching every worker is awful. Hiding the population entirely is also awful.

### What survives

Commitments and human obligations should own the primary surface. Add an independent audit lens that can reveal:

- assumption clusters;
- correlated failures;
- disagreement/diversity;
- retry rate;
- cost burn;
- stale-source concentration;
- verification coverage;
- hidden UNKNOWN count;
- fan-in lossiness;
- sample receipts from “healthy” work.

The reducer itself needs supervision.

A 100-agent system with zero explicit decisions can look nearly empty while still carrying a compact “system health / audit confidence” signal that comes from a path independent of the attention compiler.

## 10. “The persistent object is the task” overstates how cleanly real work decomposes

[`browser-terminal-agent.md`](browser-terminal-agent.md) proposes task identity as the join key across browser, source, runtime, terminal, agent, history, and verification. That creates lovely continuity when the task boundary is clean.

Real work braids.

- One source edit fixes three bugs.
- One dev server supports several investigations.
- A customer incident becomes a product bug, a documentation task, and an operational follow-up.
- A test failure reveals a different problem halfway through the original task.
- Two tasks merge after they are discovered to share a cause.
- One task splits into independent workstreams.
- A browser session contains state relevant to several goals.
- A human changes intent before the original task ends.

If every artifact must belong to one task, the system recreates filing bureaucracy under a new name. If the task silently absorbs everything, provenance becomes vague.

### What survives

Task is a strong human-facing grouping lens, especially for resumption and verification. Keep lower-level identities independent:

```text
artifact <-> event <-> runtime <-> decision <-> task
```

Allow many-to-many relationships. Let tasks split, merge, link, and retire without rewriting the evidence underneath them.

The durable primitive may be exact identity plus relationships. “Task” can remain the view that makes those relationships legible to a person.

## 11. Append-only memory can preserve mistakes, secrets, and garbage with religious devotion

The append-only journal plus computed present is elegant because it protects provenance. It also imports an event-sourcing instinct into personal information where deletion and correction can be first-class human needs.

Counterexamples:

- a pasted credential that should disappear everywhere;
- a medical or personal note the user wants erased;
- a mistaken accusation or private remark whose continued resurfacing causes harm;
- imported duplicate histories;
- low-quality captures that poison retrieval;
- external facts that changed without producing an event in the local journal;
- a model-generated “current truth” that incorrectly infers supersession;
- an old preference that the user simply wants replaced rather than litigated forever.

“History is evidence” can become an excuse to make cleanup emotionally or technically expensive. Users may want provenance and still deserve delete, redact, correct, merge, forget, and set-canonical operations.

The computed present has its own epistemic risk: current truth is sometimes external to the journal. A local event log can prove what somebody believed or decided. It cannot guarantee that the world still agrees.

### What survives

Low-friction capture, source lineage, contextual retrieval, and regenerable summaries are excellent.

Treat append-only as an internal default for provenance, with explicit user authority to delete/redact/correct and with canonical states that can be directly edited when appropriate.

Do not make users worship the log.

## 12. The hundredth-use test can optimize away the first use, the rare use, and the return after six months

The repository repeatedly asks what survives the hundredth repetition. Keep that test. Add more clocks.

A product has several populations hiding inside one person:

- first use;
- tenth use;
- hundredth use;
- rare consequential use;
- return after a long gap;
- use under stress;
- use on a different device;
- use after the UI changed;
- use while helping another person.

Rare destructive actions may never reach the hundredth repetition. Optimizing them like tab switching is a category error.

An expert can also return after six months and become a novice again for a low-frequency command.

### What survives

Test repeated paths at high repetition. Also test first success, delayed recall, rare high-consequence actions, and recovery after interruption.

A better progression is:

```text
first use
-> learned use
-> fluent use
-> forgotten use
-> stressed use
```

An interface that performs across that cycle deserves stronger confidence than one that merely becomes satisfying after immersion.

## 13. Native macOS instincts are excellent for a Mac product and dangerous as universal design doctrine

[`native-macos-daily-use.md`](native-macos-daily-use.md) is strongest when it treats macOS as a real environment with accumulated interaction value. Finder drag behavior, menu completeness, native window semantics, focus, accessibility, state restoration, and ordinary shortcuts deserve respect in a Mac app.

The trap comes later: treating those conventions as evidence about computing in general.

A Windows user, Linux tiling-window user, touch-first user, browser-only user, or screen-reader user has different accumulated expectations. Even within macOS, laptop users and 27-inch-monitor users inhabit different spatial realities.

### What survives

For terminal-kit as a Mac-native tool: lean into the platform.

For Tact as a broader design project: label platform-specific conclusions honestly and re-test them elsewhere before promoting them.

## The contradictions are more valuable than the principles

The repo already contains several collisions that should stay unresolved until experiments settle them:

### Show more state vs make healthy work disappear

Both can be right. They serve different questions. The useful design problem is deciding which state deserves persistent visibility for which user at which task phase.

### Search beats filing vs stable anchors are valuable

Stable anchors are filing with lower ambition. The dispute is about when classification pays, not whether classification exists.

### Interfaces should disappear vs spatial position is valuable

A spatial landmark is interface made deliberately persistent. Disappearance should mean low attentional demand, not literal absence.

### Delete ceremony vs make actions inspectable

Inspectability takes interface and sometimes takes a pause. The useful target is consequence-aware staging, not step count minimization.

### Personality should survive vs interfaces should disappear

Personality can live in identity and atmosphere while the hot path recedes. A product that performs personality during every action defeats its own invisibility goal.

### Stable geography vs dynamic importance

The current “preserve geography; adapt salience” rule is a good default for warm work. Attention queues, feeds, search results, and emergency escalation legitimately reorder.

These contradictions suggest Tact should stop searching for universal slogans and start building **conditional rules**.

Example:

```text
IF repeated expert task
AND bounded working set
AND large visual field
THEN stable dense geography may dominate

IF novice or rare task
OR high consequence
OR small screen
THEN stronger staging and progressive disclosure may dominate
```

That is less romantic and much harder to misuse.

## Falsification tests Tact should run before promoting more doctrine

1. **Leo versus stranger:** Give the same prototype to Leo and five competent people who did not help invent its mental model. Count where Leo's “obvious” paths vanish for everyone else.
2. **First / hundredth / six-month-gap:** Test the same command at first use, after fluency, and after a long simulated or real gap.
3. **Small-screen collapse:** Force the dense spatial prototypes onto a laptop-sized viewport without a second monitor. Record which principles survive.
4. **Screen-reader pass:** Use the “see the field” interface through a serial accessibility channel. Find which information relationships remain understandable.
5. **Shared-work handoff:** Have person A build a search-first personal archive, then ask person B to take over without coaching. Compare against a shallow organized alternative.
6. **Vocabulary mismatch:** Ask users to retrieve items whose original terminology they do not remember. Compare search, browse, stable anchors, and explicit collections.
7. **Completeness task:** Ask for every active commitment or every release decision. Measure silent omissions from semantic retrieval.
8. **Irreversible-action test:** Put “delete ceremony” against a real external side effect where undo is unavailable. Evaluate speed and error cost together.
9. **Correlated hidden failure:** Feed the 100-agent reducer ninety healthy-looking workers sharing one wrong premise. See whether the top-level interface reveals the systemic risk before a human decision object appears.
10. **Public voice test:** Run the mixed voice workflow in a shared room with sensitive identifiers and another conversation nearby.
11. **Cross-device spatial test:** Build a learned desktop arrangement, then resume the same work on a laptop or changed display topology.
12. **Personality during failure:** Take the most expressive version of the interface and use it during a serious incident. Record which personality elements become irritating, confusing, or confidence-damaging.
13. **Delete from memory:** Put a credential, embarrassing draft, or incorrect fact into the append-only system and require complete removal or correction. Measure how much the provenance model fights the user's intent.
14. **Task-boundary break:** Start one debugging task, discover a second cause halfway through, then merge it with another existing investigation. See whether task identity helps or becomes clerical work.
15. **Healthy-work audit:** Hide all nominally healthy agent work, then ask the user to assess cost, diversity, retry patterns, and verification coverage without opening fifty receipts.

## What survives the attack

There is a strong design program inside Tact once the personal preferences are demoted from laws to hypotheses.

These ideas survive well:

- **Cheap capture is valuable.** Ask for metadata only when it repays its cost.
- **Exact receipts and provenance are valuable.** Summaries deserve paths back to evidence.
- **Stable user-controlled anchors are valuable for a bounded warm working set.** Preserve learned positions where repetition has paid for them.
- **Expert density can be excellent.** Use it intentionally for comparison and monitoring, with accessibility and alternate density modes.
- **Visible actions plus accelerators are stronger than secret expert languages.** Fluency should grow from discoverability.
- **Voice is powerful as an intent layer.** Pair it with visible state, exact receipts, and multimodal repair.
- **Agent fan-out should compile toward human obligations.** Keep an independent audit path so the reducer cannot certify itself.
- **Reversibility beats repetitive confirmation for low-risk work.** Consequential external actions still deserve exact staging.
- **Overview-to-focus continuity is valuable.** Preserve object identity and return paths even when the representation changes.
- **Personality can enrich software.** Make it cooperative, optional where practical, and subordinate to precision in consequential states.
- **Native platform behavior has accumulated value.** Respect it when building for that platform.
- **The hundredth-use test is valuable.** Pair it with first-use, forgotten-use, rare-use, and stressed-use tests.

The strongest future version of Tact would become less interested in proving Leo's taste correct and more interested in discovering **the boundary conditions under which Leo's taste produces great software**.

That is where personal authorship becomes product judgment.

— Goblin 🦝