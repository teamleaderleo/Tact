I judged from the five boards at the size they display, 2000 px wide, about 2.3× smaller than the originals. I couldn't crop or zoom them because the shell command was declined. Pixel offsets below are in that downscaled space (×2.3 for the source). Effects under one hairline wide are at the limit of what I could see.

## 1. Issues

**Shared by all:** A, C and D use the same queued strip, an inset grey tab. In all three, row number "1" sits about 18 px (≈20 pt) right of the card's "Do anything" text column, so the queued text does not line up with the prompt.

**A: inset outlined tab, attached**
1. The two states use different logic. The new-chat tab is a hairline with almost no fill; the queued tab is a solid grey fill. Moving from new chat to started chat changes the material, not just the content.
2. The tab's side hairlines meet the card's top hairline, which leaves two small T-junctions about 8 px in from each card corner. This shows most in Latte and Apple light, where the two hairlines have near-identical but not equal contrast.
3. In Mocha and Apple dark the tab's empty fill matches the page background, so the strip reads as an outline drawn on nothing and is weak to find.
4. In the new-chat tab, the top radius looks smaller than the card's radius (concentric is fine, but it reads a little tight). Folder-icon alignment with the card text is good: x≈32 against 31.

**B: plain, no surface**
1. Belonging depends on proximity alone. About 13 px of empty space separates the strip text from the card's top edge, and nothing ties the two together.
2. Queued state: "1 Then add a test… / 2 And update the README" looks like plain body text. In a chat pane it can read as the end of the transcript rather than a queue owned by the composer. This is the biggest clarity risk.
3. In Apple light (white page) the strip floats freely. With no surface, the strip has no edge of its own, so it can look like loose text.
4. Strengths: the queued numbers line up with the card's text column (x≈36 against 34), and the strip cannot produce a near-miss edge.

**C: strip merged into a full-width card header**
1. **Clear defect in all four themes, at 760 and 380 queued:** the card's top corners are square, because they were cut for the merged header. The queued strip is the shared *inset* tab, so the card's square top corners show on either side of it. This is easiest to see in Latte 380 queued and Apple light 760 queued.
2. New chat: there is no divider or fill change between the location row and the input, so the pickers read as part of the text field and the prompt area starts higher. Context and input are merged.
3. Card height grows by the strip height in new chat but not in queued, so the card's outer shape changes between states.
4. Strip icon at x≈33 against text at 31: acceptable.

**D: inset filled tab, attached (no hairline)**
1. The folder icon sits at x≈36 against card text at 31, about 5 px (≈5 pt) right of the text column. It is the only contender with this new-chat misalignment.
2. The tab has fill but no hairline while the card has both. It works as a secondary surface, but the edge language differs slightly.
3. Latte: the lavender-grey fill on the #eff1f5-type page is low-contrast and verges on muddy. Apple light: the neutral grey on white is fine.
4. The tab looks slightly shorter (top at about y 44 against 42 in A), so it gives the text a little less vertical breathing room.
5. Strengths: new chat and queued use the same filled tab, so it carries both states with one logic. It is close to the reference composers.

**E: detached rounded pill above the card**
1. In new chat, an outlined, fully rounded box holding text reads as a **second text field**: it carries an input affordance.
2. The gap between the pill and the card is about 4 px, so two hairlines run in parallel. This is a classic near-miss edge, visible in all themes and worst in Latte and Apple light.
3. The pill radius (about 6) does not match the card radius (about 12), so the two surfaces are unrelated.
4. Same state mismatch as A: outline-only in new chat, grey fill when queued.
5. It costs the most height: the strip starts at y≈39 against 42–44 for the others.
6. Detached, it reads as its own toolbar rather than as part of this composer.

**380 px:** all five survive. The machine picker collapses to its icon and "main" still fits. The inset in A, D and E leaves about 8 px of margin per side, which is still fine.

## 2. Scores

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 7 | 5 | 7 | 6 | 6 | 7 |
| B | 6 | 8 | 9 | 8 | 7 | 7 |
| C | 6 | 3 | 7 | 7 | 4 | 5 |
| D | 8 | 8 | 7 | 7 | 7 | 9 |
| E | 5 | 4 | 6 | 6 | 5 | 4 |

**Winner: D.** Its filled tab tucks behind the card and stays the same in new chat and queued, so the strip reads as one secondary surface owned by the composer, quieter than the prompt. It also has no parallel hairlines or exposed square corners. Fix its ~5 pt icon offset and align the queue numbers to the card's text column.

```json
{"judge":"claude-opus-5-5","issues":["All inset-tab queued variants (A,C,D): queue row number indented ~18px (~20pt) right of card text column; queued text not aligned with prompt","A: state mismatch - new-chat tab is hairline outline with ~no fill, queued tab is solid grey fill","A: tab side hairlines form T-junctions with card top hairline ~8px inside card corners, near-miss in Latte/Apple light","A: in Mocha/Apple dark the empty tab fill equals page bg, strip reads as bare outline, weak findability","B: belonging relies only on ~13px proximity; no surface ties strip to card","B: queued prompts as plain text can be mistaken for transcript tail rather than composer-owned queue","B: floats loosely on white Apple light page","C: card top corners are square to fit merged header, but queued uses inset tab, so square corners are exposed beside it in all themes at 760 and 380","C: no divider/fill change between location row and input in new chat; pickers read as part of the text field","C: card outer height/shape changes between new-chat and queued states","D: folder icon at ~x36 vs card text x31, ~5pt off the text column","D: tab has fill but no hairline while card has both; slight edge-language difference","D: Latte lavender-grey tab fill is low contrast, borderline muddy","D: tab slightly shorter than A, less vertical breathing room","E: outlined fully-rounded pill with text reads as a second input field","E: ~4px gap creates two parallel hairlines, near-miss edge in all themes, worst in light","E: pill radius (~6) mismatches card radius (~12)","E: outline-only new chat vs grey-filled queued, state mismatch","E: highest height cost (strip begins ~3px higher)","E: detached pill reads as separate toolbar, not as part of composer","All: survive 380px; machine collapses to icon, branch fits","Judged from downscaled boards (~2.3x); sub-hairline differences at limit of visibility"],"scores":{"A":{"clarity":7,"consistency":5,"density":7,"theme_fit":6,"polish":6,"references":7},"B":{"clarity":6,"consistency":8,"density":9,"theme_fit":8,"polish":7,"references":7},"C":{"clarity":6,"consistency":3,"density":7,"theme_fit":7,"polish":4,"references":5},"D":{"clarity":8,"consistency":8,"density":7,"theme_fit":7,"polish":7,"references":9},"E":{"clarity":5,"consistency":4,"density":6,"theme_fit":6,"polish":5,"references":4}},"winner":"D","why":"A filled tab tucked behind the card, identical in new-chat and queued states, reads as one secondary surface owned by the composer without parallel hairlines or exposed square corners."}
```
