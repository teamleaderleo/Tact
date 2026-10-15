# Sidebar groups (2026-10-14)

Leo asked for a cross-model Thunderdome of how the cmux NEXT sidebar draws groups. Anything that wins ships as a Labs toggle; the default stays Chrome-style.

**Contenders.** Every still is the real native sidebar: `debug.window_snapshot` of a cg-judge DEV build of branch `cg-judge/sidebar-group-look` (`b3b8e7df801`, pushed for reference). A prototype Debug tunable, `sidebar.groupLook`, switches the look live, with no rebuild per variant.

- **chrome:** shipped. A full-width colour bar header and a colour rail along the members.
- **zen:** Zen/Dia-inspired. No bar. The header is a colour square plus the name, a soft tinted band (radius 8) sits behind the open group, and the chevron shows on hover.
- **elbow:** the shipped header, plus a spine and one └ stub per member.
- **status:** the same workspaces grouped Needs you / Running / Done, drawn Chrome-style. It is staged with real groups and is not yet a groupBy mode.

**Arena.** Catppuccin Latte, Catppuccin Mocha, Apple System Colors light and Apple System Colors dark.

**References.** Fresh Chrome, Edge, Firefox and Zen captures, and a sourced Claude Code desktop still, each with a 4-line teardown. They are in `manaflow-ai/cmux-app-screenshots` at `references/sidebar-groupings-2026-10-14/` (#49).
- Safari was skipped: every reachable capture mini had a live shared Safari.
- Arc and Dia were skipped: they are login-gated, and the repo only has their onboarding screens.

**Panel.** Same four judges and levels as the compact composer round (see that dome's RESULTS.md for why each level): `claude-opus-5-5` high and `claude-sonnet-5-5` high via acpmux claude-sr, and `gpt-6.1-sol` high and `gpt-6-astra` xhigh via `sr codex exec -i`. Judges were blind (letters shuffled; key in `panel/key.json`). They saw the reference stills but not the teardown, whose steal/avoid lines would have steered them.

## Scores (sum of six criteria, /60)

| Look | Opus | Sonnet | Sol | Astra | Mean | Default pick | Opt-in |
|---|---:|---:|---:|---:|---:|---|---|
| **chrome (shipped)** | 45 | 48 | 48 | 51 | **48.0** | **4 of 4** | n/a |
| status | 38 | 41 | 46 | 44 | 42.2 | 0 | **4 of 4** |
| elbow | 36 | 37 | 46 | 44 | 40.8 | 0 | 0 of 4 |
| zen | 38 | 42 | 40 | 40 | 40.0 | 0 | 2 of 4 (both Claude) |

Every judge said status grouping is worth offering.

Issues listed per judge: Opus 32, Sonnet 18, Sol 34, Astra 18.

## Verdict

1. **Chrome-style stays the default (4-0).** The full-width coloured header plus a continuous rail marks where a group starts and ends in every theme. Open, collapsed and member rows are one system, and the indent is the smallest of the project looks. It is also the browser idiom (Chrome, Edge).

2. **Status grouping ships as a Labs opt-in (4-0).** "Which agent needs me" is the triage job of an agent app. The staged depiction is not yet the mode, though. All four judges named what the real mode needs:
   - **A status glyph on every row.** Today the group name is the only status signal. Claude Code desktop's needs-input dot and idle ring are the reference.
   - **Stable order.** Rows must not jump while focused or being navigated by keyboard: hold position while focused, and move with an identity-keyed animation.
   - **Status colours that stay urgent in dark themes.** "Needs you" went dull brown in Mocha and Apple dark. They must also not collide with project group colours.
   - **Counts on collapsed groups**, and a defined bucket for rows with no agent.
   - **Project context on each row** (Opus).
   - **"Needs you" can't be collapsed** (Opus).

   Implementation: add a `status` case to `sidebar.groupBy`, next to none and folder (`CmuxNextDesign/SidebarSectionsPreferences.swift:21`). Put it behind a Labs toggle in `schemas/settings/source/labs.json`, plus the AgentPolicy allowlist. Bucket from `AgentActivityLane.needsAttention` (`CmuxNextAgentActivity/AgentActivityLane.swift:48`).

3. **Zen does not ship yet (split 2-2 by vendor).**
   - **The Claude judges** would offer it as the "quiet" opt-in. It is the calmest and most Apple-like, with the best density (12 px indent against Chrome's 18).
   - **The OpenAI judges** would not offer it.
   - **All four found the same two faults:** a collapsed group becomes a bare row with a dot, so it changes visual system when collapsed; and open groups have no chevron. The tint also nearly vanishes in the light themes.
   - **My call:** fix those two faults on the branch (keep a tinted card when collapsed, and keep a faint chevron), then re-judge it alone against Chrome. Don't ship a look that changes system when collapsed.

4. **Elbow is dropped (0 of 4 for default or opt-in).** It costs the most width (about 28 px of indent). The judges said the tree stubs read as a file tree, not a tab group, and add seven marks per group for no new information.

### Fixes to the shipped Chrome look (agreed across both families)

- **Collapsed groups show no count** (all four). Add the member count to the collapsed header.
- **The rail cuts into the rounded header** (Opus, Astra, Sonnet): a square rail over the pill's lower-left corner leaves a darker seam. The rail should start under the header and end rounded.
- **The green group header in Apple System Colors dark** has grey, low-contrast text on a muddy fill (all four, and the fork saw it too). Header text should take the theme's on-colour contrast.
- **Three left edges:** the header label, ungrouped rows and member rows are near-misses (Opus, Sol, Astra). Align the header label with the member text column, or with the ungrouped icon column.
- **Light themes:** Latte and Apple light get identical pastel group colours, so the Apple themes aren't using their own palette (Opus). This ties to [[group-colors-from-theme]].
