# Cross-model design panel: cmux NEXT sidebar groups

You are one judge on a blind panel; other models judge the same images independently. Do not edit, create or delete any file. Only read the images in this folder.

## The surface

This is the left sidebar of cmux NEXT, a macOS terminal and agent app. Each row is a workspace: a terminal or agent session, with a kind icon and a name. Users put workspaces into colored **groups**, like browser tab groups. A group can be collapsed. The sidebar is used all day, by keyboard as much as by mouse, and it must work in any terminal color theme.

Every board is the real app sidebar, captured at 2x, in four themes left to right: Catppuccin Latte, Catppuccin Mocha, Apple System Colors light, Apple System Colors dark. Each board shows:

- two ungrouped rows at the top (workspace-1 is selected);
- two open groups with 3-4 members each;
- one collapsed group.

## Contenders

Boards: `boards/{A..D}.png`. Letters are random.

- Three of the contenders group by **project** ("Atlas", "Infra", "Writing") and differ only in how a group is drawn.
- One contender groups the same workspaces by **agent status** ("Needs you", "Running", "Done"). It is proposed as an opt-in mode, not a replacement. Judge whether status grouping is worth offering, and how well this depiction does it.

Reference sidebars from browsers and agent apps are in `refs/`. They are context for the "references" criterion and are not contenders.

## Rubric (score each contender 1-10 on each)

1. **clarity**: at a glance, which rows belong to which group, where a group starts and ends, and what a collapsed group holds.
2. **consistency**: one visual system across header, members, collapsed state and ungrouped rows.
3. **density**: vertical and horizontal space per row; does the grouping cost width (indent) or height?
4. **theme_fit**: does it read equally well in light and dark, with group colors that sit in each theme?
5. **polish**: Apple-level craft: alignment, optical weight, radii, line weights, spacing rhythm.
6. **references**: does it sit well with how leading browsers and agent apps draw groups? Diverging is fine if it is better.

## Output, in this order

1. **ISSUES FIRST.** Before any scoring, write a numbered list of everything wrong you can see, per contender. Be exhaustive and concrete: name the pixel-level problem, the theme, the row. Aim for breadth.
2. Then a score table, your winner as the DEFAULT look, and a one-sentence reason naming the mechanism.
3. Then say separately:
   - which contenders, if any, deserve to ship as an **opt-in** (Labs) option, and why;
   - whether the status grouping is worth offering at all.
4. End with ONE fenced ```json block:
   `{"judge":"<model id>","issues":["..."],"scores":{"A":{"clarity":0,"consistency":0,"density":0,"theme_fit":0,"polish":0,"references":0},...},"winner":"A","why":"...","optin":["B"],"status_worth_it":true}`
