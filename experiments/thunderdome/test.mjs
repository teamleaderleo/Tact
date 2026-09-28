// node --test test.mjs : checks the DOM-free core of the engine.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

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

test("a dome with no questions is a dome with one anonymous question", () => {
  const D = T.normalizeDome({ id: "x", title: "T", contenders: [{ id: "p" }, { id: "q" }] });
  assert.equal(D.multi, false);
  assert.equal(D.questions.length, 1);
  assert.equal(D.questions[0].id, null, "no id means no q tag on the votes, so old tables still read");
  assert.deepEqual(D.questions[0].contenders.map(c => c.id), ["p", "q"]);
});

test("questions inherit the dome and override what they name", () => {
  const domeRender = () => "dome", ownRender = () => "own", sw = () => "#000";
  const D = T.normalizeDome({
    id: "d", title: "Dome", lede: "shared", contenderLabel: "Thing", k: 32,
    render: domeRender, swatch: sw, media: { aspect: "16/9" },
    arena: { dimensions: [{ id: "theme", options: [{ id: "l" }, { id: "d" }] }] },
    questions: [
      { id: "Button", title: "Which button?", contenders: [{ id: "a" }, { id: "b" }] },
      { id: "copy", short: "Words", lede: "its own", contenderLabel: "Wording",
        render: ownRender, media: { aspect: "4/3" }, interactiveCards: true,
        contenders: [{ id: "c" }, { id: "d" }] },
    ],
  });
  assert.equal(D.multi, true);
  assert.equal(D.k, 32, "the K factor is the dome's");
  assert.equal(D.dims.length, 1, "so is the arena");
  assert.equal(D.questions[0].id, "button", "ids are lowercased so the hash is case-insensitive");
  assert.equal(D.questions[0].label, "Which button?", "a question with no short is labelled by its title");
  assert.equal(D.questions[0].lede, "shared", "and inherits the dome's lede");
  assert.equal(D.questions[0].contenderLabel, "Thing");
  assert.equal(D.questions[1].label, "Words");
  assert.equal(D.questions[1].lede, "its own");
  assert.equal(D.questions[1].contenderLabel, "Wording");
  assert.deepEqual(D.questions[1].contenders.map(c => c.id), ["c", "d"]);
  // How a card is drawn is per-question: one dome can ask about HTML mocks and about
  // clips, and the README says so, so the engine has to actually carry these across.
  assert.equal(D.questions[0].render, domeRender);
  assert.equal(D.questions[1].render, ownRender);
  assert.equal(D.questions[0].media.aspect, "16/9");
  assert.equal(D.questions[1].media.aspect, "4/3");
  assert.equal(D.questions[0].swatch, sw, "and inherited when the question says nothing");
  assert.equal(D.questions[0].interactiveCards, false);
  assert.equal(D.questions[1].interactiveCards, true);
});

test("normalizeDome rejects ids it cannot route", () => {
  const two = [{ id: "a" }, { id: "b" }];
  const dome = q => ({ id: "d", questions: q });
  assert.throws(() => T.normalizeDome(dome([])), /empty/);
  assert.throws(() => T.normalizeDome(dome([{ contenders: two }])), /needs an id/);
  assert.throws(() => T.normalizeDome(dome([{ id: "x", contenders: two }, { id: "X", contenders: two }])), /unique/);
  // "results" in the hash is the view, so it cannot also be a question.
  assert.throws(() => T.normalizeDome(dome([{ id: "results", contenders: two }])), /view name/);
  assert.throws(() => T.normalizeDome({ ...dome([{ id: "x", contenders: two }]), arena: { dimensions: [{ id: "q" }] } }), /reserved/);
});

test("normalizeDome will not guess at a config it cannot read", () => {
  const two = [{ id: "a" }, { id: "b" }];
  // An object map of questions is a plausible thing to write, and silently ignoring it
  // gave you a working-looking single-question dome writing untagged votes.
  assert.throws(() => T.normalizeDome({ id: "d", questions: { x: { contenders: two } } }), /must be a list/);
  assert.throws(() => T.normalizeDome({ id: "d", questions: "x" }), /must be a list/);
  assert.throws(() => T.normalizeDome({ id: "d", questions: [null] }), /not an object/);
  // Borrowing the dome's contenders would put one contender set under two question tags,
  // so a typo'd key is an error rather than a second table of the same four things.
  assert.throws(() => T.normalizeDome({ id: "d", contenders: two, questions: [{ id: "x" }] }), /its own contenders/);
  // A question that reaches for a dome-level knob is told, not quietly ignored.
  assert.throws(() => T.normalizeDome({ id: "d", questions: [{ id: "x", contenders: two, k: 99 }] }), /dome-level/);
  assert.throws(() => T.normalizeDome({ id: "d", questions: [{ id: "x", contenders: two, arena: {} }] }), /dome-level/);
  // A numeric id is an id.
  assert.equal(T.normalizeDome({ id: "d", questions: [{ id: 0, contenders: two }] }).questions[0].id, "0");
});

test("a broken question says which question it is", () => {
  const two = [{ id: "a" }, { id: "b" }];
  assert.throws(() => T.normalizeDome({ id: "d", questions: [
    { id: "one", contenders: two },
    { id: "two", contenders: [{ id: "z" }, { id: "z" }] },
  ] }), /question "two"/);
});

test("the hash carries a question and a view, in either order", () => {
  const ids = ["density", "copy"];
  assert.deepEqual(T.parseHash("", ids), { q: null, view: "vote" });
  assert.deepEqual(T.parseHash("#results", ids), { q: null, view: "results" });
  assert.deepEqual(T.parseHash("#density", ids), { q: "density", view: "vote" });
  assert.deepEqual(T.parseHash("#density/results", ids), { q: "density", view: "results" });
  assert.deepEqual(T.parseHash("#results/density", ids), { q: "density", view: "results" });
  assert.deepEqual(T.parseHash("#DENSITY/Results", ids), { q: "density", view: "results" });
  // First of each kind wins, so a hash carrying two of either reads the same way round.
  assert.deepEqual(T.parseHash("#results/vote", ids), { q: null, view: "results" });
  assert.deepEqual(T.parseHash("#density/copy", ids), { q: "density", view: "vote" });
  // A question that no longer exists still opens the dome instead of a blank page.
  assert.deepEqual(T.parseHash("#gone/results", ids), { q: null, view: "results" });
  assert.deepEqual(T.parseHash("#td-shuffle", ids), { q: null, view: "vote" });
});

test("hashFor round-trips through parseHash", () => {
  const ids = ["a b", "c"];
  for (const q of [null, "a b", "c"]) for (const v of ["vote", "results"]) {
    assert.deepEqual(T.parseHash(T.hashFor(q, v), ids), { q, view: v });
  }
});

test("cards are click-to-vote unless the config opts out", () => {
  const base = { id: "x", contenders: [{ id: "p" }, { id: "q" }] };
  assert.equal(T.normalize(base).interactiveCards, false);
  assert.equal(T.normalize({ ...base, interactiveCards: true }).interactiveCards, true);
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
  const d = { aspect: "16/9", fit: "cover", frame: true, loop: false, poster: "p.png", alt: "shared" };
  const a = T.mediaSpec("a.png", d);
  assert.equal(a.aspect, "16/9"); assert.equal(a.fit, "cover"); assert.equal(a.frame, true);
  assert.equal(a.poster, "p.png"); assert.equal(a.alt, "shared");
  assert.equal(a.loop, false, "a config-level loop:false has to reach the contender");
  const b = T.mediaSpec({ src: "b.mp4", aspect: "4/3", loop: true, frame: false, alt: "row" }, d);
  assert.equal(b.aspect, "4/3"); assert.equal(b.fit, "cover");
  assert.equal(b.loop, true); assert.equal(b.frame, false); assert.equal(b.alt, "row");
  // kind set once for a whole set of extension-less artifact links.
  assert.equal(T.mediaSpec("https://ci.example/artifact/9981", { kind: "video" }).kind, "video");
  assert.equal(T.mediaSpec({ src: "a.png", kind: "img" }, { kind: "video" }).kind, "img");
  // With no default and no extension, still an image.
  assert.equal(T.mediaSpec("https://ci.example/artifact/9981", {}).kind, "img");
});

test("mediaSpec returns null when there is nothing to show", () => {
  for (const x of [undefined, null, "", {}, { poster: "p.png" }]) assert.equal(T.mediaSpec(x), null);
});

test("build inlines relative media and leaves everything else alone", async () => {
  const { inlineMedia } = await import("./build.mjs");
  // Not "examples/motion": every other test here runs from any cwd, and so should this.
  const dir = fileURLToPath(new URL("examples/motion", import.meta.url));
  const seen = new Map();
  const out = inlineMedia(
    `a: "clips/spinner-light.webm", b: "https://x.dev/c.png", c: "clips/nope.webm", d: url(clips/pulse-dark.webm)`,
    dir, "t", seen);
  assert.match(out, /a: "data:video\/webm;base64,[A-Za-z0-9+/]/);
  assert.match(out, /d: url\(data:video\/webm;base64,/);
  assert.ok(out.includes(`b: "https://x.dev/c.png"`), "remote URLs stay as written");
  assert.ok(out.includes(`c: "clips/nope.webm"`), "a path that is not on disk stays visibly broken");
  assert.equal(seen.size, 2);
});

test("build keeps an inlined url() out of the quotes around it", async () => {
  const { inlineMedia } = await import("./build.mjs");
  const dir = fileURLToPath(new URL("examples/motion", import.meta.url));
  // The url() sits inside a double-quoted HTML attribute. Emitting our own quotes here
  // would end the attribute and drop the background on the floor.
  const out = inlineMedia(`html: '<div style="background:URL(clips/bar-light.webm) repeat"></div>'`, dir, "t");
  assert.match(out, /background:url\(data:video\/webm;base64,[A-Za-z0-9+/=]+\) repeat/);
  assert.equal(out.split('"').length, 3, "the attribute still has exactly its own two quotes");
});

test("build inlines a cache-busted path and refuses to reach out of the tree", async () => {
  const { inlineMedia } = await import("./build.mjs");
  const dir = fileURLToPath(new URL("examples/motion", import.meta.url));
  const root = fileURLToPath(new URL(".", import.meta.url));
  const seen = new Map();
  const out = inlineMedia(`a: "clips/bar-dark.webm?v=2", b: "../../../../etc/hosts.png"`, dir, "t", seen, root);
  assert.match(out, /a: "data:video\/webm;base64,/, "the ?query is dropped, not left as a broken path");
  assert.ok(out.includes(`b: "../../../../etc/hosts.png"`), "a path outside the tree stays as written");
  assert.equal(seen.size, 1);
});
