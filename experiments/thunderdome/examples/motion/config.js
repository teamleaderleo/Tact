// Busy indicator for an agent row: four ways for a list row to say "this is working".
//
// This one has to be video. A still of a spinner is a ring of dots, a still of a
// shimmer is a gradient, and neither tells you what living next to it for an hour
// feels like. The whole question is the motion.
//
// Clips come from make-media.mjs (plain JS drawing piped to ffmpeg). Re-run it after
// editing a treatment. Paths stay literal so build.mjs can inline them as data URIs.

const clips = {
  spinner: { light: "clips/spinner-light.webm", dark: "clips/spinner-dark.webm" },
  pulse:   { light: "clips/pulse-light.webm",   dark: "clips/pulse-dark.webm" },
  shimmer: { light: "clips/shimmer-light.webm", dark: "clips/shimmer-dark.webm" },
  bar:     { light: "clips/bar-light.webm",     dark: "clips/bar-dark.webm" },
};

// One contender, both recordings: the arena picks which one plays.
const shot = id => arena => clips[id][arena.theme.id];

Thunderdome.start({
  id: "agent-row-busy",
  title: "Busy Indicator Thunderdome",
  contenderLabel: "Treatment",
  lede: "A sidebar row is running an agent. Four ways to show it, each a three second loop. Pick the one you would rather have in your peripheral vision all afternoon, not the one that looks best for three seconds.",

  media: { aspect: "480 / 150" },   // every clip is this shape, so cards never resize under the cursor

  contenders: [
    { id: "spinner", name: "Spinner", note: "Ring of dots in the glyph slot", media: shot("spinner") },
    { id: "pulse", name: "Pulse", note: "The status dot breathing", media: shot("pulse") },
    { id: "shimmer", name: "Shimmer", note: "A light band crossing the row", media: shot("shimmer") },
    { id: "bar", name: "Bar", note: "A hairline along the bottom edge", media: shot("bar") },
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
