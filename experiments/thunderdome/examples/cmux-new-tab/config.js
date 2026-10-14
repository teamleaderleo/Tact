// cmux NEXT New Tab page (agent-pane.new-tab, calm-default: the Default style with five chats).
// Every image is the real page from the webviews gallery at feat-cmux-next ee8d80672c35, with one
// CSS override injected, shot in headless Chrome at 2x (stored at 1.5x as JPEG). Each contender
// changes one lever. Arena: four themes. Split: light vs dark. RESULTS.md has the run.

const THEMES = [
  { id: "apple-light", name: "Apple System Colors Light", dark: false },
  { id: "latte", name: "Catppuccin Latte", dark: false },
  { id: "apple-dark", name: "Apple System Colors", dark: true },
  { id: "mocha", name: "Catppuccin Mocha", dark: true },
];

const MEDIA = {
  "t-current-apple-dark": "media/t-current-apple-dark.jpg",
  "t-current-apple-light": "media/t-current-apple-light.jpg",
  "t-current-latte": "media/t-current-latte.jpg",
  "t-current-mocha": "media/t-current-mocha.jpg",
  "t-lifted-apple-dark": "media/t-lifted-apple-dark.jpg",
  "t-lifted-apple-light": "media/t-lifted-apple-light.jpg",
  "t-lifted-latte": "media/t-lifted-latte.jpg",
  "t-lifted-mocha": "media/t-lifted-mocha.jpg",
  "t-mark-lead-apple-dark": "media/t-mark-lead-apple-dark.jpg",
  "t-mark-lead-apple-light": "media/t-mark-lead-apple-light.jpg",
  "t-mark-lead-latte": "media/t-mark-lead-latte.jpg",
  "t-mark-lead-mocha": "media/t-mark-lead-mocha.jpg",
  "t-no-newchat-apple-dark": "media/t-no-newchat-apple-dark.jpg",
  "t-no-newchat-apple-light": "media/t-no-newchat-apple-light.jpg",
  "t-no-newchat-latte": "media/t-no-newchat-latte.jpg",
  "t-no-newchat-mocha": "media/t-no-newchat-mocha.jpg",
  "t-switch-fixed-apple-dark": "media/t-switch-fixed-apple-dark.jpg",
  "t-switch-fixed-apple-light": "media/t-switch-fixed-apple-light.jpg",
  "t-switch-fixed-latte": "media/t-switch-fixed-latte.jpg",
  "t-switch-fixed-mocha": "media/t-switch-fixed-mocha.jpg",
};

const shot = id => arena => MEDIA[`${id}-${arena.theme.id}`];

Thunderdome.start({
  id: "cmux-new-tab",
  title: "New Tab Thunderdome",
  lede: "Cmd-T's page. Which one would you rather open fifty times a day? Each candidate changes one thing from the shipped page.",
  contenderLabel: "Page",
  media: { aspect: "1100 / 720", frame: true },
  arena: { dimensions: [{ id: "theme", label: "Theme", options: THEMES }] },
  split: {
    values: [{ id: "light", label: "Light themes" }, { id: "dark", label: "Dark themes" }],
    of: arena => (arena.theme.dark ? "dark" : "light"),
  },
  tag: arena => arena.theme.name.toLowerCase(),
  contenders: [
    { id: "t-current", name: "As shipped", note: "box fill text 13% over the page (grey slab in light), 0 12 32 -18 shadow", media: shot("t-current") },
    { id: "t-lifted", name: "Lifted box", note: "box lighter than the page in light, tonal step in dark; .5px rim 13%; 1/2 + 3/12 shadows at 6%", media: shot("t-lifted") },
    { id: "t-mark-lead", name: "Mark leads row", note: "harness mark beside the title, age stays a right column", media: shot("t-mark-lead") },
    { id: "t-no-newchat", name: "No New chat", note: "drops New chat from the create row; typing already starts one", media: shot("t-no-newchat") },
    { id: "t-switch-fixed", name: "Switch without radios", note: "style switch's native radio circles hidden (ui.css .ui-sr-only is not loaded in the pane)", media: shot("t-switch-fixed") },
  ],
});
