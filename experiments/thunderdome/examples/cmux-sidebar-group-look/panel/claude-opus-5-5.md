## 1. Issues

Coordinates are approximate board pixels (2x). Columns: latte | mocha | applelight | appledark.

### Shared by all four
1. **Collapsed groups don't say what they hold.** "Writing" / "Done" have no member count, no preview icons and no status. The rubric asks "what a collapsed group holds", and every contender fails it.
2. **Header text sits on its own column.** In no contender does the header label line up with the ungrouped name column (x≈72) or the member name column. Every board has three different left text edges.
3. **Group colors look the same in Latte and Apple light.** Atlas blue, Infra green and Writing lilac seem identical across the two light themes. That suggests a fixed pastel set, not colors taken from each theme's palette. The Apple System Colors themes end up with Catppuccin pastels.
4. **The green group fails in appledark.** "Infra" (A, C) and "Done" (B) have grey-ish text on a muddy sage fill, with clearly lower contrast than "Atlas" or "Writing" in the same column. The foreground-color rule breaks on mid-luminance fills.
5. **Group headers outweigh the selection** (A/B/C, and D to a lesser degree). The selected workspace-1 is a pale neutral fill, while headers are saturated pills. In latte and applelight the eye lands on "Atlas" before the focused row.
6. **The wallpaper shows through the sidebar.** The blossom texture is visible behind rows and, in D, through the tinted cards (most obvious in D appledark Infra).
7. **Every member row uses the terminal icon.** Only workspace-1 uses the agent (speech bubble) icon. This makes no sense in B, where terminal rows are sorted by agent status.

### A (project; pill header + tree connectors)
8. **Most width spent on indent.** Member icons sit at x≈68 against x≈40 for ungrouped rows, a 28 px (14 pt) indent plus the connector. Long names will truncate first here.
9. **Per-row tree ticks add noise.** Each member gets a horizontal tick, so seven extra marks across two groups. It reads like a file tree, not a tab group.
10. **Connector lines are faint.** They are low-alpha tints, barely visible in latte and applelight Infra (green on near-white) and in mocha Atlas (slate on navy).
11. **The elbow and header don't line up.** The rounded "L" at the last member (y≈380, 600) ends at the tick, while the vertical line starts below the header's left padding, not from its edge. The tree isn't optically tied to the pill.
12. **Ungrouped order differs.** A shows scratch above workspace-1; B, C and D show workspace-1 first. Either the capture is inconsistent or A changes ordering.
13. **Header rhythm is uneven.** Headers are about 40 px tall against 52 px rows, and the gap above a header (≈20 px) differs from the gap between rows.
14. **Mocha Atlas header is too close to the selection.** Its desaturated slate is nearly the same as the workspace-1 selection fill. Mocha Writing (dusty purple) is also low-chroma, so the three dark-theme groups barely tell apart.

### B (status; pill header + rail)
15. **Rows move around.** As agent status changes, workspaces jump between groups. Positions and keyboard order become unstable, which hurts a sidebar used all day by keyboard. No row-level status glyph stands in for that.
16. **Ungrouped rows are undefined.** workspace-1 and scratch carry no status, though "group by status" implies every row has one. They need an explicit "No agent" / "Terminals" bucket or a reason.
17. **Project context is gone.** fleet-runner (Infra) sits next to api-gateway (Atlas) with no project hint. Status mode needs a secondary project dot or subtitle.
18. **"Needs you" loses urgency in dark themes.** It is warm peach in light themes, but turns brown and dull in mocha and appledark. The one group that should shout is quieter than "Running" blue.
19. **The rail seams into the header.** It is drawn over the pill's left padding, leaving a darker sliver at x≈18–21 on every header. The pill's rounded bottom-left corner is cut by a square rail.
20. **Rails end with a square cut** (y≈340, 612) while everything else is rounded.
21. **"Done" has no count.** With "Done" collapsed, you can't tell whether there is one finished session or twenty.
22. **Collapse affordance on "Needs you".** Collapsing the triage group defeats its purpose. It should be pinned or non-collapsible, but it shows the same chevron as the others.

### C (project; pill header + rail)
23. **Same rail seam as B:** a darker stripe inside each header's left edge, and the rail's square end cut against the rounded pill.
24. **Three left edges:** header label x≈46, ungrouped icon x≈40, member icon x≈58. The 6 px offset between header text and ungrouped icon looks like a mistake, not a choice.
25. **Rail contrast varies.** It is strong in latte and applelight blue but weak in mocha (slate on navy) and in appledark green.
26. **The rail stops flush at the last member's bottom.** That leaves about 28 px of bare space before the next header, so the end of a group relies on whitespace.
27. **Same mocha/appledark low-chroma problem as A:** Atlas, Writing and the selection fill are three close greys.

### D (project; tinted card + dot)
28. **Collapsed group looks like an ungrouped row.** "Writing" has no card and no fill, just a dot, label and chevron, unlike the open groups. It reads like a third ungrouped row, the biggest clarity failure on the board.
29. **Open groups have no chevron.** The collapse control isn't discoverable, and open and collapsed states are drawn by two different systems (card vs bare row).
30. **The Atlas card looks like the selection.** In latte and mocha the blue-grey card is nearly the same as the workspace-1 selection fill, so a reader may take Atlas as "selected". A selected member inside a card (selection over tint) isn't shown and may disappear.
31. **Tints are too faint in light themes.** In latte and applelight the Infra green card is barely off-white. Group identity rests on an ~8 px square dot.
32. **The dot reads as a status light.** It is small and rounded-square, while the header label is regular weight. This confuses the agent-status vocabulary the app already uses, and the dot is too small to carry identity in four themes.
33. **Alignment again:** header label x≈62, member label x≈84, ungrouped label x≈72. Members shift right 12 px with no structural reason other than card inset.
34. **Card tops and bottoms don't match.** The space between the card top and the header (≈12 px) feels tighter than the space between the last member and the card bottom (≈20 px).
35. **Infra card goes olive in appledark.** The wallpaper texture under it looks dirty rather than tinted.

## 2. Scores

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 7 | 7 | 5 | 6 | 5 | 6 |
| B | 6 | 7 | 7 | 5 | 6 | 7 |
| C | 8 | 8 | 7 | 6 | 7 | 9 |
| D | 6 | 5 | 8 | 6 | 7 | 6 |

**Default look: C.** A full-width filled header plus a continuous colored rail shows where a group starts and ends in every theme, uses one drawing system for open, collapsed and ungrouped rows, and costs only about 9 pt of indent. It is also the Chrome, Edge and Firefox pattern users already know. It still needs the rail seam fixed, a member count on collapsed headers, and better contrast for the green group in dark themes.

## 3. Opt-in and status grouping

- **Opt-in (Labs): D**, as a "quiet" style for people who find the pills loud. It is the calmest and most Apple-like option. It is only fit to ship once the collapsed state gets a card or fill and open groups get a chevron. **B** should also ship as an opt-in mode, drawn with C's system. A adds little over C beyond extra indent and tree noise, so it shouldn't ship.
- **Status grouping is worth offering, as opt-in.** Triaging "which agent needs me" is the main job of an agent app; Claude Code's own "Needs input" treatment shows that. This depiction needs work before it ships:
  - pin "Needs you" so it can't be collapsed;
  - give it a dark-theme color that stays urgent;
  - show a project hint on each row;
  - add counts on collapsed groups;
  - define the bucket for ungrouped rows;
  - deal with rows jumping between groups, for example by holding position while a row is focused.

```json
{"judge":"claude-opus-5-5","issues":["All: collapsed groups (Writing/Done) show no member count, preview or status","All: group header label never aligns with ungrouped or member text column (three left edges)","All: group colors appear identical in Latte and Apple light; Apple themes get Catppuccin pastels instead of theme palette","All: green group (Infra/Done) in appledark has grey low-contrast text on muddy sage fill","All A/B/C: saturated header pills outweigh the pale selection fill on workspace-1","All: wallpaper texture bleeds through sidebar, most visible through D's tinted cards","All: member rows all use terminal icon, incoherent with B's agent-status grouping","A: deepest indent (~14pt) plus connector; long names truncate first","A: per-row tree ticks add 7 extra marks; reads as file tree, not tab group","A: connector lines too faint in light Infra and mocha Atlas","A: vertical connector not optically attached to header pill edge","A: ungrouped order (scratch above workspace-1) differs from other boards","A/C: header height 40px vs row 52px, uneven rhythm","A/C mocha: Atlas slate header and Writing purple nearly match selection grey","B: rows jump between groups as status changes, unstable keyboard order, no per-row status glyph","B: ungrouped workspace-1/scratch have undefined status","B: project context lost (fleet-runner beside api-gateway with no project hint)","B: Needs you turns dull brown in mocha/appledark, losing urgency vs Running blue","B/C: rail drawn over header's left padding, visible darker seam and square rail cutting rounded pill corner","B/C: rails end square while all other shapes are rounded","B: Done collapsed with no count","B: Needs you is collapsible, defeating triage","C: header label x46 vs ungrouped icon x40 vs member icon x58 near-miss offsets","C: rail low-contrast in mocha and appledark green","D: collapsed Writing has no card or fill, reads as ungrouped row with a dot","D: open groups have no chevron; open and collapsed use different systems","D: Atlas card tint nearly same as selection fill in latte/mocha; selected member inside card unspecified","D: green card tint nearly invisible in latte/applelight; identity rests on 8px dot","D: small rounded-square dot reads like a status light","D: header label x62 vs member x84 vs ungrouped x72 misaligned","D: card top padding tighter than bottom padding","D: appledark Infra card goes olive with wallpaper texture showing through"],"scores":{"A":{"clarity":7,"consistency":7,"density":5,"theme_fit":6,"polish":5,"references":6},"B":{"clarity":6,"consistency":7,"density":7,"theme_fit":5,"polish":6,"references":7},"C":{"clarity":8,"consistency":8,"density":7,"theme_fit":6,"polish":7,"references":9},"D":{"clarity":6,"consistency":5,"density":8,"theme_fit":6,"polish":7,"references":6}},"winner":"C","why":"Full-width filled header plus a continuous colored left rail marks group start and end in every theme, with one system for open, collapsed and ungrouped rows and only ~9pt indent, matching the Chrome/Edge/Firefox convention.","optin":["D","B"],"status_worth_it":true}
```
