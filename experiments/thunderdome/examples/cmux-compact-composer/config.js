// cmux NEXT compact composer controls: access glyph, effort, model, Stop, and the collapse order.
// Every image is the real composer (webviews agent-pane.composer, feat-cmux-next a5341bc5d77) with
// one CSS override, shot in headless Chrome at 2x inside a width-constrained iframe. Arena: Latte
// and Mocha. A four-model blind panel judged the same stills first; RESULTS.md has both.

const THEMES = [
  { id: "latte", name: "Catppuccin Latte", dark: false },
  { id: "mocha", name: "Catppuccin Mocha", dark: true },
];

const MEDIA = {
  "a-current-latte": "media/a-current-latte.png",
  "a-current-mocha": "media/a-current-mocha.png",
  "a-handbolt-latte": "media/a-handbolt-latte.png",
  "a-handbolt-mocha": "media/a-handbolt-mocha.png",
  "a-lockopen-latte": "media/a-lockopen-latte.png",
  "a-lockopen-mocha": "media/a-lockopen-mocha.png",
  "a-shield-latte": "media/a-shield-latte.png",
  "a-shield-mocha": "media/a-shield-mocha.png",
  "a-shieldcheck-latte": "media/a-shieldcheck-latte.png",
  "a-shieldcheck-mocha": "media/a-shieldcheck-mocha.png",
  "e-abbr-latte": "media/e-abbr-latte.png",
  "e-abbr-mocha": "media/e-abbr-mocha.png",
  "e-current-latte": "media/e-current-latte.png",
  "e-current-mocha": "media/e-current-mocha.png",
  "e-merged-latte": "media/e-merged-latte.png",
  "e-merged-mocha": "media/e-merged-mocha.png",
  "e-meter-latte": "media/e-meter-latte.png",
  "e-meter-mocha": "media/e-meter-mocha.png",
  "l-current-latte": "media/l-current-latte.png",
  "l-current-mocha": "media/l-current-mocha.png",
  "l-proposal-latte": "media/l-proposal-latte.png",
  "l-proposal-mocha": "media/l-proposal-mocha.png",
  "m-current-latte": "media/m-current-latte.png",
  "m-current-mocha": "media/m-current-mocha.png",
  "m-family-latte": "media/m-family-latte.png",
  "m-family-mocha": "media/m-family-mocha.png",
  "m-mark-latte": "media/m-mark-latte.png",
  "m-mark-mocha": "media/m-mark-mocha.png",
  "m-nochev-latte": "media/m-nochev-latte.png",
  "m-nochev-mocha": "media/m-nochev-mocha.png",
  "t-current-latte": "media/t-current-latte.png",
  "t-current-mocha": "media/t-current-mocha.png",
  "t-ring-latte": "media/t-ring-latte.png",
  "t-ring-mocha": "media/t-ring-mocha.png",
  "t-solid-latte": "media/t-solid-latte.png",
  "t-solid-mocha": "media/t-solid-mocha.png",
};

const shot = id => arena => MEDIA[`${id}-${arena.theme.id}`];

Thunderdome.start({
  id: "cmux-compact-composer",
  title: "Compact Composer Thunderdome",
  arena: { dimensions: [{ id: "theme", label: "Theme", options: THEMES }] },
  split: {
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: arena => (arena.theme.dark ? "dark" : "light"),
  },
  tag: arena => arena.theme.name.toLowerCase(),
  questions: [
    {
      id: "access", short: "Access", title: "Which glyph says what each permission mode means?",
      lede: "Full access at 760 and 380, then the menu with Supervised selected. Full access is the dangerous mode.",
      contenderLabel: "Glyph",
      media: { aspect: "1520 / 1224" },
      contenders: [
        { id: "a-current", name: "As shipped", note: "closed padlock for every mode; menu shield-! on every row", media: shot("a-current") },
        { id: "a-shield", name: "Shield / shield-!", note: "plain shield guarded, shield-! Full access", media: shot("a-shield") },
        { id: "a-shieldcheck", name: "Shield-check / shield-!", note: "shield-check Supervised, shield-! Full access (Codex)", media: shot("a-shieldcheck") },
        { id: "a-lockopen", name: "Closed / open lock", note: "closed lock guarded, open shackle Full access (T3 Code)", media: shot("a-lockopen") },
        { id: "a-handbolt", name: "Hand / bolt", note: "raised hand asks first, bolt runs free", media: shot("a-handbolt") },
      ],
    },
    {
      id: "effort", short: "Effort", title: "380 px: how should effort survive?",
      lede: "Medium Fast effort in a 380 px row.",
      contenderLabel: "Effort",
      media: { aspect: "760 / 300" },
      contenders: [
        { id: "e-current", name: "As shipped", note: "label truncates to M…", media: shot("e-current") },
        { id: "e-meter", name: "Meter", note: "3-step bar glyph, no label", media: shot("e-meter") },
        { id: "e-abbr", name: "Med", note: "fixed short label; the model gives way", media: shot("e-abbr") },
        { id: "e-merged", name: "Merged", note: "dim 'Med' suffix inside the model chip (Codex, Claude)", media: shot("e-merged") },
      ],
    },
    {
      id: "model", short: "Model", title: "300 px: what should the model chip keep?",
      lede: "Opus 5.5 in a 300 px row.",
      contenderLabel: "Model",
      media: { aspect: "600 / 300" },
      contenders: [
        { id: "m-current", name: "As shipped", note: "truncates to O", media: shot("m-current") },
        { id: "m-mark", name: "Mark only", note: "harness mark plus chevron", media: shot("m-mark") },
        { id: "m-family", name: "Family name", note: "'Opus', never an ellipsis", media: shot("m-family") },
        { id: "m-nochev", name: "No chevrons", note: "every chevron goes first", media: shot("m-nochev") },
      ],
    },
    {
      id: "stop", short: "Stop", title: "A turn is running: which Stop?",
      lede: "Nothing else in the row says running. Stop carries it alone.",
      contenderLabel: "Stop",
      media: { aspect: "800 / 300" },
      contenders: [
        { id: "t-current", name: "As shipped", note: "faint disk, square (same disk as empty Send)", media: shot("t-current") },
        { id: "t-solid", name: "Solid", note: "text-color disk, base square (ChatGPT, Zeron)", media: shot("t-solid") },
        { id: "t-ring", name: "Ring", note: "faint disk plus 1.5px ring", media: shot("t-ring") },
      ],
    },
    {
      id: "logic", short: "Collapse", title: "480, 400, 340, 290: which collapse?",
      lede: "The same composer at four widths.",
      contenderLabel: "Logic",
      media: { aspect: "1528 / 150" },
      contenders: [
        { id: "l-current", name: "As shipped", note: "label drops, then truncation to single letters; lock hits mic at 290", media: shot("l-current") },
        { id: "l-proposal", name: "Whole-glyph swaps", note: "symbols at all widths; chevrons ≤520, access label ≤460, effort meter ≤400, model mark ≤330, mic ≤290", media: shot("l-proposal") },
      ],
    },
  ],
});
