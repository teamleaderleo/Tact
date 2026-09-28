#!/usr/bin/env node
// Inline the engine and one example's config into a single self-contained index.html.
//
//   node build.mjs                      # every folder in examples/
//   node build.mjs examples/my-thing    # one folder
//
// An example folder holds config.js (required) and config.css (optional).
// The output needs no server and loads only Google Fonts, so it can be published
// as a claude.ai artifact as is. Media files referenced by relative path are
// inlined as data URIs to keep that true; https:// URLs are left alone.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const engineJs = readFileSync(join(here, "engine/thunderdome.js"), "utf8");
const engineCss = readFileSync(join(here, "engine/thunderdome.css"), "utf8");

// A path relative to cwd, unless that turns out to be several ../ deep, in which case
// the absolute path is both shorter and clearer. cli.mjs builds into wherever it was
// pointed, so this is not the rare case it used to be.
export const short = p => {
  const r = relative(process.cwd(), p);
  return !r || r.startsWith("../..") ? p : r;
};

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
// `</script` is the obvious one. `<!--` is the one that bites: the HTML tokenizer has a
// double-escaped script state, so once `<!--` and then `<script` have both appeared
// inside a <script> element, the block's own `</script>` no longer closes it and the
// rest of the file is script text that does not parse. A page built from an issue
// titled "x <!--<script" opens blank and nothing says why. Both rewrites survive a JS
// parser: "\/" is "/" and "\!" is "!" in a string, which is where a stranger's text
// ends up.
const inlineJs = s => s.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");
const inlineCss = s => s.replace(/<\/style/gi, "<\\/style");

const MIME = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", svg: "image/svg+xml",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v", ogv: "video/ogg",
};
const EXTS = Object.keys(MIME).join("|");
const QUOTE = `["'\\x60]`;                  // " ' `
// A quoted relative path ending in a media extension, in JS or CSS, with an optional
// ?query or #fragment. https:// never matches: the colon is outside the character class.
const MEDIA_RE = new RegExp(
  `(${QUOTE}|url\\(\\s*)` +                          // 1: opening quote, or url(
  `((?:\\.{1,2}/)?[\\w.@/-]+\\.(?:${EXTS}))` +       // 2: the path
  `((?:[?#][^"'\\x60)\\s]*)?)` +                     // 3: ?v=2 or #frag, dropped on inline
  `(\\1|\\s*\\))`, "gi");                            // 4: the matching close
const MB = 1024 * 1024;

// Swap relative media paths for data URIs so the built page is one file. Anything
// that does not resolve to a file on disk is left exactly as written: it is either a
// remote URL or a typo, and a visibly broken image beats a silently rewritten one.
export function inlineMedia(source, dir, label, seen = new Map(), root = dir) {
  root = resolve(root);   // a trailing separator would make every containment check fail
  return source.replace(MEDIA_RE, (whole, open, path, suffix, close) => {
    const abs = resolve(dir, path);
    // A config is a list of paths someone typed; it should not be able to reach out of
    // the tree and post a file from elsewhere on the machine into a published artifact.
    if (abs !== root && !abs.startsWith(root + sep)) {
      console.warn(`${label}: ${path} resolves outside ${short(root)}; left as written`);
      return whole;
    }
    if (!existsSync(abs) || !statSync(abs).isFile()) return whole;
    const ext = path.split(".").pop().toLowerCase();
    const buf = readFileSync(abs);
    seen.set(abs, buf.length);
    if (buf.length > 2 * MB) console.warn(`${label}: ${path} is ${(buf.length / MB).toFixed(1)} MB; shorter clips vote better`);
    const uri = `data:${MIME[ext]};base64,${buf.toString("base64")}`;
    // Unquoted on the CSS side on purpose. base64 has no quote, paren or space in it,
    // so url(<data uri>) is always valid, and emitting a quote of our own would end the
    // HTML attribute when the url() sits in an inline style="...".
    return /^url\(/i.test(open) ? `url(${uri})` : `${open}${uri}${close}`;
  });
}

// MEDIA_RE is deliberately narrow about what a path may look like, and inlineMedia
// leaves anything it does not match exactly as written. That is right for a URL and
// wrong for "media/Screenshot 2026-09-28 at 10.11.32 AM.png", which is a file sitting
// right there: the page builds, opens fine next to its folder, and arrives empty for
// whoever you sent the single file to. Same net as the inliner but with a path class
// wide enough to catch what it skipped, and it only speaks up when the file exists.
const LOOSE_MEDIA_RE = new RegExp(
  `(${QUOTE}|url\\(\\s*)((?:\\.{1,2}/)?[^"'\\x60()\\n]+?\\.(?:${EXTS}))(?:[?#][^"'\\x60)\\s]*)?(\\1|\\s*\\))`, "gi");

export function warnUninlined(source, dir, label) {
  const said = new Set();
  for (const m of source.matchAll(LOOSE_MEDIA_RE)) {
    const path = m[2];
    if (/^(?:https?:|data:|\/)/i.test(path) || said.has(path)) continue;
    const abs = resolve(dir, path);
    if (!existsSync(abs) || !statSync(abs).isFile()) continue;
    said.add(path);
    console.warn(`${label}: ${path} is on disk but was not inlined, so the built page still points at it. Rename it to letters, digits, dots and dashes.`);
  }
  return [...said];
}

// Run the config against a stub engine to read its title and lede without a DOM.
// Exported because cli.mjs needs the same thing for `results`, and two evaluators would
// be two sets of rules about what a config is allowed to do at load time.
// Everything the config can touch is built inside the context, the capture function
// and the console included, and the config comes back out as JSON. A host function
// handed to a sandbox is a way straight out of it: `console.log.constructor("...")()`
// compiles in this process, and so does `Thunderdome.start.constructor`. That mattered
// less when configs were all handwritten; `cli.mjs new --from-pr` writes one out of a
// stranger's issue and reads it back seconds later, so the escaping in renderConfig
// should not be the only thing standing there.
const BOOT = `
  var __seen = null;
  var Thunderdome = { start: function (c) {
    try { __seen = JSON.stringify(c === undefined ? null : c); } catch (e) { __seen = "{}"; }
  } };
  var console = { log: function () {}, warn: function () {}, error: function () {}, info: function () {}, debug: function () {} };
`;

export function readConfig(js, file) {
  const ctx = vm.createContext(Object.create(null));
  vm.runInContext(BOOT, ctx, { filename: "thunderdome-sandbox" });
  // A config that throws here throws in the browser too, so this is not a metadata
  // nicety being skipped: it is the one place that notices the page is broken before
  // anyone opens it. Said plainly enough that it does not read like a warning you can
  // scroll past.
  try { vm.runInContext(js, ctx, { filename: file, timeout: 1000 }); }
  catch (e) { console.warn(`${file}: threw while loading (${e.message}). The built page will do the same. Using the folder name for the title.`); }
  // Functions in a config (a `swatch`) do not survive the trip. Nothing that reads a
  // config from here wants one: this is for titles, ledes and results tables.
  const seen = typeof ctx.__seen === "string" ? ctx.__seen : null;
  return (seen && JSON.parse(seen)) || {};
}

export function build(dir) {
  const configPath = join(dir, "config.js");
  if (!existsSync(configPath)) throw new Error(`${dir} has no config.js`);
  const rawConfigJs = readFileSync(configPath, "utf8");
  const cssPath = join(dir, "config.css");
  const rawConfigCss = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";
  const media = new Map();
  // Paths may reach out of the example folder into a shared asset dir, but not out of
  // the thunderdome tree. An example built from somewhere else is its own root.
  const root = dir === here || dir.startsWith(here + sep) ? here : dir;
  const configJs = inlineMedia(rawConfigJs, dir, short(configPath), media, root);
  const configCss = inlineMedia(rawConfigCss, dir, short(cssPath), media, root);
  warnUninlined(configJs, dir, short(configPath));
  warnUninlined(configCss, dir, short(cssPath));
  // Metadata comes off the pre-inline source: no reason to hand the vm a megabyte of base64.
  const meta = readConfig(rawConfigJs, configPath);
  const title = meta.title || dir.split("/").pop();
  const description = (meta.lede || "").replace(/<[^>]+>/g, "").slice(0, 300);
  const rel = relative(here, dir) || ".";

  const html = `<!doctype html>
<!-- Generated by experiments/thunderdome/build.mjs from ${rel}/config.js. Edit the config, then rebuild. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ""}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
${inlineCss(engineCss)}
/* ---- ${rel}/config.css ---- */
${inlineCss(configCss)}
</style>
</head>
<body>
<noscript>This page needs JavaScript to run the duels.</noscript>
<script>
${inlineJs(engineJs)}
</script>
<script>
${inlineJs(configJs)}
</script>
</body>
</html>
`;
  const out = join(dir, "index.html");
  writeFileSync(out, html);
  const size = Buffer.byteLength(html);
  const inlined = media.size ? `, ${media.size} media file${media.size === 1 ? "" : "s"} inlined` : "";
  console.log(`wrote ${short(out)} (${(size / 1024).toFixed(1)} KB${inlined})`);
  if (size > 5 * MB) console.warn(`  ${(size / MB).toFixed(1)} MB is a slow first paint and an awkward artifact upload; try shorter or smaller clips`);
}

// Only build when run as a command, so test.mjs can import inlineMedia. Both sides are
// realpath'd: node resolves import.meta.url through symlinks and argv[1] as given, so a
// symlinked build.mjs would otherwise exit 0 having done nothing.
const invoked = (() => {
  if (!process.argv[1]) return false;
  try { return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; }
  catch (e) { return import.meta.url === pathToFileURL(process.argv[1]).href; }
})();
if (invoked) {
  const args = process.argv.slice(2);
  const dirs = args.length
    ? args.map(a => resolve(a))
    : readdirSync(join(here, "examples")).map(d => join(here, "examples", d)).filter(d => statSync(d).isDirectory());
  for (const d of dirs) build(d);
}
