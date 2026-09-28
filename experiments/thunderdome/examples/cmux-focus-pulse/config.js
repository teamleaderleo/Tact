// cmux pane focus flash: four ways to mark the pane focus just landed on.
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

Thunderdome.start({
  id: "cmux-focus-pulse",
  title: "Pane Focus Flash Thunderdome",
  contenderLabel: "Flash",
  lede: "Focus jumps between two terminal panes, as it does after a notification jump or Cmd-Shift-H. Pick the flash you would rather see fifty times a day: enough to find where you landed, not so much that it keeps pulling your eye. From <a href=\"https://github.com/manaflow-ai/cmux/pull/14894\">cmux#14894</a>.",

  media: { aspect: "600 / 206" },

  contenders: [
    { id: "old-double-blink", name: "Double blink", note: "main today: 0, 1, 0, 1, 0 over 0.9 s", media: shot("old-double-blink") },
    { id: "new-pulse", name: "Short pulse", note: "#14894: peak at 0.12 s, gone by 0.4 s", media: shot("new-pulse") },
    { id: "slow-pulse", name: "Slow pulse", note: "Same shape over 0.6 s", media: shot("slow-pulse") },
    { id: "no-flash", name: "No flash", note: "Dim and tab accent only", media: shot("no-flash") },
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
