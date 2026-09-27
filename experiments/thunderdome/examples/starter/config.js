// Starter config: the smallest useful thunderdome. Copy this folder, rename, edit.
// Contenders here are HTML snippets; see ../cmux-selection for a render function.

Thunderdome.start({
  id: "starter-primary-button",
  title: "Primary Button Thunderdome",
  lede: "Four primary buttons for a confirm dialog. Pick the one that reads as the default action without shouting.",
  contenders: [
    { id: "solid", name: "Solid", note: "Filled accent, white label",
      html: '<div class="stage"><button class="b solid">Save changes</button></div>' },
    { id: "outline", name: "Outline", note: "1px accent border, accent label",
      html: '<div class="stage"><button class="b outline">Save changes</button></div>' },
    { id: "tonal", name: "Tonal", note: "Accent at 16%, accent label",
      html: '<div class="stage"><button class="b tonal">Save changes</button></div>' },
    { id: "text", name: "Text only", note: "No container, semibold accent label",
      html: '<div class="stage"><button class="b text">Save changes</button></div>' },
  ],
  arena: {
    dimensions: [
      { id: "surface", label: "Surface", options: [
        { id: "paper", name: "Paper", dark: false },
        { id: "slate", name: "Slate", dark: true },
      ] },
      { id: "compact", label: "Compact", short: "compact", shuffle: true },
    ],
  },
  split: {
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: a => a.surface && (a.surface.dark ? "dark" : "light"),
  },
  // Optional: wrap each snippet so the arena can style it. Without render, c.html is used as is.
  render: (c, a, { h }) => h("div", { class: `arena ${a.surface.id}${a.compact ? " compact" : ""}`, html: c.html }),
});
