/*
 * Thunderdome: pairwise design judgment with a shared Elo table.
 *
 * A config calls Thunderdome.start({...}) with contenders, arena dimensions,
 * an optional split, and a render function. The engine supplies pairing,
 * voting UI, keyboard shortcuts, Elo (overall and per split), W-L-T, recent
 * bouts, the gallery, undo, and shared (claude.ai db) or local storage.
 * A contender can be an image, a GIF or a video instead of markup; the two
 * clips in a duel are restarted together so the comparison stays honest.
 * See ../README.md for the config reference.
 */
(function (root) {
  "use strict";

  const RESERVED = new Set(["id", "a", "b", "w", "t"]);

  // ---------- pure core (no DOM; exercised by test.mjs) ----------

  function pairKey(a, b) { return [a, b].sort().join("|"); }

  function pairCounts(votes) {
    const c = {};
    for (const v of votes) { const k = pairKey(v.a, v.b); c[k] = (c[k] || 0) + 1; }
    return c;
  }

  // Weighted random pair: weight 1/(1+n)^2 where n is how often the pair has met.
  // Never repeats the previous pair when another exists. Returns {a, b, key} with sides shuffled.
  function pickPair(ids, votes, lastKey, rand) {
    rand = rand || Math.random;
    const counts = pairCounts(votes), pairs = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const k = pairKey(ids[i], ids[j]);
      if (k === lastKey && ids.length > 2) continue;
      pairs.push({ k, a: ids[i], b: ids[j], w: 1 / Math.pow(1 + (counts[k] || 0), 2) });
    }
    if (!pairs.length) return null;
    let r = rand() * pairs.reduce((s, p) => s + p.w, 0), chosen = pairs[0];
    for (const p of pairs) { r -= p.w; if (r <= 0) { chosen = p; break; } }
    return rand() < .5 ? { a: chosen.a, b: chosen.b, key: chosen.k } : { a: chosen.b, b: chosen.a, key: chosen.k };
  }

  // Sequential Elo over votes in time order. Every contender starts at `start`.
  function elo(ids, votes, k, start) {
    k = k || 24; start = start || 1500;
    const r = Object.fromEntries(ids.map(id => [id, start]));
    for (const v of votes) {
      if (!(v.a in r) || !(v.b in r) || v.a === v.b) continue;
      const ea = 1 / (1 + Math.pow(10, (r[v.b] - r[v.a]) / 400));
      const sa = v.w === "a" ? 1 : v.w === "b" ? 0 : .5;
      r[v.a] += k * (sa - ea); r[v.b] += k * ((1 - sa) - (1 - ea));
    }
    return r;
  }

  function records(ids, votes) {
    const rec = Object.fromEntries(ids.map(id => [id, { w: 0, l: 0, t: 0 }]));
    for (const v of votes) {
      if (!rec[v.a] || !rec[v.b]) continue;
      if (v.w === "tie") { rec[v.a].t++; rec[v.b].t++; }
      else if (v.w === "a" || v.w === "b") {
        const win = v.w === "a" ? v.a : v.b, lose = v.w === "a" ? v.b : v.a;
        rec[win].w++; rec[lose].l++;
      }
    }
    return rec;
  }

  function ago(t, now) {
    const s = Math.max(0, ((now || Date.now()) - t) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i;

  // A contender's `media` becomes {kind, src, poster, alt, fit, loop, aspect}.
  // Accepts "shot.png" or {src, ...}; `defaults` is the config-level `media` block.
  // The kind is read off the extension, so a data URI or an extension-less URL
  // (a signed CI artifact link, say) needs an explicit `kind` or it renders as an image.
  function mediaSpec(media, defaults) {
    if (typeof media === "string") media = { src: media };
    if (!media || !media.src) return null;
    const d = defaults || {}, src = String(media.src);
    return {
      kind: media.kind || d.kind || (VIDEO_EXT.test(src) || /^data:video\//i.test(src) ? "video" : "img"),
      src,
      poster: media.poster || d.poster || null,
      alt: media.alt == null ? (d.alt || "") : media.alt,
      fit: media.fit || d.fit || "contain",
      loop: (media.loop == null ? d.loop : media.loop) !== false,
      aspect: media.aspect || d.aspect || null,
      // Off by default: most media is an opaque screenshot or clip that brings its own
      // surface, and a box around it reads as a second card. Turn it on for icons and
      // anything else with transparency to sit on.
      frame: media.frame == null ? !!d.frame : !!media.frame,
    };
  }

  function normalize(cfg) {
    if (!cfg || !cfg.id) throw new Error("Thunderdome: config needs an id");
    const contenders = (cfg.contenders || []).map(c => ({ note: "", ...c }));
    if (contenders.length < 2) throw new Error("Thunderdome: need at least two contenders");
    const seen = new Set();
    for (const c of contenders) {
      if (!c.id || seen.has(c.id)) throw new Error(`Thunderdome: contender ids must be unique and non-empty (${c.id})`);
      seen.add(c.id);
    }
    const dims = ((cfg.arena && cfg.arena.dimensions) || cfg.dimensions || []).map(d => {
      if (RESERVED.has(d.id)) throw new Error(`Thunderdome: dimension id "${d.id}" is reserved`);
      const type = d.type || (d.options ? "select" : "toggle");
      return { label: d.id, ...d, type, shuffle: d.shuffle ?? (type === "select") };
    });
    return {
      k: 24, recent: 8, collection: "votes", contenderLabel: "Contender",
      galleryTitle: "Everyone in this arena", media: {},
      ...cfg,
      contenders, dims,
      localKey: cfg.localKey || `thunderdome:${cfg.id}:local`,
    };
  }

  // Arena ids ({theme:"x", ic:true}) to the object render() sees ({theme:{id,name,...}, ic:true, ids}).
  // strict: unknown option ids resolve to null (used for stored votes); otherwise the first option.
  function resolveArena(C, ids, strict) {
    const arena = { ids: {} };
    for (const d of C.dims) {
      if (d.type === "select") {
        const o = d.options.find(x => x.id === ids[d.id]) || (strict ? null : d.options[0]);
        arena[d.id] = o; arena.ids[d.id] = o ? o.id : ids[d.id];
      } else {
        arena[d.id] = !!ids[d.id]; arena.ids[d.id] = !!ids[d.id];
      }
    }
    return arena;
  }

  function splitOf(C, arena) {
    if (!C.split) return null;
    try { return C.split.of(arena); } catch (e) { return null; }
  }

  // ---------- DOM ----------

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids) if (kid != null) el.append(kid);
    return el;
  }

  function toNode(x) {
    if (x instanceof Node) return x;
    const t = document.createElement("template");
    t.innerHTML = String(x == null ? "" : x);
    return t.content;
  }

  function reducedMotion() {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Said on a card that could not be drawn, and on one whose media 404s.
  function failNode(title, detail) {
    return h("div", { class: "td-media td-media-broken" },
      h("div", { class: "td-media-fail" }, h("b", { text: title }), detail ? h("code", { text: detail }) : null));
  }

  // One <img> or <video> in a box that holds its shape. A card whose height changes
  // between duels moves the thing you are about to click, so give media an `aspect`
  // whenever you can.
  function mediaNode(spec, label) {
    const box = h("div", { class: "td-media" + (spec.frame ? " td-framed" : "") });
    const style = `object-fit:${spec.fit}` + (spec.aspect ? `;aspect-ratio:${spec.aspect}` : "");
    // Name what failed. For an inlined data URI the path is long gone, so say that
    // instead of printing 70 characters of base64 at someone.
    const where = /^data:/i.test(spec.src)
      ? `${spec.src.slice(0, spec.src.indexOf(";")) || "data:"}, inlined at build time`
      : (spec.src.length > 72 ? spec.src.slice(0, 69) + "..." : spec.src);
    const fail = () => {
      box.classList.add("td-media-broken");
      box.replaceChildren(h("div", { class: "td-media-fail" },
        h("b", { text: "Couldn't load this one." }), h("code", { text: where })));
      // Tells the duel to take the vote buttons off: this card is no longer a fair half
      // of the comparison, and a vote cast on it is bad data.
      box.dispatchEvent(new CustomEvent("td-media-fail", { bubbles: true }));
    };
    let el;
    if (spec.kind === "video") {
      el = h("video", { src: spec.src, poster: spec.poster, loop: spec.loop, muted: true,
        playsinline: true, preload: "auto", style, "aria-label": spec.alt || label });
      el.muted = true;  // the attribute alone does not always stick, and autoplay needs the property
      // Reduced motion: hand over the controls instead of moving things at them.
      if (reducedMotion()) el.controls = true; else el.autoplay = true;
    } else {
      el = h("img", { src: spec.src, alt: spec.alt || label, loading: "lazy", decoding: "async", style });
    }
    // A blank card still looks votable, and a vote cast on one is bad data. Say it failed.
    el.addEventListener("error", fail);
    box.append(el);
    return box;
  }

  function start(cfg) {
    const C = normalize(cfg);
    const ids = C.contenders.map(c => c.id);
    const byId = Object.fromEntries(C.contenders.map(c => [c.id, c]));
    const mount = (C.mount && document.querySelector(C.mount)) || document.body;

    let arenaIds = {};
    for (const d of C.dims) arenaIds[d.id] = d.type === "select" ? (d.default ?? d.options[0].id) : !!d.default;
    let duel = null, lastKey = "";
    let votes = [];
    let votesCol = null, shared = false, myLast = null;
    let note = "", noteTimer = 0, lockNote = "";
    let syncToken = 0, galleryIO = null, galleryKey = null;

    if (C.title) document.title = C.title;

    // ---- layout ----
    const $ = {};
    const controls = h("div", { class: "td-controls", role: "group", "aria-label": "Arena" });
    for (const d of C.dims) {
      const idAttr = `td-dim-${d.id}`;
      if (d.type === "select") {
        const sel = h("select", { id: idAttr });
        for (const o of d.options) sel.append(new Option(o.name, o.id));
        sel.addEventListener("change", e => { arenaIds[d.id] = e.target.value; if ($.shuffle) $.shuffle.checked = false; render(); });
        $[idAttr] = sel;
        controls.append(h("label", { for: idAttr }, d.label + " ", sel));
      } else {
        const box = h("input", { type: "checkbox", id: idAttr });
        box.addEventListener("change", e => { arenaIds[d.id] = e.target.checked; render(); });
        $[idAttr] = box;
        controls.append(h("label", { for: idAttr }, box, " " + d.label));
      }
    }
    if (C.dims.some(d => d.shuffle)) {
      $.shuffle = h("input", { type: "checkbox", id: "td-shuffle", checked: C.shuffle !== false });
      controls.append(h("label", { for: "td-shuffle" }, $.shuffle, " New arena each duel"));
    }
    $.tag = h("span", { class: "td-arena-tag" });
    controls.append($.tag);

    $.duel = h("section", { class: "td-duel", "aria-live": "polite" });
    // Media that fails to load does so long after render(), so it reports back.
    $.duel.addEventListener("td-media-fail", () => refreshVoteLock());
    $.voteA = h("button", { class: "primary", onclick: () => vote("a") }, "Left wins", h("kbd", { text: "←" }));
    $.voteTie = h("button", { onclick: () => vote("tie") }, "Tie", h("kbd", { text: "↓" }));
    $.voteB = h("button", { class: "primary", onclick: () => vote("b") }, "Right wins", h("kbd", { text: "→" }));
    $.skip = h("button", { class: "quiet", onclick: () => nextDuel() }, "Skip", h("kbd", { text: "S" }));
    $.undo = h("button", { class: "quiet", hidden: true, onclick: () => undo() }, "Undo my last vote", h("kbd", { text: "U" }));
    $.replay = h("button", { class: "quiet", hidden: true, onclick: () => syncDuelVideos(true) }, "Replay both", h("kbd", { text: "R" }));
    $.status = h("div", { class: "td-status", role: "status" });

    const splitVals = C.split ? C.split.values : [];
    const headRow = h("tr", {}, h("th"), h("th", { text: C.contenderLabel }), h("th", { class: "num", text: "Elo" }),
      ...splitVals.map(s => h("th", { class: "num", text: s.label })),
      h("th", { class: "num", text: "W–L–T" }));
    $.standings = h("tbody");
    $.feed = h("ul", { class: "td-feed" });
    $.gallery = h("div", { class: "td-gallery" });

    const wrap = h("div", { class: "td-wrap" },
      h("header", {}, h("h1", { text: C.title || C.id }), C.lede ? h("p", { class: "td-lede", html: C.lede }) : null),
      C.dims.length ? controls : null,
      $.duel,
      h("div", { class: "td-vote" }, $.voteA, $.voteTie, $.voteB, $.skip, $.replay, $.undo),
      $.status,
      h("div", { class: "td-two" },
        h("section", { class: "td-section" }, h("h2", { text: "Standings" }),
          h("div", { class: "td-table-wrap" }, h("table", {}, h("thead", {}, headRow), $.standings))),
        h("section", { class: "td-section" }, h("h2", { text: "Recent bouts" }), $.feed)),
      h("section", { class: "td-section" }, h("h2", { text: C.galleryTitle }), $.gallery));
    mount.append(wrap);

    // ---- rendering ----
    function arena() { return resolveArena(C, arenaIds, false); }

    function defaultTag(a) {
      return C.dims.filter(d => d.type === "select").map(d => a[d.id].name.toLowerCase())
        .concat(C.dims.filter(d => d.type === "toggle" && a[d.id]).map(d => d.short || d.label))
        .join(" · ");
    }

    function describe(v) {
      if (C.describe) return C.describe(resolveArena(C, v, true), v);
      const parts = [];
      for (const d of C.dims) {
        if (d.type === "select") { const o = d.options.find(x => x.id === v[d.id]); parts.push(o ? o.name : String(v[d.id] ?? "?")); }
        else if (v[d.id]) parts.push(d.short || d.label);
      }
      return parts.join(", ");
    }

    // c.media may be a string, an object, or a function of the arena, so one contender
    // can hold its light and dark recordings and hand over whichever the arena asked for.
    function mediaFor(c, a) {
      let m = c.media;
      if (typeof m === "function") m = m(a, { h });
      const spec = mediaSpec(m, C.media);
      return spec ? mediaNode(spec, c.note ? `${c.name}: ${c.note}` : c.name) : null;
    }

    function renderBody(c, a) {
      const ctx = { h, contender: c, media: (x, ar) => mediaFor(x || c, ar || a) };
      // Most specific first: contender.render, then config.render, then media, then c.html.
      // A config-wide render() wins over media so it can place the frame itself
      // (device chrome, a caption) by calling ctx.media().
      if (typeof c.render === "function") return toNode(c.render(a, ctx));
      if (C.render) return toNode(C.render(c, a, ctx));
      const m = mediaFor(c, a);
      if (m) return m;
      if (typeof c.html === "function") return toNode(c.html(a, ctx));
      if (c.html == null) throw new Error("nothing to render: no render function, no media, no html");
      return toNode(c.html);
    }

    // A card that could not be drawn must say so and must not be votable. The usual
    // way to get here is a media resolver that is not total over the arena
    // (`media: a => clips[c.id][a.theme.id]` after a theme is added without clips):
    // without this the duel advances underneath a frozen screen and the votes land on
    // pairs nobody ever saw.
    function card(c, a, sideKey) {
      const head = h("div", { class: "td-card-head" },
        h("div", {}, h("div", { class: "td-card-name", text: c.name }), c.note ? h("div", { class: "td-card-note", text: c.note }) : null),
        sideKey ? h("span", { class: "td-side-key", text: sideKey }) : null);
      let body, broken = false;
      try { body = renderBody(c, a); } catch (e) {
        broken = true;
        console.error(`Thunderdome: ${c.id} failed to render`, e);
        body = failNode("Couldn't draw this one.", String((e && e.message) || e));
      }
      const el = h("article", { class: "td-card", "data-contender": c.id },
        head, h("div", { class: "td-card-body" }, body));
      if (broken) el.dataset.tdBroken = "1";
      return el;
    }

    function syncControls(a) {
      for (const d of C.dims) {
        const el = $[`td-dim-${d.id}`];
        if (d.type === "select") el.value = arenaIds[d.id]; else el.checked = !!arenaIds[d.id];
      }
      $.tag.textContent = C.tag ? C.tag(a) : defaultTag(a);
    }

    // Start both sides of a duel at the same point in their loop. Clips left alone
    // drift apart within seconds, and then you are comparing a treatment at the top of
    // its loop against one halfway through it, which is not the question you asked.
    // A GIF cannot be seeked at all, which is why the docs push mp4 and webm.
    // `byHand` is the R key or the Replay button. Reduced motion means nothing starts
    // itself, not that the button someone just pressed does nothing: under that setting
    // the clips carry controls and get played one at a time, which is exactly the case
    // where they drift and re-aligning them by hand is the only repair.
    function syncDuelVideos(byHand) {
      const vids = [...$.duel.querySelectorAll("video")];
      $.replay.hidden = !vids.length;
      if (!vids.length) return;
      const token = ++syncToken;
      const ready = v => v.readyState >= 2 ? Promise.resolve() : new Promise(res => {
        // Every one of these has to settle even if the element is thrown away first,
        // or the promise holds both <video> elements and their listeners alive.
        let timer = 0;
        const done = () => {
          clearTimeout(timer);
          v.removeEventListener("loadeddata", done); v.removeEventListener("error", done); res();
        };
        timer = setTimeout(done, 1500);
        v.addEventListener("loadeddata", done); v.addEventListener("error", done);
      });
      // Don't hold the first clip back forever on a slow load for the second.
      Promise.race([Promise.all(vids.map(ready)), new Promise(r => setTimeout(r, 1500))]).then(() => {
        if (token !== syncToken) return;  // a newer duel already claimed the ring
        for (const v of vids) {
          try { v.currentTime = 0; } catch (e) { /* not seekable yet */ }
          if (byHand || !reducedMotion()) { const q = v.play(); if (q && q.catch) q.catch(() => {}); }
        }
      });
    }

    // The duel is the comparison that has to stay smooth. Gallery clips below the fold
    // decoding in the background are competing with it for nothing.
    function watchGalleryVideos() {
      if (galleryIO) galleryIO.disconnect();
      if (typeof IntersectionObserver !== "function") return;
      galleryIO = new IntersectionObserver(es => {
        for (const e of es) {
          if (!e.isIntersecting) e.target.pause();
          else if (e.target.autoplay) { const q = e.target.play(); if (q && q.catch) q.catch(() => {}); }
        }
      }, { rootMargin: "120px" });
      for (const v of $.gallery.querySelectorAll("video")) galleryIO.observe(v);
    }

    // A card can fail at render (a resolver that is not total over the arena) or later
    // (media that 404s). Either way the duel stops being a fair comparison, so the vote
    // buttons come off until you skip. Called again by the media error listener.
    function refreshVoteLock() {
      const bad = !!$.duel.querySelector("[data-td-broken], .td-media-broken");
      for (const b of [$.voteA, $.voteTie, $.voteB]) b.disabled = bad;
      lockNote = bad ? "One of these cards didn't render, so this duel isn't votable. Skip it, and check the console." : "";
      renderStatus();
    }

    function render() {
      const a = arena();
      if (C.dims.length) syncControls(a);
      $.duel.replaceChildren(...(duel ? [card(byId[duel.a], a, "Left"), card(byId[duel.b], a, "Right")] : []));
      // The gallery only depends on the arena, so it is rebuilt when the arena changes
      // and not once per vote. Tearing down N <video> elements every duel put the whole
      // grid back at the top of its loop and spent decode time the duel needed.
      const gk = JSON.stringify(a.ids);
      if (gk !== galleryKey) {
        galleryKey = gk;
        $.gallery.replaceChildren(...C.contenders.map(c => card(c, a)));
        watchGalleryVideos();
      }
      syncDuelVideos();
      refreshVoteLock();
    }

    function nextDuel() {
      if ($.shuffle && $.shuffle.checked) {
        for (const d of C.dims) if (d.shuffle) {
          arenaIds[d.id] = d.type === "select" ? d.options[Math.floor(Math.random() * d.options.length)].id : Math.random() < .5;
        }
      }
      const p = pickPair(ids, votes, lastKey);
      lastKey = p.key; duel = { a: p.a, b: p.b };
      render();
    }

    function renderStandings() {
      const sorted = [...votes].sort((x, y) => x.t - y.t);
      const all = elo(ids, sorted, C.k);
      const perSplit = splitVals.map(s => {
        const list = sorted.filter(v => splitOf(C, resolveArena(C, v, true)) === s.id);
        const r = elo(ids, list, C.k);
        const best = list.length ? ids.slice().sort((x, y) => r[y] - r[x])[0] : null;
        return { r, best };
      });
      const rec = records(ids, sorted);
      const rows = ids.slice().sort((x, y) => all[y] - all[x]).map((id, i) => {
        const c = byId[id];
        const nameCell = h("td");
        if (C.swatch) {
          const sw = C.swatch(c, { h });
          if (sw != null) nameCell.append(sw instanceof Node ? sw : h("span", { class: "td-swatch", style: `background:${sw}` }));
        }
        nameCell.append(document.createTextNode(c.name));
        return h("tr", {},
          h("td", { class: "rank", text: String(i + 1) }),
          nameCell,
          h("td", { class: "num", text: String(Math.round(all[id])) }),
          ...perSplit.map(s => h("td", { class: "num" + (s.best === id ? " td-lead" : ""), text: String(Math.round(s.r[id])) })),
          h("td", { class: "num", text: `${rec[id].w}–${rec[id].l}–${rec[id].t}` }));
      });
      $.standings.replaceChildren(...rows);

      const recent = sorted.slice().reverse().slice(0, C.recent);
      $.feed.replaceChildren(...(recent.length ? recent.map(v => {
        const a = byId[v.a] ? byId[v.a].name : v.a, b = byId[v.b] ? byId[v.b].name : v.b;
        const w = v.w === "tie" ? `${a} = ${b}` : `${v.w === "a" ? a : b} beat ${v.w === "a" ? b : a}`;
        return h("li", {}, h("b", { text: w }), h("span", { text: describe(v) }), h("span", { class: "when", text: ago(v.t) }));
      }) : [h("li", { class: "td-empty", text: "No bouts yet. Vote above to start the table." })]));
      renderStatus();
    }

    function renderStatus() {
      if (lockNote) { $.status.textContent = lockNote; return; }
      if (note) { $.status.textContent = note; return; }
      if (shared) {
        const n = votes.filter(v => !String(v.id).startsWith("local-")).length;
        $.status.textContent = `${n} shared vote${n === 1 ? "" : "s"} so far.`;
      } else $.status.textContent = "Votes stay in this browser until the shared table connects.";
    }
    function say(msg, sticky) {
      note = msg; clearTimeout(noteTimer); renderStatus();
      if (!sticky) noteTimer = setTimeout(() => { note = ""; renderStatus(); }, 2500);
    }

    // ---- voting ----
    function saveLocal() {
      try { localStorage.setItem(C.localKey, JSON.stringify(votes.filter(x => String(x.id).startsWith("local-")))); } catch (e) { /* storage blocked */ }
    }
    function localVote(v) {
      v.id = "local-" + v.t; votes.push(v); myLast = { local: v.id }; $.undo.hidden = false;
      saveLocal(); renderStandings();
    }
    async function vote(w) {
      if (!duel || lockNote) return;
      const v = { a: duel.a, b: duel.b, w, ...arena().ids, t: Date.now() };
      const cards = $.duel.children;
      if (w === "a" && cards[0]) cards[0].classList.add("picked");
      if (w === "b" && cards[1]) cards[1].classList.add("picked");
      duel = null;
      if (shared && votesCol) {
        try {
          const ref = votesCol.doc(); await ref.set(v); myLast = ref; $.undo.hidden = false;
          say("Vote saved to the shared table.");
        } catch (e) {
          shared = false; localVote(v);
          say("You can view but not vote on the shared table here, so this vote stays in your browser.", true);
        }
      } else localVote(v);
      setTimeout(nextDuel, 260);
    }
    async function undo() {
      if (!myLast) return;
      if (myLast.local) { const id = myLast.local; votes = votes.filter(v => v.id !== id); saveLocal(); renderStandings(); say("Vote removed."); }
      else { try { await myLast.delete(); say("Vote removed."); } catch (e) { say("Couldn't remove that vote."); } }
      myLast = null; $.undo.hidden = true;
    }

    document.addEventListener("keydown", e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (e.target.closest && e.target.closest("select,input,textarea,[contenteditable]")) return;
      const k = e.key;
      if (k === "ArrowLeft") vote("a");
      else if (k === "ArrowRight") vote("b");
      else if (k === "ArrowDown") vote("tie");
      else if (k === "s" || k === "S") nextDuel();
      else if (k === "u" || k === "U") undo();
      else if (k === "r" || k === "R") syncDuelVideos(true);
      else return;
      e.preventDefault();
    });

    // ---- boot ----
    try { const saved = JSON.parse(localStorage.getItem(C.localKey) || "[]"); if (Array.isArray(saved)) votes = saved; } catch (e) { /* no storage */ }
    nextDuel(); renderStandings();

    (async () => {
      let db = null;
      try { db = await (root.claude && root.claude.use ? root.claude.use("db") : null); } catch (e) { db = null; }
      if (!db) { say("Shared votes aren't available in this view, so votes stay in your browser.", true); return; }
      votesCol = db.collection(C.collection); shared = true; renderStatus();
      votesCol.onSnapshot(snap => {
        const local = votes.filter(v => String(v.id).startsWith("local-"));
        votes = snap.docs.map(d => ({ ...d.data(), id: d.id })).concat(local);
        renderStandings();
      }, () => { shared = false; say("Lost the shared table, so votes stay in your browser for now.", true); });
    })();

    return { get votes() { return votes.slice(); }, next: nextDuel, vote, undo };
  }

  const api = { start, elo, records, pickPair, pairCounts, ago, normalize, resolveArena, mediaSpec };
  root.Thunderdome = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
