# Thunderdome

**Pairwise design judgment with a shared Elo table.**

Thunderdome puts candidate designs in a ring two at a time. You pick the one you would rather live with, and every vote feeds an Elo table. It is the Tact rule "show the difference, then name the difference" run as a tournament: the page shows two concrete alternatives, and the table tells you which differences kept winning so you can go name why.

Ranking eight things at once is hard. People anchor on the first few they see, lose track of what they already compared, and flatten close calls. A single pair is easy: left, right, or tie. Many quick pairwise calls, each in a slightly different context, add up to an ordering you can trust more than any one careful ranking.

```text
candidate designs
-> random pair in a random arena
-> left / right / tie
-> Elo, overall and per split
-> read the table, look at the winner's losses
-> name the lever
```

## When to use it

- You have three or more plausible treatments of one decision (a selection style, a button, an icon weight, a density) and no clear winner.
- The answer might change with context: theme, accent, contrast setting, platform, density. Put those in the arena so every vote lands in a different one.
- Several people should vote, or you want to vote across several sittings.

For a single blind A/B with a written diagnosis, use [`../microcraft/`](../microcraft/) instead.

## Layout

```text
experiments/thunderdome/
  engine/thunderdome.js   engine: pairing, voting, Elo, feed, gallery, storage
  engine/thunderdome.css  page chrome, light and dark
  build.mjs               inlines engine + one config into a single index.html
  test.mjs                node --test for the DOM-free core
  examples/
    starter/              smallest config: four HTML-snippet buttons
    cmux-selection/       cmux sidebar selection, eight treatments (see RESULTS.md)
```

Each example folder has `config.js`, optional `config.css`, and a generated `index.html`. No dependencies and no package install.

## Run

```bash
cd experiments/thunderdome
node build.mjs                          # rebuild every example
node build.mjs examples/cmux-selection  # or one
open examples/cmux-selection/index.html
```

Opened from disk, votes stay in that browser (localStorage). Publish it as an artifact to share one table.

Controls: `←` left wins, `→` right wins, `↓` tie, `S` skip, `U` undo your last vote. The arena controls pick a specific context; changing a select turns off "New arena each duel".

## Author a config

Copy `examples/starter/` to `examples/<name>/`, edit `config.js`, and run `node build.mjs examples/<name>`.

```js
Thunderdome.start({
  id: "button-style",                 // namespaces localStorage
  title: "Primary Button Thunderdome",
  lede: "One sentence on the decision. HTML allowed.",
  contenderLabel: "Treatment",        // standings column header (default "Contender")

  contenders: [
    { id: "solid", name: "Solid", note: "Filled accent", html: "<button class='b solid'>Save</button>" },
    { id: "tonal", name: "Tonal", note: "Accent at 16%", render: (arena, { h }) => h("div", { text: "..." }) },
    // any extra fields (paint functions, tokens) ride along for render()
  ],

  arena: {
    dimensions: [
      { id: "surface", label: "Surface", options: [{ id: "paper", name: "Paper", dark: false }, { id: "slate", name: "Slate", dark: true }] },
      { id: "ic", label: "Increase Contrast", short: "IC" },   // no options = toggle
    ],
  },

  split: {                            // optional: extra Elo columns
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: arena => arena.surface && (arena.surface.dark ? "dark" : "light"),
  },

  render: (contender, arena, { h }) => { /* Node or HTML string */ },   // optional
  swatch: contender => "#0A84FF",     // optional: CSS background or a Node for the standings row
  tag: arena => "light · paper",      // optional: text at the right of the arena bar
  describe: (arena, vote) => "...",   // optional: context line in Recent bouts
});
```

What the engine hands you:

- **`arena`** has one entry per dimension: the chosen option object for a select (with every field you gave it), a boolean for a toggle, plus `arena.ids` with the raw ids.
- **Card body** comes from the first of: `contender.render(arena, ctx)`, config `render(contender, arena, ctx)`, `contender.html` (string, or function of arena). A returned string is parsed as HTML. `ctx.h(tag, attrs, ...children)` is a small element helper (`class`, `text`, `html`, `style`, `on<event>`).
- **Dimensions**: selects are re-rolled every duel while "New arena each duel" is on; toggles are not, unless you set `shuffle: true`. Set `default` to choose the starting option. Ids `id`, `a`, `b`, `w`, `t` are reserved.
- **Styles** for contender markup go in `config.css`. The engine's own classes all start with `td-`, and the theme tokens (`--ink`, `--muted`, `--faint`, `--rule`, `--panel`, `--sans`, `--mono`) are available.
- Other knobs: `k` (Elo K-factor, default 24), `recent` (feed length, default 8), `collection` (db collection, default `votes`), `localKey`, `galleryTitle`, `shuffle: false` to start with a fixed arena.

Keep contenders to one variable when you can. Eight treatments that differ in fill, edge, weight, and hue at once will produce a winner you cannot explain.

## Publish as a claude.ai artifact

The built `index.html` is one file with only Google Fonts outside it, so it publishes as is. Declare the `db` capability so votes go to one shared table:

```text
Artifact publish
  file_path:    experiments/thunderdome/examples/<name>/index.html
  capabilities: { "db": {} }
```

With `db` granted, every vote is a document in the `votes` collection (`{a, b, w, t, ...arena ids}`, where `w` is `"a"`, `"b"`, or `"tie"`), and every open copy of the page updates live. Signed-in Contributors and up can vote; Viewers see the table and their votes stay local. Without the capability, or opened from disk, votes stay in the browser.

Republishing to the same artifact URL keeps the collection, so you can add a contender mid-run. Old votes still count; the newcomer starts at 1500 and the pairing weights push it into fights until it catches up. Removing a contender drops its bouts from the table without deleting them.

## Read the results

- **Elo** is sequential over all votes in time order, K = 24, everyone starting at 1500. With a few dozen votes, read gaps under about 30 points as a tie until more bouts come in.
- **Split columns** rerun Elo over only that split's votes. The leader of each split is highlighted. A treatment that wins light and loses dark is a finding, not noise.
- **W–L–T** shows how the rating was earned. A high rating on few bouts means "look again", not "ship it".
- **The table is evidence, not the decision.** A contender can rate well and still be ruled out by a constraint the mock does not show. In the cmux run, the runner-up marked selection with a dot in the row's leading glyph slot, which cmux reserves for status (agent state, unread, warnings, PR state), so it was out regardless of its score.
- **Pairing** weights each pair by 1 / (1 + times met)², and never repeats the last pair, so under-voted pairs come up first.
- To take the raw votes out of a shared table, read the `votes` collection (Claude can do this with the artifact data tools) and recompute with `Thunderdome.elo(ids, votes)` from `engine/thunderdome.js`.

Record what you learned the way a case study would: the final table, the losses of the winner, the lever you think made the difference, and where the decision went. [`examples/cmux-selection/RESULTS.md`](examples/cmux-selection/RESULTS.md) is the first one.
