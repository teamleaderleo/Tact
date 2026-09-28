// cmux sidebar organization: six ways to lay out the same ~24 workspaces.
// Arena: sidebar theme x moment (busy afternoon vs quiet evening). Split: light vs dark.
// Design notes: manaflow-ai/cmuxterm-hq#871.

const THEMES = [
  { id: "mac-light", name: "macOS Light", bg: "#E6E6E8", fg: [0, 0, 0], fgA: .85, secA: .5, dark: false },
  { id: "mac-dark", name: "macOS Dark", bg: "#262628", fg: [255, 255, 255], fgA: .88, secA: .55, dark: true },
  { id: "github-light", name: "GitHub Light", bg: "#F6F8FA", fg: [31, 35, 40], fgA: 1, secA: .62, dark: false },
  { id: "tokyo-night", name: "Tokyo Night", bg: "#1A1B26", fg: [192, 202, 245], fgA: 1, secA: .6, dark: true },
];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// One workspace per line: title, host, agent, project, manual group, and status in two moments.
// Status: n needs input, r running, u done unseen, i idle, t plain terminal.
// Hosts: "local" is this Mac; "devbox" and "gpu-01" are cmux ssh targets; "cloud" is a Cloud VM.
const W = [
  ["sidebar groups", "devbox", "claude", "cmux", "Sidebar", "rn", 4],
  ["compact status", "local", "claude", "cmux", "Sidebar", "ui", 12],
  ["row density", "local", "claude", "cmux", "Sidebar", "ri", 30],
  ["ssh failure", "devbox", "claude", "cmux", null, "ni", 2],
  ["keymap chooser", "devbox", "codex", "cmux", null, "ri", 8],
  ["clickable links", "devbox", "claude", "cmux", null, "ui", 15],
  ["merge train", "devbox", "claude", "cmux", "Release", "ri", 1],
  ["release notes", "local", "codex", "cmux", "Release", "ii", 240],
  ["nightly smoke", "cloud", null, "cmux", "Release", "tt", 400],
  ["thunderdome", "devbox", "claude", "tact", null, "ui", 6],
  ["atelier notes", "local", "claude", "tact", null, "ii", 900],
  ["glaeda queue", "devbox", "codex", "glaeda", null, "ri", 3],
  ["gh daemon", "local", "claude", "glaeda", null, "ni", 20],
  ["pool routing", "local", "claude", "subrouter", null, "ri", 5],
  ["eviction rule", "devbox", "claude", "hq", null, "ri", 9],
  ["attention feed", "devbox", "claude", "hq", null, "ui", 45],
  ["cloud vision", "devbox", "codex", "hq", null, "ii", 130],
  ["train eval", "gpu-01", "claude", "evals", null, "ri", 11],
  ["gpu shell", "gpu-01", null, "~", null, "tt", 60],
  ["tail logs", "devbox", null, "~", null, "tt", 25],
  ["dotfiles", "local", null, "dotfiles", null, "tt", 2000],
  ["scratch", "local", null, "~", null, "tt", 3000],
  ["docs site", "local", "claude", "web", null, "ii", 5000],
  ["benchmarks", "cloud", "codex", "cmux", null, "ni", 18],
].map(([t, host, agent, proj, group, st, age]) => ({ t, host, agent, proj, group, st, age }));

const MOMENTS = [
  { id: "busy", name: "Busy afternoon", pick: 0 },
  { id: "quiet", name: "Quiet evening", pick: 1 },
];
const statusOf = (w, m) => w.st[m.pick];

const HOST_NAME = { local: "This Mac", devbox: "devbox", "gpu-01": "gpu-01", cloud: "Cloud VM" };
const HOST_ORDER = ["local", "devbox", "gpu-01", "cloud"];
const STATUS_META = {
  n: { name: "Needs input", rank: 0 },
  r: { name: "Running", rank: 1 },
  u: { name: "Done, unseen", rank: 2 },
  i: { name: "Idle", rank: 3 },
  t: { name: "Terminals", rank: 4 },
};
const GROUP_COLOR = { Sidebar: "#5E81AC", Release: "#D08770" };
const AMBER = "rgb(250,176,10)", BLUE = "#0A84FF";

// ---- drawing ------------------------------------------------------------------

function glyph(st, th, h) {
  const sec = rgba(th.fg, th.secA);
  if (st === "n") return h("span", { class: "g dot", style: `background:${AMBER}` });
  if (st === "r") return h("span", { class: "g dot pulse", style: `background:${sec}` });
  if (st === "u") return h("span", { class: "g dot", style: `background:${BLUE}` });
  if (st === "i") return h("span", { class: "g ring", style: `border-color:${sec};color:${sec}`, text: "✓" });
  return h("span", { class: "g" });
}

function row(w, ctx, opts = {}) {
  const { th, m, h } = ctx;
  const fg = rgba(th.fg, th.fgA), sec = rgba(th.fg, th.secA);
  const st = statusOf(w, m);
  const r = h("div", { class: "r" + (opts.indent === 2 ? " in2" : opts.indent ? " in" : "") });
  r.append(glyph(st, th, h));
  if (opts.groupTag && w.group) r.append(h("span", { class: "tag", style: `background:${GROUP_COLOR[w.group]}` }));
  r.append(h("span", { class: "nm", style: `color:${fg};font-weight:${st === "u" || st === "n" ? 650 : 500}`, text: w.t }));
  const trail = opts.trail ? opts.trail(w) : (w.host !== "local" ? HOST_NAME[w.host] : "");
  if (trail) r.append(h("span", { class: "tr", style: `color:${sec}`, text: trail }));
  return r;
}

function header(label, ctx, opts = {}) {
  const { th, h } = ctx;
  const sec = rgba(th.fg, th.secA), fg = rgba(th.fg, th.fgA);
  const el = h("div", { class: "hd" + (opts.strong ? " strong" : "") });
  el.append(h("span", { class: "chev", style: `color:${sec}`, text: opts.collapsed ? "▸" : "▾" }));
  if (opts.icon) el.append(h("span", { class: "ic", style: `color:${opts.color || sec}`, text: opts.icon }));
  else if (opts.color) el.append(h("span", { class: "sw", style: `background:${opts.color}` }));
  el.append(h("span", { class: "hl", style: `color:${opts.strong ? fg : sec}`, text: label }));
  if (opts.count != null) el.append(h("span", { class: "ct", style: `color:${sec}`, text: String(opts.count) }));
  if (opts.rollup) el.append(glyph(opts.rollup, th, h));
  return el;
}

function switcher(label, ctx) {
  const { th, h } = ctx;
  const sec = rgba(th.fg, th.secA), fg = rgba(th.fg, th.fgA);
  return h("div", { class: "sw-bar", style: `border-color:${rgba(th.fg, .12)}` },
    h("span", { style: `color:${sec}`, text: "Group by" }),
    h("span", { class: "pill", style: `color:${fg};background:${rgba(th.fg, th.dark ? .12 : .08)}`, text: label + "  ▾" }));
}

const loudest = ws => ws.map(w => w.cur).sort((a, b) => STATUS_META[a].rank - STATUS_META[b].rank)[0];

function sections(ws, keyOf, order, ctx, labelOf, opts = {}) {
  const buckets = new Map();
  for (const w of ws) {
    const k = keyOf(w);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(w);
  }
  const keys = [...buckets.keys()].sort((a, b) => order(a) - order(b));
  const out = [];
  for (const k of keys) {
    const items = buckets.get(k);
    out.push(header(labelOf(k), ctx, { count: items.length, rollup: opts.rollup ? loudest(items) : null, icon: opts.icon && opts.icon(k), color: opts.color && opts.color(k) }));
    for (const w of items) out.push(row(w, ctx, { indent: true, ...(opts.row || {}) }));
  }
  return out;
}

// ---- the six layouts ---------------------------------------------------------

const byRecent = (a, b) => a.age - b.age;

const LAYOUTS = [
  { id: "flat", name: "Flat list (today)", note: "The control: manual order, manual groups only",
    body: (ws, ctx) => {
      const out = [];
      let seen = new Set();
      for (const w of ws) {
        if (w.group && !seen.has(w.group)) {
          seen.add(w.group);
          const members = ws.filter(x => x.group === w.group);
          out.push(header(w.group, ctx, { color: GROUP_COLOR[w.group], strong: true, count: members.length }));
          for (const x of members) out.push(row(x, ctx, { indent: true }));
        } else if (!w.group) out.push(row(w, ctx));
      }
      return out;
    } },

  { id: "project", name: "By project", note: "What Claude Code and Codex do: one section per repo",
    body: (ws, ctx) => {
      const order = [...new Set(ws.map(w => w.proj))];
      return [switcher("Project", ctx), ...sections(ws, w => w.proj, k => k === "~" ? 99 : order.indexOf(k), ctx, k => k === "~" ? "No project" : k, { icon: () => "▣" })];
    } },

  { id: "a-host", name: "A: Group by host", note: "One switcher; sections by machine; manual group kept as a color tag",
    body: (ws, ctx) => [switcher("Host", ctx), ...sections(ws, w => w.host, k => HOST_ORDER.indexOf(k), ctx, k => HOST_NAME[k],
      { rollup: true, icon: k => k === "local" ? "⌂" : k === "cloud" ? "☁" : "⇄", row: { groupTag: true, trail: () => "" } })] },

  { id: "a-status", name: "A: Group by status", note: "Same switcher; sections by agent state, loudest first",
    body: (ws, ctx) => [switcher("Status", ctx), ...sections(ws.slice().sort(byRecent), w => w.cur, k => STATUS_META[k].rank, ctx, k => STATUS_META[k].name,
      { row: { groupTag: true } })] },

  { id: "b-smart", name: "B: Smart + manual groups", note: "Rule groups live beside manual ones; manual membership wins",
    body: (ws, ctx) => {
      const { th } = ctx;
      const out = [];
      const needs = ws.filter(w => w.cur === "n");
      out.push(header("Needs input", ctx, { icon: "⚙", color: AMBER, strong: true, count: needs.length }));
      for (const w of needs) out.push(row(w, ctx, { indent: true }));
      const rest = ws.filter(w => w.cur !== "n");
      for (const g of ["Sidebar", "Release"]) {
        const m = rest.filter(w => w.group === g);
        out.push(header(g, ctx, { color: GROUP_COLOR[g], strong: true, count: m.length }));
        for (const w of m) out.push(row(w, ctx, { indent: true }));
      }
      const free = rest.filter(w => !w.group);
      for (const host of ["devbox", "gpu-01"]) {
        const m = free.filter(w => w.host === host);
        out.push(header(`host = ${host}`, ctx, { icon: "⚙", count: m.length, rollup: m.length ? loudest(m) : null }));
        for (const w of m) out.push(row(w, ctx, { indent: true, trail: () => "" }));
      }
      const other = free.filter(w => w.host !== "devbox" && w.host !== "gpu-01");
      out.push(h_sep(ctx));
      for (const w of other) out.push(row(w, ctx));
      return out;
    } },

  { id: "c-strip", name: "C: Attention strip + host lanes", note: "Needs-input and unseen pinned on top; lanes per machine below",
    body: (ws, ctx) => {
      const { th, h } = ctx;
      const out = [];
      const hot = ws.filter(w => w.cur === "n" || w.cur === "u").sort((a, b) => STATUS_META[a.cur].rank - STATUS_META[b.cur].rank);
      const strip = h("div", { class: "strip", style: `background:${rgba(th.fg, th.dark ? .07 : .05)}` });
      strip.append(h("div", { class: "strip-l", style: `color:${rgba(th.fg, th.secA)}`, text: hot.length ? `Attention · ${hot.length}` : "Attention · all clear" }));
      for (const w of hot) strip.append(row(w, ctx));
      out.push(strip);
      for (const host of HOST_ORDER) {
        const lane = ws.filter(w => w.host === host);
        if (!lane.length) continue;
        out.push(header(HOST_NAME[host], ctx, { strong: true, icon: host === "local" ? "⌂" : host === "cloud" ? "☁" : "⇄", count: lane.length, rollup: loudest(lane) }));
        const seen = new Set();
        for (const w of lane) {
          if (w.group && !seen.has(w.group)) {
            seen.add(w.group);
            const members = lane.filter(x => x.group === w.group);
            const sub = header(w.group, ctx, { color: GROUP_COLOR[w.group], count: members.length });
            sub.classList.add("in");
            out.push(sub);
            for (const x of members) out.push(row(x, ctx, { indent: 2, trail: () => "" }));
          } else if (!w.group) out.push(row(w, ctx, { indent: true, trail: () => "" }));
        }
      }
      return out;
    } },
];

function h_sep(ctx) {
  return ctx.h("div", { class: "sep", style: `background:${rgba(ctx.th.fg, .1)}` });
}

Thunderdome.start({
  id: "cmux-sidebar-groups",
  title: "Sidebar Organization Thunderdome",
  lede: "Six ways to organize the same 24 cmux workspaces: local agents, agents on two ssh hosts and a Cloud VM, and plain terminals. Pick the sidebar you would rather work from all day. The arena flips between a busy afternoon (several agents need you) and a quiet evening. Glyphs: amber = needs input, grey = running, blue = done and unseen, ✓ = idle. Design notes: <code>manaflow-ai/cmuxterm-hq#871</code>.",
  contenderLabel: "Layout",
  contenders: LAYOUTS,
  arena: {
    dimensions: [
      { id: "theme", label: "Sidebar", options: THEMES },
      { id: "moment", label: "Moment", options: MOMENTS },
    ],
  },
  split: {
    values: [{ id: "busy", label: "Busy" }, { id: "quiet", label: "Quiet" }],
    of: a => a.moment && a.moment.id,
  },
  tag: a => `${a.theme.dark ? "dark" : "light"} · ${a.moment.name.toLowerCase()}`,
  describe: (a, v) => [a.theme ? a.theme.name : v.theme, a.moment ? a.moment.name.toLowerCase() : v.moment].join(", "),
  render: (layout, a, { h }) => {
    const th = a.theme, m = a.moment;
    const ws = W.map(w => ({ ...w, cur: statusOf(w, m) }));
    const ctx = { th, m, h };
    const sb = h("div", { class: "sb", style: `background:${th.bg}` });
    for (const el of layout.body(ws, ctx)) sb.append(el);
    return sb;
  },
});
