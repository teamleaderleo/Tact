# Tact shit list

**Specific interaction failures worth remembering because they teach something.**

This is not a collection of products Leo dislikes. It is a collection of precise failures and, ideally, better alternatives.

The useful sequence is:

```text
this is bullshit
-> what exactly happened?
-> what cost did it impose?
-> what design decision caused it?
-> what would I do instead?
```

Keep the first reaction. Then earn the second sentence.

## Entry format

```md
## <product / interaction>

**Raw:**
> Why the fuck did it do that?

**Observed:**
Exact interaction sequence / screenshot / recording.

**Diagnosis:**
Name the failure precisely.

**Cost:**
What did the user have to remember, wait for, reconstruct, search for, acknowledge, or redo?

**Correction:**
Smallest stronger alternative.

**Boundary:**
Why might the existing behavior still make sense somewhere else?

**Related case / pattern:**
```

An entry can start with only `Raw` and `Observed`. Add the diagnosis later if needed.

## Seed failures to watch for

These come from recurring reactions already captured in Tact. They are prompts for future evidence, not verdicts on entire products.

### Navigation that destroys continuity

Raw family:

> “Why did backing out of this make me wait/reload/reconstruct where I was?”

Look for:

- object identity lost across pages;
- scroll/selection reset;
- unnecessary reload boundaries;
- back navigation that returns to a different state than the one left.

Existing source: macOS Settings observations and [`case-studies/everyday-interface-microcases/`](case-studies/everyday-interface-microcases/).

### Presentation before decision-useful information

Raw family:

> “Just show me the fucking specs.”

Look for:

- key constraints hidden behind decorative scroll sequences;
- repeated demonstrations of already-understood capability;
- comparison information scattered across sections;
- storytelling that delays the user's actual evaluation job.

Existing source: [`notes/information-first-product-pages.md`](notes/information-first-product-pages.md).

### Dynamic organization that spends learned position

Raw family:

> “Where the fuck did the thing go?”

Look for:

- automatic reorder of repeatedly used targets;
- grouping that introduces more navigation than recognition value;
- recency ranking applied to work whose value comes from stable location.

Existing source: [`notes/spatial-memory-overview-and-edge-bookmarks.md`](notes/spatial-memory-overview-and-edge-bookmarks.md).

### Healthy activity represented as attention demand

Raw family:

> “Why am I being shown all this shit when nothing needs me?”

Look for:

- worker/activity feeds where outcomes would suffice;
- notification storms from routine success;
- dashboards whose normal state dominates the field;
- machine events presented at the same priority as human decisions.

Existing source: [`experiments/adversarial-attention-compiler/`](experiments/adversarial-attention-compiler/).

### Sparse UI that turns comparison into memory work

Raw family:

> “I want to see the whole fucking thing.”

Look for:

- relevant values split across screens;
- repeated open/close cycles just to compare objects;
- progressive disclosure applied to state the user repeatedly needs simultaneously.

Existing source: [`notes/power-from-seeing-the-field.md`](notes/power-from-seeing-the-field.md).

### Personality that charges a repeated-use toll

Raw family:

> “Cute once. Get the fuck out of my way now.”

Look for:

- blocking animation;
- theatrical transitions on a hot path;
- sound/motion that does not communicate state;
- decorative interaction that adds gestures.

Counterpoint: personality can remain excellent when it lives in typography, material, language, sound cues, illustration, or responsive details without slowing operation.


## cmux NEXT context ring that looks like it is loading

**Raw:**
> Is it still thinking?

**Observed:**
The composer's context-usage ring (16px, 2px round-capped arc on a 28% track, starting at 12 o'clock) at 24% used. Every judge read it as a spinner. Thinning the arc changed nothing (6 ties).

**Diagnosis:**
Shape semantics. A partial arc on a track is the platform's activity-indicator shape, so a static gauge drawn that way borrows "busy" whatever its value.

**Cost:**
A permanent false busy signal next to the model picker. Users wait, or stop trusting the indicator. Hiding the ring entirely beat it.

**Correction:**
A filled wedge inside a 1px track ring (18–0 against every alternative). See [`case-studies/cmux-agent-pane-surfaces/`](case-studies/cmux-agent-pane-surfaces/).

**Boundary:**
Arcs are fine for real progress that animates toward completion, where "busy" is the truth.

## cmux NEXT closed padlock on "Full access"

**Raw:**
> Full access is locked?

**Observed:**
The composer's permission chip drew the same closed padlock for every mode, tinted orange for Full access, while its menu put a shield with "!" on every row, Supervised included. A four-model blind panel called the Full access lock "inverted" 4-0 (2026-10-14).

**Diagnosis:**
Symbol semantics fighting color. A closed shackle means "secured", so the only danger signal left is the tint, and the menu's warning shield on the safest mode spends the warning glyph on nothing.

**Cost:**
The one control that decides whether an agent can act unsupervised says "safe" at a glance. At narrow widths the label goes and only the inverted glyph remains.

**Correction:**
One family, one meaning per mark: shield-check for Supervised, plain shield between, shield-! in the warning color for Full access, the same glyph in trigger and menu. See [`experiments/thunderdome/examples/cmux-compact-composer/RESULTS.md`](experiments/thunderdome/examples/cmux-compact-composer/RESULTS.md).

**Boundary:**
An *open* padlock for Full access is defensible (T3 Code ships it; one judge preferred it). The failure is the closed one.

## Rule

Do not put something here merely because it is unfamiliar, unfashionable, dense, ugly, or opinionated.

A shit-list entry should identify a **specific user cost or broken expectation** and give us something we can learn or make from it.
