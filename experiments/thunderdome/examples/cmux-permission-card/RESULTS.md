# Permission card: results

**Surface:** the cmux NEXT agent-pane permission card. This is the gallery entry `agent-pane.permission-panel`, state `pending`: two grouped tool requests from one turn. Source is `feat-cmux-next` `ee8d80672c35`.

**Method:** the real React component, rendered in headless Chrome at 2x. Each contender adds one injected CSS override and nothing else. There are 40 bouts across 4 themes (Apple System Colors Light/Dark, Catppuccin Latte/Mocha), with the pairs shuffled and A/B randomized.

**Caveat:** two judging passes, 20 bouts each. j1 used an Apple-native lens on the Apple themes; j2 used a heavy-user lens on Catppuccin. Both passes were run by the same agent that wrote the variants, so the votes are not blind in the way the composer dome's were. Lens and theme are also confounded (j1 judged only the Apple themes, j2 only Catppuccin). Treat the order as strong and the gaps between ranks 2-4 as noise. Leo's votes on the page are the real test.

## Standings

| # | | Elo | W–L–T |
|---:|---|---:|---:|
| 1 | All three | 1840 ±110 | 16–0–0 |
| 2 | No Expand button | 1531 ±117 | 9–7–0 |
| 3 | Terse | 1457 ±104 | 7–9–0 |
| 4 | Ranked buttons | 1457 ±128 | 7–9–0 |
| 5 | As shipped | 1214 ±126 | 1–15–0 |

All three is ahead of No Expand button in 99% of resamples.

## Raw reaction

"This is a debug form, not a question." The card asks the right question, but in the shipped version you read three lines of header, a bordered button and a sentence of policy before you reach two identical black slabs.

## The levers

1. **Consequence-ranked buttons.** Shipped, "Allow once" and "Allow for this chat" are both filled accent, so the wider, standing grant looks exactly as safe as the one-shot one. Making Allow once primary and Allow for this chat tonal puts the consequence into the button's weight, which is how Codex and Claude prompts read.
   - Split finding: j1 (Apple themes) took Ranked 6–2. j2 (Catppuccin) put it last, 1–7.
   - The reason recurs in the j2 notes: in **Latte**, a text-9% tonal button with Latte's muted text reads as *disabled*.
   - So ranking wins only when the secondary still reads as a live button.
2. **The redundant control.** "Expand details" duplicates the row disclosure triangles. Shipped, it renders as a browser-default bordered box in light and a grey slab in dark, and either way it is a third button-weight object above the real choice. Removing it never lost a bout against the shipped card.
3. **Copy weight.** "ACP requests only · Isolation unverified" is implementation jargon in the title block. The scope sentence ("Allow for this chat also approves future eligible requests…") explains a consequence, so it is worth keeping but not as a standing line of body text. j1 penalized dropping it when nothing else changed.
   - Correction: put the scope sentence in the Allow for this chat button's tooltip and the coverage line in the lock icon's tooltip. Don't just hide them.

The stack won every bout (16–0) because the three levers compound into one property: **the ask is the first thing you see, and the default answer is the brightest thing on the card**. On its own, each lever buys only a little.

## Cross-surface note

In Apple System Colors Light, the card's fill is darker than the white page: a grey slab on white. This is the same text-tinted-fill sign flip found on the composer (`color-mix(var(--agent-text) N%, …)` darkens in light themes). It looks like one token problem across agent-pane cards, not a per-surface one.

## Verdict

- **Keep:** the grouped card, the per-row disclosure, and Deny as plain text.
- **Change:**
  - Allow once becomes the only filled button.
  - Allow for this chat becomes a tonal secondary with a hairline rim, so it can't read as disabled in Latte.
  - Delete the Expand details button.
  - Move the coverage line to the lock icon's tooltip and the scope sentence to the secondary button's tooltip.
- **Reject:** two equal filled primaries, and the browser-default bordered button.
- **Unresolved:**
  - Should the secondary be tonal or outlined? It needs a Latte/Solarized check with the rim added.
  - Should the collapsed row show the actual command in mono (Codex does)? This needs a markup change, not CSS, so it wasn't tested here.
  - Heavy users may *want* Allow for this chat as the fast path. That argues for a key hint (⌥↩), not for equal weight.

## Winning CSS (as tested)

```css
.acpmux-permission-panel .acpmux-permission-surface .acpmux-permission-buttons button:nth-child(2) {
  background: color-mix(in srgb, var(--agent-text) 9%, transparent);
  color: var(--agent-text);
  border: 0;
}
.acpmux-permission-panel .acpmux-permission-surface > button { display: none; } /* Expand details */
.acpmux-permission-panel .acpmux-permission-surface .acpmux-permission-coverage,
.acpmux-permission-panel .acpmux-permission-surface .acpmux-permission-scope { display: none; }
```

The ship version should add `box-shadow: inset 0 0 0 .5px color-mix(in srgb, var(--agent-text) 18%, transparent)` to the secondary. Removing the button and moving the copy into tooltips belongs in `permissions/Panel.tsx`, not in CSS.

## Blind re-run (supersedes the table above)

The table above came from the fork that built the dome. It judged its own variants knowing which was which. Two blind judges (Apple-native, heavy daily user) then re-voted the same 40 pairs without the key (`votes-blind.json`):

## Permission Card Thunderdome

| # | | Elo | W–L–T |
|---:|---|---:|---:|
| 1 | No Expand button | 1749 ±119 | 14–2–0 |
| 2 | Ranked buttons | 1705 ±130 | 13–3–0 |
| 3 | As shipped | 1467 ±124 | 7–9–0 |
| 4 | All three | 1428 ±110 | 6–10–0 |
| 5 | Terse | 1151 ±124 | 0–16–0 |

No Expand button and Ranked buttons are too close to call: 67% of resamples put No Expand button ahead.

**Verdict, blind:** the stack lost (6–10). The tersifying is what sank it: hiding the scope sentence went 0–16. "Allow for this chat also approves future eligible requests" is the only thing on the card that makes the bigger grant read as bigger, and both judges called it the deciding element.

- **Change:** drop the "Expand details" button (14–2). It duplicates the row disclosure triangles and renders as a default bordered box in light.
- **Change:** rank the buttons (13–3). "Allow once" is the one filled button; "Allow for this chat" is secondary. In light the 9% tonal secondary reads as disabled, so it needs the .5px rim.
- **Keep:** the scope sentence and the coverage line, on the card.
- **Reject:** moving the copy into tooltips.

Lever: a consequence needs a visible signal on the card. Button weight orders the choice; the sentence explains the cost. Weight alone made the bigger grant look like the smaller one.
