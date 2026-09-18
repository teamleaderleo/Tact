# cmux visit — what to show, what to say

Running order comes from Tact [#67](https://github.com/teamleaderleo/Tact/issues/67). **Their problem beats prepared material.** Everything in this directory is supporting evidence for a conversation, not the conversation.

If you read one thing before walking in, read this file. The pages behind it are §6 material — pull them when the topic arrives, not to fill time.

---

## The order

| # | slot | what you actually show | when to use it |
| --- | --- | --- | --- |
| 0 | **Their workflow** | nothing — you ask | always, first |
| 1 | **Your cmux + the sidebar** | the running app | always |
| 2 | **Primary object** | a question | always |
| 3 | **Navigation vs attention** | a thesis | once 1–2 are alive |
| 4 | **Extensibility** | terminal-kit + the fork | if customization comes up |
| 5 | **Build loop** | [`build-loop.md`](build-loop.md) | if it turns engineering-heavy |
| 6 | **Small craft cases** | the pages below | only if the topic arrives |

Short visit: 0, 1, 2. That is a useful meeting on its own.

---

## 0. Their workflow

No artifact. Ask, then follow the thread.

- What stays open all day?
- What do you jump between?
- What do you re-check by hand because cmux does not surface it?
- What have you customized internally that the product does not do?
- What annoys you right now?
- What is cmux in a year?

If they name a real problem, stop running this list and work that problem. Capture it in a [#67](https://github.com/teamleaderleo/Tact/issues/67) comment using the template at the bottom of that issue.

## 1. Your cmux + the sidebar — the lead

**Show:** the running app, used normally. Not a slide, not a diff. Screenshots, demo steps and the launch command: [`fork-sidebar.md`](fork-sidebar.md).

The fork's work: [cmux#57](https://github.com/teamleaderleo/cmux/pull/57) — one sidebar over Claude, Codex and OpenCode, open tabs above searchable history, plus a collapsible Spaces navigator that groups live tabs by their actual tile. Demonstrate the behavior; do not tour the diff (173 files).

**Say:** "I use it all day, the sidebar is where the day happens, so that's where I started changing things."

**Ask:** **When you use cmux all day, what is the thing you think you are navigating?**

Backing if they want detail: [`sidebar-density.md`](sidebar-density.md) (two screenshots one config flag apart), Tact [#61](https://github.com/teamleaderleo/Tact/issues/61).

## 2. Primary object

The highest-value product question behind everything else.

Candidates cmux currently organizes by: workspace, surface, conversation, project, agent, delegated task.

**Ask:** **Which identity should survive switching, restore, history and handoff?**

If they have a strong answer, use it to kill or redirect the fork work. Related: Tact [#36](https://github.com/teamleaderleo/Tact/issues/36), [#37](https://github.com/teamleaderleo/Tact/issues/37), [#39](https://github.com/teamleaderleo/Tact/issues/39), [#54](https://github.com/teamleaderleo/Tact/issues/54).

## 3. Navigation vs attention

Navigation: where is the thing I already know? Attention: what needs me now? Different jobs, currently one list.

**Say:** "Keep the work context. Keep the receipts. Surface the few moments that need a person."

**Ask:** **With 20–100 pieces of delegated work alive, how should the human know which two deserve judgment?**

Related: Tact [#52](https://github.com/teamleaderleo/Tact/issues/52), [#55](https://github.com/teamleaderleo/Tact/issues/55), [#40](https://github.com/teamleaderleo/Tact/issues/40), [#61](https://github.com/teamleaderleo/Tact/issues/61).

## 4. Extensibility

The concrete version of this question is on the table already: everything useful I built needed either a core fork or terminal-kit.

**Ask:** **Which parts of how I use cmux should be possible without carrying a core fork?**

Their internal setup is the interesting half of this answer. Related: Tact [#45](https://github.com/teamleaderleo/Tact/issues/45), [#47](https://github.com/teamleaderleo/Tact/issues/47), [#48](https://github.com/teamleaderleo/Tact/issues/48), [#49](https://github.com/teamleaderleo/Tact/issues/49), [#62](https://github.com/teamleaderleo/Tact/issues/62); [`default-config.md`](default-config.md).

## 5. Build loop

**Show:** [`build-loop.md`](build-loop.md) — 58 real receipts from writing the sidebar work, not a benchmark.

**Ask:** **What is your actual edit → build → launch → see-it loop internally?**

Glaeda gets one sentence unless they ask: keep the hottest reusable build state whose identity and validity can be proved. Related: Tact [#63](https://github.com/teamleaderleo/Tact/issues/63), [#44](https://github.com/teamleaderleo/Tact/issues/44).

## 6. Small craft cases

Supporting examples. Use the one that matches what they are already talking about.

| page | one-line version | issue |
| --- | --- | --- |
| [**accessibility-labels**](accessibility-labels.md) | every surface tab-bar button announced its SF Symbol name; found live, traced, patched, verified against two builds | [#64](https://github.com/teamleaderleo/Tact/issues/64) |
| [**shortcut-namespace**](shortcut-namespace.md) | An agent pass called a defect that was not one — cmux already implements the VS Code `when`-clause model | [#59](https://github.com/teamleaderleo/Tact/issues/59) |
| [**appdelegate-ownership**](appdelegate-ownership.md) | a third of `AppDelegate.swift` is `#if DEBUG`; the seam is the UI-test harness, not the line count | [#60](https://github.com/teamleaderleo/Tact/issues/60) |
| [**default-config**](default-config.md) | no way to say "pin this to today's default" | [#62](https://github.com/teamleaderleo/Tact/issues/62) |

Strongest of the four is accessibility-labels: it is a complete loop with a patch attached ([bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1)) and it takes thirty seconds to explain.

---

## Numbers, exactly

Quote these and nothing rounder.

| claim | number | source |
| --- | --- | --- |
| warm app rebuild | median **32s** (n=32, min 22s) | [`build-loop.md`](build-loop.md) |
| cold / new cache generation | median **~19 min** (1,157s), worst **34 min** (2,019s) | same |
| receipts behind both | **58**, 2026-09-12 → 09-15 | [`evidence/build-times.py`](evidence/build-times.py) |
| `AppDelegate.swift` inside `#if DEBUG` | **32.4%** (6,594 of 20,325) | [`evidence/appdelegate.py`](evidence/appdelegate.py) |
| named test scaffolding in that file | **72 members / 2,749 lines**, 71 gated | same |
| default chords | **128 over 43 keys**; 13 chords carry 2 actions | [`evidence/shortcuts.py`](evidence/shortcuts.py) |
| sidebar detail flags defaulting on | **9** | [`evidence/config-drift.py`](evidence/config-drift.py) |
| tab-bar buttons announcing an icon name | **7 of 7**, now fixed | [`evidence/ax-buttons.swift`](evidence/ax-buttons.swift) |

"About half a minute warm, twenty to thirty-five minutes cold" is the safe spoken version.

**Baseline for every measurement:** `manaflow-ai/cmux` at `e9ec596d1`, 2026-09-17.

## What stays out unless asked

- [cmux#58](https://github.com/teamleaderleo/cmux/pull/58) — the 4,239-commit upstream sync. It is real work and it is not a demo.
- Glaeda internals.
- Line-count archaeology as an argument in itself.
- The Tact research program, the prototype list, the issue backlog.
- A feature tour of anything.

## Reproducing the evidence

```bash
cd evidence
python3 shortcuts.py     ~/Projects/cmux
python3 appdelegate.py   ~/Projects/cmux
python3 config-drift.py  ~/Projects/cmux ~/.config/cmux/cmux.json
python3 build-times.py   ~/Projects/cmux
```

Standard library only. Each script parses files and prints a table; none build, launch or modify anything.

The live accessibility probe reads a running app and presses nothing:

```bash
swiftc -O ax-buttons.swift -o ax-buttons
./ax-buttons $(pgrep -f "cmux.app/Contents/MacOS/cmux" | head -1)
```

Screenshot method for the sidebar pair: `tk customization off|on` to flip config (cmux hot-reloads it), then `screencapture -x -o -l<window-id>` by window id so the window is never raised or resized.
