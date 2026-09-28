# Thunderdome

**Pairwise design judgment with a shared Elo table.**

Thunderdome puts candidate designs in a ring two at a time. You pick the one you would rather live with, and every vote feeds an Elo table. It is the Tact rule "show the difference, then name the difference" run as a tournament: the page shows two concrete alternatives, and the table tells you which differences kept winning so you can go name why.

Ranking eight things at once is hard. People anchor on the first few they see, lose track of what they already compared, and flatten close calls. A single pair is easy: left, right, or tie. Many quick pairwise calls, each in a slightly different context, add up to an ordering you can trust more than any one careful ranking.

```text
candidate designs
-> random pair in a random arena
-> left / right / tie
-> Elo with an interval, overall and per split
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
  engine/thunderdome.js   engine: pairing, voting, ratings, feed, gallery, storage
  engine/thunderdome.css  page chrome, light and dark
  build.mjs               inlines engine + one config into a single index.html
  cli.mjs                 make a dome from screenshots or a GitHub thread; read results
  test.mjs                node --test for the DOM-free core
  examples/
    starter/              smallest config: four HTML-snippet buttons
    cmux-selection/       cmux sidebar selection, eight treatments (see RESULTS.md)
    cmux-sidebar-groups/  cmux sidebar organization: six layouts of the same 24 workspaces (overview-*.png show all six)
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

## Make one from the command line

A dome is a config and a build, so it can be one command. `cli.mjs` is for the case where
you have the candidates already and do not want to write a config by hand: screenshots on
disk, or an issue where someone has pasted four mocks and asked which one.

```bash
node cli.mjs new red-button --title "Which delete button?" \
  --media shots/solid-red.png --media shots/outlined-red.png \
  --media shots/text-red.png --media shots/solid-grey.png
# wrote examples/red-button/config.js (4 contenders, 4 media files copied in)
# wrote examples/red-button/index.html (691.4 KB, 4 media files inlined)
```

Names come off the filenames, so `shots/dense-rows@2x.png` becomes "Dense rows". Media is
copied into the dome folder first, because the build only inlines what sits inside it and
a page built from `/tmp` would come out with empty cards. A `--media` path that is not a
file stops the command rather than building a dome with a hole in it.

`--from-pr` reads the title and the images out of the body of an issue or a PR, which is
the other half of the round trip: the thread asking the question becomes the thing that
answers it. The body only, not the comments and not the diff, so what you get is the
question as it was asked.

```bash
node cli.mjs new dialog --from-pr teamleaderleo/Tact#105
node cli.mjs new dialog --from-issue https://github.com/manaflow-ai/cmux/issues/13742
```

Markdown images, `<img src>` and bare image URLs all count, in that order, and alt text
becomes the contender name where there is any. Anything inside a code fence, backticks or
an HTML comment is left alone, so a body that quotes some markdown does not get voted on.
The images are downloaded into the dome's `media/` folder, because a GitHub attachment URL
on a private repo only loads for people already logged in and the point of the output is
one file you can send someone; `--link-media` leaves them as URLs instead. Every image URL
in the body gets fetched, so read a body you did not write before pointing the command at
it. The reference is recorded as `askedBy`, which the lede links to and `--md` prints in
its footer, so the answer can find its way back to the question. Needs `gh` on the path
and logged in.

For anything the flags do not cover, `--spec` takes the whole config as JSON, including
`questions` for a multi-question dome:

```bash
node cli.mjs new density --spec - <<'JSON'
{"title": "How dense?", "contenders": [{"id": "roomy", "name": "Roomy", "media": "a.png"},
                                       {"id": "tight", "name": "Tight", "media": "b.png"}]}
JSON
```

Media paths in a spec are resolved from where you ran the command, the same as `--media`,
in both the `"a.png"` and the `{"src": "a.png"}` form. Keys the flags do not know about
are written through to the config as they are, so `"confidence": {"level": 0.8}` in a spec
is what the built page computes with. `--media` is for building the contenders out of
files, so it cannot be combined with `--spec` or `--from-pr`.

`--out <dir>` puts the dome somewhere other than `examples/<name>`, `--no-build` writes
the config and stops, `--force` overwrites one that is already there, and `build <name>`
rebuilds without touching the config.

### Results without opening the page

Export the votes (the `votes` collection from a shared table, or the localStorage array)
and hand them to `results`. It reads the dome's own config, so the ids, names and
questions are the ones the page used.

```bash
node cli.mjs results red-button --votes votes.json
```

```text
Which delete button?

  #                     Elo    W–L–T
  1  Solid red     1653 ±57  66–22–0
  2  Outlined red  1543 ±42  60–46–0
  3  Text red      1432 ±48  34–59–0
  4  Solid grey    1373 ±66  20–53–0
  Solid red is ahead of Outlined red in 99% of resamples.
```

`--md` gives the same thing as a markdown table to paste back into the thread that asked,
and `--json` gives the numbers. A multi-question dome prints one table per question, and
votes with no `q` tag count toward the first question, the same as in the browser. The
rating, the interval and the sentence underneath come from the same functions the page
calls, with the dome's own `confidence` settings, so the two cannot drift apart. The one
thing the terminal leaves out is the per-[`split`](#author-a-config) columns: open the
page for those.

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

### Saying why

After a vote, a one-line box appears under the cards: "Why Solid red over Outlined red? (optional)". Type a reason and press Enter, or ignore it and keep voting. `C` focuses it if your hands are on the keys.

The box never takes focus on its own, so a run of fast votes stays a run of fast votes. It also does not retarget while it holds text you have not sent: if you start a sentence and then vote twice more, the sentence still belongs to the duel you started writing about, and the placeholder still names that pair. Escape drops it.

A note rides on the vote (`vote.why`), which is what makes the rest of it fall out for free: it is tagged with the question the vote was cast in, it arrives over a shared table like any other vote, and `U` takes the note away with the bout. Notes are trimmed and cut at `comments.max` characters, 140 by default. One line is the format, and a box that stops you at the end of it says so better than a paragraph nobody reads under a card.

On the results view the notes hang under the candidate they were written about: the winner of that duel, or both sides of a tie, each with what it was up against. Nobody carries a note about a duel they lost, because a note is the reason for a pick and not a caption on a card. The recent-bouts feed shows them too, under the line for the bout. `comments: false` drops the box and the notes.

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
- Other knobs: `comments` (`false` to drop the note box, or `{max: 140}` for a different length), `confidence` (`false` for a bare rating, or `{prior: 200, minBouts: 8, level: .9}`), `k` (still accepted, no longer read by anything; `Thunderdome.elo()` takes its K-factor as an argument), `recent` (feed length, default 8), `collection` (db collection, default `votes`), `localKey`, `galleryTitle`, `shuffle: false` to start with a fixed arena, `interactiveCards: true` when the cards have their own controls to click.

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
- **Dome-level, on purpose:** the arena, the split, `k`, `confidence`, `recent`, `collection`, `localKey`, `shuffle`. A question that sets one of those is an error, not a silent no-op. A question asked against a different arena is a different dome, not a tab on this one, and the arena is held steady as you move between questions so you can put two of them side by side in the same context.
- **The hash** is `#<question>/<view>`, either order, case-insensitive: `#wording`, `#wording/results`, `#results/wording`. Both segments are optional. A missing question means the first one, and the page writes it back into the address bar on load, so the URL you copy always says which question it opens. A question that has since been renamed opens the dome rather than a blank page. The tabs are plain `<a href>`s, so back and forward walk your questions.

### Storage and older domes

Votes go in one table per dome, tagged with `q`.

- A config with **no** `questions` writes exactly the vote shape it always did, with no tag, so every dome built before this keeps reading its own history.
- A dome that **gains** `questions` later keeps its untagged votes: they count toward the first question. The fit ignores contender ids it does not know, so any old vote whose contenders are not in question one drops out on its own instead of landing in the wrong table.
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

- **Elo** is a Bradley-Terry fit over all the votes at once, on the usual Elo scale (400 points is 10:1), with an L2 prior of 200 points pulling toward 1500. It does not depend on the order the votes arrived in, and the prior is what keeps a contender that has never lost at a finite number instead of an impressive one.
- **± is the spread**, the middle 90% of 300 refits, reported as a half-width. Hover the number for the two ends. Each refit takes two draws: the votes are resampled with replacement, and the prior's centre is drawn from the prior. Under 8 bouts there is no ± at all, because a handful of votes still returns a number and the reader has no way to tell it from an earned one.
- **The line under the table** is the claim the ranking is making: "Solid red is ahead of Outlined red in 99% of resamples", or "too close to call: 91% of resamples put Right, danger last ahead". The bar is the one-sided form of the interval's own level, so 95% at the default `level: .9`. The rank column always reads 1, 2, 3, 4; this is the sentence that tells you whether to believe it.
- **The vote view names a leader** once the top two are further apart than `1000 / sqrt(bouts)` Elo, which is roughly where the spread sits. It is the cheap version of the same call, so you are not made to switch views to find out whether anything is happening; it agrees with the line under the table 95% of the time or better.
- **Split columns** refit over only that split's votes. The leader of each split is highlighted. A treatment that wins light and loses dark is a finding, not noise. No ± there: four spreads in a row is a table nobody reads, and the split columns are the place to look for a pattern rather than a verdict.
- **[Notes](#saying-why)** are the part the numbers cannot give you. Two candidates a point apart with one of them carrying "reads at a glance, the other made me stop" is a decision; the same two points with no notes is a coin flip you have dressed up.
- **W–L–T** shows how the rating was earned. A high rating on few bouts means "look again", not "ship it".
- **The table is evidence, not the decision.** A contender can rate well and still be ruled out by a constraint the mock does not show. In the cmux run, the runner-up marked selection with a dot in the row's leading glyph slot, which cmux reserves for status (agent state, unread, warnings, PR state), so it was out regardless of its score.
- **Pairing** weights each pair by 1 / (1 + times met)², and never repeats the last pair, so under-voted pairs come up first.
- To take the raw votes out of a shared table, read the `votes` collection (Claude can do this with the artifact data tools) and recompute with `Thunderdome.confidence(ids, votes)` from `engine/thunderdome.js`. It returns `{rating, lo, hi, ahead, bouts}`, where `ahead.x.y` is the share of resamples putting `x` over `y`. `Thunderdome.fit(ids, votes)` is the point estimate on its own, and `Thunderdome.elo(ids, votes)` is still there for the sequential version. `Thunderdome.comments(ids, votes)` groups the notes the same way the page does, so a summary of why people voted as they did can be written from the same export.

### Why the table is fitted rather than accumulated

Sequential Elo walks the votes in order and nudges two ratings at a time. It is the right thing for a ladder that is still being played, and the wrong thing for a table you read at the end of a run: the same votes in a different order give different numbers.

It is also not something you can put an interval on honestly. Bootstrapping sequential Elo produces an interval that gets **narrower as the data gets scarcer**: ±44 at 20 votes against ±65 at 600, covering the true rating 0 times out of 4 at the small size. With K = 24 the ratings have barely left 1500 after 20 bouts, so the bootstrap measures how tightly the estimate clusters around its own bias, not how far it is from the answer. Resampling the fit instead moves the right way: ±147 at 20 votes, ±84 at 60, ±46 at 200, ±27 at 600.

Each refit is centered on the field before the percentiles are taken. Bradley-Terry is identified only up to an additive constant, so an uncentered refit carries a shift of the whole field that says nothing about any one contender, and a 25-point shift eats a 26-point interval alive: coverage of a nominal 90% interval measured 60% uncentered and 91% centered. The table is read as an ordering, so the thing the interval has to cover is each rating relative to the field.

The prior's centre is drawn too, not just the votes. Resampling the votes alone asks "how much would this move if the same voters voted again", which is the whole question for a contender with a mixed record and no question at all for one that has never lost: every resample of an all-wins record is still all wins, the rating is held where the prior stops it, and the table prints an unbeaten contender on 20 bouts as ±3 and a contender with a 0–0–0 record as ±0. Those two are the least certain rows on the page. Drawing the prior's centre from the prior puts that uncertainty where it belongs. Measured against known truth over 150 runs at each size, four contenders, nominal 90%: coverage 84/82/90/88% at 20/60/200/600 votes with the votes alone, and 92/86/91/89% with both draws. The well-fed half-widths do not move (±48 to ±49 at 200 votes), so it only widens the rows that were claiming more than they knew.

The resample count comes down as the vote list grows, since every resample is another fit. 8 contenders costs about 35ms at 240 votes and about 31ms at 2000. It runs when the results view asks for the table, not on every vote: the same work on the vote view would land on the frame that is trying to paint the card you just picked.

`confidence: false` turns the whole thing off and leaves a bare rating. `confidence: {prior, minBouts, level}` changes the settings. The `k` config key is still accepted, and dome-level, but nothing reads it any more: `Thunderdome.elo()` takes its K-factor as an argument.

Record what you learned the way a case study would: the final table, the losses of the winner, the lever you think made the difference, and where the decision went. [`examples/cmux-selection/RESULTS.md`](examples/cmux-selection/RESULTS.md) is the first one.
