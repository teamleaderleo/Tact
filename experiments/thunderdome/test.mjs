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
