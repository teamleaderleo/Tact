// cmux pane focus flash: how long the ring lasts, and what color it is.
//
// cmux flashes a ring around a pane when a jump, a notification or a restored
// panel lands there. main blinks it twice over 0.9 s; manaflow-ai/cmux#14894
// makes it one pulse that is gone by 0.4 s. This has to be video: every still
// of a ring looks the same, the question is how long it keeps your eye.
//
// Clips come from focus-flash-clip.swift, a cmux ui-lab harness (see
// README.md). Each is a 3 s loop: focus moves to the right pane at 0.5 s and
// back to the left at 2.0 s. The unfocused pane is dimmed and its tab accent
// goes gray in every contender, as it does in the app.

const clips = {
  "old-double-blink": { light: "clips/old-double-blink-light.webm", dark: "clips/old-double-blink-dark.webm" },
  "new-pulse": { light: "clips/new-pulse-light.webm", dark: "clips/new-pulse-dark.webm" },
  "slow-pulse": { light: "clips/slow-pulse-light.webm", dark: "clips/slow-pulse-dark.webm" },
  "no-flash": { light: "clips/no-flash-light.webm", dark: "clips/no-flash-dark.webm" },
};

const shot = id => arena => clips[id][arena.theme.id];

// The second question: the slow pulse in seven ring colors, on Catppuccin Mocha
// (dark) and Latte (light). The focused tab indicator takes the ring color too.
const colors = [
  { id: "blue", name: "cmux blue", note: "Today's default: 0,145,255 dark, 0,136,255 light" },
  { id: "neutral", name: "Neutral", note: "Terminal foreground: white 85% dark, black 80% light" },
  { id: "peach", name: "Peach", note: "Catppuccin #FAB387 Mocha, #FE640B Latte" },
  { id: "mauve", name: "Mauve", note: "Catppuccin #CBA6F7 Mocha, #8839EF Latte" },
  { id: "lavender", name: "Lavender", note: "Catppuccin #B4BEFE Mocha, #7287FD Latte" },
  { id: "green", name: "Green", note: "Catppuccin #A6E3A1 Mocha, #40A02B Latte" },
  { id: "teal", name: "Teal", note: "Catppuccin #94E2D5 Mocha, #179299 Latte" },
];
const colorClips = {
  blue: { light: "clips/color-blue-light.webm", dark: "clips/color-blue-dark.webm" },
  neutral: { light: "clips/color-neutral-light.webm", dark: "clips/color-neutral-dark.webm" },
  peach: { light: "clips/color-peach-light.webm", dark: "clips/color-peach-dark.webm" },
  mauve: { light: "clips/color-mauve-light.webm", dark: "clips/color-mauve-dark.webm" },
  lavender: { light: "clips/color-lavender-light.webm", dark: "clips/color-lavender-dark.webm" },
  green: { light: "clips/color-green-light.webm", dark: "clips/color-green-dark.webm" },
  teal: { light: "clips/color-teal-light.webm", dark: "clips/color-teal-dark.webm" },
};
const colorShot = id => arena => colorClips[id][arena.theme.id];

Thunderdome.start({
  id: "cmux-focus-pulse",
  title: "Pane Focus Flash Thunderdome",
  media: { aspect: "600 / 206" },

  // "timing" stays first: votes cast before there were questions carry no tag and
  // count toward the first one.
  questions: [
    {
      id: "timing",
      short: "Timing",
      title: "Which flash?",
      contenderLabel: "Flash",
      lede: "Focus jumps between two terminal panes, as it does after a notification jump or Cmd-Shift-H. Pick the flash you would rather see fifty times a day: enough to find where you landed, not so much that it keeps pulling your eye. From <a href=\"https://github.com/manaflow-ai/cmux/pull/14894\">cmux#14894</a>.",
      contenders: [
        { id: "old-double-blink", name: "Double blink", note: "main today: 0, 1, 0, 1, 0 over 0.9 s", media: shot("old-double-blink") },
        { id: "new-pulse", name: "Short pulse", note: "#14894: peak at 0.12 s, gone by 0.4 s", media: shot("new-pulse") },
        { id: "slow-pulse", name: "Slow pulse", note: "Same shape over 0.6 s", media: shot("slow-pulse") },
        { id: "no-flash", name: "No flash", note: "Dim and tab accent only", media: shot("no-flash") },
      ],
    },
    {
      id: "color",
      short: "Color",
      title: "Which flash color?",
      contenderLabel: "Color",
      lede: "The same 0.6 s pulse in seven colors, on Catppuccin Mocha (dark) and Latte (light) terminal colors. The focused tab's indicator uses the ring color too. Pick the one that finds your pane without looking out of place in the theme.",
      contenders: colors.map(c => ({ ...c, media: colorShot(c.id) })),
    },
  ],

  arena: {
    dimensions: [
      { id: "theme", label: "Theme", options: [{ id: "light", name: "Light" }, { id: "dark", name: "Dark" }] },
    ],
  },

  split: {
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: a => a.theme && a.theme.id,
  },
});
