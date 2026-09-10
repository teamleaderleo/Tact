# Tact signature

**A slowly changing record of the design choices Leo keeps making.**

This is not a manifesto and it is not a preset theme. The signature should emerge from repeated work across unrelated products, not from declaring a house style in advance.

Promote a preference here when it keeps surviving contact with real interfaces, implementation, repeated use, and counterexamples. Link the cases that earned it. Demote it when later work contradicts it.

## Current candidates

### Preserve continuity across views

**Preference:** Keep object identity, state, and a cheap path back intact while representation changes.

**Why it keeps recurring:** Leo strongly notices reloads, lost selection, destroyed spatial position, and workflows where the user must reconstruct context after changing views.

**Current expression:** Change representation without making the user rediscover the thing they were already working on.

**Evidence:**

- [`notes/leo-interface-instincts.md`](notes/leo-interface-instincts.md)
- [`notes/spatial-memory-overview-and-edge-bookmarks.md`](notes/spatial-memory-overview-and-edge-bookmarks.md)
- [`case-studies/everyday-interface-microcases/`](case-studies/everyday-interface-microcases/)
- CMUX spatial and causal case studies under [`case-studies/`](case-studies/)

**Confidence:** high.

### Prefer decision-relevant density

**Preference:** Show enough of the field that comparison and orientation can happen without serial navigation.

**Boundary:** Visible state still has a parsing cost. Density loses when weakly relevant state competes with the current judgment.

**Current expression:** Maximize useful state per navigation step, not content per square inch.

**Evidence:**

- [`notes/power-from-seeing-the-field.md`](notes/power-from-seeing-the-field.md)
- [`notes/contrarian-review.md`](notes/contrarian-review.md)
- [`prototypes/warm-field/`](prototypes/warm-field/)

**Confidence:** medium.

### Give warm work stable places

**Preference:** Let frequently revisited work accumulate spatial memory instead of continuously reordering it.

**Boundary:** Search, feeds, cold archives, emergencies, and explicit sorting have different jobs.

**Current expression:** Preserve user-owned geography; change salience before location.

**Evidence:**

- [`notes/spatial-memory-overview-and-edge-bookmarks.md`](notes/spatial-memory-overview-and-edge-bookmarks.md)
- [`prototypes/warm-field/`](prototypes/warm-field/)
- [`case-studies/cmux-spatial-interactions/`](case-studies/cmux-spatial-interactions/)

**Confidence:** medium.

### Make hot paths direct

**Preference:** Repeated actions should have stable targets, immediate acknowledgement, minimal backend-driven detours, and cheap recovery.

**Current expression:** Let fluency accumulate. Do not charge the hundredth use for ceremony whose only purpose was first-use explanation.

**Boundary:** Consequential and irreversible actions can deserve explicit staging.

**Evidence:**

- [`APPLIED.md`](APPLIED.md)
- [`notes/lovable-jank-and-operational-atmosphere.md`](notes/lovable-jank-and-operational-atmosphere.md)
- [`notes/contrarian-review.md`](notes/contrarian-review.md)

**Confidence:** high.

### Keep capture cheap; recover meaning later

**Preference:** Accept thoughts with little clerical work, preserve surrounding context, and rely on strong retrieval plus only as much explicit organization as later use earns.

**Current expression:** Capture first. Let repeated use reveal which stable names and collections deserve to exist.

**Boundary:** Shared meaning, permissions, onboarding, lifecycle, and complete-set inspection can justify organization much earlier.

**Evidence:**

- [`notes/append-only-memory-and-computed-present.md`](notes/append-only-memory-and-computed-present.md)
- [`experiments/capture-retrieve-handoff-delete/`](experiments/capture-retrieve-handoff-delete/)

**Confidence:** medium.

### Let modalities specialize

**Preference:** Speech is excellent for open-ended intent; visible interaction is excellent for reference, comparison, precision, memory, and repair.

**Current expression:** Selection supplies the noun. Speech supplies the relationship or desired action. Keep the result inspectable.

**Evidence:**

- [`notes/voice-multimodal-and-disappearing-interfaces.md`](notes/voice-multimodal-and-disappearing-interfaces.md)
- [`prototypes/microphone-clutch/`](prototypes/microphone-clutch/)
- [`case-studies/everyday-interface-microcases/`](case-studies/everyday-interface-microcases/)

**Confidence:** medium.

### Let character ride with operation

**Preference:** Software can have atmosphere, personality, humor, material, sound, and authorial taste without slowing the job down.

**Current expression:** Put character into typography, language, icons, motion, sound, material, and domain-native details before adding extra transitional ceremony.

**Evidence:**

- [`notes/authorship-and-product-design.md`](notes/authorship-and-product-design.md)
- [`notes/lovable-jank-and-operational-atmosphere.md`](notes/lovable-jank-and-operational-atmosphere.md)
- [`case-studies/cmux-native-macos-daily-use/`](case-studies/cmux-native-macos-daily-use/)

**Confidence:** medium.

### Put decision-useful truth early

**Preference:** When the user is evaluating something, surface facts, mechanisms, constraints, tradeoffs, and comparison before decorative presentation exhausts attention.

**Current expression:** Beauty can come through exact information rather than standing between the user and it.

**Evidence:**

- [`notes/information-first-product-pages.md`](notes/information-first-product-pages.md)
- [`case-studies/everyday-interface-microcases/`](case-studies/everyday-interface-microcases/)

**Confidence:** high for evaluation tasks.

### Reduce machine activity into human obligations, with an independent audit path

**Preference:** Large amounts of background work should compile into outcomes, blockers, decisions, and recovery actions instead of demanding that the human watch executor activity.

**Current expression:** Human obligations summarize consequential work. Independent audit invariants summarize consequential population behavior. Exact receipts remain beneath both.

**Evidence:**

- [`notes/when-100-agents-feel-like-three-decisions.md`](notes/when-100-agents-feel-like-three-decisions.md)
- [`experiments/adversarial-attention-compiler/`](experiments/adversarial-attention-compiler/)

**Confidence:** medium and especially relevant to agent products.

## Visual signature: deliberately unfinished

Do not fill these fields because they sound attractive. Add evidence from several unrelated pieces of work first.

### Typography

Questions to accumulate:

- Which type proportions repeatedly feel right?
- How much contrast between title/body/metadata?
- Tight or open tracking?
- How small can supporting text go before the hierarchy becomes brittle?

**Current evidence:** insufficient for a house position.

### Geometry

Questions:

- Sharp, softly rounded, or mixed?
- How much framing is desirable?
- What kind of radius language keeps recurring?

**Current evidence:** insufficient.

### Color

Questions:

- How much chroma belongs in operational software?
- Are accents local or atmospheric?
- What neutral temperatures keep recurring?

**Current evidence:** insufficient.

### Material

Questions:

- Flat, translucent, layered, tactile?
- How much depth cue is enough?
- When does glass preserve context and when does it muddy reading?

**Current evidence:** early Mac/CMUX cases only.

### Motion

Questions:

- How immediate should acknowledgement be?
- Which transitions deserve spatial explanation?
- How much easing tail survives repetition?

**Current evidence:** some vocabulary, little applied evidence.

### Iconography

Questions:

- Stroke/filled balance?
- How much personality can icons carry without harming scanability?
- What apparent weight works next to dense text?

**Current evidence:** insufficient.

### Density and atmosphere

This is the strongest emerging visual/interaction territory: relatively high information availability, calm hierarchy, persistent context, and enough character that the product feels authored.

It still needs many more real products before becoming a visual recipe.

## Promotion rule

A signature claim becomes much more interesting when it has:

1. at least two or three substantially different real cases;
2. one counterexample or boundary condition;
3. a visible artifact or interaction, not only prose;
4. evidence that Leo still prefers the decision after using it;
5. language precise enough that another designer can disagree with the actual choice.

The signature is an output of the work.

Do not design the work merely to preserve the signature.
