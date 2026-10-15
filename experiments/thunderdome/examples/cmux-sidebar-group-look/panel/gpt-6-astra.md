1. **A —** The child labels start around x100 versus x72 for ungrouped rows, costing roughly 28 px of usable width.
2. **A —** Connector arms stop about 20–24 px before each child icon, so the tree branches look detached.
3. **A —** Four horizontal elbows add file-tree noise compared with the thinner rails in the browser references.
4. **A —** The thin blue/green rails wash out against the Latte and Apple-light marble; the header junction is especially easy to lose.
5. **A —** Group titles align with child icons, while child labels sit much farther right, creating an awkward parent/child column offset.
6. **A —** Saturated header pills sit above transparent member rows, producing uneven visual weight and variable contrast over the wallpaper.
7. **A —** There is a large visual gap between the end of Atlas and the Infra header, loosening the scan.
8. **A —** Apple-dark Infra uses near-black title text while Atlas and Writing use white, creating inconsistent header contrast.
9. **A —** Collapsed Writing has no count or preview, so its hidden extent is unknown.
10. **A —** The ungrouped order places `scratch` before the selected `workspace-1`, unlike the other boards.

11. **B —** Status buckets split related project workspaces across groups, making project scanning harder.
12. **B —** Status changes can move rows between groups, disrupting keyboard focus and spatial memory.
13. **B —** “Needs you,” “Running,” and “Done” are broad labels with no reason, age, or row-level status marker.
14. **B —** The same blue/green colors carry different meanings between project mode and status mode, weakening color memory.
15. **B —** The peach/brown “Needs you” color under-signals urgency, while Apple-dark Done switches to dark text against the white treatment used elsewhere.
16. **B —** The Done group has no count or preview when collapsed.
17. **B —** The vertical rail begins halfway inside each header pill instead of below it, reading like a stripe through the header.
18. **B —** The short branch/indent treatment still leaves a 12–14 px gap before child icons and spends unnecessary width.
19. **B —** Unboxed children over the marble background have variable contrast, and the large gaps between groups reduce density.
20. **B —** Parent labels and child labels use noticeably different columns, making the hierarchy feel offset.

21. **C —** The rail starts inside the left side of the header pill, producing a visible seam/notch.
22. **C —** With no horizontal joins to individual rows, membership is inferred mostly from indentation and the colored header.
23. **C —** The parent title aligns with the icon column while child labels sit about 44 px farther right.
24. **C —** Transparent member rows over the marble background produce uneven contrast in pale Latte and highlighted Mocha areas.
25. **C —** Apple-dark Infra again uses dark title text while Atlas and Writing use white.
26. **C —** Full-width pills and roughly one-row gaps between groups feel heavier and less compact than the reference rails.
27. **C —** Collapsed Writing has no count or preview.

28. **D —** Open Atlas and Infra have no down-chevron; only collapsed Writing shows an arrow, so the collapse action is undiscoverable.
29. **D —** Expanded groups are tinted cards, while collapsed Writing becomes a bare row with a tiny square; the state language changes completely.
30. **D —** Card edges and fills are low-contrast over the marble, especially in Mocha and Apple-dark.
31. **D —** Membership depends almost entirely on translucent tint; there is no rail, per-row connector, or separator.
32. **D —** The small colored square is a weak and ambiguous group marker.
33. **D —** Large translucent surfaces make the sidebar feel blocky, and the embedded heading has less separation from the first member.
34. **D —** Collapsed Writing has no count or preview and can be mistaken for an ordinary ungrouped row.

35. **All contenders —** The selected workspace uses a rounded full-width pill similar to group headers, so selection versus grouping relies heavily on color and the presence of a chevron.

| Contender | clarity | consistency | density | theme_fit | polish | references |
|---|---:|---:|---:|---:|---:|---:|
| A | 8 | 8 | 6 | 7 | 7 | 8 |
| B | 8 | 8 | 7 | 7 | 7 | 7 |
| C | 9 | 9 | 8 | 8 | 8 | 9 |
| D | 7 | 6 | 8 | 7 | 6 | 6 |

**DEFAULT: C.** Its compact full-width colored headers and thin project rail preserve hierarchy with the lowest indentation cost and the closest match to Chrome, Edge, and Firefox group navigation.

**Labs opt-in:** B deserves an opt-in status-grouping mode because “Needs you / Running / Done” supports triage-heavy workflows. It should add counts, row-level reasons or badges, and focus-preserving movement; D needs its collapse affordances and state treatment fixed first.

Status grouping is worth offering as an explicit opt-in, but project grouping should remain the default because status regrouping is dynamic and loses project context.

```json
{"judge":"gpt-6-astra","issues":["A has excessive child indentation and detached branch arms.","A's tree elbows add file-tree noise and variable marble contrast.","A's Apple-dark Infra title contrast is inconsistent.","A's collapsed Writing header has no count or preview.","B splits projects by status and can move rows as status changes.","B has vague status labels, no row-level status marker, and no collapsed count.","B's tan Needs you color is semantically weak and dark-theme text treatment is inconsistent.","B's rail intrudes into the header and still leaves a branch-to-icon gap.","C's rail intrudes into the header pill.","C has no per-row horizontal joins, so membership is inferred from indentation.","C has a large parent-title/child-label offset and transparent wallpaper rows.","C's Apple-dark Infra contrast and collapsed Writing discoverability need improvement.","D lacks open-group chevrons.","D changes from tinted cards to a bare collapsed row.","D's card fills blend into the wallpaper and provide no connector or separator.","D's tiny square marker is weak and its card treatment is visually heavy.","All contenders provide no collapsed member count or preview.","All contenders make the selected row resemble a group header."],"scores":{"A":{"clarity":8,"consistency":8,"density":6,"theme_fit":7,"polish":7,"references":8},"B":{"clarity":8,"consistency":8,"density":7,"theme_fit":7,"polish":7,"references":7},"C":{"clarity":9,"consistency":9,"density":8,"theme_fit":8,"polish":8,"references":9},"D":{"clarity":7,"consistency":6,"density":8,"theme_fit":7,"polish":6,"references":6}},"winner":"C","why":"Compact colored pill headers plus a thin project rail give the clearest stable hierarchy with the best density and reference fit.","optin":["B"],"status_worth_it":true}
```