## 1. Issues

I judged from the boards and reference stills alone. I didn't crop or zoom, so pixel measurements are estimates read off the 2000 px downscale.

**A**
1. The new-chat strip and the queued strip use different surface logic. New chat is a hairline-only tab with no fill, tucked behind the card. Queued is a solid grey-filled tab. The slot changes character when the chat starts.
2. On new chat the hairline tab is nearly the page colour. In Latte and Apple light the strip is barely distinguishable from the background, so it looks like the card has a header row rather than a separate strip. In Mocha and Apple dark the outline is very faint.
3. The tab is inset about 8 px at 760 and about 8 px at 380 each side, but the text inside it is not aligned to the card's text column. The "cmux" icon sits at about x=31 while the card's "+" and placeholder are at about x=31. This is fine, but the queued numerals are indented to about x=1051 against the card text at about x=1034, so alignment differs between states.
4. The queued fill is a mid grey in Latte and Apple light. It is heavier than the card and stronger than the prompt it sits above, which breaks "never louder than the prompt".
5. At 380 px the tab corners and the card's overlapping corners get tight. The strip is still readable, and the machine collapses to its icon correctly.

**B**
1. There is no container, fill or edge. The strip is loose text floating above the card, so it doesn't read as belonging to the composer. It reads as page content.
2. In queued state, items 1 and 2 float as bare text with no containment. They could be mistaken for transcript messages or a caption rather than queued prompts. This is the weakest affordance for the queued job.
3. The gap between strip and card is about 12 px. It is roomy, so height is spent on empty space instead of a surface.
4. Positive: text is aligned exactly to the card's text column (numerals at about x=1035, card text at about x=1034), and there are no near-miss edges because there are no edges.
5. The pickers have no hit-area cue (no fill or edge). They don't look like pickers, especially in dark themes.

**C**
1. The new-chat strip is the same hairline tab as A, with the same low presence in light themes.
2. In queued state the card's top corners appear squared off where the strip tucks behind it. The card's radius changes between states, a clear near-miss with the card's own bottom corners.
3. The queued strip is inset about 14 px against the card's edge, and the card's flat top edge runs wider than the strip. This leaves a stepped shoulder that looks like a rendering bug.
4. It has the same fill-versus-hairline state inconsistency as A.
5. The square top corners are most visible in Mocha and Apple dark, where the lighter card against a dark page makes the hard corner stand out.

**D**
1. The strip is filled in both states, as a tab behind the card with rounded top corners and the card overlapping it. One surface logic carries both new chat and queued, and it is close to one of the reference composers.
2. The new-chat strip's text is indented about 5 px from the card text column. The "cmux" icon is at about x=36 against the card's "+" at about x=31. It is intentional inset, but not on the card's column.
3. The grey fill is fairly heavy in Latte and Apple light. It is slightly louder than the placeholder text, though the placeholder is intentionally dim.
4. At 380 px the fill carries the machine icon and the branch cleanly. The tab is only about 26 px tall, so density cost is low.
5. The strip's bottom edge is hidden under the card with no visible seam, which is clean. The 8 px side inset is consistent, and the radii nest properly.

**E**
1. The strip is a detached, fully rounded bar with a hairline, floating about 4–5 px above the card. That tiny gap is a near-miss: neither flush nor clearly separated. It reads as a second, competing control bar.
2. The strip is inset about 8 px at 760 and about 15 px at 380 relative to the card. Together with the gap, the edge relationships are close but not equal, so nothing lines up cleanly.
3. The height cost is the highest of the five: strip height plus the gap, with nothing tucked under the card.
4. The queued variant is a detached filled box with all four corners rounded and a visible gap. The new-chat bar is outlined and the queued box is filled, so the same state-inconsistency problem as A applies.
5. In dark themes the double hairline (strip edge, gap, card edge) looks busy. In Mocha the strip fill vanishes into the page.

## 2. Scores

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 6 | 5 | 8 | 6 | 6 | 6 |
| B | 4 | 8 | 7 | 7 | 6 | 5 |
| C | 6 | 3 | 8 | 6 | 3 | 6 |
| D | 9 | 9 | 9 | 8 | 8 | 9 |
| E | 6 | 4 | 5 | 6 | 4 | 5 |

**Winner: D.** A filled tab tucked behind the card, with rounded top corners, an 8 px side inset and a shared fill in both states, reads as "this composer's context" and costs only about 26 px of height. The same mechanism carries both the location strip and the queued prompts, and it echoes one of the reference composers.

```json
{"judge":"claude-sonnet-5-5","issues":["A: new-chat strip is hairline-only (no fill) while queued strip is solid grey fill, so the slot changes surface logic between states","A: outline-only strip is nearly invisible against the page in Latte and Apple light, reading like a card header row","A: queued fill is a heavy mid-grey in light themes, louder than the prompt","B: no fill or edge; strip is loose text that does not read as belonging to the composer","B: queued prompts float as bare text and could be mistaken for transcript messages","B: pickers have no hit-area cue; gap about 12 px spends height on empty space","C: card's top corners appear squared where the queued strip tucks behind, a radius near-miss against the card's rounded bottom","C: queued strip inset about 14 px with the card edge wider, leaving a stepped shoulder","C: same hairline-vs-fill state inconsistency as A, and weak presence in light themes","D: strip text is indented about 5 px from the card's text column (icon at about x=36 vs card at about x=31)","D: grey fill is fairly heavy in Latte and Apple light","E: strip detached about 4-5 px above the card, a near-miss gap that reads as a second control bar","E: strip inset (about 8 px at 760, about 15 px at 380) does not match card edges; highest height cost","E: new-chat is an outlined bar and queued is a filled box, so surface logic differs between states; double hairline looks busy in dark themes"],"scores":{"A":{"clarity":6,"consistency":5,"density":8,"theme_fit":6,"polish":6,"references":6},"B":{"clarity":4,"consistency":8,"density":7,"theme_fit":7,"polish":6,"references":5},"C":{"clarity":6,"consistency":3,"density":8,"theme_fit":6,"polish":3,"references":6},"D":{"clarity":9,"consistency":9,"density":9,"theme_fit":8,"polish":8,"references":9},"E":{"clarity":6,"consistency":4,"density":5,"theme_fit":6,"polish":4,"references":5}},"winner":"D","why":"D uses a filled tab tucked behind the card with rounded top corners, a consistent side inset and the same fill in new-chat and queued states, so the strip reads as part of the composer, carries both content types, stays about 26 px tall and holds up in all four themes and at 380 px."}
```
