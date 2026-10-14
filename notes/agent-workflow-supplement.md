# Agent workflow supplement: running design judgment

Written by the cg-design-judge lane (cosmic-gray, 2026-10-14) after its first composer rounds. These are working habits, not laws. Drop any of them when a better one appears.

## 1. Judge the real component, not a mock of it

A mock compares your redraw of the product with your redraw of a variant, and a mock can drift from the real component in ways nobody notices. When the surface is web (the cmux agent pane, New Tab, menus, cards), render the real component and change one thing about it.

For cmux NEXT that path already exists. The `webviews` gallery imports the shipped components, and `frame.html?entry=…&variant=…&theme=…` draws one state in any terminal theme. A copy of the frame that appends `td/<name>.css` after load lets each contender be the shipped component with one stylesheet on top. Headless Chrome at `--force-device-scale-factor=2` gives retina stills in seconds, so 100 shots across six themes take about 80 seconds.

Native surfaces still need the app. Check that the window can draw before planning a capture session. On a locked Mac the DEV app reports `window_drawable=false`, web panes never paint, and nothing a capture tool does fixes that.

## 2. Pin state with CSS, never with timing

The gallery's "idle" composer was refocused after load, so half the idle shots carried a focus ring, and that ring hid exactly the rim the dome was asking about. Blurring on a timer fixed some shots and not others. What worked was pinning the look: every contender declares its own idle value (`--td-idle-shadow`), and an `idle.css` forces `:focus-within` to that value and hides the caret.

Rule: if a state can change after load, pin it in CSS, then look at the contact sheet before building the dome.

## 3. Look at a contact sheet before anyone votes

Put every contender in every arena on one image (`sheet.py`) and look at it yourself first. That one look caught the focus bug above and the context ring that reads as a spinner. A dome built on broken shots produces confident numbers about the wrong thing.

## 4. One lever per question; split questions instead of bundling

The composer dome asks three questions (card surface, empty Send, context ring), each over the same arena. Contenders inside a question differ in one lever, or in one named bundle such as "lifted = lighter fill + thin rim + small shadow". A winner you cannot name is not a verdict.

## 5. Blind multi-lens judges, then your own call

Agents vote well when:

- pairs are pre-rendered as one image (A over B), with the key kept outside the judge's folder;
- each judge sees different arenas, so each theme gets coverage without any one judge seeing all of them;
- each judge has a declared lens (Apple-native craft, heavy daily user, anti-trend skeptic) and must give a one-line reason that names the mechanism.

Then convert the votes to the engine's shape and run `cli.mjs results`. The table is evidence. The lane still writes the verdict and still names the lever. When the lane's own call disagrees with the table, say so and say why.

### Never let the author judge

The permission-card round was built by a forked agent. Forks can't start their own subagents, so it cast both lens passes itself, knowing which variant was which. Its pick, "all three changes", won 16–0. Two blind judges then ranked the same stack 6–10, and its "terse" ingredient went 0–16, because the sentence it hid was the only thing that made the bigger grant look bigger. Whoever made the variants does not vote. If the lane building a round can't spawn judges, it writes the pair images and the key, and the parent runs the judges.

Also: if a lens prompt quotes a house rule (for example "light composers sit lighter than the page"), that judge will mostly vote the rule. Run at least one judge without the rule, and read any split as evidence about where the rule stops holding.

## 6. Watch for theme-flipping tokens

`color-mix(in srgb, var(--text) 8%, var(--base))` lightens a dark theme and darkens a light one. One token quietly gave the composer two opposite designs: a raised card in dark and a sunken, disabled-looking well in light. Any surface built from "text at N% over the page" needs a light-theme look in the same session.

## 7. Turn verdicts into routing, not essays

- **Small and clear** (a token value, one CSS rule, a shadow that is too heavy): one line to the owning lane with the exact CSS and the dome link.
- **A default someone will feel** (a different look, hiding information): a SHOW LEO packet with the dome link, two stills, the recommendation and the tradeoff.
- **Tact**: only what the round earned. A case study if the lever transfers, a reservoir line if a reference taught a mechanism, a shit-list entry if a precise failure showed up.

## 8. Know your capture paths before you need them

On cosmic-gray with the screen locked, the native AppKit sidebar still renders through the app's own `debug.window_snapshot`, but web panes don't paint and Screen Recording tools fail. So: native chrome comes from the app's snapshot RPC, web surfaces from the gallery, and the full composite needs an unlocked display. Check `debug.surfaces` for `window_drawable` before planning.

## 9. Keep the machinery reusable

Keep `shoot.sh`, `sheet.py`, the vote converter and the injection frame next to the work (`~/Projects/design-judge/` on cosmic-gray), so the next round starts from a surface choice and not from tooling.
