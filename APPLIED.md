# Tact applied work

**Current direction — turn the principles into product decisions.**

Tact has enough general research for now. The next phase is to take real products, real workflows, and real code, apply the strongest ideas, make concrete alternatives, and keep the resulting design judgment.

The target is not a larger pile of design doctrine. It is a body of case studies that can answer:

- What was the user trying to do?
- What did the existing interaction make easy or hard?
- What exactly felt wrong or unusually good?
- Which variable or product decision caused that reaction?
- What alternative did we make?
- What changed when the alternative was used?
- Which principle became stronger, weaker, or narrower?

A useful operating rule:

> **Show the difference, then name the difference.**

Design is often easiest to understand in two concrete alternatives. Tact should still develop the language to explain why one works better, so a visual judgment can become a repeatable engineering/product decision instead of remaining “this feels better.”

## Why this is the next phase

A large fraction of interface work is not an ideological argument. There are many cases where hierarchy, alignment, feedback, latency, affordance, information order, or recovery has a clearly stronger implementation once the user goal and constraints are understood.

The interesting work is therefore less about manufacturing opinions and more about:

1. seeing the relevant difference;
2. naming the lever precisely;
3. making the better version;
4. recognizing the cases where two legitimate goals conflict;
5. preserving the evidence and reasoning so the judgment can transfer.

The existing research notes are vocabulary and prior art. The existing canned experiments are drills and test fixtures. Use them when they answer a live question. Do not treat running them as the main activity.

The warm-field and attention-compiler work remain especially useful because they expose unresolved interaction problems rather than only rehearsing known craft.

## Applied case-study format

A case study can be small. One sidebar, one transition, one workflow, one page, one notification policy, or one debugging handoff is enough.

### 1. Context

Record the real product/workflow and the actual user goal.

Include the environment when it changes the judgment:

- desktop / laptop / phone;
- screen size;
- pointer / keyboard / touch / voice;
- first use or repeated use;
- individual or collaborative use;
- consequence level;
- amount of concurrent work.

### 2. Existing interaction

Show the current thing as concretely as possible.

Prefer:

- screenshot;
- screen recording;
- sketch;
- exact interaction sequence;
- relevant code/component;
- measured latency or dimensions when useful.

Do not begin with a principle and hunt for evidence afterward.

### 3. Reaction

Capture the initial judgment before polishing it into professional language.

Examples:

- “I keep losing where I was.”
- “This panel feels like a junk drawer.”
- “I want all of these visible at once.”
- “The app made me wait for an implementation boundary I do not care about.”
- “This is ugly but I can operate it absurdly quickly.”
- “I stopped looking at the interface once voice took over.”

That reaction is the sensor reading.

### 4. Diagnosis

Translate the reaction into exact product/design language.

Useful categories include:

- information hierarchy;
- grouping / spacing / alignment;
- density and decision-relevant state;
- object identity and continuity;
- stable geography and spatial memory;
- discoverability and learned fluency;
- latency and feedback;
- modal transitions and return paths;
- voice / pointer / keyboard division of labor;
- attention routing and interruption;
- progressive disclosure;
- provenance / receipts / auditability;
- visual character and operational atmosphere;
- consequence and deliberate staging.

The diagnosis should point toward something that can be changed.

### 5. Alternatives

Make at least two real alternatives when the answer is not already obvious.

Change as little as practical so the comparison remains intelligible.

A useful case study often contains:

```text
current
-> minimal correction
-> stronger reinterpretation
```

Mockups, code, CSS, native prototypes, sketches, or even annotated screenshots are valid. Use the cheapest medium that makes the decision visible.

### 6. Use

Try the thing in the workflow that motivated it.

For hot paths, repeat it enough for novelty to disappear. For rare consequential paths, inspect clarity, consequence, and recovery instead of pretending the hundredth-use test is relevant.

Useful observations:

- where hesitation occurs;
- what the eye reaches for first;
- how many context switches happen;
- what remains visible or has to be reconstructed;
- what becomes irritating with repetition;
- what becomes automatic with repetition;
- what gets ignored;
- what the user reaches for instead;
- what fails on a smaller screen or different input mode.

### 7. Judgment

End with a design decision, not merely an observation.

Record:

```text
Keep:
Change:
Reject:
Unresolved:
```

Then note which Tact belief became stronger, weaker, or more conditional.

## Language is part of the craft

The goal is to preserve the speed of an artistic eye while adding enough vocabulary to communicate and reproduce the judgment.

Useful transformations:

```text
“this feels busy”
-> three unrelated regions occupy the same emphasis tier

“this transition feels stupid”
-> the representation changed while object identity and return position were lost

“this is too sparse”
-> comparison requires serial navigation between state that should coexist

“this is too dense”
-> visible state exceeds what participates in the current decision and competes at similar visual priority

“this voice flow feels magical”
-> speech carries open-ended intent while visible selection supplies exact referents and the screen preserves inspectable history

“this status dashboard is exhausting”
-> routine machine activity is represented at the same level as human obligations

“this UI has personality without annoying me”
-> character lives in typography, material, language, sound, and state treatment without adding gestures or delaying the hot path
```

Keep both versions when useful. The raw reaction records taste; the diagnosis records craft.

## Near-term case studies

The highest-value work before the CMUX visit is material that overlaps with products and interactions Leo genuinely uses rather than speculative redesign theater.

### CMUX / terminal-kit

Use the actual terminal workflow as the main classroom.

Potential cases:

- sidebar density and minimum useful width;
- workspace/tab identity at high concurrency;
- overview -> focus -> exact return;
- stable task geography versus recency;
- notifications and “what needs me?”;
- terminal output versus task/result summaries;
- browser + terminal + agent continuity;
- command discoverability versus learned shortcuts;
- personality and native macOS material without degrading repeated use.

Prefer changes that can be dogfooded in `terminal-kit` or a local CMUX build.

### Agent work

Apply the attention-compiler findings to real Stensibly / Cultist / Glaeda / Lazy Commander workflows.

Potential cases:

- which events deserve a human interruption;
- when worker identity belongs in the foreground;
- how many receipts can safely fan into one decision;
- what independent population audit remains visible;
- how a human returns from an exception to the prior work region.

### Everyday products

Use ChatGPT, Edge, Outlook, Safari, macOS Settings, Discord, YouTube, games, calendars, and product pages as teardown material when a concrete interaction provokes a reaction.

Do not redesign an entire app. Pick one live flow and make the alternative visible.

## CMUX visit packet

Before going to San Francisco, Tact should be able to produce a small, informal packet of things worth discussing or showing.

It does not need to look like an interview presentation.

A strong packet would contain roughly:

- 2–4 CMUX/terminal case studies with screenshots or working changes;
- the warm-field idea, including where Rook found its current limits;
- the attention-compiler result: commitments + human obligations + independent population audit;
- one browser/terminal/agent causal interaction example;
- a page of compact design vocabulary / principles earned from the cases;
- unresolved questions that would be fun to attack with the CMUX team.

The point is to arrive with things that can turn into a conversation, sketch, argument, code change, or prototype in the room.

## What to avoid

- another broad “principles of good design” essay;
- redesigning products from screenshots without understanding the real hot path;
- canned A/B drills when a live product can answer the same question;
- treating Leo's personal habits as universal requirements;
- beautiful mockups whose interaction cannot survive actual use;
- forcing every case into a pre-existing Tact belief;
- writing five pages when one before/after image and three precise sentences settle the point.

## Current standard for useful work

A Tact contribution is especially valuable when another person can inspect it and say:

1. **I see what changed.**
2. **I understand why.**
3. **I can disagree with a specific decision rather than a vibe.**
4. **I can carry the vocabulary or interaction into another problem.**

That is the bridge from taste to product judgment.
