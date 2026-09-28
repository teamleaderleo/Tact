// cmux empty pane: what a new, empty pane shows by default. Eight candidates, today's
// "Empty Panel" among them as the control, each drawn in one of seven terminal themes.
// Arena: the theme. Split: dark themes vs light themes.
// Ported from the one-off page behind manaflow-ai/cmux#15264; RESULTS.md has the run.

const THEMES = [
  { id: "ghostty", name: "Ghostty default", dark: true, bg: "#282c34", fg: "#ffffff", dim: "#8a8f98", accent: "#61afef", alt: "#c678dd", chrome: "#21252b" },
  { id: "mocha", name: "Catppuccin Mocha", dark: true, bg: "#1e1e2e", fg: "#cdd6f4", dim: "#7f849c", accent: "#89b4fa", alt: "#f5c2e7", chrome: "#181825" },
  { id: "tokyo-night", name: "Tokyo Night", dark: true, bg: "#1a1b26", fg: "#c0caf5", dim: "#565f89", accent: "#7aa2f7", alt: "#bb9af7", chrome: "#16161e" },
  { id: "gruvbox-dark", name: "Gruvbox Dark", dark: true, bg: "#282828", fg: "#ebdbb2", dim: "#928374", accent: "#fabd2f", alt: "#fe8019", chrome: "#1d2021" },
  { id: "latte", name: "Catppuccin Latte", dark: false, bg: "#eff1f5", fg: "#4c4f69", dim: "#8c8fa1", accent: "#1e66f5", alt: "#8839ef", chrome: "#e6e9ef" },
  { id: "solarized-light", name: "Solarized Light", dark: false, bg: "#fdf6e3", fg: "#586e75", dim: "#93a1a1", accent: "#268bd2", alt: "#d33682", chrome: "#eee8d5" },
  { id: "github-light", name: "GitHub Light", dark: false, bg: "#ffffff", fg: "#24292f", dim: "#8c959f", accent: "#0969da", alt: "#8250df", chrome: "#f6f8fa" },
];

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const span = (c, s) => `<span style="color:${c}">${esc(s)}</span>`;

// Two rows of braille cells (8 dots tall) tracing a sine wave.
function braille(width, phase) {
  const H = 8, W = width * 2, grid = Array.from({ length: H }, () => Array(W).fill(0));
  for (let x = 0; x < W; x++) {
    const y = Math.round((H - 1) / 2 + Math.sin(x / 5 + phase) * 3.2);
    grid[Math.max(0, Math.min(H - 1, y))][x] = 1;
  }
  const bits = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  const rows = [];
  for (let r = 0; r < H / 4; r++) {
    let line = "";
    for (let c = 0; c < width; c++) {
      let v = 0;
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) if (grid[r * 4 + dy][c * 2 + dx]) v |= bits[dy][dx];
      line += String.fromCharCode(0x2800 + v);
    }
    rows.push(line);
  }
  return rows;
}

const BUTTONS = t => `<div class="buttons">
  <span class="btn" style="background:${t.fg}14;color:${t.fg}">▸ Terminal</span>
  <span class="btn" style="background:${t.fg}14;color:${t.fg}">◎ Browser</span></div>`;

// Each candidate's `art` draws the inside of the pane for one theme.
const CANDIDATES = [
  { id: "control", name: "Today: Empty Panel", note: "The control: icon, title, two buttons", art: t => `
      <svg width="46" height="40" viewBox="0 0 46 40" aria-hidden="true"><rect x="1" y="1" width="44" height="38" rx="7" fill="${t.dim}" opacity=".55"/><path d="M11 14l7 6-7 6" stroke="${t.bg}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 27h11" stroke="${t.bg}" stroke-width="3" stroke-linecap="round"/></svg>
      <div class="control-title" style="color:${t.dim}">Empty Panel</div>${BUTTONS(t)}` },
  { id: "block-small", name: "Half-block wordmark", note: "cmux in two rows of half blocks", art: t => `
      <pre class="art">${span(t.accent, "█▀▀ █▀▄▀█ █ █ ▀▄▀")}\n${span(t.accent, "█▄▄ █ ▀ █ █▄█ █ █")}</pre>${BUTTONS(t)}` },
  { id: "block-shadow", name: "ANSI Shadow wordmark", note: "Blocks in the accent, shadow dim", art: t => {
      const rows = [
        " ██████╗███╗   ███╗██╗   ██╗██╗  ██╗",
        "██╔════╝████╗ ████║██║   ██║╚██╗██╔╝",
        "██║     ██╔████╔██║██║   ██║ ╚███╔╝ ",
        "██║     ██║╚██╔╝██║██║   ██║ ██╔██╗ ",
        "╚██████╗██║ ╚═╝ ██║╚██████╔╝██╔╝ ██╗",
        " ╚═════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝"];
      const line = r => [...r].map(ch => ch === "█" ? span(t.accent, ch) : span(t.dim, ch)).join("");
      return `<pre class="art" style="font-size:10px">${rows.map(line).join("\n")}</pre>${BUTTONS(t)}`; } },
  { id: "slant", name: "Figlet slant, two-tone", note: "Top half accent, bottom half second accent", art: t => {
      const rows = [
        "  _________ ___  __  ___  __",
        " / ___/ __ `__ \\/ / / / |/_/",
        "/ /__/ / / / / / /_/ />  <  ",
        "\\___/_/ /_/ /_/\\__,_/_/|_|  "];
      return `<pre class="art">${rows.map((r, i) => span(i < 2 ? t.accent : t.alt, r)).join("\n")}</pre>${BUTTONS(t)}`; } },
  { id: "braille", name: "Braille wave", note: "A sine wave in braille, and the shortcut", art: t => {
      const w = braille(30, 0.6);
      return `<pre class="art" style="font-size:14px;line-height:1">${span(t.accent, w[0])}\n${span(t.alt, w[1])}</pre>
        <pre class="art">${span(t.dim, "no process · ")}${span(t.fg, "⌘T")}${span(t.dim, " terminal")}</pre>${BUTTONS(t)}`; } },
  { id: "shade", name: "Shade ramp", note: "░▒▓█ cmux █▓▒░", art: t => `
      <pre class="art">${span(t.dim, "░░▒▒▓▓")}${span(t.accent, "██ cmux ██")}${span(t.dim, "▓▓▒▒░░")}</pre>${BUTTONS(t)}` },
  { id: "grid", name: "Quiet dot grid", note: "A dim field of dots around ∅ empty", art: t => {
      const rows = [];
      for (let r = 0; r < 5; r++) rows.push(Array(15).fill("·").join(" "));
      return `<pre class="art">${rows.map((r, i) => i === 2
        ? span(t.dim, "· · · · ·  ") + span(t.fg, "∅ empty") + span(t.dim, "  · · · · ·")
        : span(t.dim + "88", r)).join("\n")}</pre>${BUTTONS(t)}`; } },
  { id: "frame", name: "Box-drawn keycaps", note: "A cheat sheet in a rounded box", art: t => {
      const k = (key, label) => span(t.dim, "│  ") + span(t.accent, key.padEnd(6)) + span(t.fg, label.padEnd(20)) + span(t.dim, "│");
      return `<pre class="art">${span(t.dim, "╭────────────────────────────╮")}\n${k("⌘T", "new terminal")}\n${k("⌘⇧L", "new browser")}\n${k("⌘D", "split right")}\n${span(t.dim, "╰────────────────────────────╯")}</pre>`; } },
];

// Leo's run on the one-off page (69 votes, 2026-09-28), in the shape the results box
// exports. Those Elo numbers are sequential Elo, K = 24, which is what that page kept;
// the engine's own boards are a fitted Bradley-Terry and will read a little differently
// for the same votes. #demo draws these.
const LEO = {
  dark: [
    { id: "block-small", elo: 1558, w: 6, l: 0, t: 3 }, { id: "slant", elo: 1554, w: 5, l: 0, t: 4 },
    { id: "block-shadow", elo: 1538, w: 3, l: 0, t: 6 }, { id: "shade", elo: 1528, w: 5, l: 2, t: 2 },
    { id: "frame", elo: 1497, w: 3, l: 3, t: 3 }, { id: "grid", elo: 1477, w: 2, l: 4, t: 2 },
    { id: "braille", elo: 1450, w: 2, l: 7, t: 0 }, { id: "control", elo: 1398, w: 0, l: 10, t: 0 },
  ],
  light: [
    { id: "block-shadow", elo: 1553, w: 5, l: 0, t: 3 }, { id: "slant", elo: 1552, w: 5, l: 0, t: 4 },
    { id: "frame", elo: 1532, w: 3, l: 0, t: 5 }, { id: "block-small", elo: 1523, w: 3, l: 1, t: 4 },
    { id: "shade", elo: 1491, w: 1, l: 2, t: 5 }, { id: "braille", elo: 1479, w: 3, l: 5, t: 0 },
    { id: "grid", elo: 1463, w: 2, l: 5, t: 1 }, { id: "control", elo: 1407, w: 0, l: 9, t: 0 },
  ],
  votes: 69,
};

Thunderdome.start({
  id: "cmux-empty-pane",
  title: "Empty Pane Thunderdome",
  lede: "Which should a new, empty cmux pane show by default? Two candidates, one terminal theme. Pick the one you would rather see. Today's look is in the pool as the control. Rankings are kept separately for dark and light themes. From <code>manaflow-ai/cmux#15264</code>.",
  askedBy: "manaflow-ai/cmux#15264",
  contenderLabel: "Candidate",
  contenders: CANDIDATES,
  arena: {
    dimensions: [{ id: "theme", label: "Theme", options: THEMES }],
  },
  split: {
    values: [{ id: "dark", label: "Dark themes" }, { id: "light", label: "Light themes" }],
    of: a => a.theme && (a.theme.dark ? "dark" : "light"),
  },
  tag: a => `${a.theme.name} (${a.theme.dark ? "dark" : "light"})`,
  describe: (a, v) => (a.theme ? a.theme.name : v.theme),
  render: (c, a) => {
    const t = a.theme;
    return `<div class="pane" style="background:${t.bg};color:${t.fg}">
      <div class="tabs" style="background:${t.chrome};color:${t.dim}"><span class="t" style="background:${t.bg}">~/Projects</span><span class="t">agent · claude</span></div>
      <div class="body">${c.art(t)}</div></div>`;
  },
  demo: { arena: { theme: "tokyo-night" }, duel: ["control", "slant"], results: LEO },
});
