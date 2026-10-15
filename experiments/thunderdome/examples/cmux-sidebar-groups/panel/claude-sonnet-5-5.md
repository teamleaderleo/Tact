## 1. Issues

**A (project groups, filled header, tree elbows)**
1. The elbow connectors cost the most width. Member icons sit at x≈58, against x≈40 for the ungrouped rows, so each member is indented about 28px at 2x. The names lose that room to truncation.
2. The tree is heavy for a flat list of sessions. Every member gets a hook, and the last one curls into a rounded elbow. The result looks like a file explorer, and it adds a hairline per row that competes with the icons.
3. The connector line is about 2px and low-contrast. It is faint in Latte and Apple light, and it nearly disappears in Mocha and Apple dark. The group color reaches the members only through this thin line.
4. In Apple dark, the "Infra" header is a washed grey-green. Its label is grey and lighter in weight than "Atlas" and "Writing", which are white and bold. That is a contrast and weight inconsistency between headers within one theme. The same green is much richer in Mocha.
5. The filled pastel headers are loud. Three saturated bars, each about as tall as a row, outweigh the content rows, and the sidebar is meant to be read all day.
6. The collapsed "Writing" header is identical to an expanded header except for the chevron. Nothing says how many or which workspaces are inside, and a chevron pointing right is the only clue.
7. The ungrouped order is scratch, then workspace-1. The other boards show workspace-1 first, so the "selected row on top" state is not constant across contenders. This is minor.
8. The first elbow starts directly under the header with no gap, and the rail begins about 8px inside the header's left edge. The vertical line is not aligned to the header's radius or edge.

**B (status groups: Needs you / Running / Done)**
1. Rows carry no status glyph. Every row still has the same terminal icon, so membership is the only status signal. A row that is "Running" looks identical to one that is "Done" once the header is off-screen. A status mode should show a per-row indicator (spinner, dot, check).
2. The group colors are amber, blue and green, which reuse the project palette. The "Running" blue is the same blue as the "Atlas" project group in the other boards, so the color means different things in different modes.
3. In Apple dark, the "Needs you" rail is a muddy brown against the dark grey. The most important group, the one that needs attention, has the weakest rail in that theme. "Done" has the same washed grey-green fill and grey label as "Infra" in A.
4. Rows will jump between groups as agents change state, which is hostile to keyboard navigation and muscle memory. The board cannot show that cost.
5. Attention is not drawn to "Needs you" beyond its position. There is no count, badge or pulse, and the amber fill is about as loud as the other two headers.
6. The collapsed "Done" group is a good default for this mode, but it shows no count. Finished work is hidden entirely.
7. It inherits C's rail issues. The rail is about 3px wide with square ends, and it begins at the header's bottom edge, so the header's rounded corner and the rail meet awkwardly.

**C (project groups, filled header + left rail)**
1. It is the same loud filled header as A: three pastel bars of about 40px each. The weight is high for an all-day surface.
2. The rail is a hard-ended 3px bar starting flush under the header's bottom-left. Where the header's rounded corner meets the square rail top, it reads as a small notch or tab. The rail also ends square against nothing, with no cap.
3. The rail is low-contrast in Latte and Apple light (pale blue and green on pale grey). In Apple dark the Atlas rail is fine, but the Infra rail is dull.
4. Apple dark "Infra" has the same grey-green header and dim label as A. The header fill is derived differently per theme, so the green is not equally saturated across the four themes.
5. The collapsed "Writing" header carries no count or preview.
6. The members are indented about 18px. The header label, the member icon column and the rail line up well, but the rail sits 8px right of the header's left edge, which is a slightly arbitrary inset.

**D (project groups, tinted container, dot header)**
1. The collapsed group "Writing" loses the card entirely, so it is a dot, a label and a chevron on the bare background. In every theme it reads almost like an ungrouped row. The group's identity is an 8px dot. This is the biggest clarity and consistency failure in D.
2. The tint is very faint in Latte and Apple light. The Atlas card is barely distinguishable from the sidebar material, and the background image shows through. Group edges rely on a barely visible rounded rect.
3. The group color appears only as the small dot and the tint. The dots are desaturated and small, so identifying a group by color alone at a glance is weak.
4. The header is the same size and weight as the rows, with a tiny dot as its only distinction. The hierarchy of "this is a group title" is weaker than C's.
5. The card's inner padding is tight at the bottom. The last row, "design-tokens", sits close to the card's lower edge, and there is no visible inner top padding beyond the header.
6. Nested rounded backgrounds will compete. The selected row's grey pill inside a tinted card, plus hover and drag states, are not shown, and are likely to look muddy.
7. The ungrouped rows and the card contents are aligned (icon x≈40 vs 51), but the card's inner indent is 11px and the header dot is flush with the icon column. This is neat, but the rows inside the card feel slightly crowded against the card's left edge.

## 2. Scores

| | clarity | consistency | density | theme_fit | polish | references |
|---|---|---|---|---|---|---|
| A | 7 | 7 | 5 | 6 | 6 | 6 |
| B (status) | 7 | 8 | 7 | 6 | 7 | 6 |
| C | 8 | 9 | 7 | 7 | 8 | 9 |
| D | 6 | 6 | 9 | 7 | 8 | 6 |

**DEFAULT: C.** A saturated group-colored header bar plus a matching left rail on the members encloses each group's start and end. The collapsed state is the same header with the chevron flipped, so one visual system covers open, collapsed and member rows. This is also the Chrome and Edge vertical-tab pattern that users already know.

## 3. Opt-in and status grouping

**Opt-in (Labs): D.** It has the best density, at 12px indent against 18px for C and 28px for A. Its quiet tinted cards suit people who find colored header bars too loud. Before it ships it needs two fixes:
- The collapsed state must keep a tinted pill or a stronger group-color mark, not only the dot.
- The light-theme tint needs more contrast.

A should not ship. Its tree elbows cost the most width and add visual noise.

**Status grouping: worth offering, as opt-in only.** For an agent app, a "Needs you" bucket at the top is a real triage tool, and the board's amber, blue, green order is sensible. Three things hold it back:
- It needs per-row status glyphs.
- It needs colors that do not collide with the project palette.
- It must handle rows jumping between groups. For example, it could keep a stable order within a group and animate the move.

B's depiction is a competent reuse of C, but the grouping itself is the only status signal, so it is not yet a convincing status mode.

```json
{"judge":"claude-sonnet-5-5","issues":["A: elbow tree connectors indent members ~28px at 2x (icons x≈58 vs 40 ungrouped), the most width cost of any contender","A: tree connectors are file-explorer-like, add a hairline per row and a curled last elbow; the 2px line is low-contrast in all themes so group color barely reaches members","A: appledark Infra header is washed grey-green with a dim, lighter-weight label vs white bold Atlas/Writing; inconsistent contrast and weight across headers and vs Mocha","A: filled pastel header bars are loud for an all-day sidebar; the collapsed Writing header is just a chevron flip with no member count or hint","A: ungrouped order differs (scratch first) from other boards; connector top starts flush under header with no gap and an arbitrary 8px inset","B: no per-row status glyph; every row keeps the same terminal icon, so status is only inferable from the header when it is on-screen","B: status colors amber/blue/green reuse the project palette (Running blue = Atlas blue), so color meaning changes between modes","B: appledark Needs-you rail is a muddy brown and Done header is washed grey-green with a dim label; the attention group is the weakest in that theme","B: rows will hop between groups as agents change state, hurting keyboard muscle memory; no count/badge/pulse draws attention to Needs you, and the collapsed Done shows no count","B: inherits C rail flaws: square 3px rail butts into the header's rounded bottom corner","C: three ~40px saturated header bars outweigh the content rows; heavy for all-day use","C: 3px hard-ended rail starts flush under the header's rounded corner, reading as a small notch/tab; rail is inset 8px from the header edge arbitrarily","C: rail is pale and low-contrast in Latte and Apple light; Infra rail dull in Apple dark; appledark Infra header is grey-green with a dim label, so fill saturation differs per theme","C: collapsed Writing shows no count or member hint","D: collapsed Writing loses the card and is a dot + label + chevron on bare background, nearly indistinguishable from an ungrouped row; open/collapsed inconsistent","D: tint is very faint in Latte and Apple light, so group edges are barely visible over the textured sidebar","D: group color is carried only by a small desaturated 8px dot plus faint tint; weak at-a-glance identification; header has same size/weight as rows so hierarchy is weak","D: tight bottom padding in cards; nested rounded surfaces (selection pill, hover, focus, drag) inside a tinted card are untested and likely to look muddy"],"scores":{"A":{"clarity":7,"consistency":7,"density":5,"theme_fit":6,"polish":6,"references":6},"B":{"clarity":7,"consistency":8,"density":7,"theme_fit":6,"polish":7,"references":6},"C":{"clarity":8,"consistency":9,"density":7,"theme_fit":7,"polish":8,"references":9},"D":{"clarity":6,"consistency":6,"density":9,"theme_fit":7,"polish":8,"references":6}},"winner":"C","why":"A group-colored filled header plus a matching left rail on members encloses each group's start and end, and the collapsed state is the same header with the chevron flipped, so one system covers open, collapsed and members, in the Chrome/Edge vertical-tab idiom.","optin":["D","B"],"status_worth_it":true}
```
