Q1 to Q5 and all five references are read. My verdicts and the JSON are below.

## 1. Issues

**Global / shipped look**
1. In every still, the transcript footer ("Worked for 42s 2:32 AM" and its copy/retry icons) is cut off at the top by the location strip's top edge. It reads as a z-order bleed, not a deliberate crop.
2. Location strip: "atlas-web" and "main" have chevrons but "This Mac" has none, so it is unclear whether the machine can be changed. The "·" separator floats next to the folder chevron.
3. At 290–300 px the strip truncates to "atla…", "atl…", "This…" and "Thi…". The laptop icon alone would say "This Mac". The folder name should truncate in the middle, and the branch label is the one that survives.
4. The text caret is drawn over the "D" of the "Do anything" placeholder in most stills, not just to its left. Some stills have no caret at all (Q1-B mocha, Q1-E latte 380, Q2 latte A/D), so caret rendering is inconsistent.
5. Disabled Send in Latte and Apple light is a pale grey disc on a near-white field, with very low contrast. In Mocha it is a slate disc that nearly matches the composer fill.
6. The effort chip is the only chip with no leading glyph (model has the asterisk, access has a lock or shield), so the row's rhythm breaks.
7. The Full access warning colour shifts by theme: saturated orange in Latte, pale butter-yellow in Mocha and Apple dark. In Mocha it reads as "highlight", not "danger".
8. In the Q2 and Q3 stills the shipped Full access glyph is a closed orange padlock. That means "locked" for the most dangerous mode, an inverted meaning.

**Q1 access glyph**

9. All five menus have the same bug: every row (Supervised, Auto-accept, Auto, Full access) uses the same shield-with-"!" glyph. The safest mode gets an alert glyph, and modes 1–3 are identical, so the menu shows no gradation of risk.
10. In every contender the trigger glyph doesn't match the menu glyph for the selected mode (A/B: lock vs shield; C: shield-check vs shield-!; D: plain shield vs shield-!; E: hand vs shield-!).
11. The menu's shortcut numerals 1–4 are set larger and heavier than the row titles and pull focus. They should be secondary-grey ⌘1… style.
12. In the menu-open shots the effort chip is missing from the row even at full width, although the 760 px still shows "Medium Fast". The state is inconsistent.
13. **A:** Open padlock for Full access and closed padlock for Supervised is correct, but the menu still shows shields (mixed metaphor). The open shackle is slightly heavier than the label's stroke at 380.
14. **B:** A closed padlock for Full access is semantically inverted ("secured"), even though it is orange. The trigger lock is also a lock while the menu is shields. In the menu shot the ghost footer text bleeds over the location strip top edge.
15. **C:** Shield-check for Supervised is good, but Full access is still a shield (shield-!), which says "protected, with a notice" rather than "unguarded". In the menu shot the user bubble behind the popover renders empty (missing text).
16. **D:** A plain shield for Supervised and shield-! for Full access are both shields. The risk difference rests on a 2 px "!" and colour alone. At 380 the shield-! is hard to tell from a badge.
17. **E:** Hand for Supervised ("stop and ask") is apt, but a bolt for Full access collides with "Fast" in the effort chip (bolt = speed) and doesn't say "unguarded". It has three metaphors in total (hand, bolt, shield).

**Q2 effort chip @380**

18. **A:** "M…" is a single-letter ellipsis, unreadable. It keeps the chevron and wastes space on the ellipsis.
19. **B:** A signal-bars glyph with no label reads as Wi-Fi/cell signal, and "Fast" is not encoded at all. The bars sit about 1 px low against the text baseline.
20. **C:** Keeps "Med" but sacrifices the model ("Opus …"). It truncates the more important control to save the less important one, and "Fast" is lost.
21. **D:** Merges effort into the model chip as a dimmed "Med" suffix, which works. But "Fast" is dropped, and in Latte the dimmed "Med" is close to the placeholder grey, with weak contrast.

**Q3 model chip @300**

22. **A:** "O" is a single letter with no ellipsis, the effort "M." is a clipped ellipsis, the access chip loses its chevron, and the lock sits about 4 px from the mic.
23. **B:** "O…" and "Me…" are text stubs with no information, and all chevrons are gone, so nothing looks like a menu.
24. **C:** Harness mark + chevron is the right idea, but the effort chip still shows "M." (clipped ellipsis).
25. **D:** Severe bug. The lock glyph overlaps the mic, and the access chevron overlaps the Send disc. "Opus" sits about 2 px above the row baseline (it doesn't share the baseline with "M."). It is broken in all four themes.

**Q4 Stop**

26. All three hide the effort and access chips while running at 400 px. Even at 380, Q2 shows them. The Full access warning disappears exactly while unsupervised actions run.
27. **A:** An outline ring with a small square reads as a secondary or disabled control in Latte (thin grey ring on white). The lavender ring in Mocha is better but still weak.
28. **B:** Solid high-contrast disc. The fill colour changes by theme (slate in Latte, lavender in Mocha, black/white in Apple), which is fine, but the stop square is a little small for the disc.
29. **C:** Grey-filled disc, the same treatment as disabled Send, so the "running" state reads as "disabled". This is worst in Apple dark and Mocha.

**Q5 collapse**

30. **A:** At 400 it shows "Medi…", at 340 "O…" and "M.", and at 290 "O" plus the lock overlapping the mic (collision in both themes). It is truncation, not a collapse.
31. **B:** Chevrons are removed even at 480, where there is room, so menu affordance is lost at every width. The mic is dropped at 340, yet 290 leaves an empty gap where it would fit. The model collapses to the mark at 340 with room to spare. The Full access shield-! is small and pale in Mocha.

## 2. Scores and winners

**Q1**
| | clar | cons | dens | theme | polish | refs |
|---|---|---|---|---|---|---|
| A | 8 | 4 | 8 | 7 | 7 | 7 |
| B | 2 | 4 | 8 | 7 | 7 | 4 |
| C | 6 | 6 | 8 | 7 | 7 | 8 |
| D | 6 | 7 | 8 | 7 | 7 | 8 |
| E | 5 | 3 | 8 | 7 | 6 | 4 |

**Winner: A.** The padlock is the only glyph whose shape itself changes state: the open shackle says "unguarded" and the closed one says "guarded" without relying on colour or a tiny "!". T3 Code uses the same mechanism. The menu must switch to the same lock glyphs to fix consistency.

**Q2**
| | clar | cons | dens | theme | polish | refs |
|---|---|---|---|---|---|---|
| A | 2 | 6 | 3 | 7 | 4 | 4 |
| B | 5 | 6 | 9 | 7 | 6 | 5 |
| C | 5 | 5 | 4 | 7 | 4 | 4 |
| D | 7 | 7 | 8 | 7 | 7 | 9 |

**Winner: D.** Effort becomes a dimmed suffix of the model chip, so the row saves a whole chip (padding plus chevron) instead of truncating a word. This is the Codex/ChatGPT "6.1 Sol Medium" pattern.

**Q3**
| | clar | cons | dens | theme | polish | refs |
|---|---|---|---|---|---|---|
| A | 3 | 5 | 3 | 7 | 3 | 4 |
| B | 3 | 4 | 3 | 7 | 4 | 3 |
| C | 7 | 7 | 8 | 7 | 7 | 7 |
| D | 5 | 4 | 1 | 6 | 1 | 4 |

**Winner: C.** The harness mark is a complete identifier on its own, so it drops the label whole instead of leaving a meaningless "O…", and it keeps the chevron so it still reads as a menu.

**Q4**
| | clar | cons | dens | theme | polish | refs |
|---|---|---|---|---|---|---|
| A | 6 | 6 | 9 | 6 | 7 | 6 |
| B | 9 | 8 | 9 | 8 | 8 | 9 |
| C | 3 | 5 | 9 | 6 | 6 | 4 |

**Winner: B.** It inverts to the strongest fill in the row, so the running state is the highest-contrast element and can't be mistaken for disabled Send. Zeron and Codex use the same solid-disc stop.

**Q5**
| | clar | cons | dens | theme | polish | refs |
|---|---|---|---|---|---|---|
| A | 4 | 6 | 3 | 7 | 3 | 5 |
| B | 7 | 7 | 9 | 7 | 7 | 7 |

**Winner: B.** Each control swaps to a whole glyph form at a breakpoint (effort to bars, model to mark), so nothing is ever a text stub or a collision. It should keep chevrons and the mic, though.

## 3. Q5 collapse order to ship

- **≥460:** Everything is full: `+ | ✳ Opus 5.5 Medium Fast ⌄ | 🔓 Full access ⌄ | mic | Send`. Effort is already merged into the model chip as a dimmed suffix.
- **<460:** The effort suffix shortens to "Med" (the Fast bolt moves into the menu). The location strip's "This Mac" becomes the laptop icon only.
- **<420:** The access chip drops its label but keeps the coloured open/closed lock and chevron. Full access also gets a faint tinted pill so the warning survives without text.
- **<380:** The effort suffix becomes a 3-step meter glyph inside the model chip.
- **<340:** The model chip becomes the harness mark plus meter plus chevron. The folder name truncates in the middle, and the branch keeps priority.
- **<300:** The mic moves into the `+` menu.
- **Never:** truncate below 3 characters, drop chevrons, shrink Send/Stop, or hide the access chip while a turn runs.

```json
{"judge":"claude-opus-5-5","issues":["Global: transcript footer 'Worked for 42s 2:32 AM' and icons clipped by location-strip top edge in every still","Location strip: 'This Mac' has no chevron while folder and branch do; dangling '·' separator","Location strip at 290-300px truncates to 'atla…'/'atl…' and 'This…'/'Thi…' instead of icon-only machine and middle-truncated folder","Text caret drawn over the 'D' of the placeholder; caret missing in some stills (Q1-B mocha, Q1-E latte 380, Q2 latte A/D)","Disabled Send is a very low-contrast pale disc in Latte/Apple light and nearly matches the fill in Mocha","Effort chip is the only chip with no leading glyph, so the row rhythm breaks","Full access warning colour is saturated orange in Latte but pale butter-yellow in Mocha/Apple dark; reads as highlight not danger in dark","Shipped Q2/Q3 look uses a closed orange padlock for Full access: inverted meaning","Q1 all menus: every mode row uses an identical shield-with-! glyph; Supervised (safest) gets an alert glyph; no risk gradation","Q1 all: trigger glyph never matches the menu glyph for the selected mode","Q1 menus: shortcut numerals 1-4 larger and heavier than row titles","Q1 menu shots: effort chip missing from row even at full width while 760 still shows Medium Fast","Q1-A: lock trigger vs shield menu mixed metaphor; open-shackle stroke slightly heavy at 380","Q1-B: closed padlock for Full access is semantically inverted; ghost footer text bleeds over location strip in menu shot","Q1-C: Full access is still a shield (protected) with !; user bubble behind menu renders empty","Q1-D: plain shield vs shield-! differ only by a tiny ! and colour; ambiguous at 380","Q1-E: bolt for Full access collides with 'Fast' speed meaning; hand/bolt/shield are three metaphors","Q2-A: 'M…' single-letter ellipsis","Q2-B: signal-bars glyph reads as Wi-Fi/cell signal; Fast not encoded; bars sit ~1px low","Q2-C: truncates model to 'Opus …' to keep 'Med'; wrong priority; Fast lost","Q2-D: Fast dropped; dimmed 'Med' near placeholder grey in Latte","Q3-A: 'O' single letter, 'M.' clipped ellipsis, access chevron lost, lock ~4px from mic","Q3-B: 'O…' and 'Me…' stubs with all chevrons removed","Q3-C: effort still shows clipped 'M.'","Q3-D: lock overlaps mic, access chevron overlaps Send, 'Opus' baseline ~2px high, in all four themes","Q4 all: effort and access chips hidden while running at 400px, so the Full access warning vanishes during unsupervised runs","Q4-A: thin outline ring reads as secondary/disabled in Latte","Q4-B: stop square slightly small for the disc; fill colour varies by theme","Q4-C: grey fill identical to disabled Send, so running reads as disabled","Q5-A: 'Medi…' at 400, 'O…'/'M.' at 340, 'O' and lock overlapping mic at 290","Q5-B: chevrons removed at all widths including 480; mic dropped at 340 though 290 leaves empty space; model collapses to mark earlier than needed"],"q1":{"scores":{"A":{"clarity":8,"consistency":4,"density":8,"theme_fit":7,"polish":7,"references":7},"B":{"clarity":2,"consistency":4,"density":8,"theme_fit":7,"polish":7,"references":4},"C":{"clarity":6,"consistency":6,"density":8,"theme_fit":7,"polish":7,"references":8},"D":{"clarity":6,"consistency":7,"density":8,"theme_fit":7,"polish":7,"references":8},"E":{"clarity":5,"consistency":3,"density":8,"theme_fit":7,"polish":6,"references":4}},"winner":"A","why":"The padlock's own shape changes state (open shackle = unguarded, closed = guarded), so danger reads from the silhouette rather than colour or a tiny '!'; the menu must adopt the same locks."},"q2":{"scores":{"A":{"clarity":2,"consistency":6,"density":3,"theme_fit":7,"polish":4,"references":4},"B":{"clarity":5,"consistency":6,"density":9,"theme_fit":7,"polish":6,"references":5},"C":{"clarity":5,"consistency":5,"density":4,"theme_fit":7,"polish":4,"references":4},"D":{"clarity":7,"consistency":7,"density":8,"theme_fit":7,"polish":7,"references":9}},"winner":"D","why":"Merging effort into the model chip as a dimmed suffix removes a whole chip's padding and chevron instead of truncating words, matching Codex/ChatGPT's 'model + effort' chip."},"q3":{"scores":{"A":{"clarity":3,"consistency":5,"density":3,"theme_fit":7,"polish":3,"references":4},"B":{"clarity":3,"consistency":4,"density":3,"theme_fit":7,"polish":4,"references":3},"C":{"clarity":7,"consistency":7,"density":8,"theme_fit":7,"polish":7,"references":7},"D":{"clarity":5,"consistency":4,"density":1,"theme_fit":6,"polish":1,"references":4}},"winner":"C","why":"The harness mark is a complete identifier, so dropping the label whole (keeping the chevron) avoids meaningless 'O…' stubs while still reading as a menu."},"q4":{"scores":{"A":{"clarity":6,"consistency":6,"density":9,"theme_fit":6,"polish":7,"references":6},"B":{"clarity":9,"consistency":8,"density":9,"theme_fit":8,"polish":8,"references":9},"C":{"clarity":3,"consistency":5,"density":9,"theme_fit":6,"polish":6,"references":4}},"winner":"B","why":"A solid inverted fill makes Stop the highest-contrast element in the row, so running can't be confused with disabled Send; Zeron and Codex use the same pattern."},"q5":{"scores":{"A":{"clarity":4,"consistency":6,"density":3,"theme_fit":7,"polish":3,"references":5},"B":{"clarity":7,"consistency":7,"density":9,"theme_fit":7,"polish":7,"references":7}},"winner":"B","why":"Each control swaps to a whole glyph form at a breakpoint instead of truncating text, so there are no stubs or collisions; it should keep chevrons and the mic."},"order":">=460 full row with effort merged into the model chip as a dimmed suffix; <460 effort suffix shortens to 'Med' and 'This Mac' becomes the laptop icon; <420 access chip goes glyph-only (open/closed lock + chevron, Full access keeps tinted pill); <380 effort becomes a meter glyph inside the model chip; <340 model chip becomes harness mark + meter + chevron and folder name truncates in the middle; <300 mic moves into the + menu; never truncate below 3 chars, drop chevrons, shrink Send/Stop, or hide the access chip while running"}}
```
