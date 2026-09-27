# cmux sidebar selection: results

## Context

cmux draws the selected workspace in its sidebar as a solid blue row. It ignores the macOS accent color and looks the same whether or not the window is key. [manaflow-ai/cmux#14890](https://github.com/manaflow-ai/cmux/pull/14890) proposed an accent tint instead. Rather than argue one alternative against the control, this page put eight treatments in the ring.

Each card shows the same four-row sidebar twice, window active and window in the background. Each duel re-rolls the arena: one of eight sidebar themes (four light, four dark) and one of eight macOS accent colors, with Increase Contrast as a manual toggle.

## Contenders

| Treatment | What changes |
| --- | --- |
| Accent tint | Accent fill at 20% light, 24% dark (the #14890 proposal) |
| Neutral wash | Grey fill, no accent (Things, Linear) |
| Tint + hairline | Faint accent fill plus a 1px accent edge |
| Raised chip | Lighter surface, no hue (Arc) |
| Muted accent | Accent pulled halfway to grey |
| Solid blue (today) | Current main, the control |
| Accent title | No fill; the title text takes the accent |
| Neutral + accent dot | Grey wash with a small accent marker |

## First run (Leo, September 2026)

| # | Treatment | Elo | W–L–T |
| --: | --- | --: | --: |
| 1 | Tint + hairline | 1625 | 14–0–3 |
| 2 | Neutral + accent dot | 1592 | |
| 3 | Accent tint | 1541 | |
| 4 | Raised chip | 1521 | |
| 5 | Muted accent | 1519 | |
| 6 | Neutral wash | 1457 | |
| 7 | Accent title | 1397 | |
| 8 | Solid blue (today) | 1348 | 0–17–0 |

Only the top and bottom records were kept from the run; the middle rows have Elo only.

## Reading

One voter, one sitting. Treat these as a strong first signal, not a population result.

- **The control lost every bout.** Solid blue went 0–17. Every alternative beat it, so the question was never whether to change, only to what.
- **The winner never lost.** Tint + hairline went 14–0–3. Its ties are the useful part: those are the pairs worth looking at again.
- **Accent plus structure beat accent alone.** The top two both carry the accent in a small, precise element (a 1px edge, a dot) over a quiet fill. The proposal's plain tint came third. The hairline gives the row a shape without raising the fill, so the selection stays legible on dark themes and with loud accents like yellow.
- **The runner-up is ruled out on principle.** Neutral + accent dot scored well, but it spends the leading glyph slot of the row on "this is selected". In cmux that slot belongs to status symbols that mean something: agent state, unread, warnings, PR state. Selection should change the row's surface (fill, edge) and leave the glyph slots to status. The vote measured what looks good in isolation; this is a constraint the mock did not show, and it still decides.
- **Hue-free treatments landed mid-table.** Raised chip and neutral wash read as calm, but they drop the link to the system accent that the top three keep.
- **Accent title** was near the bottom: color on text alone is too thin a signal at sidebar sizes.

## Decision

Tint + hairline, the top pick and a surface-only treatment, is being shipped in [manaflow-ai/cmux#14890](https://github.com/manaflow-ai/cmux/pull/14890).

**Unresolved:** the light and dark split columns were not recorded from this run. The next run should record them, plus a few duels with Increase Contrast on, before treating the hairline as settled for both appearances.

## Rerun

```bash
node ../../build.mjs .
open index.html
```

Publish `index.html` with `capabilities: { "db": {} }` to collect shared votes (see [`../../README.md`](../../README.md)).
