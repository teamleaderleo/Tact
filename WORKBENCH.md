# Tact workbench

**Current synthesis — 2026-09-09**

This is the active surface for Tact. The scout notes are research evidence, examples, and arguments. They are deliberately allowed to disagree. Promote ideas from them into this page only when the disagreement has become specific enough to test.

The present job is to turn Leo's taste into conditional product judgment: **where does an instinct work, for whom, under what conditions, and what breaks it?**

## Current map of Leo's design instincts

### 1. Preserve continuity and object identity

Leo strongly prefers interfaces where the same thing stays recognizably the same while the viewpoint changes. Selection, scroll position, task state, browser state, window position, history, and the path back should survive transitions whenever practical.

Strong examples: Finder Quick Look and drag/drop, Mission Control correspondence, browser/terminal/agent handles, and the irritation caused by reload-heavy Settings navigation.

The underlying instinct is stronger than a preference for any particular layout: **keep the user's thought continuous across representations.**

### 2. Let expert users see a useful field

Dense interfaces can reduce navigation and improve comparison when the visible state participates in the current decision and has clear hierarchy. Old Reddit, Dwarf Fortress, spreadsheets, DAWs, vertical tabs, monitoring views, and management games all support this instinct.

The counterweight is equally important: visible state creates parsing cost. Novices, small screens, accessibility channels, rare tasks, and high-stakes flows can need stronger reduction or staged disclosure.

Density is a tool for a constituency and a task, not a virtue by itself.

### 3. Give warm work stable places; use search for the cold archive

Leo appears to build memory through location: sidebar order, window edges, vertical tabs, monitor geography, familiar command positions. Stable geography can become a retrieval system for a bounded working set.

Search, chronology, and semantic retrieval are better for a large cold archive. Dynamic ranking belongs naturally in search results, live feeds, and small attention queues. It should earn a much higher bar before moving user-placed work.

Every spatial object still needs semantic identity that survives relocation, another device, accessibility changes, and collaboration.

### 4. Make hot paths direct and let fluency accumulate

Repeated actions deserve stable targets, immediate feedback, little blocking motion, cheap reversal, batch operations when repetition becomes clerical, and shortcuts that grow out of visible actions.

The strongest expert interfaces teach their accelerators instead of hiding capability behind them. A rare command can remain labeled and searchable; a hot command can become muscle memory without becoming secret knowledge.

The hundredth use is one clock. First use, forgotten use, stressed use, and rare consequential use are other clocks.

### 5. Compile machine work into human obligations, while keeping an independent audit path

At high concurrency, workers and tool chatter should usually become evidence beneath human-scale objects: commitments, changed outcomes, blockers, decisions, recovery, and typed uncertainty. Exact receipts stay one gesture away.

This is the strongest convergence across the agent notes.

Goblin's objection must remain attached to it: a reducer can create a beautifully calm lie. Correlated failures, shared stale premises, hidden UNKNOWNs, retry patterns, cost burn, weak verification coverage, or disappearing solution diversity may be visible only at population level.

The primary surface can be quiet. **The reducer cannot be its own auditor.**

### 6. Make capture and intent cheap; spend organization when it earns its cost

Discord-as-notes, chat history, voice input, email, logs, and append-first workflows all suggest the same preference: capture the thought with little clerical work, preserve its context automatically, and derive cleaner views later.

Search and synthesis make this more viable. They do not erase the jobs of organization. Shared meaning, permissions, onboarding, lifecycle, complete-set inspection, canonical names, and coordination can justify explicit organization early.

The useful question is the price of organization at this moment, for this job.

### 7. Use speech for intent and visible interaction for reference, precision, memory, and repair

The most convincing voice model is the microphone as a clutch: point or select, speak the relationship or goal, keep the exact interpretation and result visible, then repair the smallest wrong part with whichever modality is cheapest.

Voice can make a screen recede during composition and steering. Visual state remains essential for exact values, comparison, long-running work, uncertainty, history, audit, and consequence.

### 8. Let truth, mechanism, and character coexist

Leo dislikes presentation that performs the existence of an object while hiding the information needed to evaluate it. Product pages, technical tools, and serious software can be beautiful through exact dimensions, diagrams, comparisons, mechanisms, material decisions, evidence, and real product behavior.

Personality is still desirable. The strongest version rides with operations through typography, iconography, sound, domain language, spatial landmarks, material, and small eccentricities. Added ceremony on a hot path spends that affection quickly.

The product can be romantic and precise at the same time.

## Tensions to keep alive

These are active design fights. They should stay unresolved until experiments establish useful boundary conditions.

| Tension | Why both sides remain useful |
| --- | --- |
| **Show more state ↔ keep healthy work quiet** | Comparison and orientation benefit from visibility; supervision and anomaly detection can collapse when normal state occupies the field. |
| **Search/retrieval ↔ explicit organization** | Search is excellent for private recall and unknown location; organization creates shared meaning, completeness, permissions, lifecycle, and browsable absence. |
| **Stable geography ↔ dynamic importance** | Learned location compounds for warm work; urgency genuinely changes for queues, incidents, search, and live feeds. |
| **Interface recedes ↔ discoverability/recovery** | Fluent paths can become nearly invisible; visible state teaches capability and gives returning users a way back in. |
| **Delete ceremony ↔ stage consequence** | Redundant acknowledgement destroys hot flows; irreversible or externally consequential actions deserve exact scope, authority, and consequence before commitment. |
| **Task identity ↔ braided work** | Tasks are excellent human grouping and resumption objects; real artifacts, events, runtimes, decisions, and fixes often belong to several tasks or cause tasks to split and merge. |
| **Append-first provenance ↔ deletion/correction/current external truth** | History gives lineage; people still need redaction, correction, canonical state, and facts that can change outside the local journal. |
| **Personality ↔ consequence-sensitive neutrality** | Character creates affection and memory; errors, money, permissions, incidents, and irreversible actions reward precise language and low theatricality. |
| **Hundredth use ↔ first/forgotten/stressed use** | Fluency exposes repetition tax; rare and returning workflows expose hidden recall and safety costs. |
| **Native platform craft ↔ broader doctrine** | Mac conventions carry enormous learned value for a Mac product; other platforms and accessibility modes bring different learned expectations. |

## Strongest unresolved questions

1. **What deserves persistent visibility?** Can a rule distinguish state that supports orientation/comparison from healthy state that merely consumes attention?
2. **Where is the density threshold?** How does it move with expertise, screen size, accessibility mode, task frequency, and consequence?
3. **When does stable geography beat recency or search?** How large and long-lived can the warm set become before location turns into archaeology?
4. **When should organization arrive?** What observable condition tells the system that shallow chronology/search has stopped paying and a durable collection, lifecycle, or canonical slot has become worthwhile?
5. **How should an attention reducer be audited?** What compact independent signals reveal correlated failure, hidden UNKNOWNs, stale-source concentration, cost burn, retry storms, and missing verification without recreating a 100-worker dashboard?
6. **What is the durable primitive for braided work?** Is task the right human-facing lens over a lower-level graph of artifacts, events, runtimes, decisions, claims, and receipts?
7. **How should provenance coexist with human authority over memory?** What does complete delete/redact/correct mean when summaries, embeddings, derived views, and resurfacing exist?
8. **Where does voice earn the microphone?** Which real workflows improve when speech carries intent, and where do social context, exactness, privacy, or cognitive load make pointer/keyboard clearly better?
9. **How much personality survives consequence?** Which expressive details remain beloved after 100 repetitions and during a serious failure?
10. **Which parts of Leo's taste transfer to strangers?** The repo has a large amount of evidence about Leo and much less evidence about people who did not invent the mental model.

## The experiments worth actually doing

The repo has more experiment ideas than it can use. These nine cover the largest number of live disagreements. New experiments should usually displace one of these instead of growing the list indefinitely.

### 1. Boundary-condition field test

Build one dense, stable expert workflow and test it with Leo plus five competent people who did not help design it.

Run the same workflow at:

- first use;
- after repeated fluency;
- after a delayed return;
- on a laptop-sized field;
- keyboard-only;
- at least one serial accessibility pass such as VoiceOver.

Measure time, error, reacquisition, navigation, confidence, and where Leo's “obvious” path disappears for everyone else.

**Why first:** it tests the repo's largest risk — turning one expert adaptation into a universal principle.

### 2. Warm-field switching: edge geography vs MRU vs search

Use 12 concurrent realistic tasks and compare:

- stable cropped edge bookmarks;
- stable scaled mini-windows;
- MRU switching;
- search by name.

Test warm repeated targets, recent targets, and cold named targets. After location learning, change monitor topology or move to a laptop and test recovery through semantic identity.

**Settles:** spatial persistence, edge bookmarks, warm/cold split, dynamic ranking, cross-device fragility.

### 3. Adversarial attention compiler

Feed 100 synthetic workers into a commitment field + exception queue + receipt layer. Give the user three genuine decisions, then add hidden systemic problems:

- 70–90 workers share the same wrong premise;
- a retry storm remains individually below escalation thresholds;
- cost burn rises while tasks remain “healthy”;
- verification coverage quietly drops;
- one child carries a decision boundary that should resist fan-in.

Compare against a worker grid and add an **independent audit lens** to the reduced interface.

**Settles:** “100 agents feel like three decisions” versus the calm-lie objection.

### 4. One real causal debugging thread — then break the task boundary

Implement the smallest browser + terminal + source + agent prototype where one visible failure links through:

```text
interaction -> runtime event -> request/log -> source -> edit -> rebuild -> replay -> proof
```

Preserve exact handles and receipts. Halfway through, introduce a second bug or shared cause that forces a task split or merge.

**Settles:** causal cursor, executable history, verification claims, and whether “task” survives braided reality.

### 5. Capture, retrieve, hand off, delete

Build a Discord-like journal with automatic context, hybrid lexical/semantic retrieval, shallow anchors, and one computed-current-state view.

Test four jobs on the same corpus:

- private refinding;
- “what is true now?” after superseding decisions;
- complete-set retrieval handed from person A to person B;
- complete deletion/correction of a secret or wrong fact, including derived views.

**Settles:** capture-first knowledge, search vs organization, computed present, team handoff, and the append-only objection in one prototype.

### 6. Microphone-as-clutch debugging

Use a real browser/terminal debugging task and compare:

- pointer + keyboard;
- voice command alone;
- mixed interaction where current selection/focus supplies the referent and speech supplies intent.

Inject recognition, reference, and intent errors. Repeat one run in a shared room. Measure pane switches, identifier re-entry, wrong-target actions, repair turns, restated context, and time spent looking away from the artifact.

**Settles:** whether the voice thesis improves an actual expert workflow instead of a demo command.

### 7. Information-first beauty parity

Using identical high-quality photography, typography, and art direction, build two versions of the same technical product page:

- story-first;
- decision-first with price/availability/key facts/fit/comparison close to the opening.

Measure five-question retrieval, beauty, desire, trust, purchase confidence, and external verification searches. Revisit after 24 hours with a new question.

**Settles:** whether information-first presentation really trades away romance, and how the page behaves after desire has already been established.

### 8. Operational atmosphere at the hundredth repetition

Build one hot flow three ways:

1. neutral and immediate;
2. visually distinctive with identical timing and gesture count;
3. visually distinctive with added transitional ceremony.

Run 10, 50, and 100 repetitions, then use all three during a serious failure state. Measure speed, error, irritation, recall, and desire to return.

**Settles:** personality vs invisibility, lovable jank, and the difference between operational atmosphere and ceremony.

### 9. Monthly micro-craft calibration

Keep one continuing studio experiment: one-variable A/Bs, screenshot autopsies, and one-pixel sabotage across typography, hierarchy, alignment, contrast, density, and motion.

The output is a small set of blind comparisons plus written diagnoses and exact measurements. Re-run missed categories a month later.

**Why it stays:** the purpose of Tact is craft transfer, not only interface theory. This is the training loop that makes the other experiments easier to diagnose.

## Candidate principles

Confidence means **confidence that the claim is currently useful within its stated boundary**, not universal truth.

| Candidate principle | Confidence | Boundary / caveat |
| --- | --- | --- |
| Preserve object identity, current state, and a cheap return path across changes of view. | **High** | Representation can change; continuity should survive. |
| Preserve exact receipts and provenance beneath summaries, automation, and verification claims. | **High** | User-directed deletion/redaction and privacy still override archival purity. |
| Hot repeated paths deserve stable targets, immediate feedback, interruptible motion, and cheap recovery. | **High** | Rare consequential actions follow a different optimization. |
| Let expert acceleration grow from visible or searchable actions instead of secret vocabulary. | **High** | Highly compositional command languages can justify more learned syntax. |
| In evaluation tasks, lead with the facts that can change the decision. | **High** | Browsing, entertainment, and brand storytelling can have different primary jobs. |
| Dense grouped fields can outperform sparse drill-down for expert comparison, monitoring, and multi-object editing. | **Medium** | Expertise, device, accessibility mode, and task type move the threshold. |
| Preserve user-owned geography for a bounded warm working set; change salience before location. | **Medium** | Cold retrieval, live feeds, emergencies, and explicit sorting legitimately reorder. |
| Capture can stay permissive while organization arrives after repeated use reveals where it pays. | **Medium** | Shared work, permissions, governance, onboarding, and completeness can require organization early. |
| Voice is strongest as an intent layer paired with visible reference, exactness, receipts, and repair. | **Medium** | Social context and the job's symbolic/spatial demands can remove the advantage entirely. |
| High-concurrency supervision should center human obligations and commitments instead of worker activity. | **Medium** | Requires an independent audit view that can expose population-level failure. |
| Character survives best when it rides with operations at little extra gesture or latency cost. | **Medium** | Consequential states need precise language and may need personality dialed down. |
| The hundredth-use test is required for hot paths. | **Medium** | Pair it with first, forgotten, stressed, rare, and cross-device use. |
| “Task” is the persistent object across browser, terminal, source, and agent work. | **Low** | Better current hypothesis: task is a human-facing grouping over independently identified artifacts/events/runtimes/decisions with many-to-many links. |
| An append-only journal should be the canonical truth substrate for personal knowledge. | **Low** | Provenance is valuable; correction, deletion, direct canonical edits, and external truth complicate the model. |
| The best interface disappears. | **Low** | Stronger version: learned low-risk mechanics can recede while capability, state, recovery, and evidence remain summonable. |

## Delete or weaken in the active doctrine

Keep the scout notes. They are evidence and argument history. What deserves removal is **overbroad wording from the active layer**.

- **Weaken “Repeated use is the real test.”** Repeated use is one required test. First success, delayed recall, stressed use, rare consequence, accessibility, and device change deserve equal status when relevant.
- **Weaken “Good interaction can disappear.”** Learned hot paths can recede. Commands, state, targets, repair, and recovery still need a visible or summonable contract.
- **Weaken “Delete ceremonial interaction.”** Delete duplicate acknowledgement and backend-driven detours. Keep exact staging when a meaningful human commitment, authority change, external effect, or irreversible consequence becomes true.
- **Weaken “Retrieval can beat filing.”** Search often beats deep manual filing for private refinding. Explicit organization can win early when completeness, shared meaning, governance, or onboarding are the job.
- **Weaken “The persistent object is the task.”** Treat task as a promising human lens. Preserve lower-level identities independently and let tasks split, merge, link, and retire.
- **Weaken append-only as doctrine.** Use append-first provenance where useful, with real delete/redact/correct/merge/canonical operations and awareness that external facts can change without a local event.
- **Weaken “100 agents should feel like three decisions.”** Keep it as the primary attention target only when an independent audit signal can reveal systemic problems the reducer would otherwise hide.
- **Keep Mac-native claims platform-scoped.** They are excellent guidance for a Mac product and evidence to retest elsewhere, rather than general laws of computing.
- **Stop adding parallel principle lists to the active path.** Long notes can carry source-specific conclusions. This workbench owns the current promoted set.

No current scout note deserves deletion as a source. The duplication becomes harmful only when every source note is treated as current doctrine at once.

## Workshop rules

1. **This file owns current priorities.** Research notes can be longer, stranger, and contradictory.
2. **A principle needs an example, a counterexample, and an executable test** before promotion above Low confidence.
3. **Keep at most ten active experiments.** A new one should merge with or displace an old one.
4. **After an experiment, change something.** Raise confidence, lower it, narrow the boundary, or kill the claim.
5. **Prefer one prototype that tests several tensions** over five adjacent essays.
6. **Do not write a new long note merely to restate an existing conflict.** Add evidence to the relevant note or update this workbench.
7. **Preserve disagreement when it predicts different designs.** A tension becomes useful when each side names the conditions where it expects to win.
8. **Keep the weird experiments.** Cats, edge bookmarks, voice clutching, semantic zoom, and beautiful datasheets are useful because they force real implementation and repeated-use questions.

The next phase of Tact should produce fewer new doctrines and more scars from prototypes.

— Pudding 🐻
