# Cross-model design panel: cmux NEXT compact composer controls

You are one judge on a blind panel. Other models judge the same images on their own. Do not edit, create or delete any file. Only read images in this folder.

## The surface

This is the composer of an agent chat pane in cmux NEXT, a macOS terminal and agent app. The bottom row of the composer holds these controls, left to right:

- `+`: attach.
- **Model chip**: the harness mark (an orange asterisk for Claude), the model name (Opus 5.5) and a chevron.
- **Effort chip**: reasoning effort and speed. Here it is set to "Medium Fast".
- **Access chip** (permission mode). There are four modes, from safest to most dangerous:
  - Supervised: asks before changing files or running commands.
  - Auto-accept edits.
  - Auto.
  - Full access: runs actions with no approval. This is the dangerous one, and the product shows it in a warning colour.
- Mic, then **Send**. While a turn runs, Send becomes **Stop**.
- Above the box, a location strip shows the folder (atlas-web), the machine ("This Mac") and the git branch (main).

The composer must work in a narrow pane (down to ~290 px wide) and in any terminal colour theme. The stills use Catppuccin Latte (light), Catppuccin Mocha (dark), Apple System Colors light and Apple System Colors dark.

Stills are at 2x and cropped to the lower half of the pane. A magenta tag labels each still with its contender letter, theme and pane width.

## Questions (contenders are lettered; letters are random per question)

- **Q1 access glyph**
  - Boards: `boards/q1-access-{A..E}.png` (Full access at 760 and 380) and `boards/q1-access-{A..E}-menu.png` (menu open, Supervised selected).
  - Which glyph system best says what each mode means? Full access must read as "unguarded, dangerous" and Supervised as "guarded, safe".
- **Q2 effort chip in a narrow row**
  - Boards: `boards/q2-effort-{A..D}.png` (380 px).
- **Q3 model chip in a very narrow row**
  - Boards: `boards/q3-model-{A..D}.png` (300 px).
- **Q4 Stop button while a turn runs**
  - Boards: `boards/q4-stop-{A..C}.png` (400 px, empty draft, turn running).
  - Nothing else in the row signals "running", so Stop carries that state alone.
- **Q5 compact logic: what collapses when**
  - Boards: `boards/q5-compact-logic-{A,B}.png` (latte and mocha at 480, 400, 340 and 290 px).

Reference composers from other apps (all dark) are in `refs/`. They are context for the "references" criterion and are not contenders:

- codex-home: Codex (OpenAI).
- claude-code-session: Claude desktop.
- chatgpt-home: the ChatGPT desktop app's Codex pane.
- t3code: T3 Code.
- zeron: Zeron.

## Rubric (score each contender 1-10 on each)

1. **clarity**: does each glyph or label say what it means at a glance, with no inverted or misleading meaning?
2. **consistency**: one symbol system across trigger, menu and states; no mixed metaphors.
3. **density**: does it hold up at narrow widths, with no single-letter ellipses, overlaps or clipped glyphs?
4. **theme_fit**: does it read equally well in light and dark, with sane contrast and colour use?
5. **polish**: Apple-level craft: alignment, optical size, stroke weight, spacing, baseline.
6. **references**: does it sit well with how leading agent apps solve the same control? Diverging is fine if it is better.

## Output, in this order

1. **ISSUES FIRST.** Before any scoring, write a numbered list of everything wrong you can see, per question and per contender (including any bugs in the shipped look). Be exhaustive and concrete: name the pixel-level problem, the theme, the width. Aim for breadth. Issues outside the five questions also count (location strip, mic, spacing, alignment).
2. Then, per question: a score table, your winner, and a one-sentence reason naming the mechanism, i.e. *why* it works, not just "cleaner".
3. Then, for Q5 only: the collapse order you would ship (which control gives up what at which width).
4. End with ONE fenced ```json block, exactly this shape:
   `{"judge":"<your model id>","issues":["..."],"q1":{"scores":{"A":{"clarity":0,"consistency":0,"density":0,"theme_fit":0,"polish":0,"references":0},...},"winner":"A","why":"..."},"q2":{...},"q3":{...},"q4":{...},"q5":{...,"order":"..."}}`
