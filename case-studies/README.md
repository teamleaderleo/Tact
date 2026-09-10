# Applied case studies

This directory is for **real product work**: one interaction, one judgment, one concrete alternative, and enough evidence that somebody else can see and argue with the decision.

Use [`../APPLIED.md`](../APPLIED.md) for the full method.

## Default case file

Keep the write-up proportional to the problem. A tiny interaction may need only a screenshot and a page of notes.

```md
# <product / interaction>

## Context

Product, device, workflow, frequency, user goal.

## Current interaction

Exact sequence, screenshot/recording/sketch, relevant implementation details.

## First reaction

Write the unsanitized perception first.

## Diagnosis

Name the exact lever(s): hierarchy, continuity, density, latency, spatial memory, attention, modality, material, typography, consequence, etc.

## Alternatives

### Current

### Minimal correction

### Stronger reinterpretation

Show the difference when possible.

## Use notes

What happened after actually trying/repeating it?

- hesitation;
- context loss;
- visual scan;
- repeated-use friction;
- learned fluency;
- alternative actions the user reached for;
- smaller-screen / accessibility / consequence boundary when relevant.

## Judgment

**Keep:**

**Change:**

**Reject:**

**Unresolved:**

## Vocabulary earned

What can now be said more precisely than “this feels good/bad”?

## Tact update

Which belief got stronger, weaker, or narrower?
```

## Artifact rule

Whenever possible, keep the thing being discussed close to the case:

```text
case-studies/<slug>/
  README.md
  current.png
  alternative-a.png
  alternative-b.png
  prototype/        # only when code is useful
  observations.md   # only when repeated use earns more notes
```

Images are optional. Code is optional. **A visible comparison is strongly preferred.**

## CMUX-adjacent queue

Good first cases because they overlap with Leo's real daily use and the upcoming CMUX conversation:

1. **Sidebar density / width** — how narrow can CMUX remain useful while preserving hierarchy, titles, state, and scanability?
2. **Overview -> focus -> return** — can a user dive into one terminal/task and return without reconstructing where everything was?
3. **Warm task presence** — what should remain partially visible or spatially stable when several tasks are active?
4. **What needs me?** — which agent/terminal events deserve foreground attention, and what can collapse into quiet state?
5. **Terminal output -> result** — how should exact command evidence coexist with a terse default result?
6. **Browser + terminal continuity** — what would it mean for a browser observation and terminal/source action to remain one causal thread?
7. **Command discovery** — visible actions, command palette, keyboard accelerators, and CLI should teach one another instead of becoming separate vocabularies.
8. **Native Mac character** — where can typography, translucency, animation, sound, naming, or tiny eccentricities make CMUX more lovable without charging a repeated-use toll?

Do not assume these require product changes. Start by observing the real interaction closely.

## Current CMUX applied work

- [`cmux-native-macos-daily-use/`](cmux-native-macos-daily-use/) — four repeat-use native-Mac seams: titlebar/window ownership, file Quick Look, pane selection versus focus, and Accessibility focus. Includes side-by-side SVG alternatives plus notes on native sheets, menus, drag/drop, restoration, materials, and motion.
- [`cmux-causal-selection-handoff/`](cmux-causal-selection-handoff/) — one real browser-visible failure (#10965), the existing React Grab terminal round-trip, and a working mock of a durable selection receipt through request/source/edit/build/verification.
- [`cmux-spatial-interactions/`](cmux-spatial-interactions/) — three live CMUX interaction cases around notification reorder, agent triage versus stable return, and cross-workspace switcher identity.
- [`cmux-precedent-hunt/`](cmux-precedent-hunt/) — seven product precedents selected for transferable mechanisms, plus CMUX-adjacent sketches for semantic scrollback, a task-scoped causal cursor, and an operational overview.

## Other useful case sources

If a non-CMUX product provokes a strong reaction, capture it while the reaction is fresh. Good recurring sources include ChatGPT mobile, Edge vertical tabs, Safari, Outlook, macOS Settings, Discord, YouTube, games, calendars, spreadsheets, and technical product pages.

The value is in the transfer: a well-understood Outlook or Dwarf Fortress interaction can teach something useful about a terminal workspace if the underlying job is actually similar.