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

## Rule

Do not put something here merely because it is unfamiliar, unfashionable, dense, ugly, or opinionated.

A shit-list entry should identify a **specific user cost or broken expectation** and give us something we can learn or make from it.
