// cmux NEXT sidebar groups: how a group is drawn, plus status grouping as an opt-in. Every image is
// the real native sidebar (debug.window_snapshot of a cg-judge DEV build, branch
// cg-judge/sidebar-group-look b3b8e7df801) with the sidebar.groupLook Debug tunable switched live.
// A four-model blind panel judged first; RESULTS.md has both.

const THEMES = [
  { id: "latte", name: "Catppuccin Latte", dark: false },
  { id: "applelight", name: "Apple System Colors Light", dark: false },
  { id: "mocha", name: "Catppuccin Mocha", dark: true },
  { id: "appledark", name: "Apple System Colors", dark: true },
];

const MEDIA = {
  "chrome-appledark": "media/chrome-appledark.png",
  "chrome-applelight": "media/chrome-applelight.png",
  "chrome-latte": "media/chrome-latte.png",
  "chrome-mocha": "media/chrome-mocha.png",
  "elbow-appledark": "media/elbow-appledark.png",
  "elbow-applelight": "media/elbow-applelight.png",
  "elbow-latte": "media/elbow-latte.png",
  "elbow-mocha": "media/elbow-mocha.png",
  "status-appledark": "media/status-appledark.png",
  "status-applelight": "media/status-applelight.png",
  "status-latte": "media/status-latte.png",
  "status-mocha": "media/status-mocha.png",
  "zen-appledark": "media/zen-appledark.png",
  "zen-applelight": "media/zen-applelight.png",
  "zen-latte": "media/zen-latte.png",
  "zen-mocha": "media/zen-mocha.png",
};

const shot = id => arena => MEDIA[`${id}-${arena.theme.id}`];

Thunderdome.start({
  id: "cmux-sidebar-group-look",
  title: "Sidebar Groups Thunderdome",
  arena: { dimensions: [{ id: "theme", label: "Theme", options: THEMES }] },
  split: {
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: arena => (arena.theme.dark ? "dark" : "light"),
  },
  tag: arena => arena.theme.name.toLowerCase(),
  questions: [
    {
      id: "look", short: "Group look", title: "Which sidebar would you rather live in?",
      lede: "Same workspaces. Three ways to draw a project group, and one status grouping (opt-in).",
      contenderLabel: "Look",
      media: { aspect: "424 / 800" },
      contenders: [
        { id: "chrome", name: "Chrome-style (shipped)", note: "full-width color bar header, color rail along members", media: shot("chrome") },
        { id: "zen", name: "Zen/Dia band", note: "no bar: color square + name, soft tinted band behind the group, chevron on hover", media: shot("zen") },
        { id: "elbow", name: "Elbow tree", note: "shipped header; spine plus one └ stub per member", media: shot("elbow") },
        { id: "status", name: "Status groups", note: "Needs you / Running / Done, Chrome-style look (staged with real groups)", media: shot("status") },
      ],
    },
  ],
});
