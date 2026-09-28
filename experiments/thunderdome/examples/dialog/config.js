// Three decisions about the same dialog, in one dome. The arena, the render function and
// the media defaults are written once; each question brings its own contenders and its
// own lede. Every question has its own link: #wording/results is the table for that one.

const shell = (body, footer) => `
  <div class="dlg">
    <div class="dlg-body">${body}</div>
    <div class="dlg-foot">${footer}</div>
  </div>`;
const BODY = `<h3>Delete “Q3 pricing”?</h3><p>This board and its 48 cards will be removed for everyone on the team.</p>`;
const FOOT = `<button class="b ghost">Cancel</button><button class="b danger">Delete board</button>`;

Thunderdome.start({
  id: "dialog-thunderdome",
  title: "Destructive Dialog Thunderdome",
  collection: "dialog-votes",
  questions: [
    {
      id: "button",
      short: "Button",
      title: "Which delete button?",
      lede: "The dialog is the same in all four. Pick the button you would rather see under a sentence about deleting 48 cards.",
      contenderLabel: "Button",
      contenders: [
        { id: "solid", name: "Solid red", note: "Filled danger, white label",
          html: shell(BODY, `<button class="b ghost">Cancel</button><button class="b danger">Delete board</button>`) },
        { id: "outline", name: "Outlined red", note: "1px danger border, danger label",
          html: shell(BODY, `<button class="b ghost">Cancel</button><button class="b danger-outline">Delete board</button>`) },
        { id: "quiet", name: "Quiet red", note: "No container, danger label",
          html: shell(BODY, `<button class="b ghost">Cancel</button><button class="b danger-text">Delete board</button>`) },
        { id: "neutral", name: "Neutral", note: "Ordinary primary, red nowhere",
          html: shell(BODY, `<button class="b ghost">Cancel</button><button class="b solid">Delete board</button>`) },
      ],
    },
    {
      id: "footer",
      short: "Footer",
      title: "Where do the buttons go?",
      lede: "Same button, four footers. Cancel is the safe one, so the question is how hard it is to hit the other by accident.",
      contenderLabel: "Footer",
      contenders: [
        { id: "right", name: "Right, danger last", note: "Cancel then Delete, right aligned",
          html: shell(BODY, FOOT) },
        { id: "right-swap", name: "Right, danger first", note: "Delete then Cancel, right aligned",
          html: shell(BODY, `<button class="b danger">Delete board</button><button class="b ghost">Cancel</button>`) },
        { id: "split", name: "Split", note: "Cancel far left, Delete far right",
          html: shell(BODY, `<button class="b ghost split-left">Cancel</button><button class="b danger">Delete board</button>`) },
        { id: "stacked", name: "Stacked", note: "Full width, Delete on top",
          html: shell(BODY, `<div class="stack"><button class="b danger">Delete board</button><button class="b ghost">Cancel</button></div>`) },
      ],
    },
    {
      id: "wording",
      short: "Wording",
      title: "How should it say it?",
      lede: "Same dialog, four ways of saying what is about to happen. Read each one as if you were about to click.",
      contenderLabel: "Wording",
      contenders: [
        { id: "plain", name: "Plain", note: "Names the thing and the count",
          html: shell(`<h3>Delete “Q3 pricing”?</h3><p>This board and its 48 cards will be removed for everyone on the team.</p>`, FOOT) },
        { id: "short", name: "Short", note: "One line, no count",
          html: shell(`<h3>Delete this board?</h3><p>Everyone on the team will lose access.</p>`, FOOT) },
        { id: "consequence", name: "Consequence first", note: "Leads with what is lost",
          html: shell(`<h3>48 cards will be deleted</h3><p>“Q3 pricing” and everything in it, for the whole team. This cannot be undone.</p>`, FOOT) },
        { id: "reassuring", name: "Reassuring", note: "Names the way back",
          html: shell(`<h3>Delete “Q3 pricing”?</h3><p>The board moves to Trash for 30 days. You can restore it from there.</p>`, FOOT) },
      ],
    },
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
  render: (c, a, { h }) => h("div", { class: `arena ${a.surface.id}${a.compact ? " compact" : ""}`, html: c.html }),
});
