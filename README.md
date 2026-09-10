# Tact

**Turning taste into product judgment.**

Tact is a working notebook for developing product and interaction design craft through observation, critique, real product work, and building.

The starting point is simple: having strong taste is useful, but product design asks for another skill — turning "this feels wrong" into a better interaction that survives repeated use, technical constraints, different users, and real consequences.

## Start here

[`APPLIED.md`](APPLIED.md) is the current direction. Tact now favors **real products, real workflows, concrete alternatives, and case studies** over accumulating more general design doctrine.

The core loop is:

```text
use something real
-> notice a reaction
-> show the current interaction
-> diagnose the lever
-> make an alternative
-> use it
-> record what changed
```

A useful operating rule:

> **Show the difference, then name the difference.**

Design is often easier to understand through concrete alternatives. Tact should still build the language to explain why one works better, so visual judgment becomes communicable product craft rather than only intuition.

[`WORKBENCH.md`](WORKBENCH.md) remains the current synthesis of the larger research program: Leo's design instincts, live tensions, candidate principles, and unresolved questions. Treat it as a reference and source of hypotheses rather than a requirement to run every experiment.

[`notes/operator-loop.md`](notes/operator-loop.md) remains available for using the existing lab prototypes when one answers a live question. The prototypes are now **drills and research fixtures**, not the center of Tact.

The long notes below are research evidence, vocabulary, examples, and arguments. They are allowed to disagree.

## Working beliefs

These are hypotheses to exercise against real products.

- **Preserve continuity.** Keep object identity, state, and the path back intact while the viewpoint changes.
- **Show state that helps the current judgment.** Dense expert fields can be excellent; healthy machine activity can stay quiet when an independent audit path remains available.
- **Let fluency accumulate.** Hot paths deserve stable targets, immediate feedback, recoverability, and accelerators that grow from visible or searchable actions.
- **Preserve exact evidence beneath reduction.** Summaries, current-state views, agent decisions, and verification claims should retain a cheap path to receipts and provenance.
- **Put decision-useful truth early.** Facts, constraints, comparisons, mechanisms, and tradeoffs can carry beauty instead of sitting behind presentation ceremony.
- **Make capture cheap; charge organization when it earns its cost.** Private recall, shared coordination, and complete-set inspection have different needs.
- **Let each modality do the job it handles well.** Speech can carry intent while visible interaction carries reference, precision, history, and repair.
- **Character should ride with the work.** Typography, iconography, material, sound, domain language, spatial landmarks, and small eccentricities can create affection with little hot-path cost.
- **Test across several clocks.** Repetition matters, alongside first use, forgotten use, stressed use, rare consequential use, accessibility, and device change.
- **Taste detects; craft resolves.** Diagnose the lever, build alternatives, alter the thing, use the result, and revise the judgment.

One useful north star:

> If you notice it, you love it. If you don't, you can just work.

## What belongs here now

Prefer applied work such as:

- a CMUX or terminal-kit interaction improved and dogfooded;
- an annotated before/after of a real workflow;
- a small redesign of one ChatGPT, Edge, Outlook, Safari, macOS, Discord, game, calendar, or product-page interaction;
- a design change backed by exact screenshots, measurements, code, or repeated-use notes;
- a case where a Tact principle failed or needed a narrower boundary;
- a compact write-up that turns "this feels wrong" into precise vocabulary another person can challenge.

Do not redesign entire products for sport. Pick the hot flow, state transition, information hierarchy, attention problem, or visual decision that actually provoked the reaction.

Before the CMUX visit, the most useful output is a small body of **CMUX-adjacent case studies, working changes, designs, and questions** that can turn naturally into discussion or hacking in the room. See [`APPLIED.md`](APPLIED.md).

## Runnable lab

These remain useful when they answer an applied question:

- [`experiments/microcraft/`](experiments/microcraft/) — blind one-variable A/B drills for typography, spacing, alignment, hierarchy, contrast, material, icon weight, density, motion duration, and easing.
- [`prototypes/microphone-clutch/`](prototypes/microphone-clutch/) — pointer/keyboard vs voice-only vs mixed selection + voice, with deterministic recognition/referent/intent failures and repair-cost instrumentation.
- [`prototypes/causal-debugger/`](prototypes/causal-debugger/) — one-stage causal debugging thread from visible browser failure through runtime, request/log, source, edit, rebuild, replay, and proof.
- [`prototypes/warm-field/`](prototypes/warm-field/) — cropped edge bookmarks vs scaled mini-windows vs MRU vs search over a persistent warm working set. This remains one of the more promising open interaction directions.
- [`experiments/adversarial-attention-compiler/`](experiments/adversarial-attention-compiler/) — executable 100-worker supervision simulator with commitment/decision reduction plus independent population audit. This remains one of the strongest research results.
- [`experiments/capture-retrieve-handoff-delete/`](experiments/capture-retrieve-handoff-delete/) — Discord-like capture with retrieval, current-state projection, handoff, correction, and deletion semantics.

Use these as training equipment. A live product is preferred when it can answer the same question better.

## Research notes

- [`notes/operator-loop.md`](notes/operator-loop.md) — optional human-use protocol for the current prototypes.
- [`notes/starting-points.md`](notes/starting-points.md) — first principles, practice loops, agent-attention questions, and issue-sized exercises.
- [`notes/leo-interface-instincts.md`](notes/leo-interface-instincts.md) — Leo's product preferences across ChatGPT, browsers, games, notes, email, macOS, calendars, car sites, and a first map of competing design values.
- [`notes/contrarian-review.md`](notes/contrarian-review.md) — adversarial review of density, organization, ceremony, disappearance, spatial memory, agent reduction, task identity, append-only history, repeated use, and platform specificity.
- [`notes/taste-to-diagnosis-microcraft.md`](notes/taste-to-diagnosis-microcraft.md) — vocabulary for typography, hierarchy, spacing, alignment, iconography, color, contrast, material, motion, transitions, rhythm, density, and controlled A/B drills.
- [`notes/power-from-seeing-the-field.md`](notes/power-from-seeing-the-field.md) — expert density, spatial memory, labels and icons, command vocabulary, contextual help, panel cost, and repeated-use experiments.
- [`notes/spatial-memory-overview-and-edge-bookmarks.md`](notes/spatial-memory-overview-and-edge-bookmarks.md) — warm working sets, stable geography, semantic zoom, overview continuity, edge bookmarks, and dynamic salience without relocation.
- [`notes/native-macos-daily-use.md`](notes/native-macos-daily-use.md) — Finder, Safari, System Settings, Spotlight, Mission Control, native window behavior, latency, AppKit/SwiftUI conventions, customization, accessibility, and cats.
- [`notes/browser-terminal-agent.md`](notes/browser-terminal-agent.md) — browser + terminal + source + dev-server + agent interaction through shared object identity, time, causality, executable history, and receipts.
- [`notes/when-100-agents-feel-like-three-decisions.md`](notes/when-100-agents-feel-like-three-decisions.md) — high-concurrency supervision through commitments, exception routing, decision packets, fan-in, exact receipts, and quiet healthy work.
- [`notes/append-only-memory-and-computed-present.md`](notes/append-only-memory-and-computed-present.md) — permissive capture, hybrid retrieval, chronology, contextual metadata, resurfacing, stable anchors, and current-state projections from history.
- [`notes/voice-multimodal-and-disappearing-interfaces.md`](notes/voice-multimodal-and-disappearing-interfaces.md) — voice as text entry, command, and conversation; multimodal repair; interruption; ambient computing; and mixed browser/terminal/agent workflows.
- [`notes/information-first-product-pages.md`](notes/information-first-product-pages.md) — product pages that put specifications, comparisons, diagrams, engineering explanation, useful photography, ownership facts, and credibility in the path of desire.
- [`notes/lovable-jank-and-operational-atmosphere.md`](notes/lovable-jank-and-operational-atmosphere.md) — Dwarf Fortress, Battle Brothers, Mount & Blade, hot flows, muscle memory, thematic chrome, semantic diegesis, and repeated-use lessons for serious software.
- [`notes/authorship-and-product-design.md`](notes/authorship-and-product-design.md) — art, authorship, product constraints, early-team ownership, personality, and expressive experiments in software.

## Nearby work

Tact overlaps with several existing projects from different directions:

- [`terminal-kit`](https://github.com/teamleaderleo/terminal-kit) — terminal ergonomics, cmux customization, interaction, and everyday workspace preferences.
- [`Lazy-Commander`](https://github.com/teamleaderleo/Lazy-Commander) — preserving command evidence while reducing automatic output shown to coding agents.
- [`Cultist`](https://github.com/teamleaderleo/cultist) — selecting repository evidence that can change the next justified action.
- [`Stensibly`](https://github.com/teamleaderleo/stensibly) — durable work, responsibility, authority, continuation, and human attention around concurrent agents.
- [`Glaeda`](https://github.com/teamleaderleo/glaeda) — reusable compute, resident project state, low-latency execution, and recovery.

Tact owns the product-craft question across those threads: **what should the human actually see, touch, understand, and enjoy using?**
