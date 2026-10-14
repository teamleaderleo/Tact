# New Tab Thunderdome: results

The cmux NEXT New Tab page (Cmd-T), `agent-pane.new-tab` / `calm-default` from the webviews gallery at
feat-cmux-next `ee8d80672c35`. Every image is the real page with one CSS override injected, shot in
headless Chrome at 2x. Each contender changes **one lever** from the shipped page. Arena: Apple System
Colors Light/Dark, Catppuccin Latte/Mocha.

**How the votes were cast:** 40 blind A/B pairs (every pair in every theme), each judged by two lenses
(Apple-native craft; skeptical heavy user), for 80 votes. **These votes are not blind.** The round ran in a
fork that could not start judge subagents, so the lane cast both lenses itself after seeing the labels.
The blind pair images and key are in `~/Projects/design-judge/bouts/nt-j*` and `.key/nt-key.json`. Treat this
table as one opinionated judge until blind judges or Leo re-vote in the dome.

## Raw reaction (shipped)

- Light: the grey slab is the first thing I see, and it reads as a disabled field with a blur under it.
  The page is white and the box is darker than it.
- The harness mark sits far right next to the age. To learn which agent a chat belongs to, the eye crosses about
  650pt from the title.
- The style switch at the bottom shows **native radio circles**. They look like a web form leaking into the chrome.
- "New chat" sits next to a box whose whole job is starting a chat.
- Spacing, copy and density are otherwise fine: terse, Codex-like, nothing to cut.

## Diagnosis

| Lever | What's wrong | Cause |
| --- | --- | --- |
| Box surface | figure is darker than ground in light, so the box reads as disabled | `--acpmux-composer-bg: color-mix(text 13%, page)` darkens in light and lightens in dark: one token whose sign flips with the theme |
| Row geometry | the agent identity is out of reading order | `.nt-cards[data-variant=list] .nt-card-meta{order:3;margin-left:auto}` |
| Style switch | radio inputs render | `.ui-sr-only` is defined in `ui/ui.css`, which the agent pane does not load (see `conversation.css:2062`) |
| Create row | duplicate path | "New chat" next to a chat box |

## Standings

| # | Page | Elo (all) | W–L–T | Light | Dark |
|---:|---|---:|---:|---:|---:|
| 1 | Mark leads row | 1714 ±100 | 26–6–0 | 1664 | **1744** |
| 2 | Switch without radios | 1669 ±91 | 24–8–0 | 1584 | **1744** |
| 3 | Lifted box | 1543 ±99 | 16–12–4 | **1748** | 1338 |
| 4 | No New chat | 1287 ±98 | 6–26–0 | 1252 | 1338 |
| 5 | As shipped | 1287 ±88 | 4–24–4 | 1252 | 1338 |

Overall, "Mark leads row" vs "Switch without radios" is too close to call (72%). The split is the finding:
**Lifted box wins light outright (14–2) and is a tie with shipped in dark.** It is the same lever and the
same result as the composer dome (`../cmux-composer/`).

## Judge notes (representative)

- Lifted, light: "the box reads as paper to type on; the shipped grey slab plus 32px blur reads as a disabled field"
- Lifted vs shipped, dark: "in dark the box surfaces are indistinguishable; the shipped shadow barely registers"
- Mark leads: "the harness mark next to the title gives each row a scannable left edge"
- Switch: "native radio circles in the style switch look like a web form leaking into the chrome"
- No New chat, losing: "dropping New chat removes the only no-typing way to open an empty chat; the redundancy is cheap"

## Verdict

```text
Keep:    layout, copy, density, the create row including New chat.
Change:  hide the style switch's radio inputs (bug, ship now);
         box surface lighter than the page in light (white 82% over page, .5px rim 13%, 1/2 + 3/12 shadows at 6%),
         shared with the composer card so both surfaces use one token;
         harness mark leads the chat row, age stays a fixed right column.
Reject:  removing New chat (it costs the no-typing path, gains one word of quiet).
Unresolved: mark-leads vs Leo's 10-13 call that the age column keeps the icon still; leading the mark keeps
         it still too, but confirm with Leo. Blind re-vote needed before quoting numbers.
```

The named lever: **figure/ground sign.** A fill made by mixing in the text color gets darker in light and lighter
in dark, so the same token reads as a raised card in dark and a sunken, disabled well in light. Mix toward
white in light themes instead.

## Blind re-run (supersedes the table above)

Two blind judges re-voted the 40 pairs without the key (`votes-blind.json`):

## New Tab Thunderdome

| # | | Elo | W–L–T |
|---:|---|---:|---:|
| 1 | Mark leads row | 1723 ±133 | 14–2–0 |
| 2 | Switch without radios | 1569 ±96 | 10–6–0 |
| 3 | Lifted box | 1534 ±148 | 9–7–0 |
| 4 | As shipped | 1357 ±115 | 4–12–0 |
| 5 | No New chat | 1318 ±121 | 3–13–0 |

Mark leads row and Switch without radios are too close to call: 93% of resamples put Mark leads row ahead.

**Verdict, blind:** agrees with the fork on every call.
- Lead each chat row with the harness mark. You scan down the left edge, and the right edge stays the age column.
- Hide the native radios in the style switch. This is a bug: `ui-sr-only` is not loaded in the agent pane.
- Lift the box, the same lever as the composer.
- Keep "New chat" (3–13 when removed).
