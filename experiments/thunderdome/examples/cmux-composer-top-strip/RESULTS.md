# Composer top strip (2026-10-15)

A cross-model Thunderdome of how the cmux NEXT agent composer attaches its **top strip** to the composer card.

- **Surface.** On a new chat the top strip is the location strip: folder · machine · branch pickers. On a started chat the same slot holds the queued prompts, so one style has to carry both states.
- **Contenders.** They differ only in how the strip attaches to the card (fill, edge, width, gap).
  - **default:** shipped.
  - **bump** and **plain:** behind an app Debug toggle, `agentPane.debug.topStripStyle` (cmux PR #20984).
  - **hairline:** judge CSS. The strip becomes the card's top zone.
  - **tray:** judge CSS. A filled tray tucked under the card.
- **Renders.** Every still is a real gallery render of entry `agent-pane.composer-strip` at 2x. Themes: Catppuccin Latte, Apple System Colors light, Catppuccin Mocha and Apple System Colors dark, one row each. Columns: 760 px new chat, 380 px new chat, 760 px queued, 380 px queued.
- **Boards.** `board-<variant>.png`. These are the blind boards the judges scored, so each cell still carries its letter tag:

| Letter | Variant |
|---|---|
| A | default (shipped) |
| B | plain |
| C | hairline |
| D | tray |
| E | bump |

The key is also in `panel/key.json`.

**References.** The judges also saw a few dark-theme composer stills from other agent apps, for the "references" criterion. They were not contenders, and none of them are published here. Every image in this folder is a cmux render.

## Panel

Same four judges and levels as the compact composer round (see that dome's RESULTS.md for why each level): `claude-opus-5-5` high and `claude-sonnet-5-5` high via acpmux `claude-sr`, and `gpt-6.1-sol` high and `gpt-6-astra` xhigh via `sr codex exec -i`. Judges were blind (letters shuffled).

Each judge wrote its issue list first, then scored each contender 1-10 on six criteria (clarity, consistency, density, theme fit, polish, references), for 60 per judge, then named a winner with the mechanism. The prompt and the four raw answers are in `panel/`.

## Scores (sum of six criteria, /60 per judge, /240 total)

| Variant | Opus | Sonnet | Sol | Astra | Total | Wins |
|---|---:|---:|---:|---:|---:|---|
| **tray** | 46 | 52 | 37 | 50 | **185** | **3** (Opus, Sonnet, Astra) |
| plain | 45 | 37 | 41 | 45 | 168 | 0 |
| default (shipped) | 38 | 37 | 47 | 44 | 166 | 1 (Sol) |
| hairline | 32 | 32 | 42 | 40 | 146 | 0 |
| bump | 30 | 30 | 38 | 39 | 137 | 0 |

## Verdict

1. **Tray wins (3-1).** A filled tray tucked under the card, with the same fill in new chat and queued, reads as one secondary surface owned by the composer. It stays quieter than the prompt, keeps the card's rounded silhouette, and leaves no parallel hairlines. Sol was the dissent: it preferred the shipped default and read the tray as a floating pill.

2. **Bump is last.** Its 4-5 px gap between strip and card leaves two parallel hairlines that are neither flush nor clearly separate, so the strip reads as a second control bar.

3. **Plain is a close second on score but loses on ownership.** With no surface, the strip floats on proximity alone, and the queued prompts can read as the tail of the transcript.

### Fixes before tray ships

- **Text column.** The folder icon sits about 5 px right of the prompt text column (Opus, Sonnet, Astra).
- **Light-theme fill.** The fill is heavy in Latte and Apple light, and reads as a grey toolbar at 760 px (Sonnet, Sol, Astra).
- **Inset differs between states.** About 7 px on new chat against about 14 px when queued (Sol, Astra).
- **Queue numbers.** They start 18-20 px right of the prompt column (Opus, Astra). Align them with the card's text column.

### Bug in plain

- **A stray stroke** a few px tall sits above both of the card's top corners in light themes (Astra; confirmed in the renders). Fix it whether or not plain ships.

## What the round taught

- **The first render pass was invalid.** It used a fixture with no top strip, so all five variants rendered identically. Render the strip's own gallery entry (`agent-pane.composer-strip`), and look at every cell before a board goes to the judges.
- **The queued state needs a taller frame** (440 px). The transcript pushes the composer down, and a shorter frame crops the strip.

Files:
- `board-*.png`: the five blind boards, named by variant.
- `panel/`: prompt, key and the four raw answers. Mentions of the reference stills were generalized; the stills themselves are not included.
