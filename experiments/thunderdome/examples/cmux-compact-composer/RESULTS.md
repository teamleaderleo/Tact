# Compact composer: icons and collapse (2026-10-14)

Leo asked for this round: "they're not as good as they could be... a real opportunity to do better", looking at symbolization, compact logic and depictions.

- Surface: the cmux NEXT agent composer's bottom row at feat-cmux-next `a5341bc5d77`: `+`, model chip, effort chip, access (permission mode), mic, Send/Stop, and the location strip above.
- Every still is the real component (gallery entry `agent-pane.composer`) with one CSS override, shot at 2x in a width-constrained iframe. Themes: Catppuccin Latte and Mocha, plus Apple System Colors light and dark for Q2-Q4. Widths: 760, 480, 400, 380, 340, 300, 290.
- Judged by a **blind cross-model panel**: four vision models, the same boards, one rubric, and contender letters shuffled per question. Judges' raw answers, the prompt and the key are in `panel/`.

## Panel

| Judge | Model id | Level | Route | Why this level |
|---|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | high | acpmux `claude-sr` | Strongest Claude at multi-image reasoning. Past high it writes more, not looks more. |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | high | acpmux `claude-sr` | A second Claude with different priors. It leans harder on conventions. |
| GPT-6.1 Sol | `gpt-6.1-sol` | high | `sr codex exec -i …` | High is its benchmarked sweet spot. LMArena Vision ~tied with Astra (1285 vs 1280). |
| GPT-6 Astra | `gpt-6-astra` | xhigh | `sr codex exec -i …` | The stronger multimodal model (OSWorld 2.0 72.6%). Codex capacity is plentiful. |

Sources for the levels:
- <https://deploymentsafety.openai.com/gpt-6-1-sol>
- <https://llm-stats.com/models/compare/gpt-6-astra-vs-gpt-6.1-sol>
- <https://www.benchleader.com/compare/gpt-6-1-sol-vs-gpt-6-astra>
- <https://emergent.sh/learn/gpt-6-1-sol-benchmarks>
- <https://benchlm.ai/compare/gpt-6-1-sol-vs-gpt-6-astra>

**How each judge answered.** Each judge first wrote a numbered list of every issue it saw, then scored each contender 1-10 on six criteria (clarity, consistency, density, theme fit, polish, references), then named a winner with the mechanism. The OpenAI judges were told they are weighted as issue-finders.

**Route note.** acpmux's codex-acp harness fails on cosmic-gray with "Authentication required" because it doesn't inherit sr. So the OpenAI judges ran on `sr codex exec` with every board attached via `-i`.

## Scores (sum of six criteria, /60)

| Question | Contender | Opus | Sonnet | Sol | Astra | Mean |
|---|---|---:|---:|---:|---:|---:|
| Access glyph | **shield-check / shield-!** | 42 | 47 | 49 | 49 | **46.8** |
| | shield / shield-! | 43 | 47 | 47 | 47 | 46.0 |
| | closed / open lock | 41 | 43 | 44 | 47 | 43.8 |
| | as shipped (closed lock for all) | 32 | 30 | 37 | 37 | 34.0 |
| | hand / bolt | 33 | 30 | 35 | 36 | 33.5 |
| Effort @380 | **merged into model chip ("Opus 5.5 Med")** | 45 | 49 | 41 | 48 | **45.8** |
| | 3-step meter | 38 | 34 | 44 | 45 | 40.2 |
| | "Med", model gives way | 29 | 33 | 45 | 43 | 37.5 |
| | as shipped ("M…") | 26 | 28 | 39 | 37 | 32.5 |
| Model @300 | **mark only** | 43 | 39 | 40 | 38 | **40.0** |
| | family name "Opus" | 21 | 18 | 48 | 48 | 33.8 |
| | chevrons drop first | 24 | 28 | 42 | 41 | 33.8 |
| | as shipped ("O") | 25 | 26 | 39 | 37 | 31.8 |
| Stop | **solid text-color disk** | 51 | 52 | 53 | 52 | **52.0** |
| | faint disk + ring | 40 | 40 | 51 | 48 | 44.8 |
| | as shipped (faint disk) | 33 | 34 | 34 | 42 | 35.8 |
| Collapse | **whole-glyph swaps** | 44 | 47 | 48 | 45 | **46.0** |
| | as shipped (truncate) | 28 | 28 | 33 | 38 | 31.8 |

Winners per judge:

| Question | Opus | Sonnet | Sol | Astra | Result |
|---|---|---|---|---|---|
| Access | closed/open lock | shield-check | shield-check | shield-check | **3-1** |
| Effort | merged | merged | "Med" | merged | **3-1** |
| Model | mark | mark | "Opus" | "Opus" | **2-2, split by vendor** |
| Stop | solid | solid | solid | solid | **4-0** |
| Collapse | proposal | proposal | proposal | proposal | **4-0** |

## Verdict

### Agreed: route these

1. **Stop is a solid text-color disk with a base-color square** (4-0).
   - Lever: the running state needs the strongest fill in the row. Today's faint disk is the disabled-Send look, so "running" reads as "disabled".
   - Target: `webviews/src/agent-session/acpmux/composerLocation.css:379-388` (`.acpmux-send.acpmux-cancel`): `background: var(--agent-text); color: var(--acpmux-base)`.
   - Nit (Opus): the square can grow a pixel.
2. **One shield family, mirrored in the menu** (3-1; all four judges flagged the menu).
   - Supervised = shield-check. Full access = shield-! in the warning color. Auto-accept edits and Auto = plain shield.
   - The menu rows use the same per-mode glyph as the trigger. Today every row, including Supervised, shows the shield-!.
   - Lever: the mark inside one silhouette carries the risk, and the trigger matches the menu.
   - Targets: `ComposerPickers.tsx:575` and `:622` (trigger `<LockIcon />`), `:649` (`choice.icon ?? <ShieldIcon />`), `:1062` (`ShieldIcon`, add check and plain variants), and `PermissionStatus.tsx:38`.
   - The closed padlock on Full access is the one unanimous symbol bug: every judge called it inverted.
3. **Effort folds into the model chip as a dim suffix** ("Opus 5.5 Med", one chevron) (3-1).
   - Lever: it saves a whole chip's padding and chevron instead of truncating a word. Codex and Claude desktop do the same.
   - Three judges noted "Fast" disappears. Keep it as a second dim word when there is room, and drop it before "Med".
   - Targets: the effort chip in `ComposerPickers.tsx` (`effortLabel` :427, chip :566) and the flex-shrink weights in `composerLocation.css` (`.acpmux-chips > .acpmux-effort`).
4. **Collapse by whole-unit swaps, never by truncating to letters** (4-0).
   - All four penalized the proposal for dropping chevrons, and three for hiding the access label at 480 while there was room.
   - The order to ship, merged from the four judges' own orders:
     - **Always:** `+`, the access glyph (warning color kept), Send/Stop and every chevron stay. No label shorter than 3 characters. No overlapping hit targets.
     - **≤ 460:** the access label goes; glyph + chevron stay. "This Mac" becomes the laptop icon alone.
     - **≤ 400:** the effort suffix drops "Fast" and stays "Med".
     - **≤ 340:** the mic leaves the row (it is what collides today). The model shortens to its family ("Opus"). The folder name truncates in the middle.
     - **≤ 300:** the model becomes the harness mark; the effort suffix moves into the menu.
   - Target: `composerRowFit.ts` (today it only toggles `data-fit="icons"` for `.acpmux-mode-text`) becomes a stepped fit. The `@media` rules in `composerLocation.css` move to container queries on the bar.
5. **Shipped bug: at 290 the access lock overlaps the mic** (flagged by all four).
   - The chips row overflows instead of giving up a control.
   - Fixed by item 4. Until then, hide the mic under the same fit that hides the access label.

### Split: for Leo

**Model chip at ~300 px: harness mark only, or the family name "Opus"?** This is a 2-2 split along vendor lines.

- **Mark (Claude judges):** the mark is a complete identifier, so dropping the label whole keeps the chip a clean button instead of a meaningless "O…".
  - Note that "Opus" scored 18-21 from them partly because that variant's row still overflowed at 300 (lock on mic, chevron under Send). That is a layout consequence, not the name.
- **"Opus" (OpenAI judges):** the asterisk identifies the harness, not the model. With Sonnet and Opus on the same harness, the mark alone loses the one fact the chip exists to show.
- **My call: both, as a ladder:** "Opus 5.5" → "Opus" → mark. That is the order in item 4. The mark appears only when "Opus" can't fit beside a glyph-only access chip.

The Access dissent (Opus 5.5 for closed/open lock) is worth one line: the lock's silhouette changes state, while the shield relies on an inner mark. T3 Code ships the lock. Three judges preferred one shield family that matches Codex and the menu. Route the shields.

### Issues raised across families (beyond the questions)

- **Empty Send is low contrast in Latte and Apple light** (Opus, Sonnet, Sol).
  - The faint disk is the earlier blind winner (#20624), so this is a light-theme tuning note: 9% → ~12% text in light themes. It is not a reversal.
- **The location strip truncates to "atla…" and "This…"** (all four). Covered by item 4.
- **The Full access warning color** is ~2.5-3:1 on Latte (Sonnet) and reads as a highlight, not a warning, in Mocha's butter yellow (Opus). Same family, but both judges say it. Worth one look by op-next-theme.

### Discarded: fixture artifacts, not product

These were checked against the gallery fixtures before routing:

- "Effort and access chips vanish while a turn runs" and "the effort chip is missing in the menu shot". The `working` and `access-menu` fixtures carry no `composerControls`, so the effort chip has no options there.
- "The transcript footer is clipped by the location strip". That is the still's crop.
- "Empty user bubble behind the menu". That is the fixture's snapshot.

## What the panel taught (see notes/agent-workflow-supplement.md §10)

- **The OpenAI judges were not the better issue-finders this round.**
  - Counts: Opus 31, Sonnet 30, Astra 30, Sol 22.
  - Both OpenAI judges missed the most severe defect on a contender: the lock and mic collision in the "Opus" model variant. They called it "optically tight" and "excess gap". Both Claude judges called it a bug.
  - The OpenAI judges did catch the same collision in the collapse question.
  - Keep both families, and don't let one family's issue list stand alone.
- **The vendor split on Q3 was clean (2-2).** A same-family panel would have reported a false consensus either way.
- **Agreement was strongest where a reference pattern exists** (solid Stop, merged effort) and weakest where none does (what a model chip becomes at 300 px).

Files:
- `index.html`: the dome, for human votes.
- `sheet-*.png`: the contact sheets.
- `panel/`: prompt, key, the four raw answers and the merged scores.
