# Tact

**Turning taste into product judgment.**

Tact is a working notebook for developing product and interaction design craft through observation, critique, experiments, and building.

The starting point is simple: having strong taste is useful, but product design asks for another skill — turning "this feels wrong" into a better interaction that survives repeated use, technical constraints, different users, and real consequences.

## Start here

[`WORKBENCH.md`](WORKBENCH.md) is the current synthesis and active experiment queue. It reconciles the scout notes into:

- Leo's current design instincts;
- tensions that should remain unresolved for now;
- the strongest open questions;
- nine experiments worth actually building;
- candidate principles with confidence levels;
- claims that deserve weakening or retirement from the active doctrine.

[`notes/operator-loop.md`](notes/operator-loop.md) is the current answer to **"what should Leo actually do with this lab?"** It turns the built prototypes into short human-use sessions, says which measurements are worth trusting now, and separates Leo's job as a user/test subject from the builders' job maintaining harnesses.

The long notes below are **research evidence, examples, and arguments**. They are allowed to disagree. They should not all be read as simultaneous doctrine.

## Working beliefs

These are intentionally narrower than the first pass. Boundaries and counterexamples live in the workbench.

- **Preserve continuity.** Keep object identity, state, and the path back intact while the viewpoint changes.
- **Show state that helps the current judgment.** Dense expert fields can be excellent; healthy machine activity can stay quiet when an independent audit path remains available.
- **Let fluency accumulate.** Hot paths deserve stable targets, immediate feedback, recoverability, and accelerators that grow from visible or searchable actions.
- **Preserve exact evidence beneath reduction.** Summaries, current-state views, agent decisions, and verification claims should retain a cheap path to receipts and provenance.
- **Put decision-useful truth early.** Facts, constraints, comparisons, mechanisms, and tradeoffs can carry beauty instead of sitting behind presentation ceremony.
- **Make capture cheap; charge organization when it earns its cost.** Private recall, shared coordination, and complete-set inspection have different needs.
- **Let each modality do the job it handles well.** Speech can carry intent while visible interaction carries reference, precision, history, and repair.
- **Character should ride with the work.** Typography, iconography, material, sound, domain language, spatial landmarks, and small eccentricities can create affection with little hot-path cost.
- **Test across several clocks.** Repetition matters, alongside first use, forgotten use, stressed use, rare consequential use, accessibility, and device change.
- **Taste detects; craft resolves.** Diagnose the lever, build alternatives, alter one variable, use the result, and revise the claim.

One useful north star:

> If you notice it, you love it. If you don't, you can just work.

## What belongs here

Use issues and notes for small, concrete hunts:

- critique an interaction that feels wrong;
- study a product that handles something unusually well;
- rebuild one interaction several ways;
- compare information density, hierarchy, typography, motion, voice, or spatial behavior;
- record counterexamples beside attractive principles;
- test whether a visual or interaction change improves actual use;
- collect references worth stealing from browsers, terminals, editors, operating systems, art, games, and physical products.

Prefer a prototype that settles a live disagreement over another essay that restates one.

## Runnable lab

- [`experiments/microcraft/`](experiments/microcraft/) — blind one-variable A/B drills for typography, spacing, alignment, hierarchy, contrast, material, icon weight, density, motion duration, and easing. This is the recurring craft-training loop.
- [`prototypes/microphone-clutch/`](prototypes/microphone-clutch/) — pointer/keyboard vs voice-only vs mixed selection + voice, with deterministic recognition/referent/intent failures and repair-cost instrumentation.
- [`prototypes/causal-debugger/`](prototypes/causal-debugger/) — one-stage causal debugging thread from visible browser failure through runtime, request/log, source, edit, rebuild, replay, and proof; the shared-cause case forces two human tasks to converge on one edit/rebuild and tests task identity against a lower-level causal graph.
- [`prototypes/warm-field/`](prototypes/warm-field/) — cropped edge bookmarks vs scaled mini-windows vs MRU vs search over a persistent warm working set. Useful for informal interaction testing now; timed density claims should wait for the adversarial harness work tracked in issues #28–#31.
- [`experiments/adversarial-attention-compiler/`](experiments/adversarial-attention-compiler/) — executable 100-worker supervision simulator comparing a worker grid, commitment/decision reduction, and the same reduced interface with independent population audit signals for correlated premise failure, retries, verification decline, compute burn, stale-source concentration, and lossy decision fan-in.
- [`experiments/capture-retrieve-handoff-delete/`](experiments/capture-retrieve-handoff-delete/) — Discord-like capture with shallow channels, lexical/semantic/temporal/context retrieval, deterministic complete sets, current-state projections with provenance, export/import handoff, correction, and source/derived redaction and deletion.

The lab is now ahead of the human evidence. Run the prototypes, keep observations compact, and let results change the Workbench before adding more general doctrine.

## Research notes

- [`notes/operator-loop.md`](notes/operator-loop.md) — concrete human-use protocol for the current prototypes: what Leo should run, what to notice, what to defer, and how to record evidence without turning Tact into another job.
- [`notes/starting-points.md`](notes/starting-points.md) — first principles, practice loops, agent-attention questions, and issue-sized exercises.
- [`notes/leo-interface-instincts.md`](notes/leo-interface-instincts.md) — Leo's product preferences across ChatGPT, browsers, games, notes, email, macOS, calendars, car sites, and a first map of competing design values.
- [`notes/contrarian-review.md`](notes/contrarian-review.md) — adversarial review of the doctrine: density, organization, ceremony, disappearance, spatial memory, agent reduction, task identity, append-only history, repeated use, and platform specificity.
- [`notes/taste-to-diagnosis-microcraft.md`](notes/taste-to-diagnosis-microcraft.md) — a micro-craft studio for typography, hierarchy, spacing, alignment, iconography, color, contrast, material, motion, transitions, rhythm, density, and controlled A/B drills.
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
