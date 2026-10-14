## 1. Issues first

**Shipped-look issues (outside the five questions)**
1. The menu icons are identical in all five Q1 contenders. All four rows use a grey shield with "!", Supervised included. The "!" says "caution" on the safest mode. Supervised, Auto-accept and Auto look the same, so the icons show no gradation toward danger.
2. Only the Full access row is tinted yellow, and the tint is the sole difference. That fails for colour-blind users and for themes where amber and grey are close.
3. The trigger glyph often differs from the menu glyph for the same mode. A and B use a padlock in the trigger and a shield in the menu. C uses shield-check against a menu shield-!. E uses a hand or bolt against a shield. This is a mixed metaphor between trigger and menu.
4. In the menu, Supervised and Auto wrap to two lines while Auto-accept and Full access stay on one. Row heights are uneven, and the 1–4 numerals are larger and brighter than the descriptions.
5. The open menu covers the location strip: "T…" is left visible behind it. The row where the check sits indents the Supervised icon, so it is misaligned against the other three icon columns.
6. At 380 px the effort chip is already "M…" in every Q1 frame. That is a single-letter ellipsis in the shipped look.
7. The caret is drawn over the "D" of the "Do anything" placeholder in nearly all frames. It should sit before the text, with a gap.
8. The previous turn's footer ("Worked for 42s 2:32 AM", copy and retry icons) shows through and collides with the top edge of the location strip. This is visible in Latte 760, Latte 380 and Mocha 380.
9. At 300 px the location strip becomes "atla…" and "This…". These are meaningless truncations. The "·" separator is lost, and "This Mac" should collapse to the laptop icon alone.
10. Amber on Latte and Apple Light is low contrast. The Full access label and glyph are roughly 2.5–3:1 against the light card.
11. The disabled Send circle is very low contrast in Latte and Apple Light. The mic is dim in Mocha.
12. Chevrons are tiny against the label x-height, and chevron spacing varies between chips.
13. At 760 px the effort chip is text-only, while the model and access chips have icons. The row mixes chips with leading glyphs and chips without.

**Q1 access glyph**
- **A (open/closed padlock)**
  - Open lock for Full access and closed lock for Supervised is the most literal guarded/unguarded pair.
  - The open shackle is thin and small at 16 px at 380 px.
  - The trigger lock does not match the shield menu.
  - Auto-accept edits and Auto have no lock state, so there are only two lock states for four modes.
- **B (closed lock for Full access)**
  - This inverts the meaning. A closed, filled padlock says "locked, safe" on the most dangerous mode.
  - Supervised also uses a closed lock, so only the colour tells them apart.
  - The filled lock is heavier than the neighbouring outline icons.
  - Worst contender.
- **C (shield-check against shield-!)**
  - Shield-! in amber for Full access reads as a warning, and it matches Codex, ChatGPT-Codex and T3 Code.
  - Shield-check for Supervised says "verified".
  - Shield-check differs from the menu's shield-! for Supervised.
  - At 16 px the "!" is tight in the Mocha yellow.
  - A shield strictly means "protected", so a "!" shield for Full access is slightly oxymoronic. The amber colour fixes it.
- **D (plain shield against shield-!)**
  - Same family as C, but Supervised is a bare shield with no affirmative mark.
  - Smaller delta between states than C.
  - Cleaner stroke weight.
- **E (hand / bolt)**
  - The bolt means speed or power, not danger.
  - It collides with the "Fast" meaning in the effort chip.
  - The hand means "stop" or "halt", which is ambiguous for Supervised.
  - Neither matches the shield menu. Weakest metaphor, and Full access does not read as dangerous.

**Q2 effort chip at 380 px**
- **A**
  - "M…" is a single-letter ellipsis and unreadable. It is the shipped bug.
  - Effort and Fast are both lost.
- **B**
  - A signal-bars glyph is icon-only.
  - The glyph means cellular signal, not effort, and it shows no level or speed.
  - There is no label for assistive or first-time users.
  - The bars look the same at every level in a static frame.
- **C**
  - "Med" is readable, but the model collapses to "Opus …", which drops the "5.5" and ends in a hanging ellipsis.
  - The model, the more important information, is sacrificed for the effort.
  - Two chevrons stay close together.
- **D**
  - Merges effort into the model chip as "Opus 5.5 Med" with one chevron.
  - No truncation at 380 px in any theme.
  - "Fast" is dropped from the label, so the menu must carry it.
  - The merged chip's menu now holds model and effort together.

**Q3 model chip at 300 px**
- **A**
  - A bare "O" with a chevron next to the asterisk reads as a zero. It is a single-letter truncation.
  - "M." is also bad.
  - The lock sits against the mic with almost no gap.
- **B**
  - "O…" and "Me…" are single-letter and two-letter ellipses.
  - The lock loses its chevron, and its spacing to the mic is tight.
- **C**
  - The asterisk alone with a chevron works as an icon-only model chip.
  - "M." for effort is still a clipped label.
  - Spacing is even, and the lock keeps its chevron.
  - Best of the four, but not clean.
- **D**
  - "Opus" with a chevron drops "5.5" and the harness meaning is only half there.
  - The lock and mic overlap into one smudged glyph in all four themes.
  - The mic and Send circle collide, and the lock's chevron is hidden under Send.
  - This is a clear overlap bug.
  - The model label is also vertically offset from the baseline.

**Q4 Stop button**
- **A**
  - An outline ring with a small square is low emphasis and reads like a radio button or a disabled state.
  - In Mocha the lavender ring is faint.
  - It has no fill, so it carries "running" weakly.
  - A ring could host a progress or spinner arc, but static it does not.
- **B**
  - A solid, high-contrast filled circle that inverts per theme: slate on Latte, lavender on Mocha, black on Apple Light, white on Apple Dark.
  - It reads as "active control" instantly, and it matches the ChatGPT reference.
  - Latte slate and Mocha lavender are slightly different "accent" logic from the black and white Apple pairs, but each is legible.
- **C**
  - A tinted grey circle with a small square.
  - It is nearly identical to the disabled Send, so it reads as "disabled" instead of "running".
  - Very low contrast in Latte and Apple Light, and the square is tiny.
- In all three, the mic stays live and the placeholder text is unchanged, so nothing else hints at a running turn.

**Q5 compact logic**
- **A**
  - Truncates labels progressively: "Medi…" at 400, "O…" and "M." at 340, "O" and "M." at 290.
  - At 290 the lock and mic collide in both themes.
  - Single-letter fragments appear in the model and effort chips.
  - The lock keeps its chevron until it collides.
  - Truncation is the only mechanism, so labels degrade into noise.
- **B**
  - Swaps whole labels for icons.
    - At 480 the effort shows "Medium Fast" and the shield replaces "Full access".
    - At 400 effort becomes a bars icon.
    - At 340 the model name drops to the asterisk alone and the mic disappears.
  - No single-letter ellipses and no overlaps down to 290.
  - Chevrons are dropped from every chip, so chips stop looking tappable.
  - The bars icon for effort carries no meaning on its own.
  - At 290 the asterisk-only model chip has no label, so the user cannot tell which model is selected.
  - The mic drops at 340, which is acceptable. The shield, the safety signal, is never dropped.
  - The strip still shows "atl…" and "Thi…" at 290.

**References**
- Codex, ChatGPT-Codex and T3 Code show Full access as an amber or orange shield-! (Codex, ChatGPT-Codex) or open padlock (T3 Code), with the label.
- All refs put model and effort as one text pair ("GPT-6.1 Sol High", "6.1 Sol Medium", "Sonnet 5.5 Medium"). That supports Q2-D.
- The ChatGPT desktop reference shows a solid white circle with a black square for Stop, which supports Q4-B.
- No reference collapses to unlabeled icons. All keep text.

## 2. Scores

**Q1 access glyph**

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 8 | 5 | 8 | 7 | 7 | 8 |
| B | 2 | 4 | 8 | 7 | 6 | 3 |
| C | 9 | 6 | 8 | 8 | 7 | 9 |
| D | 8 | 6 | 8 | 8 | 8 | 9 |
| E | 3 | 3 | 8 | 7 | 6 | 3 |

**Winner: C.** A shield family with an affirmative check for Supervised and a "!" for Full access separates the two ends by mark and colour, and it matches the Codex, ChatGPT-Codex and T3 Code convention.

**Q2 effort chip at 380 px**

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 4 | 6 | 3 | 7 | 4 | 4 |
| B | 4 | 5 | 8 | 7 | 6 | 4 |
| C | 5 | 6 | 5 | 7 | 5 | 5 |
| D | 8 | 8 | 8 | 8 | 8 | 9 |

**Winner: D.** Effort becomes a suffix on the model chip, so one chevron and one text run share the width and nothing has to truncate. It matches the references' "model + effort" pattern.

**Q3 model chip at 300 px**

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 3 | 5 | 3 | 7 | 4 | 4 |
| B | 3 | 5 | 4 | 7 | 5 | 4 |
| C | 6 | 7 | 7 | 7 | 6 | 6 |
| D | 2 | 3 | 1 | 6 | 2 | 4 |

**Winner: C.** The asterisk mark with a chevron is a whole-glyph chip that stays a legible button, and spacing to the neighbours holds, instead of clipping letters. Its remaining flaw is the "M." effort label.

**Q4 Stop button**

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 6 | 7 | 8 | 7 | 7 | 5 |
| B | 9 | 8 | 9 | 9 | 8 | 9 |
| C | 4 | 7 | 8 | 5 | 6 | 4 |

**Winner: B.** A solid, theme-inverted fill is the only treatment that stays distinct from the disabled grey Send, so the button itself signals "running". It matches the ChatGPT pattern.

**Q5 compact logic**

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 4 | 5 | 3 | 7 | 4 | 5 |
| B | 7 | 8 | 9 | 8 | 8 | 7 |

**Winner: B.** It collapses by whole-unit swaps (text to icon to dropped control) instead of clipping text, so no state shows a single-letter ellipsis or an overlap down to 290 px.

## 3. Q5 collapse order I would ship

- **≥600 px:** everything in full: `+`, "Opus 5.5 ▾", "Medium Fast ▾", "🛡 Full access ▾", mic, Send.
- **~480 px:** "Full access" label becomes the amber shield-! icon with its chevron. Everything else stays full.
- **~400 px:** the effort chip drops "Fast" ("Medium ▾"), or merges into the model chip as "Opus 5.5 · Med ▾" (Q2-D).
- **~340 px:** the model chip drops its name to asterisk plus chevron. Effort becomes "Med" (never one letter) or moves inside the model menu. The location strip collapses "This Mac" to the laptop icon.
- **~290 px:** the mic is dropped (still reachable by shortcut). Folder name truncates to at least 4 characters.
- **At every width:** never ellipsize to fewer than 3 characters, keep chevrons on every chip, and never drop the access signal or Send/Stop.

```json
{"judge":"claude-sonnet-5-5","issues":["Menu icons identical across Q1 contenders: all four rows use a grey shield with '!' including Supervised, so the safest mode carries a caution mark and the four modes show no gradation","Only the Full access menu row is tinted; colour is the sole differentiator","Trigger glyph differs from menu glyph for the same mode (A/B padlock vs shield, C shield-check vs shield-!, E hand/bolt vs shield): mixed metaphor","Menu rows uneven: Supervised and Auto wrap to two lines while Auto-accept and Full access do not; 1-4 numerals bigger and brighter than the descriptions; icon column indented by the check column","Open menu covers the location strip leaving 'T' clipped","Shipped 380 px effort chip is 'M...' in every Q1 frame: single-letter ellipsis","Caret drawn over the 'D' of the 'Do anything' placeholder in nearly all frames","Previous-turn footer ('Worked for 42s 2:32 AM', copy/retry icons) shows through and collides with the top edge of the location strip","At 300 px location strip truncates to 'atla...' and 'This...' and loses the dot separator; 'This Mac' should collapse to the laptop icon","Amber Full access label and glyph is roughly 2.5-3:1 on Latte and Apple Light","Disabled Send circle very low contrast on Latte and Apple Light; mic dim on Mocha","Chevrons small relative to label x-height; effort chip has no leading icon while model and access chips do","Q1-A open padlock shackle thin at 16 px at 380; only two lock states for four modes","Q1-B closed filled padlock on Full access inverts meaning (locked = safe) and is the same glyph as Supervised; filled lock heavier than outline neighbours","Q1-C shield-check trigger does not match shield-! shown in menu for Supervised; '!' tight at 16 px in Mocha","Q1-D Supervised is a bare shield, small delta from Full access; trigger does not match menu","Q1-E bolt reads as speed/power and collides with 'Fast'; hand reads as stop; neither signals danger or safety","Q2-A 'M...' single-letter ellipsis, loses effort and Fast","Q2-B signal-bars icon means cellular signal, no label, no level or speed shown","Q2-C model truncates to 'Opus ...' dropping 5.5 to keep 'Med'; two chevrons crowd","Q2-D drops 'Fast' from the label; menu must carry it","Q3-A bare 'O' reads as zero, 'M.' clipped, lock touches mic","Q3-B 'O...' and 'Me...' ellipses, lock loses chevron, tight to mic","Q3-C 'M.' effort label still clipped","Q3-D lock and mic overlap into one smudged glyph, mic collides with Send and hides the lock chevron, model label baseline offset, drops 5.5","Q4-A outline ring is low emphasis, reads like a radio button or disabled, faint lavender in Mocha","Q4-C tinted grey circle with tiny square looks like the disabled Send, low contrast on Latte and Apple Light","Q4: nothing else in the row changes while running; mic stays live and placeholder unchanged","Q5-A at 290 the lock and mic collide; 400/340/290 show 'Medi...', 'O...', 'M.' fragments","Q5-B chevrons dropped on every chip so chips lose menu affordance; bars icon for effort has no intrinsic meaning; asterisk-only model chip at 290 does not say which model; mic dropped at 340; strip still 'atl...' at 290"],"q1":{"scores":{"A":{"clarity":8,"consistency":5,"density":8,"theme_fit":7,"polish":7,"references":8},"B":{"clarity":2,"consistency":4,"density":8,"theme_fit":7,"polish":6,"references":3},"C":{"clarity":9,"consistency":6,"density":8,"theme_fit":8,"polish":7,"references":9},"D":{"clarity":8,"consistency":6,"density":8,"theme_fit":8,"polish":8,"references":9},"E":{"clarity":3,"consistency":3,"density":8,"theme_fit":7,"polish":6,"references":3}},"winner":"C","why":"A shield family with an affirmative check for Supervised and an amber '!' for Full access separates guarded from unguarded by mark and colour, and matches the Codex, ChatGPT-Codex and T3 Code convention."},"q2":{"scores":{"A":{"clarity":4,"consistency":6,"density":3,"theme_fit":7,"polish":4,"references":4},"B":{"clarity":4,"consistency":5,"density":8,"theme_fit":7,"polish":6,"references":4},"C":{"clarity":5,"consistency":6,"density":5,"theme_fit":7,"polish":5,"references":5},"D":{"clarity":8,"consistency":8,"density":8,"theme_fit":8,"polish":8,"references":9}},"winner":"D","why":"Folding effort into the model chip as a suffix gives one chevron and one text run, so nothing has to truncate at 380 px, and it matches how every reference app shows model plus effort."},"q3":{"scores":{"A":{"clarity":3,"consistency":5,"density":3,"theme_fit":7,"polish":4,"references":4},"B":{"clarity":3,"consistency":5,"density":4,"theme_fit":7,"polish":5,"references":4},"C":{"clarity":6,"consistency":7,"density":7,"theme_fit":7,"polish":6,"references":6},"D":{"clarity":2,"consistency":3,"density":1,"theme_fit":6,"polish":2,"references":4}},"winner":"C","why":"The asterisk plus chevron is a whole-glyph chip that remains a legible button and keeps even spacing to its neighbours, instead of clipping letters or colliding with the lock, mic and Send."},"q4":{"scores":{"A":{"clarity":6,"consistency":7,"density":8,"theme_fit":7,"polish":7,"references":5},"B":{"clarity":9,"consistency":8,"density":9,"theme_fit":9,"polish":8,"references":9},"C":{"clarity":4,"consistency":7,"density":8,"theme_fit":5,"polish":6,"references":4}},"winner":"B","why":"A solid, theme-inverted filled circle is the only treatment clearly distinct from the disabled grey Send, so the button itself carries the running state, as in the ChatGPT reference."},"q5":{"scores":{"A":{"clarity":4,"consistency":5,"density":3,"theme_fit":7,"polish":4,"references":5},"B":{"clarity":7,"consistency":8,"density":9,"theme_fit":8,"polish":8,"references":7}},"winner":"B","why":"It collapses by whole-unit swaps (text to icon to dropped control) instead of clipping text, so no width down to 290 px shows a single-letter ellipsis or an overlap.","order":">=600: all chips with full labels and chevrons. ~480: access label becomes the amber shield-! icon with chevron. ~400: effort drops 'Fast' ('Medium') or merges into the model chip as 'Opus 5.5 · Med'. ~340: model chip becomes asterisk plus chevron, effort 'Med' (never one letter) or moved into the model menu, location strip 'This Mac' becomes laptop icon only. ~290: drop the mic, folder name keeps at least 4 characters. Always: chevrons on every chip, never ellipsize below 3 characters, never drop the access signal or Send/Stop."}}
```
