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

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const inlineJs = s => s.replace(/<\/script/gi, "<\\/script");
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
      console.warn(`${label}: ${path} resolves outside ${relative(process.cwd(), root) || "."}; left as written`);
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

// Run the config against a stub engine to read its title and lede without a DOM.
function readConfig(js, file) {
  let captured = null;
  const sandbox = { Thunderdome: { start: c => { captured = c; } }, console };
  try { vm.runInNewContext(js, sandbox, { filename: file, timeout: 1000 }); }
  catch (e) { console.warn(`${file}: could not evaluate for metadata (${e.message}); using folder name`); }
  return captured || {};
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
  const configJs = inlineMedia(rawConfigJs, dir, relative(process.cwd(), configPath), media, root);
  const configCss = inlineMedia(rawConfigCss, dir, relative(process.cwd(), cssPath), media, root);
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
  console.log(`wrote ${relative(process.cwd(), out)} (${(size / 1024).toFixed(1)} KB${inlined})`);
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
