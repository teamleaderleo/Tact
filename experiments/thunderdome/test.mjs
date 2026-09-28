// node --test test.mjs : checks the DOM-free core of the engine.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const T = createRequire(import.meta.url)("./engine/thunderdome.js");
const ids = ["a1", "b2", "c3"];

test("elo is zero-sum and rewards the winner", () => {
  const r = T.elo(ids, [{ a: "a1", b: "b2", w: "a" }, { a: "c3", b: "a1", w: "b" }]);
  assert.ok(r.a1 > 1500 && r.b2 < 1500 && r.c3 < 1500);
  assert.equal(Math.round(r.a1 + r.b2 + r.c3), 4500);
});

test("ties move ratings toward each other and unknown ids are ignored", () => {
  const r = T.elo(ids, [{ a: "a1", b: "b2", w: "a" }, { a: "a1", b: "b2", w: "tie" }, { a: "a1", b: "gone", w: "a" }]);
  const once = T.elo(ids, [{ a: "a1", b: "b2", w: "a" }]);
  assert.ok(r.a1 < once.a1);
});

test("records count wins, losses, ties", () => {
  const rec = T.records(ids, [{ a: "a1", b: "b2", w: "a" }, { a: "b2", b: "c3", w: "tie" }, { a: "c3", b: "a1", w: "a" }]);
  assert.deepEqual(rec.a1, { w: 1, l: 1, t: 0 });
  assert.deepEqual(rec.b2, { w: 0, l: 1, t: 1 });
  assert.deepEqual(rec.c3, { w: 1, l: 0, t: 1 });
});

test("pickPair favors unseen pairs and never repeats the last pair", () => {
  const votes = Array.from({ length: 20 }, () => ({ a: "a1", b: "b2", w: "a" }));
  const seen = {};
  let n = 0;
  const rand = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 400; i++) {
    const p = T.pickPair(ids, votes, "b2|c3", rand);
    assert.notEqual(p.key, "b2|c3");
    seen[p.key] = (seen[p.key] || 0) + 1;
  }
  assert.ok((seen["a1|c3"] || 0) > (seen["a1|b2"] || 0) * 20);
});

test("normalize rejects reserved dimension ids and duplicate contenders", () => {
  const base = { id: "x", contenders: [{ id: "p" }, { id: "q" }] };
  assert.throws(() => T.normalize({ ...base, dimensions: [{ id: "w", options: [{ id: "o" }] }] }), /reserved/);
  assert.throws(() => T.normalize({ ...base, contenders: [{ id: "p" }, { id: "p" }] }), /unique/);
  const C = T.normalize({ ...base, dimensions: [{ id: "theme", options: [{ id: "l" }, { id: "d" }] }, { id: "ic" }] });
  assert.equal(C.dims[0].type, "select"); assert.equal(C.dims[0].shuffle, true);
  assert.equal(C.dims[1].type, "toggle"); assert.equal(C.dims[1].shuffle, false);
  const a = T.resolveArena(C, { theme: "zz", ic: 1 }, true);
  assert.equal(a.theme, null); assert.equal(a.ic, true);
});

test("mediaSpec reads the kind off the extension", () => {
  assert.equal(T.mediaSpec("shots/a.png").kind, "img");
  assert.equal(T.mediaSpec("shots/a.GIF").kind, "img");
  assert.equal(T.mediaSpec("clips/a.webm").kind, "video");
  assert.equal(T.mediaSpec("clips/a.mp4?v=2").kind, "video");
  assert.equal(T.mediaSpec("data:video/webm;base64,AA").kind, "video");
  // No extension to read (a signed artifact link), so it falls back to an image.
  assert.equal(T.mediaSpec("https://ci.example/artifact/9981").kind, "img");
  assert.equal(T.mediaSpec({ src: "https://ci.example/artifact/9981", kind: "video" }).kind, "video");
});

test("mediaSpec fills defaults and lets a contender override them", () => {
  const d = { aspect: "16/9", fit: "cover", frame: true };
  const a = T.mediaSpec("a.png", d);
  assert.equal(a.aspect, "16/9"); assert.equal(a.fit, "cover"); assert.equal(a.frame, true);
  assert.equal(a.loop, true); assert.equal(a.alt, "");
  const b = T.mediaSpec({ src: "b.mp4", aspect: "4/3", loop: false, frame: false, alt: "row" }, d);
  assert.equal(b.aspect, "4/3"); assert.equal(b.fit, "cover");
  assert.equal(b.loop, false); assert.equal(b.frame, false); assert.equal(b.alt, "row");
});

test("mediaSpec returns null when there is nothing to show", () => {
  for (const x of [undefined, null, "", {}, { poster: "p.png" }]) assert.equal(T.mediaSpec(x), null);
});

test("build inlines relative media and leaves everything else alone", async () => {
  const { inlineMedia } = await import("./build.mjs");
  const dir = "examples/motion";
  const seen = new Map();
  const out = inlineMedia(
    `a: "clips/spinner-light.webm", b: "https://x.dev/c.png", c: "clips/nope.webm", d: url(clips/pulse-dark.webm)`,
    dir, "t", seen);
  assert.match(out, /a: "data:video\/webm;base64,[A-Za-z0-9+/]/);
  assert.match(out, /d: url\("data:video\/webm;base64,/);
  assert.ok(out.includes(`b: "https://x.dev/c.png"`), "remote URLs stay as written");
  assert.ok(out.includes(`c: "clips/nope.webm"`), "a path that is not on disk stays visibly broken");
  assert.equal(seen.size, 2);
});
