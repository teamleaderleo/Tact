# Tact

**Turning taste into product judgment.**

Tact is a working notebook for developing product and interaction design craft through observation, critique, experiments, and building.

The starting point is simple: having strong taste is useful, but product design asks for another skill — turning "this feels wrong" into a better interaction that survives repeated use, technical constraints, and real users.

## Working beliefs

These are hypotheses to sharpen through use, not commandments.

- **Make the thing true.** Get the user from A to B with as little unnecessary work as possible.
- **Good interaction can disappear.** When the mechanics are right, the user can simply work. When the product calls attention to itself, that attention should be worth it.
- **Character has to earn its place.** Software can have a strong visual voice. Typography, spacing, motion, density, materials, sound, and omission are all aesthetic decisions; the product still has a job to accomplish.
- **Taste detects; craft resolves.** A strong eye can reject weak work quickly. Product craft means producing alternatives, understanding the tradeoffs, and iterating until one survives contact with use.
- **Repeated use is the real test.** An interaction that feels clever once may feel awful on the hundredth repetition.
- **Attention is scarce.** In agent-heavy software, the useful interface increasingly answers: what changed, what is blocked, what needs judgment, and what can stay quiet?
- **Preserve exact evidence; reduce the automatic view.** Raw logs, output, and history can remain recoverable without occupying the user's or agent's attention by default.
- **Delete round trips before polishing small costs.** Moving computation and evidence closer to the work can beat repeatedly asking remote systems for facts the local environment can already prove.
- **Export repeated cognition into software.** When the same mechanical observation, investigation, or decision keeps recurring, ask whether the environment should perform it automatically.

One useful north star:

> If you notice it, you love it. If you don't, you can just work.

## What belongs here

Use issues and notes for small, concrete hunts:

- critique an interaction that feels wrong;
- study a product that handles something unusually well;
- rebuild one interaction several ways;
- compare information density, hierarchy, typography, or motion;
- record a principle only after examples earn it;
- test whether a visual or interaction change improves actual use;
- collect references worth stealing from browsers, terminals, editors, operating systems, art, games, and physical products.

The goal is to turn aesthetic instinct into repeatable product judgment, without sanding away personality.

## Working notes

- [`notes/starting-points.md`](notes/starting-points.md) — first principles, practice loops, agent-attention questions, and issue-sized exercises.
- [`notes/authorship-and-product-design.md`](notes/authorship-and-product-design.md) — art, authorship, product constraints, early-team ownership, and personality in software.
- [`notes/leo-interface-instincts.md`](notes/leo-interface-instincts.md) — Leo's actual product preferences across ChatGPT, browsers, games, notes, email, macOS, calendars, car sites, and the Thunderdome of competing design values.
- [`notes/lovable-jank-and-operational-atmosphere.md`](notes/lovable-jank-and-operational-atmosphere.md) — Dwarf Fortress, Battle Brothers, Mount & Blade, strategy and immersive interfaces; hot flows, muscle memory, thematic chrome, lovable jank, semantic diegesis, and repeated-use lessons for serious software.
- [`notes/browser-terminal-agent.md`](notes/browser-terminal-agent.md) — a task-centric browser + terminal + source + dev-server + agent environment built around shared object identity, time, causality, executable history, and receipts.
- [`notes/voice-multimodal-and-disappearing-interfaces.md`](notes/voice-multimodal-and-disappearing-interfaces.md) — voice as text entry, command, and conversation; multimodal repair; interruption; ambient computing; mixed browser/terminal/agent workflows; and disappearing-interface experiments.
- [`notes/power-from-seeing-the-field.md`](notes/power-from-seeing-the-field.md) — expert density, spatial memory, labels and icons, command vocabulary, contextual help, panel cost, and repeated-use experiments.
- [`notes/when-100-agents-feel-like-three-decisions.md`](notes/when-100-agents-feel-like-three-decisions.md) — high-concurrency supervision through stable commitments, exception routing, decision packets, fan-in, exact receipts, and quiet healthy work.
- [`notes/append-only-memory-and-computed-present.md`](notes/append-only-memory-and-computed-present.md) — append-only capture, hybrid retrieval, chronology, contextual metadata, resurfacing, stable anchors, and deriving current truth from historical streams.
- [`notes/native-macos-daily-use.md`](notes/native-macos-daily-use.md) — Finder, Safari, System Settings, Spotlight, Mission Control, native window behavior, latency, AppKit/SwiftUI conventions, customization, and cats.

## Nearby work

Tact overlaps with several existing projects from different directions:

- [`terminal-kit`](https://github.com/teamleaderleo/terminal-kit) — terminal ergonomics, cmux customization, interaction, and everyday workspace preferences.
- [`Lazy-Commander`](https://github.com/teamleaderleo/Lazy-Commander) — preserving command evidence while reducing automatic output shown to coding agents.
- [`Cultist`](https://github.com/teamleaderleo/cultist) — selecting repository evidence that can change the next justified action.
- [`Stensibly`](https://github.com/teamleaderleo/stensibly) — durable work, responsibility, authority, continuation, and human attention around concurrent agents.
- [`Glaeda`](https://github.com/teamleaderleo/glaeda) — reusable compute, resident project state, low-latency execution, and recovery.

Tact owns the product-craft question across those threads: **what should the human actually see, touch, understand, and enjoy using?**
