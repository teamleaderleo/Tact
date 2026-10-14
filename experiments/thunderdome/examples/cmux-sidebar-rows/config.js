// cmux NEXT sidebar rows: native AppKit sidebar of the cg-judge DEV build (feat-cmux-next ee8d80672c35),
// captured with debug.window_snapshot; each contender is one runtime Debug tunable. RESULTS.md has the blind run.
const MEDIA = {
  "badge-outline-appledark": "media/badge-outline-appledark.png",
  "badge-outline-applelight": "media/badge-outline-applelight.png",
  "badge-outline-latte": "media/badge-outline-latte.png",
  "badge-outline-mocha": "media/badge-outline-mocha.png",
  "badge-quiet-appledark": "media/badge-quiet-appledark.png",
  "badge-quiet-applelight": "media/badge-quiet-applelight.png",
  "badge-quiet-latte": "media/badge-quiet-latte.png",
  "badge-quiet-mocha": "media/badge-quiet-mocha.png",
  "badge-tone-appledark": "media/badge-tone-appledark.png",
  "badge-tone-applelight": "media/badge-tone-applelight.png",
  "badge-tone-latte": "media/badge-tone-latte.png",
  "badge-tone-mocha": "media/badge-tone-mocha.png",
  "mark-beside-appledark": "media/mark-beside-appledark.png",
  "mark-beside-applelight": "media/mark-beside-applelight.png",
  "mark-beside-latte": "media/mark-beside-latte.png",
  "mark-beside-mocha": "media/mark-beside-mocha.png",
  "mark-replaces-appledark": "media/mark-replaces-appledark.png",
  "mark-replaces-applelight": "media/mark-replaces-applelight.png",
  "mark-replaces-latte": "media/mark-replaces-latte.png",
  "mark-replaces-mocha": "media/mark-replaces-mocha.png",
  "r4-appledark": "media/r4-appledark.png",
  "r4-applelight": "media/r4-applelight.png",
  "r4-latte": "media/r4-latte.png",
  "r4-mocha": "media/r4-mocha.png",
  "r9-appledark": "media/r9-appledark.png",
  "r9-applelight": "media/r9-applelight.png",
  "r9-latte": "media/r9-latte.png",
  "r9-mocha": "media/r9-mocha.png",
  "rh22-appledark": "media/rh22-appledark.png",
  "rh22-applelight": "media/rh22-applelight.png",
  "rh22-latte": "media/rh22-latte.png",
  "rh22-mocha": "media/rh22-mocha.png",
  "rh28-appledark": "media/rh28-appledark.png",
  "rh28-applelight": "media/rh28-applelight.png",
  "rh28-latte": "media/rh28-latte.png",
  "rh28-mocha": "media/rh28-mocha.png",
  "sec-card-appledark": "media/sec-card-appledark.png",
  "sec-card-applelight": "media/sec-card-applelight.png",
  "sec-card-latte": "media/sec-card-latte.png",
  "sec-card-mocha": "media/sec-card-mocha.png",
  "sec-linesicons-appledark": "media/sec-linesicons-appledark.png",
  "sec-linesicons-applelight": "media/sec-linesicons-applelight.png",
  "sec-linesicons-latte": "media/sec-linesicons-latte.png",
  "sec-linesicons-mocha": "media/sec-linesicons-mocha.png",
  "shipped-appledark": "media/shipped-appledark.png",
  "shipped-applelight": "media/shipped-applelight.png",
  "shipped-latte": "media/shipped-latte.png",
  "shipped-mocha": "media/shipped-mocha.png",
};

Thunderdome.start({
  id: "cmux-sidebar-rows",
  title: "Sidebar Rows Thunderdome",
  lede: "Which sidebar would you rather scan all day to find what needs you? One tunable per question.",
  media: { aspect: "420 / 960" },
  arena: { dimensions: [{ id: "theme", label: "Theme", options: [
    { id: "applelight", name: "Apple System Colors Light", dark: false }, { id: "latte", name: "Catppuccin Latte", dark: false },
    { id: "appledark", name: "Apple System Colors", dark: true }, { id: "mocha", name: "Catppuccin Mocha", dark: true }] }] },
  split: { values: [{ id: "light", label: "Light themes" }, { id: "dark", label: "Dark themes" }], of: a => (a.theme.dark ? "dark" : "light") },
  questions: [
    { id: "agent-mark", short: "Agent mark", title: "Where does the agent show up on a row?", contenders: [
        { id: "shipped", name: "As shipped", note: "status glyph only", media: a => MEDIA[`shipped-${a.theme.id}`] },
        { id: "mark-replaces", name: "Mark replaces status", note: "brand mark in the status slot", media: a => MEDIA[`mark-replaces-${a.theme.id}`] },
        { id: "mark-beside", name: "Mark beside title", note: "small leading brand mark, status kept", media: a => MEDIA[`mark-beside-${a.theme.id}`] }
      ] },
    { id: "notification-badge", short: "Badge", title: "Which unread count?", contenders: [
        { id: "shipped", name: "As shipped", note: "count on a neutral fill", media: a => MEDIA[`shipped-${a.theme.id}`] },
        { id: "badge-quiet", name: "Quiet", note: "plain secondary digit", media: a => MEDIA[`badge-quiet-${a.theme.id}`] },
        { id: "badge-outline", name: "Outline", note: "hairline box", media: a => MEDIA[`badge-outline-${a.theme.id}`] },
        { id: "badge-tone", name: "Tone", note: "faint attention-yellow wash", media: a => MEDIA[`badge-tone-${a.theme.id}`] }
      ] },
    { id: "row-pitch", short: "Row pitch", title: "How tall are rows?", contenders: [
        { id: "rh22", name: "22pt", note: "", media: a => MEDIA[`rh22-${a.theme.id}`] },
        { id: "shipped", name: "24pt (shipped)", note: "", media: a => MEDIA[`shipped-${a.theme.id}`] },
        { id: "rh28", name: "28pt (Codex/Claude pitch)", note: "", media: a => MEDIA[`rh28-${a.theme.id}`] }
      ] },
    { id: "corner-radius", short: "Radius", title: "Item corner radius", contenders: [
        { id: "r4", name: "4pt", note: "", media: a => MEDIA[`r4-${a.theme.id}`] },
        { id: "shipped", name: "6pt (shipped)", note: "", media: a => MEDIA[`shipped-${a.theme.id}`] },
        { id: "r9", name: "9pt", note: "", media: a => MEDIA[`r9-${a.theme.id}`] }
      ] },
    { id: "top-sections", short: "Top", title: "Home and App Store", contenders: [
        { id: "shipped", name: "As shipped", note: "labeled rows over a hairline", media: a => MEDIA[`shipped-${a.theme.id}`] },
        { id: "sec-card", name: "Card", note: "in a rounded inset card", media: a => MEDIA[`sec-card-${a.theme.id}`] },
        { id: "sec-linesicons", name: "Icon tiles", note: "icon-only buttons", media: a => MEDIA[`sec-linesicons-${a.theme.id}`] }
      ] }
  ],
});
