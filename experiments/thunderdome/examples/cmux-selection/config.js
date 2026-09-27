// cmux sidebar selection: eight ways to draw the selected workspace row.
// Arena: sidebar theme x macOS accent x Increase Contrast. Split: light vs dark sidebar.

const THEMES = [
  { id: "mac-light", name: "macOS Light", bg: "#E6E6E8", fg: [0, 0, 0], fgA: .85, secA: .5, dark: false },
  { id: "mac-dark", name: "macOS Dark", bg: "#262628", fg: [255, 255, 255], fgA: .88, secA: .55, dark: true },
  { id: "github-light", name: "GitHub Light", bg: "#F6F8FA", fg: [31, 35, 40], fgA: 1, secA: .62, dark: false },
  { id: "solarized-light", name: "Solarized Light", bg: "#FDF6E3", fg: [7, 54, 66], fgA: 1, secA: .62, dark: false },
  { id: "catppuccin-mocha", name: "Catppuccin Mocha", bg: "#1E1E2E", fg: [205, 214, 244], fgA: 1, secA: .62, dark: true },
  { id: "gruvbox-dark", name: "Gruvbox Dark", bg: "#282828", fg: [235, 219, 178], fgA: 1, secA: .6, dark: true },
  { id: "nord", name: "Nord", bg: "#2E3440", fg: [236, 239, 244], fgA: 1, secA: .6, dark: true },
  { id: "tokyo-night", name: "Tokyo Night", bg: "#1A1B26", fg: [192, 202, 245], fgA: 1, secA: .6, dark: true },
];
const ACCENTS = [
  { id: "blue", name: "Blue", l: "#007AFF", d: "#0A84FF" },
  { id: "purple", name: "Purple", l: "#953D96", d: "#A550A7" },
  { id: "pink", name: "Pink", l: "#F74F9E", d: "#F74F9E" },
  { id: "red", name: "Red", l: "#E0383E", d: "#FF5257" },
  { id: "orange", name: "Orange", l: "#F7821B", d: "#F7821B" },
  { id: "yellow", name: "Yellow", l: "#FFC600", d: "#FFC600" },
  { id: "green", name: "Green", l: "#62BA46", d: "#62BA46" },
  { id: "graphite", name: "Graphite", l: "#8C8C8C", d: "#8C8C8C" },
];
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, t) => a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));

// Each paint: ({th, ac, dark, active, ic}) -> {bg, edge, title, sub, weight, mark}
const TREATMENTS = [
  { id: "tint", name: "Accent tint", note: "#14890: accent at 20% light, 24% dark",
    paint: ({ th, ac, dark, active, ic }) => active
      ? { bg: rgba(ac, ic ? (dark ? .42 : .36) : (dark ? .24 : .20)), edge: ic ? rgba(ac, .85) : null }
      : { bg: rgba(th.fg, ic ? (dark ? .20 : .16) : (dark ? .10 : .07)), edge: ic ? rgba(th.fg, .45) : null } },
  { id: "neutral", name: "Neutral wash", note: "Things, Linear: grey fill, no accent",
    paint: ({ th, dark, active, ic }) => ({ bg: rgba(th.fg, (active ? (dark ? .13 : .10) : (dark ? .08 : .06)) * (ic ? 1.8 : 1)), edge: ic ? rgba(th.fg, .45) : null }) },
  { id: "edge", name: "Tint + hairline", note: "Faint accent fill, 1px accent edge",
    paint: ({ th, ac, dark, active, ic }) => active
      ? { bg: rgba(ac, ic ? .26 : (dark ? .14 : .11)), edge: rgba(ac, ic ? .95 : .6) }
      : { bg: rgba(th.fg, dark ? .08 : .06), edge: rgba(th.fg, ic ? .45 : .2) } },
  { id: "chip", name: "Raised chip", note: "Arc-style lighter surface, no hue",
    paint: ({ dark, active, ic }) => dark
      ? { bg: `rgba(255,255,255,${active ? (ic ? .2 : .12) : .07})`, edge: `rgba(255,255,255,${ic ? .4 : .06})` }
      : { bg: `rgba(255,255,255,${active ? (ic ? 1 : .82) : .5})`, edge: `rgba(0,0,0,${ic ? .35 : .07})` } },
  { id: "muted", name: "Muted accent", note: "Accent pulled halfway to grey",
    paint: ({ th, ac, dark, active, ic }) => active
      ? { bg: rgba(mix(ac, [128, 128, 128], .5), ic ? .55 : (dark ? .38 : .32)), edge: ic ? rgba(ac, .85) : null }
      : { bg: rgba(th.fg, dark ? .10 : .07), edge: ic ? rgba(th.fg, .45) : null } },
  { id: "vivid", name: "Solid blue (today)", note: "Current main, the control",
    paint: ({ dark }) => ({ bg: dark ? "#0091FF" : "#0088FF", edge: null, title: "#FFFFFF", sub: "rgba(255,255,255,.75)" }) },
  { id: "title", name: "Accent title", note: "No fill; the title takes the accent",
    paint: ({ th, ac, dark, active, ic }) => ({ bg: ic ? rgba(th.fg, dark ? .10 : .08) : "transparent", edge: null,
      title: active ? rgba(ac, 1) : null, weight: 700 }) },
  { id: "dot", name: "Neutral + accent dot", note: "Grey wash with a small accent marker",
    paint: ({ th, ac, dark, active, ic }) => ({ bg: rgba(th.fg, (dark ? .10 : .08) * (ic ? 1.8 : 1)), edge: ic ? rgba(th.fg, .45) : null,
      mark: active ? rgba(ac, 1) : rgba(th.fg, .4) }) },
];

const ROWS = [
  { t: "api-server", s: "feature/auth  ~/code/api", sel: true },
  { t: "docs site", s: "main  ~/code/docs", unread: 2 },
  { t: "release prep", s: "release/1.4  ~/code/app" },
  { t: "scratch", s: "~" },
];

function sidebar(tr, th, acHex, active, ic, h) {
  const dark = th.dark, ac = rgb(acHex);
  const fg = rgba(th.fg, th.fgA), sec = rgba(th.fg, th.secA);
  const p = tr.paint({ th, ac, dark, active, ic });
  const el = h("div", { class: "sb", style: `background:${th.bg}` });
  for (const r of ROWS) {
    const row = h("div", { class: "row" });
    let tc = fg, sc = sec, weight = 600, mark = null;
    if (r.sel) {
      row.style.background = p.bg;
      if (p.edge) row.style.boxShadow = `inset 0 0 0 1px ${p.edge}`;
      if (p.title) tc = p.title;
      if (p.sub) sc = p.sub;
      if (p.weight) weight = p.weight;
      mark = p.mark;
    }
    const t = h("div", { class: "t", style: `color:${tc};font-weight:${weight}` });
    if (mark) t.append(h("span", { class: "mark", style: `background:${mark}` }));
    t.append(h("span", { class: "nm", text: r.t }));
    if (r.unread) t.append(h("span", { class: "badge", style: `background:${acHex};color:${acHex === "#FFC600" ? "#3A2E00" : "#fff"}`, text: String(r.unread) }));
    row.append(t, h("div", { class: "s", style: `color:${sc}`, text: r.s }));
    el.append(row);
  }
  return el;
}

Thunderdome.start({
  id: "cmux-selection",
  title: "Selection Thunderdome",
  lede: "Eight ways to draw the selected workspace in the cmux sidebar, fighting in pairs. Each card shows the same sidebar with the window active and with the window in the background. Pick the one you'd rather look at all day. Every vote feeds a shared Elo table, split by light and dark sidebars. Proposal under review: <code>manaflow-ai/cmux#14890</code>.",
  contenderLabel: "Treatment",
  contenders: TREATMENTS,
  arena: {
    dimensions: [
      { id: "theme", label: "Sidebar", options: THEMES },
      { id: "accent", label: "Accent", options: ACCENTS },
      { id: "ic", label: "Increase Contrast", short: "IC", shuffle: false },
    ],
  },
  split: {
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: a => a.theme && (a.theme.dark ? "dark" : "light"),
  },
  tag: a => `${a.theme.dark ? "dark" : "light"} · ${a.accent.name.toLowerCase()} · ${(a.theme.dark ? a.accent.d : a.accent.l).toLowerCase()}`,
  describe: (a, v) => [a.theme ? a.theme.name : v.theme, a.accent ? a.accent.name.toLowerCase() : v.accent].concat(a.ic ? ["IC"] : []).join(", "),
  render: (tr, a, { h }) => {
    const acHex = a.theme.dark ? a.accent.d : a.accent.l;
    const pair = h("div", { class: "pair" });
    for (const [label, active] of [["Window active", true], ["In background", false]]) {
      pair.append(h("div", {}, h("div", { class: "cap", text: label }), sidebar(tr, a.theme, acHex, active, a.ic, h)));
    }
    return pair;
  },
  // Standings swatch: the active row on macOS Dark with the blue accent.
  swatch: tr => {
    const th = THEMES[1], p = tr.paint({ th, ac: rgb("#0A84FF"), dark: true, active: true, ic: false });
    const sw = document.createElement("span");
    sw.className = "td-swatch";
    sw.style.background = tr.id === "title"
      ? `linear-gradient(90deg,#0A84FF 0 40%, ${th.bg} 40%)`
      : `linear-gradient(${p.bg},${p.bg}),${th.bg}`;
    if (p.edge) sw.style.boxShadow = `inset 0 0 0 1px ${p.edge}`;
    if (p.mark) sw.style.boxShadow = `inset 4px 0 0 ${p.mark}`;
    return sw;
  },
});
