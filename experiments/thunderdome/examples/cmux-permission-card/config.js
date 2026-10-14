// cmux NEXT agent-pane permission card (gallery agent-pane.permission-panel, "pending": two
// grouped tool requests), feat-cmux-next ee8d80672c35. Every image is the real component in
// headless Chrome at 2x with one CSS override injected. Arena: four themes. Split: light vs dark.
// RESULTS.md has the run.

const THEMES = [
  { id: "apple-light", name: "Apple System Colors Light", dark: false },
  { id: "latte", name: "Catppuccin Latte", dark: false },
  { id: "apple-dark", name: "Apple System Colors", dark: true },
  { id: "mocha", name: "Catppuccin Mocha", dark: true },
];

const MEDIA = {
  "p-all-apple-dark": "media/p-all-apple-dark.png",
  "p-all-apple-light": "media/p-all-apple-light.png",
  "p-all-latte": "media/p-all-latte.png",
  "p-all-mocha": "media/p-all-mocha.png",
  "p-current-apple-dark": "media/p-current-apple-dark.png",
  "p-current-apple-light": "media/p-current-apple-light.png",
  "p-current-latte": "media/p-current-latte.png",
  "p-current-mocha": "media/p-current-mocha.png",
  "p-no-expand-apple-dark": "media/p-no-expand-apple-dark.png",
  "p-no-expand-apple-light": "media/p-no-expand-apple-light.png",
  "p-no-expand-latte": "media/p-no-expand-latte.png",
  "p-no-expand-mocha": "media/p-no-expand-mocha.png",
  "p-rank-apple-dark": "media/p-rank-apple-dark.png",
  "p-rank-apple-light": "media/p-rank-apple-light.png",
  "p-rank-latte": "media/p-rank-latte.png",
  "p-rank-mocha": "media/p-rank-mocha.png",
  "p-terse-apple-dark": "media/p-terse-apple-dark.png",
  "p-terse-apple-light": "media/p-terse-apple-light.png",
  "p-terse-latte": "media/p-terse-latte.png",
  "p-terse-mocha": "media/p-terse-mocha.png",
};

const shot = id => arena => MEDIA[`${id}-${arena.theme.id}`];

Thunderdome.start({
  id: "cmux-permission-card",
  title: "Permission Card Thunderdome",
  lede: "The agent asks to run two commands. Which card gets you to the right answer fastest, and makes the bigger grant look like the bigger grant?",
  contenderLabel: "Card",
  media: { aspect: "1080 / 485" },
  arena: { dimensions: [{ id: "theme", label: "Theme", options: THEMES }] },
  split: {
    values: [{ id: "light", label: "Light themes" }, { id: "dark", label: "Dark themes" }],
    of: arena => (arena.theme.dark ? "dark" : "light"),
  },
  tag: arena => arena.theme.name.toLowerCase(),
  contenders: [
    { id: "p-current", name: "As shipped", note: "Allow once and Allow for this chat both filled accent; bordered Expand details; coverage meta + scope sentence", media: shot("p-current") },
    { id: "p-rank", name: "Ranked buttons", note: "Allow once filled, Allow for this chat tonal (text 9%), Deny text", media: shot("p-rank") },
    { id: "p-no-expand", name: "No Expand button", note: "the bordered Expand details button removed; row triangles still disclose", media: shot("p-no-expand") },
    { id: "p-terse", name: "Terse", note: "coverage jargon and scope sentence moved to tooltips", media: shot("p-terse") },
    { id: "p-all", name: "All three", note: "ranked + no Expand + terse", media: shot("p-all") },
  ],
});
