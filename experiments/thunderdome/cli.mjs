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
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const eq = a.indexOf("=");
    const key = eq > 0 ? a.slice(2, eq) : a.slice(2);
    let val = eq > 0 ? a.slice(eq + 1) : null;
    if (val == null) val = argv[i + 1] != null && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    if (key in out) out[key] = (Array.isArray(out[key]) ? out[key] : [out[key]]).concat(val);
    else out[key] = val;
  }
  return out;
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
    id: slug(args.id || name),
    title: typeof args.title === "string" ? args.title : titleCase(name),
    lede: typeof args.lede === "string" ? args.lede : "",
  };
  if (typeof args["asked-by"] === "string") spec.askedBy = args["asked-by"];
  if (typeof args.aspect === "string") spec.media = { aspect: args.aspect };
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
    if (!MEDIA_URL.test(url) && !GH_ASSET.test(url)) return;
    if (out.some(x => x.src === url)) return;
    out.push({ src: url, alt: alt || "" });
  };
  const text = String(body || "");
  for (const m of text.matchAll(/!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?[^)]*\)/g)) push(m[2], m[1]);
  for (const m of text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) push(m[1], "");
  for (const m of text.matchAll(/(?<!\()\bhttps?:\/\/[^\s<>")\]]+/g)) push(m[0], "");
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

export function parseRef(s) {
  const m = /^([\w.-]+)\/([\w.-]+)(?:#|\/(?:pull|issues)\/)(\d+)$/.exec(String(s).replace(/^https:\/\/github\.com\//, ""));
  if (!m) throw new Error(`not an issue or PR reference: ${s} (want owner/repo#123)`);
  return { owner: m[1], repo: m[2], number: +m[3] };
}

// Source text, not JSON with a wrapper. Someone is going to open this file and change a
// name, and a config that reads like the handwritten ones is a config they can edit.
export function renderConfig(spec) {
  const j = v => JSON.stringify(v);
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
    `// ${spec.title || spec.id}`,
    spec.askedBy ? `// Asked by ${spec.askedBy}.` : null,
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
  const conf = T.confidence(ids, mine, D.confidence || {});
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
  let verdict;
  if (!conf.ahead) {
    verdict = conf.bouts
      ? `Not enough bouts to say who is ahead yet: ${conf.bouts} so far.`
      : "No bouts yet, so the table is the prior and nothing else.";
  } else {
    const [a, b] = order, pct = Math.round(conf.ahead[a][b] * 100);
    verdict = pct >= 95
      ? `${name(a)} is ahead of ${name(b)} in ${pct}% of resamples.`
      : `${name(a)} and ${name(b)} are too close to call: ${pct}% of resamples put ${name(a)} ahead.`;
  }
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
  if (cfg && cfg.title) out.push(`## ${cfg.title}`, "");
  for (const t of tables) {
    if (t.title) out.push(`### ${t.title}`, "");
    out.push("| # | | Elo | W–L–T |", "|---:|---|---:|---:|");
    for (const r of t.rows) {
      const elo = r.spread == null ? String(r.rating) : `${r.rating} ±${r.spread}`;
      out.push(`| ${r.rank} | ${r.name} | ${elo} | ${r.record} |`);
    }
    out.push("", t.verdict, "");
  }
  if (cfg && cfg.askedBy) out.push(`Asked by ${cfg.askedBy}.`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ---------- commands ----------

function gh(args) {
  try {
    return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    const msg = (e.stderr || e.message || "").toString().trim().split("\n")[0];
    throw new Error(`gh failed: ${msg || e.message}. Is the GitHub CLI installed and logged in?`);
  }
}

function readSpec(where) {
  const raw = where === "-" ? readFileSync(0, "utf8") : readFileSync(resolve(where), "utf8");
  const spec = JSON.parse(raw);
  if (!spec || typeof spec !== "object") throw new Error("spec must be a JSON object");
  return spec;
}

// Screenshots live wherever you took them. The build inlines media that sits inside the
// dome folder and leaves everything else as written, so a page built from /tmp/shot.png
// would come out with four broken cards. Copy them in first and rewrite the spec to
// point at the copies, so one command really does give you a page you can send someone.
// https:// srcs are left alone: they are already reachable from anywhere.
// A local path that is not a file is a typo, and a typo that builds is worse than one
// that fails: you find out when someone else opens the page and one card is empty.
export function gatherMedia(spec, dir, fs = FS) {
  const taken = new Set(), missing = [], copies = [];
  const root = resolve(dir);
  const bring = c => {
    if (typeof c.media !== "string" || /^(https?:|data:)/i.test(c.media)) return c;
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
    let base = basename(src), i = 2;
    while (taken.has(base)) base = `${basename(src, extname(src))}-${i++}${extname(src)}`;
    taken.add(base);
    copies.push([src, join(root, "media", base)]);
    return { ...c, media: `media/${base}` };
  };
  // Plan every copy before making any, so one bad path leaves the folder as it was
  // rather than half-populated with files the config it never wrote would have used.
  const planned = spec.questions
    ? { ...spec, questions: spec.questions.map(q => ({ ...q, contenders: (q.contenders || []).map(bring) })) }
    : { ...spec, contenders: (spec.contenders || []).map(bring) };
  if (missing.length) {
    throw new Error(`no such media file${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
  }
  for (const [src, dest] of copies) fs.copyIn(src, dest);
  if (planned.questions) spec.questions = planned.questions;
  else spec.contenders = planned.contenders;
  return copies.length;
}

const FS = {
  isFile: p => existsSync(p) && statSync(p).isFile(),
  copyIn: (src, dest) => { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(src, dest); },
};

function cmdNew(args) {
  const name = args._[1];
  if (!name) throw new Error("usage: cli.mjs new <name> [--title ...] [--media a.png --media b.png] [--spec file|-] [--from-pr owner/repo#123]");
  let spec;
  if (args["from-pr"] || args["from-issue"] || args.from) {
    const ref = parseRef(args["from-pr"] || args["from-issue"] || args.from);
    const issue = JSON.parse(gh(["api", `repos/${ref.owner}/${ref.repo}/issues/${ref.number}`]));
    spec = specFromIssue(ref, issue);
    spec.id = slug(args.id || name);
    if (typeof args.title === "string") spec.title = args.title;
  } else if (args.spec) {
    spec = { ...readSpec(args.spec === true ? "-" : args.spec) };
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

  const dir = args.out ? resolve(String(args.out)) : join(here, "examples", slug(name));
  mkdirSync(dir, { recursive: true });
  const configPath = join(dir, "config.js");
  if (existsSync(configPath) && !args.force) {
    throw new Error(`${short(configPath)} already exists; pass --force to overwrite`);
  }
  const copied = gatherMedia(spec, dir);
  writeFileSync(configPath, renderConfig(spec));
  console.log(`wrote ${short(configPath)} (${count} contenders${copied ? `, ${copied} media file${copied === 1 ? "" : "s"} copied in` : ""})`);
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
    const raw = args.votes === "-" || args.votes === true ? readFileSync(0, "utf8") : readFileSync(resolve(String(args.votes)), "utf8");
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
          --out <dir>   somewhere other than examples/<name>
          --aspect 16/9 media box shape
          --force       overwrite an existing config.js
          --no-build    write the config and stop
results   recomputes the table from an exported votes list
build     rebuilds an existing dome
`;

function main(argv) {
  const args = parseArgs(argv);
  const cmd = args._[0];
  if (!cmd || args.help || cmd === "help") { process.stdout.write(USAGE); return; }
  if (cmd === "new") return void cmdNew(args);
  if (cmd === "results") return void cmdResults(args);
  if (cmd === "build") return void build(domeDir(args._[1] || "."));
  throw new Error(`unknown command "${cmd}". Try: new, results, build`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try { main(process.argv.slice(2)); }
  catch (e) { console.error(`thunderdome: ${e.message}`); process.exit(1); }
}
