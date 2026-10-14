1. **Q1-A:** The trigger uses closed/open padlocks, while every menu row uses a shield-exclamation; this mixes lock and shield metaphors. At 380 px, the open-versus-closed shackle distinction is small.
2. **Q1-B:** Full access still uses a closed padlock, making the dangerous mode look guarded. Full and Supervised are nearly indistinguishable in the trigger.
3. **Q1-C:** The trigger’s shield-check and shield-exclamation are semantically strong, but the selected Supervised menu row reverts to the generic shield-exclamation.
4. **Q1-D:** Plain shields do not clearly distinguish safe from dangerous. The trigger and menu glyphs also differ.
5. **Q1-E:** Lightning suggests speed or power rather than unguarded access; the hand suggests stopping or approval. The trigger, menu, and state glyphs form three unrelated metaphors.
6. **Q1-A–E:** Menu rows reuse the same shield-exclamation for Supervised, Auto-accept, Auto, and Full access, so most meaning is carried by text, color, and the selection check.
7. **Q2-A:** `M...` is an arbitrary effort abbreviation; it does not communicate Medium Fast.
8. **Q2-B:** The three-bar meter is compact but ambiguous as reasoning effort or speed and has no textual fallback.
9. **Q2-C:** `Med` is readable, but the model becomes `Opus ...`, losing model precision.
10. **Q2-D:** `Opus 5.5` and `Med` run together with weak separation; the effort chevron is missing or visually buried.
11. **Q2-A–D:** Muted effort labels are lower contrast in Mocha and AppleDark than the model label.
12. **Q3-A:** The model collapses to a lone `O`; the effort is the cryptic `M...`.
13. **Q3-B:** `O...` and `Me...` truncate both important controls without preserving a useful name.
14. **Q3-C:** Removing model text entirely leaves only the harness mark and chevron, so the selected model is not identifiable.
15. **Q3-D:** `Opus` remains recognizable, but `M...` still hides the effort meaning and the right-side controls are optically tight.
16. **Q3-A–D:** At 300 px the location strip clips `atlas-web` and `This Mac` to forms such as `atla...` and `This...`.
17. **Q3-A–D:** The muted labels lose hierarchy and contrast more noticeably in the dark themes.
18. **Q4-A:** The outlined stop ring is visually secondary and can resemble a radio or record control; the center square is weak in Mocha and AppleDark.
19. **Q4-B:** The filled stop button is clearest, but the near-white circle in AppleDark is visually heavy.
20. **Q4-C:** The low-contrast circle reads disabled in all four themes; the small square does not rescue the running-state cue.
21. **Q5-A:** At 400 px only effort truncates (`Medi…`) while the model remains full, an unintuitive priority.
22. **Q5-A:** At 340 px both model and effort approach single-letter truncations (`O...`, `M...`).
23. **Q5-A:** At 290 px the model is a lone `O`, which is not a meaningful identity.
24. **Q5-A:** At 290 px the orange access lock and its chevron visibly collide with the microphone in both Latte and Mocha.
25. **Q5-B:** Access collapses to a warning shield at 480 px despite available room, losing `Full access` text and a clear menu affordance.
26. **Q5-B:** Effort becomes an ambiguous bar chart by 400 px and remains icon-only thereafter.
27. **Q5-B:** The model becomes `O...` at 340 px and a lone `O` at 290 px.
28. **Q5-B:** Icon-only effort and access controls have weak or missing chevrons, reducing discoverability.
29. **Q5-B:** The microphone disappears at 290 px even though the row still appears to have some spare space.
30. **Q5-A/B:** The collapse strategy is inconsistent: one preserves labels until collision, the other discards access semantics prematurely.
31. **Q5-A/B:** The disabled Send control is very pale in Latte and low-contrast in Mocha.
32. **Q5-A/B:** Narrow location strips clip repository and machine labels at the same widths.

### Q1 — access glyph

| Contender | clarity | consistency | density | theme_fit | polish | references |
|---|---:|---:|---:|---:|---:|---:|
| A | 8 | 5 | 8 | 8 | 8 | 7 |
| B | 3 | 4 | 8 | 8 | 8 | 6 |
| C | 9 | 8 | 8 | 8 | 8 | 8 |
| D | 7 | 8 | 8 | 8 | 8 | 8 |
| E | 4 | 3 | 8 | 8 | 8 | 4 |

**Winner: C.** A shield-check for Supervised and a warning shield for Full access create the clearest guarded-versus-dangerous semantic contrast while keeping one shield family.

### Q2 — effort chip

| Contender | clarity | consistency | density | theme_fit | polish | references |
|---|---:|---:|---:|---:|---:|---:|
| A | 4 | 8 | 7 | 8 | 6 | 6 |
| B | 5 | 7 | 9 | 8 | 8 | 7 |
| C | 8 | 7 | 8 | 8 | 7 | 7 |
| D | 7 | 5 | 9 | 8 | 6 | 6 |

**Winner: C.** It preserves a readable `Med` label and chevron, spending width on an ellipsized secondary model label.

### Q3 — model chip

| Contender | clarity | consistency | density | theme_fit | polish | references |
|---|---:|---:|---:|---:|---:|---:|
| A | 4 | 8 | 7 | 8 | 6 | 6 |
| B | 5 | 7 | 8 | 8 | 7 | 7 |
| C | 3 | 7 | 9 | 8 | 7 | 6 |
| D | 8 | 8 | 8 | 8 | 8 | 8 |

**Winner: D.** It retains recognizable `Opus` text and a model chevron while sacrificing the less critical effort detail.

### Q4 — Stop button

| Contender | clarity | consistency | density | theme_fit | polish | references |
|---|---:|---:|---:|---:|---:|---:|
| A | 8 | 9 | 9 | 9 | 8 | 8 |
| B | 9 | 9 | 9 | 8 | 9 | 9 |
| C | 3 | 8 | 9 | 5 | 6 | 3 |

**Winner: B.** A filled, high-contrast circle makes the running state immediately actionable and matches common stop-button patterns.

### Q5 — compact logic

| Contender | clarity | consistency | density | theme_fit | polish | references |
|---|---:|---:|---:|---:|---:|---:|
| A | 5 | 7 | 4 | 8 | 4 | 5 |
| B | 7 | 8 | 9 | 8 | 8 | 8 |

**Winner: B.** It avoids A’s 290 px lock/microphone collision and maintains usable spacing, despite collapsing access semantics too early.

Ship the collapse order as: retain full labels at 480 px; collapse effort text to a recognizable icon with chevron around 400 px; shorten the model to its harness mark or a meaningful multi-character token around 340 px; collapse access text only as needed while retaining its warning icon and chevron; give up the microphone last around 290 px; never allow a lone `O` or overlapping hit targets.

```json
{"judge":"gpt-6.1-sol","issues":["Q1-A mixes padlocks in the trigger with shield-exclamation glyphs in the menu; the 380 px open/closed shackle distinction is subtle.","Q1-B uses a closed padlock for Full access, making the dangerous state look guarded and nearly identical to Supervised.","Q1-C has strong shield-check versus shield-exclamation trigger semantics, but the selected Supervised menu row uses the generic warning shield.","Q1-D uses plain shields that do not clearly distinguish safe from dangerous and differ between trigger and menu.","Q1-E uses lightning for Full access and a hand for Supervised; these suggest speed and stopping rather than permission state and do not match the menu.","Q1-A-E reuse the same shield-exclamation for all menu modes, forcing text, color, and selection checkmarks to carry meaning.","Q2-A uses ambiguous M... for Medium Fast.","Q2-B replaces effort text with an ambiguous three-bar meter.","Q2-C preserves Med but truncates the model to Opus ....","Q2-D visually merges Opus 5.5 and Med and appears to lose the effort chevron.","Q2 muted labels are weaker in Mocha and AppleDark.","Q3-A reduces the model to O and effort to M....","Q3-B truncates both model and effort to O... and Me....","Q3-C removes model text entirely.","Q3-D preserves Opus but leaves effort as M... and makes the right side optically tight.","Q3 tiles clip atlas-web and This Mac in the location strip.","Q4-A outlined Stop is too secondary and can resemble a radio or record control.","Q4-B is clearest but visually heavy in AppleDark.","Q4-C looks disabled in every theme.","Q5-A truncates effort before model, reaches O and M... at 340, leaves a lone O at 290, and collides the access lock with the microphone at 290.","Q5-B collapses access to a shield at 480, effort to bars at 400, reaches O... and O at narrow widths, has weak icon-only chevrons, and hides the microphone at 290.","Q5-A/B have pale disabled Send styling and clipped location labels at narrow widths."],"q1":{"scores":{"A":{"clarity":8,"consistency":5,"density":8,"theme_fit":8,"polish":8,"references":7},"B":{"clarity":3,"consistency":4,"density":8,"theme_fit":8,"polish":8,"references":6},"C":{"clarity":9,"consistency":8,"density":8,"theme_fit":8,"polish":8,"references":8},"D":{"clarity":7,"consistency":8,"density":8,"theme_fit":8,"polish":8,"references":8},"E":{"clarity":4,"consistency":3,"density":8,"theme_fit":8,"polish":8,"references":4}},"winner":"C","why":"Shield-check and warning-shield states make guarded versus dangerous access legible while preserving a single glyph family."},"q2":{"scores":{"A":{"clarity":4,"consistency":8,"density":7,"theme_fit":8,"polish":6,"references":6},"B":{"clarity":5,"consistency":7,"density":9,"theme_fit":8,"polish":8,"references":7},"C":{"clarity":8,"consistency":7,"density":8,"theme_fit":8,"polish":7,"references":7},"D":{"clarity":7,"consistency":5,"density":9,"theme_fit":8,"polish":6,"references":6}},"winner":"C","why":"It keeps a readable Med effort label and chevron, sacrificing the secondary model label instead."},"q3":{"scores":{"A":{"clarity":4,"consistency":8,"density":7,"theme_fit":8,"polish":6,"references":6},"B":{"clarity":5,"consistency":7,"density":8,"theme_fit":8,"polish":7,"references":7},"C":{"clarity":3,"consistency":7,"density":9,"theme_fit":8,"polish":7,"references":6},"D":{"clarity":8,"consistency":8,"density":8,"theme_fit":8,"polish":8,"references":8}},"winner":"D","why":"It preserves a recognizable Opus model label and its menu affordance while collapsing secondary effort detail."},"q4":{"scores":{"A":{"clarity":8,"consistency":9,"density":9,"theme_fit":9,"polish":8,"references":8},"B":{"clarity":9,"consistency":9,"density":9,"theme_fit":8,"polish":9,"references":9},"C":{"clarity":3,"consistency":8,"density":9,"theme_fit":5,"polish":6,"references":3}},"winner":"B","why":"A filled, high-contrast stop circle carries the running state alone and remains immediately actionable."},"q5":{"scores":{"A":{"clarity":5,"consistency":7,"density":4,"theme_fit":8,"polish":4,"references":5},"B":{"clarity":7,"consistency":8,"density":9,"theme_fit":8,"polish":8,"references":8}},"winner":"B","why":"It prevents the 290 px access-lock and microphone collision and preserves separate control spacing.","order":"At 480 px retain full labels; around 400 px collapse effort text to a recognizable icon with chevron; around 340 px shorten the model to a harness mark or meaningful multi-character token; collapse access text only as needed while retaining warning icon and chevron; around 290 px give up the microphone last and never allow a lone O or overlapping hit targets."}}
```