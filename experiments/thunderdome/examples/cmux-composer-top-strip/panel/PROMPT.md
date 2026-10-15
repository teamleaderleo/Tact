# Cross-model design panel: cmux NEXT composer top strip

You are one judge on a blind panel. Other models judge the same images on their own. Do not edit, create or delete any file. Only read the images in this folder.

## The surface

This is the composer of an agent chat pane in cmux NEXT, a macOS terminal and agent app. Above the composer card sits a small **top strip**. On a new chat it is the location strip: folder (cmux) · machine (This Mac) on the left, git branch (main) on the right, each a picker (at 380 px the machine collapses to its icon). On a started chat the same slot holds the queued prompts (1, 2), so the strip style must carry both. The strip is context, not a primary control. It should be easy to find and read, never louder than the prompt, and it must work in a narrow pane and in any terminal theme.

Contenders differ ONLY in how the strip is attached to the card: fill, edge, width, gap.

Each board is the real component at 2x in four themes (Catppuccin Latte, Apple System Colors light, Catppuccin Mocha, Apple System Colors dark), one row per theme: 760 px new chat, 380 px new chat, 760 px queued, 380 px queued. Boards: `boards/{A..E}.png`. Letters are random.

Judges also saw a few reference composer stills from other agent apps (dark only) as context for the "references" criterion. They were not contenders and are not published here.

## Rubric (score each contender 1-10 on each)

1. **clarity**: does the strip read at once as "where this chat runs", and as belonging to this composer?
2. **consistency**: one surface logic with the card (fill, hairline, radius), with no near-miss edges.
3. **density**: what it costs in height and width; does it survive 380 px?
4. **theme_fit**: equally good in light and dark; contrast; does a fill turn muddy in one theme?
5. **polish**: Apple-level craft: alignment to the card's text column, corner radii, hairline weight, optical gaps.
6. **references**: how it sits next to how leading agent apps attach the same context. Diverging is fine if it is better.

## Output, in this order

1. **ISSUES FIRST.** Before any scoring, write a numbered list of everything wrong you can see, per contender. Be exhaustive and concrete: the pixel-level problem, the theme, the width.
2. Then a score table, your winner, and a one-sentence reason naming the mechanism.
3. End with ONE fenced ```json block:
   `{"judge":"<model id>","issues":["..."],"scores":{"A":{"clarity":0,"consistency":0,"density":0,"theme_fit":0,"polish":0,"references":0},...},"winner":"A","why":"..."}`
