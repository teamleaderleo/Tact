// node --test test.mjs : checks the DOM-free core of the engine.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

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

// A field of four whose true ratings are known, so a fit can be checked against an
// answer instead of against itself. Deterministic: the same seed gives the same votes.
const FIELD = ["a", "b", "c", "d"];
const TRUTH = { a: 1650, b: 1560, c: 1480, d: 1410 };
function synth(m, seed) {
  let s = seed >>> 0;
  const rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const v = [];
  for (let i = 0; i < m; i++) {
    let x = FIELD[(rand() * 4) | 0], y = FIELD[(rand() * 4) | 0];
    while (y === x) y = FIELD[(rand() * 4) | 0];
    const p = 1 / (1 + Math.pow(10, (TRUTH[y] - TRUTH[x]) / 400));
    v.push({ a: x, b: y, w: rand() < p ? "a" : "b", t: i });
  }
  return v;
}

test("fit recovers the ordering and stays on the Elo scale", () => {
  // 1500 votes, because b and c are 80 points apart and 400 is not enough to tell them
  // apart reliably. That is the honest amount of data for this assertion, and the
  // interval test below is the one that says so on smaller samples.
  const r = T.fit(FIELD, synth(1500, 7));
  assert.deepEqual(FIELD.slice().sort((x, y) => r[y] - r[x]), ["a", "b", "c", "d"]);
  // The prior pulls toward 1500 rather than pinning the mean there, so this is a
  // sanity band on the scale, not an identity.
  for (const id of FIELD) assert.ok(Math.abs(r[id] - TRUTH[id]) < 80, `${id}: ${r[id]}`);
});

test("fit does not care what order the votes arrived in", () => {
  const votes = synth(120, 11);
  const forward = T.fit(FIELD, votes);
  const backward = T.fit(FIELD, votes.slice().reverse());
  for (const id of FIELD) assert.ok(Math.abs(forward[id] - backward[id]) < 1e-6);
  // Which is the whole reason the table left sequential Elo behind.
  const e1 = T.elo(FIELD, votes), e2 = T.elo(FIELD, votes.slice().reverse());
  assert.ok(Math.abs(e1.a - e2.a) > 1);
});

test("the prior keeps an undefeated contender finite", () => {
  const sweep = [];
  for (let i = 0; i < 30; i++) for (const other of ["b", "c", "d"]) sweep.push({ a: "a", b: other, w: "a" });
  const r = T.fit(FIELD, sweep);
  assert.ok(r.a > 1700 && r.a < 2600, String(r.a));
  assert.ok(Number.isFinite(r.a));
});

test("ties pull two contenders together", () => {
  const wins = T.fit(FIELD, [{ a: "a", b: "b", w: "a" }, { a: "a", b: "b", w: "a" }]);
  const drawn = T.fit(FIELD, [{ a: "a", b: "b", w: "a" }, { a: "a", b: "b", w: "tie" }]);
  assert.ok(wins.a - wins.b > drawn.a - drawn.b);
});

// A record between exactly two contenders is the sharpest test of the fit, because there
// is one gap and every vote bears on it. It is also the shape the solver used to diverge
// on: gradients taken from the ratings at the top of a sweep and applied all at once
// moved the gap twice as far as it should, and a 130-70 record ran off to -12776 Elo.
const lopsided = (wa, wb) => [
  ...Array.from({ length: wa }, (_, i) => ({ a: "x", b: "y", w: "a", t: i })),
  ...Array.from({ length: wb }, (_, i) => ({ a: "x", b: "y", w: "b", t: wa + i })),
];

test("two contenders stay on the scale however many votes they get", () => {
  const SCALE = 400 / Math.log(10);
  for (const [wa, wb] of [[13, 7], [33, 17], [130, 70], [1300, 700]]) {
    const r = T.fit(["x", "y"], lopsided(wa, wb));
    const gap = r.x - r.y, unshrunk = Math.log(wa / wb) * SCALE;
    assert.ok(r.x > r.y, `${wa}-${wb}: ${r.x} ${r.y}`);
    // The prior shrinks the gap toward zero and never past it, and the more votes there
    // are the less it shrinks: at 2000 bouts the fit is the plain MLE to within a point.
    assert.ok(gap > 0 && gap <= unshrunk + 1e-6, `${wa}-${wb}: gap ${gap} vs ${unshrunk}`);
    assert.ok(gap > unshrunk * 0.85, `${wa}-${wb}: gap ${gap} vs ${unshrunk}`);
    assert.equal(Math.round((r.x + r.y) / 2), 1500);
  }
});

test("one pair hogging the votes does not throw the rest of the field", () => {
  // 100 bouts between a and b, 6 between c and d. The votes say a > b and c > d by
  // about the same margin, so the two gaps should come out about the same size.
  const votes = [
    ...lopsided(60, 40),
    ...Array.from({ length: 4 }, (_, i) => ({ a: "c", b: "d", w: "a", t: 100 + i })),
    ...Array.from({ length: 2 }, (_, i) => ({ a: "c", b: "d", w: "b", t: 104 + i })),
  ].map(v => (v.a === "x" ? { ...v, a: "a", b: "b" } : v));
  const r = T.fit(["a", "b", "c", "d"], votes);
  for (const id of ["a", "b", "c", "d"]) assert.ok(Math.abs(r[id] - 1500) < 400, `${id} at ${r[id]}`);
  assert.ok(r.a > r.b && r.c > r.d, JSON.stringify(r));
});

test("the fit is a stationary point, not wherever the sweeps ran out", () => {
  // The gradient of the penalised log-likelihood, computed here from scratch: if the
  // solver has really converged, every contender's is zero. This is the check that
  // catches a solver that oscillates without ever visibly blowing up.
  const SCALE = 400 / Math.log(10), pv = (200 / SCALE) ** 2;
  const check = (field, votes) => {
    const r = T.fit(field, votes);
    for (const id of field) {
      let g = -(r[id] - 1500) / SCALE / pv;
      for (const v of votes) {
        const mine = v.a === id ? 1 : v.b === id ? -1 : 0;
        if (!mine) continue;
        const [me, them] = mine === 1 ? [v.a, v.b] : [v.b, v.a];
        const s = v.w === "tie" ? .5 : (v.w === "a") === (mine === 1) ? 1 : 0;
        g += s - 1 / (1 + Math.exp(-(r[me] - r[them]) / SCALE));
      }
      assert.ok(Math.abs(g) < 1e-6, `${id}: gradient ${g} at ${r[id]}`);
    }
  };
  check(["x", "y"], lopsided(130, 70));
  check(FIELD, synth(400, 5));
  check(["x", "y"], lopsided(20, 0));
});

test("the interval gets wider as the data gets thinner", () => {
  const half = c => (c.hi.a - c.lo.a) / 2;
  const wide = half(T.confidence(FIELD, synth(20, 3), { resamples: 200 }));
  const mid = half(T.confidence(FIELD, synth(120, 3), { resamples: 200 }));
  const tight = half(T.confidence(FIELD, synth(600, 3), { resamples: 200 }));
  assert.ok(wide > mid && mid > tight, `${wide} ${mid} ${tight}`);
  // Bootstrapping sequential Elo instead produces the opposite, which is what sent the
  // table to a fitted rating in the first place. Guard the property, not the numbers.
  assert.ok(tight < 45 && wide > 60, `${wide} ${tight}`);
});

test("the same votes always give the same interval", () => {
  const votes = synth(80, 21);
  const one = T.confidence(FIELD, votes, { resamples: 120 });
  const two = T.confidence(FIELD, votes, { resamples: 120 });
  assert.deepEqual(one.lo, two.lo);
  assert.deepEqual(one.hi, two.hi);
  assert.deepEqual(one.ahead, two.ahead);
});

test("a contender who has never fought is the least certain row, not the most", () => {
  // Resampling the votes alone cannot move a contender with no votes: every resample
  // leaves it at the prior's centre and the table prints 1500 +/-0, which reads as the
  // one thing on the page we are sure of. Drawing the prior's centre too is what makes
  // the row say what it means, and it also stops the callout claiming a 100% result
  // against a contender with a 0-0-0 record.
  const field = ["a", "b", "c", "idle"];
  const votes = [];
  for (let i = 0; i < 12; i++) votes.push({ a: "a", b: "b", w: i % 3 ? "a" : "b", t: i });
  for (let i = 0; i < 12; i++) votes.push({ a: "a", b: "c", w: i % 4 ? "a" : "b", t: 12 + i });
  const c = T.confidence(field, votes, { resamples: 200 });
  assert.equal(Math.round(c.rating.idle), 1500);
  const half = id => (c.hi[id] - c.lo[id]) / 2;
  assert.ok(half("idle") > 200, `idle spread ${half("idle")}`);
  assert.ok(half("idle") > half("a"), `${half("idle")} vs ${half("a")}`);
  assert.ok(c.ahead.a.idle < .95, `ahead ${c.ahead.a.idle}`);
});

test("an unbeaten contender does not get a hairline interval", () => {
  // Same mechanism seen from the other side: every resample of an all-wins record is
  // still all wins, so the rating sits where the prior stops it and the votes have
  // nothing left to say about it.
  const field = ["a", "b", "c"];
  const votes = [];
  for (let i = 0; i < 10; i++) votes.push({ a: "a", b: "b", w: "a", t: i });
  for (let i = 0; i < 10; i++) votes.push({ a: "a", b: "c", w: "a", t: 10 + i });
  const c = T.confidence(field, votes, { resamples: 200 });
  assert.ok(c.rating.a > c.rating.b && c.rating.a > c.rating.c);
  assert.ok((c.hi.a - c.lo.a) / 2 > 50, `unbeaten spread ${(c.hi.a - c.lo.a) / 2}`);
});

test("too few bouts reports no interval rather than a confident zero", () => {
  const none = T.confidence(FIELD, []);
  assert.equal(none.bouts, 0);
  assert.equal(none.lo, null);
  assert.equal(none.ahead, null);
  const few = T.confidence(FIELD, synth(5, 1));
  assert.equal(few.bouts, 5);
  assert.equal(few.lo, null);
  // The ratings are still there, they just do not claim a spread.
  assert.ok(Number.isFinite(few.rating.a));
});

test("the resample share separates a clear winner and hedges a close one", () => {
  const clear = T.confidence(FIELD, synth(400, 5), { resamples: 200 });
  assert.ok(clear.ahead.a.d > .98, String(clear.ahead.a.d));
  assert.ok(Math.abs(clear.ahead.a.d + clear.ahead.d.a - 1) < 1e-9);
  // Two contenders the votes have never told apart should not be called either way.
  const even = [];
  for (let i = 0; i < 40; i++) even.push({ a: "a", b: "b", w: i % 2 ? "a" : "b", t: i });
  const tied = T.confidence(FIELD, even, { resamples: 200 });
  assert.ok(tied.ahead.a.b > .3 && tied.ahead.a.b < .7, String(tied.ahead.a.b));
});

test("the confidence settings are filled in, and false turns it off", () => {
  const two = [{ id: "x", name: "X" }, { id: "y", name: "Y" }];
  const on = T.normalize({ id: "d", contenders: two });
  assert.deepEqual(on.confidence, { prior: 200, minBouts: 8, level: .9 });
  const tuned = T.normalize({ id: "d", contenders: two, confidence: { minBouts: 30 } });
  assert.deepEqual(tuned.confidence, { prior: 200, minBouts: 30, level: .9 });
  assert.equal(T.normalize({ id: "d", contenders: two, confidence: false }).confidence, null);
  // It is a dome setting, not a question one: two questions in one dome are read off
  // the same table and cannot disagree about how wide an interval is.
  assert.throws(() => T.normalizeDome({
    id: "d", questions: [{ id: "one", contenders: two, confidence: false }, { id: "two", contenders: two }],
  }), /dome-level/);
});

test("confidence ignores votes it cannot place", () => {
  const votes = synth(60, 9).concat([{ a: "a", b: "ghost", w: "a" }, { a: "a", b: "a", w: "tie" }]);
  assert.equal(T.confidence(FIELD, votes, { resamples: 60 }).bouts, 60);
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

test("a note hangs off the candidate it was written about", () => {
  const votes = [
    { id: "v1", a: "a1", b: "b2", w: "a", t: 10, why: "  crisper edge  " },
    { id: "v2", a: "b2", b: "c3", w: "b", t: 20, why: "reads faster" },
    { id: "v3", a: "a1", b: "c3", w: "tie", t: 30, why: "same to me" },
    { id: "v4", a: "a1", b: "b2", w: "a", t: 40 },                        // no note
    { id: "v5", a: "a1", b: "b2", w: "a", t: 50, why: "   " },            // blank note
    { id: "v6", a: "a1", b: "gone", w: "a", t: 60, why: "not a contender" },
    { id: "v7", a: "a1", b: "a1", w: "a", t: 70, why: "itself" },
  ];
  const notes = T.comments(ids, votes);
  // The winner gets the note, and a tie puts it on both. Nobody carries a note about
  // the duel they lost: a note is the reason for the pick, not a caption on the card.
  assert.deepEqual(notes.a1.map(n => n.text), ["same to me", "crisper edge"]);
  assert.deepEqual(notes.b2.map(n => n.text), []);
  assert.deepEqual(notes.c3.map(n => n.text), ["same to me", "reads faster"]);
  // Newest first, trimmed, and each note remembers what it was up against.
  assert.equal(notes.a1[0].tie, true);
  assert.equal(notes.a1[1].vs, "b2");
  assert.equal(notes.a1[1].vote, "v1");
  assert.deepEqual(Object.keys(notes).sort(), ["a1", "b2", "c3"]);
});

test("notes from the same millisecond keep a fixed order", () => {
  const same = t => [
    { id: "b", a: "a1", b: "b2", w: "a", t, why: "second" },
    { id: "a", a: "a1", b: "c3", w: "a", t, why: "first" },
  ];
  assert.deepEqual(T.comments(ids, same(5)).a1.map(n => n.text), ["first", "second"]);
  // Same votes, other order in: an import or a seeded dome must not shuffle between renders.
  assert.deepEqual(T.comments(ids, same(5).reverse()).a1.map(n => n.text), ["first", "second"]);
});

test("comments are on by default and can be turned off", () => {
  const base = { id: "x", contenders: [{ id: "p" }, { id: "q" }] };
  assert.deepEqual(T.normalizeDome(base).comments, { max: 140 });
  assert.equal(T.normalizeDome({ ...base, comments: false }).comments, null);
  assert.equal(T.normalizeDome({ ...base, comments: { max: 40 } }).comments.max, 40);
  // A question cannot turn notes on or off for itself: the box is the dome's.
  assert.throws(() => T.normalizeDome({
    id: "x", questions: [{ id: "one", contenders: base.contenders, comments: false }],
  }), /dome-level/);
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

// ---- cli.mjs ----
// The pure half: turning arguments and issue bodies into a spec, a spec into config
// source, and votes into a table. The fs and gh halves are exercised by hand.

test("parseArgs takes flags in every shape a person types them", async () => {
  const { parseArgs } = await import("./cli.mjs");
  const a = parseArgs(["new", "density", "--title", "How dense?", "--media=a.png", "--media", "b.png", "--force"]);
  assert.deepEqual(a._, ["new", "density"]);
  assert.equal(a.title, "How dense?");
  assert.deepEqual(a.media, ["a.png", "b.png"]);
  assert.equal(a.force, true);
  // A flag whose value is missing takes the next thing only if it is not itself a flag.
  assert.equal(parseArgs(["--md", "--votes", "v.json"]).md, true);
});

test("contender names come off the filenames someone already chose", async () => {
  const { contenderFromPath, uniqueIds } = await import("./cli.mjs");
  assert.deepEqual(contenderFromPath("shots/dense-rows@2x.png", 0), { id: "dense-rows", name: "Dense rows", media: "shots/dense-rows@2x.png" });
  // Two shot.png in different folders is the ordinary way to collide, and a duplicate
  // id is an error the engine throws on rather than something the CLI should emit.
  const ids = uniqueIds([{ id: "shot" }, { id: "shot" }, { id: "shot" }]).map(c => c.id);
  assert.deepEqual(ids, ["shot", "shot-2", "shot-3"]);
});

test("an issue body becomes a field of contenders", async () => {
  const { mediaFromMarkdown, specFromIssue } = await import("./cli.mjs");
  const body = [
    "Which of these?",
    "![Solid red](https://example.com/a.png)",
    '<img src="https://example.com/b.gif">',
    "https://user-images.githubusercontent.com/1/deadbeef",   // no extension, still an image
    "[not an image](https://example.com/page)",
    "![dupe](https://example.com/a.png)",
  ].join("\n\n");
  const found = mediaFromMarkdown(body);
  // Markdown images first, then <img>, then bare URLs: an issue that bothers to write
  // alt text gets its names honoured before the ones that are only a link.
  assert.deepEqual(found.map(f => f.src), [
    "https://example.com/a.png",
    "https://example.com/b.gif",
    "https://user-images.githubusercontent.com/1/deadbeef",
  ]);
  const spec = specFromIssue({ owner: "o", repo: "r", number: 7 }, { title: "Which?", body, html_url: "https://github.com/o/r/pull/7" });
  assert.equal(spec.askedBy, "o/r#7");
  assert.equal(spec.contenders[0].id, "solid-red");
  assert.equal(spec.contenders.length, 3);
});

test("the generated config is source someone can edit, and the engine accepts it", async () => {
  const { renderConfig } = await import("./cli.mjs");
  const src = renderConfig({
    id: "d", title: "Which?", askedBy: "o/r#7",
    contenders: [{ id: "a", name: "A", media: "media/a.png" }, { id: "b", name: "B", media: "media/b.png" }],
  });
  assert.match(src, /^\/\/ Which\?\n\/\/ Asked by o\/r#7\./);
  assert.match(src, /Thunderdome\.start\(\{/);
  // Round-trip it through the same evaluator build.mjs uses, then through the engine's
  // own validation, so "it generated something" is not mistaken for "it generated a dome".
  const { readConfig } = await import("./build.mjs");
  const cfg = readConfig(src, "generated");
  assert.equal(cfg.id, "d");
  const D = T.normalizeDome(cfg);
  assert.equal(D.questions[0].contenders.length, 2);
});

test("a multi-question spec generates a multi-question dome", async () => {
  const { renderConfig } = await import("./cli.mjs");
  const { readConfig } = await import("./build.mjs");
  const two = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
  const src = renderConfig({
    id: "d", title: "Two",
    questions: [
      { id: "one", short: "One", title: "First?", contenders: two },
      { id: "two", title: "Second?", contenders: two },
    ],
  });
  const D = T.normalizeDome(readConfig(src, "generated"));
  assert.equal(D.multi, true);
  // Spread before comparing: readConfig evaluates in a vm, so the arrays it hands back
  // are Arrays from that realm and deepStrictEqual compares prototypes.
  assert.deepEqual([...D.questions.map(q => q.id)], ["one", "two"]);
});

test("results split votes by question and say what the table claims", async () => {
  const { tablesFor, renderMarkdown, renderText } = await import("./cli.mjs");
  const two = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
  const cfg = {
    id: "d", title: "Two",
    questions: [{ id: "one", contenders: two }, { id: "two", contenders: two }],
  };
  const votes = [];
  for (let i = 0; i < 40; i++) votes.push({ q: "one", a: "a", b: "b", w: "a", t: i });
  for (let i = 0; i < 3; i++) votes.push({ q: "two", a: "a", b: "b", w: "b", t: i });
  const tables = tablesFor(cfg, votes);
  assert.deepEqual(tables.map(t => t.bouts), [40, 3]);
  assert.equal(tables[0].rows[0].name, "A");
  assert.match(tables[0].verdict, /A is ahead of B in \d+% of resamples\./);
  // Three bouts is not a result, and the table has to say so rather than rank them.
  assert.equal(tables[1].rows[0].spread, null);
  assert.match(tables[1].verdict, /Not enough bouts/);
  const md = renderMarkdown(tables, cfg);
  assert.match(md, /\| 1 \| A \| \d+ ±\d+ \| 40–0–0 \|/);
  assert.match(renderText(tables, cfg), /1 {2}A +\d+ ±\d+ +40–0–0/);
});

test("an untagged vote counts toward the first question, as it does in the browser", async () => {
  const { tablesFor } = await import("./cli.mjs");
  const two = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
  const cfg = { id: "d", questions: [{ id: "one", contenders: two }, { id: "two", contenders: two }] };
  const tables = tablesFor(cfg, [{ a: "a", b: "b", w: "a", t: 1 }]);
  assert.deepEqual(tables.map(t => t.bouts), [1, 0]);
});

const fakeFs = (extra = {}) => ({
  isFile: p => !p.includes("nope"),
  list: () => [],
  copyIn: () => {},
  write: () => {},
  get: async () => { throw new Error("offline"); },
  ...extra,
});

test("media is planned before anything is written, and a path that is not a file stops the whole command", async () => {
  const { planMedia } = await import("./cli.mjs");
  const spec = {
    contenders: [
      { id: "a", media: "/tmp/shot.png" },
      { id: "b", media: "/elsewhere/shot.png" },              // same basename, different folder
      { id: "c", media: "https://example.com/c.gif" },        // fetched, so the page stays one file
      { id: "d", media: "/dome/media/already.png" },          // already under the dome
    ],
  };
  const plan = planMedia(spec, "/dome", {}, fakeFs());
  assert.deepEqual(plan.spec.contenders.map(c => c.media),
    ["media/shot.png", "media/shot-2.png", "media/c.gif", "/dome/media/already.png"]);
  assert.deepEqual(plan.copies, [["/tmp/shot.png", "/dome/media/shot.png"], ["/elsewhere/shot.png", "/dome/media/shot-2.png"]]);
  assert.deepEqual(plan.fetches.map(f => f.url), ["https://example.com/c.gif"]);
  // Planning is pure: the caller's spec is untouched until applyMedia runs.
  assert.equal(spec.contenders[0].media, "/tmp/shot.png");

  // --link leaves remote media where it is, for people who would rather not carry it.
  const linked = planMedia(spec, "/dome", { link: true }, fakeFs());
  assert.equal(linked.spec.contenders[2].media, "https://example.com/c.gif");
  assert.deepEqual(linked.fetches, []);

  // A name already sitting in media/ is not clobbered, even though nothing in this
  // spec collides with it.
  const one = { contenders: [{ id: "a", media: "/tmp/shot.png" }] };
  const clobber = planMedia(one, "/dome", {}, fakeFs({ list: () => ["shot.png"] }));
  assert.equal(clobber.spec.contenders[0].media, "media/shot-2.png");

  // One typo and nothing is copied: a folder half full of media whose config never got
  // written is harder to clean up than a command that did nothing.
  const bad = { contenders: [{ id: "a", media: "/tmp/shot.png" }, { id: "b", media: "/tmp/nope.png" }] };
  assert.throws(() => planMedia(bad, "/dome", {}, fakeFs()), /no such media file: \/tmp\/nope\.png/);
});

test("a download that fails leaves the URL in place and says so", async () => {
  const { planMedia, applyMedia } = await import("./cli.mjs");
  const spec = {
    contenders: [
      { id: "a", media: "https://example.com/good" },   // no extension: content-type names it
      { id: "b", media: "https://example.com/bad.gif" },
    ],
  };
  const wrote = [];
  const fs = fakeFs({
    write: (d, b) => wrote.push([d, String(b)]),
    get: async url => {
      if (url.endsWith("bad.gif")) throw new Error("HTTP 404");
      return { body: Buffer.from("bytes"), type: "image/webp" };
    },
  });
  const out = await applyMedia(planMedia(spec, "/dome", {}, fs), fs);
  assert.deepEqual(out.spec.contenders.map(c => c.media), ["media/a.webp", "https://example.com/bad.gif"]);
  assert.deepEqual(wrote, [["/dome/media/a.webp", "bytes"]]);
  assert.equal(out.fetched, 1);
  assert.deepEqual(out.failed.map(f => f.url), ["https://example.com/bad.gif"]);
});

// Named for what it checks: the terminal derives its numbers the way the browser does,
// from the dome's own options. It is not a page test. There is no DOM here, so it
// cannot be one; the page side is driven in a browser by hand before a change ships.
test("tableFor takes its confidence settings from the dome, not defaults of its own", async () => {
  const { tableFor } = await import("./cli.mjs");
  const four = [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }, { id: "d", name: "D" }];
  const votes = [];
  for (let i = 0; i < 60; i++) {
    const [x, y] = [["a", "b"], ["b", "c"], ["c", "d"], ["a", "c"]][i % 4];
    votes.push({ a: x, b: y, w: i % 5 === 0 ? "b" : "a", t: i });
  }
  // A level of its own, so a verdict fixed at somebody else's 95% would show up here.
  for (const confidence of [{ level: .99 }, { level: .5 }, false]) {
    const D = T.normalizeDome({ id: "d", contenders: four, confidence });
    const Q = D.questions[0];
    const table = tableFor(D, Q, votes);
    // What the browser does, spelled out: same options, same resample count, same rule.
    const qIds = Q.contenders.map(c => c.id);
    const conf = T.confidence(qIds, votes, T.confidenceOpts(D, votes.length));
    const order = qIds.slice().sort((x, y) => conf.rating[y] - conf.rating[x]);
    const nm = id => Q.contenders.find(c => c.id === id).name;
    assert.deepEqual(table.rows.map(r => r.id), order);
    assert.deepEqual(table.rows.map(r => r.rating), order.map(id => Math.round(conf.rating[id])));
    assert.deepEqual(table.rows.map(r => r.spread),
      order.map(id => (conf.lo ? Math.round((conf.hi[id] - conf.lo[id]) / 2) : null)));
    // With confidence off the page builds no callout at all, so there is no sentence
    // to match and the table must not invent one.
    assert.equal(table.verdict, D.confidence ? T.verdictFor(conf, order, nm) : null);
  }
});

test("with confidence off, neither renderer prints a verdict", async () => {
  const { tablesFor, renderText, renderMarkdown } = await import("./cli.mjs");
  const cfg = {
    id: "d", title: "Off",
    contenders: [{ id: "a", name: "A" }, { id: "b", name: "B" }],
    confidence: false,
  };
  const votes = Array.from({ length: 240 }, (_, i) => ({ a: "a", b: "b", w: i % 4 ? "a" : "b", t: i }));
  const tables = tablesFor(cfg, votes);
  assert.equal(tables[0].verdict, null);
  assert.equal(tables[0].rows[0].spread, null);
  for (const text of [renderText(tables, cfg), renderMarkdown(tables, cfg)]) {
    assert.ok(!/ahead|too close|Not enough/i.test(text), text);
    assert.match(text, /180.60.0/);
  }
});

test("the resample count comes down as the votes go up, and never off the ends", () => {
  assert.equal(T.resampleCount(0), 300);
  assert.equal(T.resampleCount(400), 300);
  assert.equal(T.resampleCount(1200), 100);
  assert.equal(T.resampleCount(1e6), 40);
  // confidence: false is off, not "off by default": no resamples and no bar to clear.
  assert.deepEqual(T.confidenceOpts({ confidence: null }, 50), { resamples: 0, minBouts: Infinity });
  assert.equal(T.confidenceOpts({ confidence: { level: .9 } }, 1200).resamples, 100);
});

test("a hostile title cannot write code into the generated config", async () => {
  const { renderConfig } = await import("./cli.mjs");
  // U+2028 and U+2029 end a line to a JS parser but not to JSON.stringify, so an issue
  // whose title carries one could close a comment, or a string, and keep going as code.
  const src = renderConfig({
    id: "d",
    title: "Which?\u2028globalThis.PWNED = 1;\u2028//",
    askedBy: "o/r#7\u2029globalThis.PWNED = 1;",
    contenders: [
      { id: "a", name: "A\u2028globalThis.PWNED = 1;", media: "media/a.png" },
      { id: "b", name: "B</script><script>", media: "media/b.png" },
    ],
  });
  assert.equal(/[\u2028\u2029]/.test(src), false);
  const sandbox = { Thunderdome: { start: () => {} } };
  vm.runInNewContext(src, sandbox, { filename: "hostile", timeout: 1000 });
  assert.equal(sandbox.PWNED, undefined);
  assert.equal("PWNED" in sandbox, false);
  // The header is still one comment per line, so the title is readable and inert.
  assert.match(src, /^\/\/ Which\? globalThis\.PWNED = 1; \/\/\n/);
});

test("fenced code and inline code are not candidates", async () => {
  const { mediaFromMarkdown } = await import("./cli.mjs");
  const body = [
    "Try `![nope](https://example.com/inline.png)` first.",
    "```md\n![nope](https://example.com/fenced.png)\n```",
    "~~~md\n![nope](https://example.com/tilde.png)\n~~~",
    "<!--\n![nope](https://example.com/commented.png)\n-->",
    "![yes](https://example.com/real.png)",
    "See https://example.com/trailing.gif.",              // sentence period is not part of it
    "![spaced](  <https://example.com/angle.png>  \"t\")",
    "![no scheme](/relative/a.png)",
  ].join("\n\n");
  assert.deepEqual(mediaFromMarkdown(body).map(f => f.src), [
    "https://example.com/real.png",
    "https://example.com/angle.png",
    "https://example.com/trailing.gif",
  ]);
});

test("parseRef takes the shapes people paste", async () => {
  const { parseRef } = await import("./cli.mjs");
  const want = { owner: "o", repo: "r", number: 9 };
  assert.deepEqual(parseRef("manaflow-ai/cmux#1234"), { owner: "manaflow-ai", repo: "cmux", number: 1234 });
  assert.deepEqual(parseRef("https://github.com/o/r/pull/9"), want);
  assert.deepEqual(parseRef("https://github.com/o/r/issues/9"), want);
  assert.deepEqual(parseRef("  https://www.github.com/o/r/pull/9  "), want);
  assert.deepEqual(parseRef("https://github.com/o/r/issues/9#issuecomment-123"), want);
  assert.deepEqual(parseRef("https://github.com/o/r/pull/9/files"), want);
  assert.deepEqual(parseRef("o/r#9"), want);
  assert.deepEqual(parseRef("teamleaderleo/Tact#9"), { owner: "teamleaderleo", repo: "Tact", number: 9 });
  // A number that runs into a word is not a number someone meant.
  assert.throws(() => parseRef("o/r#9abc"), /owner\/repo#123/);
  assert.throws(() => parseRef("https://gitlab.com/o/r/issues/9"), /owner\/repo#123/);
  assert.throws(() => parseRef("o/r"), /owner\/repo#123/);
});

test("the CLI runs as a command and builds a dome that opens", async () => {
  const dir = mkdtempSync(join(tmpdir(), "thunderdome-cli-"));
  const dome = join(dir, "which-one");
  const png = join(dir, "red.png");
  writeFileSync(png, Buffer.from("89504e470d0a1a0a", "hex"));
  const here = dirname(fileURLToPath(import.meta.url));
  const run = (...args) => {
    const r = spawnSync(process.execPath, [join(here, "cli.mjs"), ...args], { encoding: "utf8", cwd: dir });
    assert.equal(r.status, 0, `${args.join(" ")} failed: ${r.stderr}`);
    return r.stdout;
  };
  const out = run("new", "which-one", "--out", dome, "--title", "Which one?", "--media", png, "--media", png);
  assert.match(out, /index\.html/);
  const html = readFileSync(join(dome, "index.html"), "utf8");
  // Self-contained: the media came along as a data URI, not a path out of the folder.
  assert.match(html, /data:image\/png;base64,/);
  assert.equal(html.includes(png), false);
  assert.match(html, /<title>Which one\?<\/title>/);
  // Two files with the same name both arrive, under names that do not collide.
  assert.deepEqual(readdirSync(join(dome, "media")).sort(), ["red-2.png", "red.png"]);

  writeFileSync(join(dome, "votes.json"), JSON.stringify(
    Array.from({ length: 20 }, (_, i) => ({ id: `v${i}`, a: "red", b: "red-2", w: "a", t: i }))));
  const text = run("results", dome, "--votes", join(dome, "votes.json"));
  assert.match(text, /20–0–0/);
  assert.match(text, /of resamples/);
  const md = run("results", dome, "--votes", join(dome, "votes.json"), "--md");
  assert.match(md, /\| 1 \| Red \| \d+ ±\d+ \| 20–0–0 \|/);
  rmSync(dir, { recursive: true, force: true });
});

test("a hostile title and a filename full of spaces still build a page that opens", async () => {
  const dir = mkdtempSync(join(tmpdir(), "thunderdome-cli-"));
  const dome = join(dir, "hostile");
  const shot = join(dir, "Screenshot 2026-09-28 at 10.11.32 AM.png");
  const other = join(dir, "café (1).png");
  for (const p of [shot, other]) writeFileSync(p, Buffer.from("89504e470d0a1a0a", "hex"));
  const here = dirname(fileURLToPath(import.meta.url));
  const r = spawnSync(process.execPath,
    [join(here, "cli.mjs"), "new", "hostile", "--out", dome, "--title", "x <!--<script", "--media", shot, "--media", other],
    { encoding: "utf8", cwd: dir });
  assert.equal(r.status, 0, r.stderr);

  const html = readFileSync(join(dome, "index.html"), "utf8");
  // The HTML tokenizer has a double-escaped script state: once `<!--` and then
  // `<script` have appeared inside a <script>, the block's own `</script>` stops
  // closing it and the rest of the file is script text that does not parse. The page
  // opens blank with nothing in the console about why, so the invariant is that no
  // unescaped comment opener survives into a script block at all.
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.equal(blocks.length, 2);
  for (const src of blocks) {
    assert.equal(/<!--/.test(src), false);
    new vm.Script(src, { filename: "built" });        // throws if the page would not parse
  }

  // build.mjs only inlines paths made of letters, digits, dots, @ and dashes, so a
  // copied-in file with a space in its name would be left as a relative link and the
  // one file you send someone would arrive with holes in it.
  assert.deepEqual(readdirSync(join(dome, "media")).sort(),
    ["cafe-1.png", "screenshot-2026-09-28-at-10-11-32-am.png"]);
  assert.equal((html.match(/data:image\/png;base64,/g) || []).length, 2);
  assert.equal(/media\/[^"]+\.png/.test(html), false);
  rmSync(dir, { recursive: true, force: true });
});

test("a spec keeps the keys the flags never heard of", async () => {
  const { renderConfig } = await import("./cli.mjs");
  const src = renderConfig({
    id: "density", title: "How dense?",
    confidence: { level: .8 }, contenderLabel: "layout", recent: 3,
    questions: [{
      id: "q1", title: "One", interactiveCards: true,
      contenders: [{ id: "a", name: "A", tag: "x" }, { id: "b", name: "B" }],
    }],
  });
  const { readConfig } = await import("./build.mjs");
  const got = readConfig(src, "spec");
  assert.deepEqual(got.confidence, { level: .8 });
  assert.equal(got.contenderLabel, "layout");
  assert.equal(got.recent, 3);
  assert.equal(got.questions[0].interactiveCards, true);
  assert.equal(got.questions[0].contenders[0].tag, "x");
});

test("object-form media is copied in like the string form", async () => {
  const copied = [];
  const fs = {
    isFile: p => !p.includes("nope"), list: () => [], write: () => {},
    copyIn: (src, dest) => copied.push([src, dest]),
    get: async () => { throw new Error("offline"); },
  };
  const { planMedia } = await import("./cli.mjs");
  const spec = {
    contenders: [
      { id: "a", name: "A", media: { src: "/shots/a.png", frame: true } },
      { id: "b", name: "B", media: { src: "/shots/b.png", frame: true } },
    ],
  };
  const plan = planMedia(spec, "/dome", {}, fs);
  assert.deepEqual(plan.spec.contenders.map(c => c.media),
    [{ src: "media/a.png", frame: true }, { src: "media/b.png", frame: true }]);
  assert.deepEqual(plan.copies.map(c => c[1]), ["/dome/media/a.png", "/dome/media/b.png"]);
  // And a missing one still stops the command, the same as a missing string would.
  assert.throws(() => planMedia({ contenders: [{ id: "a", name: "A", media: { src: "/nope/ghost.png" } }] }, "/dome", {}, fs),
    /no such media file/);
});

test("a download with no extension in its URL cannot land on a name already taken", async () => {
  const wrote = [];
  const fs = {
    isFile: () => true, list: () => [], copyIn: () => {}, write: (p, b) => wrote.push([p, String(b)]),
    get: async url => ({ body: url.includes("attach") ? "ATTACHMENT" : "SHOT", type: "image/png" }),
  };
  const { planMedia, applyMedia } = await import("./cli.mjs");
  const spec = {
    contenders: [
      { id: "shot", name: "Shot", media: "https://github.com/user-attachments/assets/uuid" },
      { id: "b", name: "B", media: "https://example.com/shot.png" },
    ],
  };
  const out = await applyMedia(planMedia(spec, "/dome", {}, fs), fs);
  assert.deepEqual(wrote.map(w => w[0]), ["/dome/media/shot-2.png", "/dome/media/shot.png"]);
  assert.deepEqual(out.spec.contenders.map(c => c.media), ["media/shot-2.png", "media/shot.png"]);
  // Two contenders, two files: a duel between a picture and itself is not a duel.
  assert.equal(new Set(wrote.map(w => w[1])).size, 2);
});

test("the evaluator a config is read in has nothing of ours in it", async () => {
  const { readConfig } = await import("./build.mjs");
  // A config gets its title read seconds after `new --from-pr` wrote it out of somebody
  // else's issue. A host function in the sandbox is a way out of it, so there are none.
  const probe = fn => {
    const cfg = readConfig(`
      var out = null;
      try { out = ${fn}.constructor("return typeof process")(); } catch (e) { out = "blocked: " + e.name; }
      Thunderdome.start({ id: "x", title: String(out), contenders: [] });
    `, "probe");
    return cfg.title;
  };
  assert.equal(probe("console.log"), "undefined");
  assert.equal(probe("Thunderdome.start"), "undefined");
});
