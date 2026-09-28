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
- The decision is about motion (a busy indicator, a transition, a repaint) and stills cannot answer it. Contenders can be video.
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
    motion/               four busy indicators as video, one clip per theme
    dialog/               one destructive dialog, three questions about it
```

Each example folder has `config.js`, optional `config.css`, and a generated `index.html`. No dependencies and no package install. Media files sit next to the config and get inlined by the build.

## Run

```bash
cd experiments/thunderdome
node build.mjs                          # rebuild every example
node build.mjs examples/cmux-selection  # or one
open examples/cmux-selection/index.html
```

Opened from disk, votes stay in that browser (localStorage). Publish it as an artifact to share one table.

## Voting

The page opens on the duel. Click either card to vote for it, or use the keys:

| key | does |
| --- | --- |
| `←` or `1` | left wins |
| `→` or `2` | right wins |
| `↓`, `3` or space | tie |
| `S` | skip this pair |
| `U` | undo your last vote |
| `R` | replay both clips |

The whole card is the button, so your cursor never leaves the thing you are judging. Dragging to select a contender's name is not a vote, and a clip's own controls play it rather than voting for it. Clicking a vote button hands focus back, so every key in the table keeps meaning what the table says it means.

Two views, `#vote` and `#results`, switched by the tabs in the header. No hash opens the duel, with only the title and the lede above it, and the Results tab carries the vote count. `#results` in a link opens the table directly. A dome with several [questions](#several-questions-in-one-dome) puts the question id in front: `#wording/results`. The keys above are the vote view's; on the results view they are the browser's, so space scrolls the standings. The arena controls are folded into a summary line that shows the current context; open it to pin a specific one. Changing a select turns off "New arena each duel".

Under the cards a line names the current leader once there are three votes in, so you can see your vote land without switching views.

Cards are click-to-vote unless the contenders are themselves interactive (a mock with its own buttons or a hover state you want people to try). Set `interactiveCards: true` for that and the vote buttons carry the whole job.

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
    { id: "shot", name: "As shipped", media: "shots/current.png" },
    { id: "clip", name: "Spinner", media: arena => `clips/spinner-${arena.theme.id}.webm` },
    // any extra fields (paint functions, tokens) ride along for render()
  ],

  media: { aspect: "16 / 9" },        // optional defaults for every contender's media

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
- **Card body** comes from the first of: `contender.render(arena, ctx)`, config `render(contender, arena, ctx)`, `contender.media`, `contender.html` (string, or function of arena). A returned string is parsed as HTML. `ctx.h(tag, attrs, ...children)` is a small element helper (`class`, `text`, `html`, `style`, `on<event>`). A config-wide `render` sits above `media` so it can place the frame itself; call `ctx.media()` to get the element.
- **Dimensions**: selects are re-rolled every duel while "New arena each duel" is on; toggles are not, unless you set `shuffle: true`. Set `default` to choose the starting option. Ids `id`, `a`, `b`, `w`, `t` and `q` are reserved.
- **Styles** for contender markup go in `config.css`. The engine's own classes all start with `td-`, and the theme tokens (`--ink`, `--muted`, `--faint`, `--rule`, `--panel`, `--sans`, `--mono`) are available.
- Other knobs: `k` (Elo K-factor, default 24), `recent` (feed length, default 8), `collection` (db collection, default `votes`), `localKey`, `galleryTitle`, `shuffle: false` to start with a fixed arena, `interactiveCards: true` when the cards have their own controls to click.

## Several questions in one dome

One screen usually raises more than one question. A destructive dialog is a button, a footer layout, and a sentence, and they are worth judging separately even though they share the mock, the arena, and the styles. Give the config a `questions` array instead of a top-level `contenders` and each one gets its own table, its own link, and its own votes.

```js
Thunderdome.start({
  id: "dialog-thunderdome",
  title: "Destructive Dialog Thunderdome",
  questions: [
    { id: "button", short: "Button", title: "Which delete button?",
      lede: "The dialog is the same in all four...",
      contenderLabel: "Button", contenders: [ /* ... */ ] },
    { id: "wording", short: "Wording", title: "How should it say it?",
      contenders: [ /* ... */ ] },
  ],
  arena: { /* shared */ },
  render: (c, a, { h }) => /* shared */,
});
```

- **Each question brings its own `contenders`.** That is the one thing it cannot inherit: borrowing the dome's list would put one set of contenders under two question tags, so a question without its own is an error rather than a second table of the same four things.
- **It may also set** `lede`, `contenderLabel`, `galleryTitle`, `media`, `render`, `swatch` and `interactiveCards`, and inherits the dome's for any it does not name. Those are all per-question because how a card is drawn is part of the question: one dome can ask about HTML mocks and about clips.
- **`id` is the link.** Lowercased, unique, and not `vote` or `results` because those are the views. `title` is the question itself, shown above the cards. `short` is the tab label, falling back to `title` and then to the id.
- **Dome-level, on purpose:** the arena, the split, `k`, `recent`, `collection`, `localKey`, `shuffle`. A question that sets one of those is an error, not a silent no-op. A question asked against a different arena is a different dome, not a tab on this one, and the arena is held steady as you move between questions so you can put two of them side by side in the same context.
- **The hash** is `#<question>/<view>`, either order, case-insensitive: `#wording`, `#wording/results`, `#results/wording`. Both segments are optional. A missing question means the first one, and the page writes it back into the address bar on load, so the URL you copy always says which question it opens. A question that has since been renamed opens the dome rather than a blank page. The tabs are plain `<a href>`s, so back and forward walk your questions.

### Storage and older domes

Votes go in one table per dome, tagged with `q`.

- A config with **no** `questions` writes exactly the vote shape it always did, with no tag, so every dome built before this keeps reading its own history.
- A dome that **gains** `questions` later keeps its untagged votes: they count toward the first question. Elo ignores contender ids it does not know, so any old vote whose contenders are not in question one drops out on its own instead of landing in the wrong table.
- `q` is now a reserved arena dimension id, alongside `id`, `a`, `b`, `w` and `t`. A config with a dimension called `q` has to rename it.

`examples/dialog/` is three questions about one dialog: `node build.mjs examples/dialog`.

## Images, GIFs and video

`contender.media` takes a path, a `{ src, ... }` object, or a function of the arena (so one contender can hold its light and dark recordings). The element is chosen from the extension: `.mp4`, `.webm`, `.mov`, `.m4v` and `.ogv` become a `<video>`, everything else an `<img>`. A URL with no extension needs `kind: "video"` spelled out.

```js
{ id: "spinner", name: "Spinner", media: "clips/spinner.webm" }
{ id: "spinner", name: "Spinner", media: arena => clips.spinner[arena.theme.id] }
{ id: "icon", name: "Filled", media: { src: "icons/filled.svg", frame: true, aspect: "1 / 1" } }
```

Per-item fields, all of which can also be set once under the config's `media` block: `aspect` (CSS `aspect-ratio`), `fit` (`object-fit`, default `contain`), `alt`, `poster`, `loop` (video, default true), `frame` (a neutral backdrop and hairline, default off), `kind`.

**Set `aspect`.** Without it the card resizes when the next duel loads media of a different shape, which moves the button you were about to click. A dome you can vote through quickly is one where nothing under the cursor moves.

**Prefer mp4 or webm over GIF.** A GIF cannot be seeked, so the engine cannot restart it. Two GIFs side by side drift apart within seconds and you end up comparing one treatment at the top of its loop against another halfway through, with nothing on screen telling you that is happening. Video clips are restarted together at the start of every duel, and `R` replays both. GIFs still render, they are just a worse instrument.

Video is muted, looped, `playsinline`, and autoplaying. Under `prefers-reduced-motion: reduce` nothing plays on its own and the clips get controls instead. Gallery clips are paused while you are on the vote view, and below the fold on the results view, so they are not competing with the duel for decode time. Media that fails to load says so on the card, because a blank card still looks votable and a vote cast on one is bad data.

Media referenced by relative path is inlined into `index.html` as a data URI at build time, which is what keeps the built page one self-contained file. `https://` URLs are left as they are. Base64 costs about a third on top of the file size, so keep clips to a few seconds: `examples/motion` is eight clips and 99 KB in total. The build warns past 2 MB for one file and 5 MB for a page.

Keep contenders to one variable when you can. Eight treatments that differ in fill, edge, weight, and hue at once will produce a winner you cannot explain.

## Publish as a claude.ai artifact

The built `index.html` is one file with only Google Fonts outside it (media included, inlined as data URIs), so it publishes as is. Declare the `db` capability so votes go to one shared table:

```text
Artifact publish
  file_path:    experiments/thunderdome/examples/<name>/index.html
  capabilities: { "db": {} }
```

With `db` granted, every vote is a document in the `votes` collection (`{a, b, w, t, ...arena ids}`, where `w` is `"a"`, `"b"`, or `"tie"`, plus `q` when the dome has questions), and every open copy of the page updates live. Signed-in Contributors and up can vote; Viewers see the table and their votes stay local. Without the capability, or opened from disk, votes stay in the browser.

Republishing to the same artifact URL keeps the collection, so you can add a contender mid-run. Old votes still count; the newcomer starts at 1500 and the pairing weights push it into fights until it catches up. Removing a contender drops its bouts from the table without deleting them.

## Read the results

- **Elo** is sequential over all votes in time order, K = 24, everyone starting at 1500. With a few dozen votes, read gaps under about 30 points as a tie until more bouts come in.
- **Split columns** rerun Elo over only that split's votes. The leader of each split is highlighted. A treatment that wins light and loses dark is a finding, not noise.
- **W–L–T** shows how the rating was earned. A high rating on few bouts means "look again", not "ship it".
- **The table is evidence, not the decision.** A contender can rate well and still be ruled out by a constraint the mock does not show. In the cmux run, the runner-up marked selection with a dot in the row's leading glyph slot, which cmux reserves for status (agent state, unread, warnings, PR state), so it was out regardless of its score.
- **Pairing** weights each pair by 1 / (1 + times met)², and never repeats the last pair, so under-voted pairs come up first.
- To take the raw votes out of a shared table, read the `votes` collection (Claude can do this with the artifact data tools) and recompute with `Thunderdome.elo(ids, votes)` from `engine/thunderdome.js`.

Record what you learned the way a case study would: the final table, the losses of the winner, the lever you think made the difference, and where the decision went. [`examples/cmux-selection/RESULTS.md`](examples/cmux-selection/RESULTS.md) is the first one.
