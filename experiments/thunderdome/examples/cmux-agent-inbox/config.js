// cmux agent inbox: six places for one inbox across every agent, with a quick
// reply that goes through `cmux agent message`, never typed keystrokes.
// Arena: light or dark window x which item has focus. Split: light vs dark.

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// One inbox, newest first. Every contender shows the same four items.
const ITEMS = [
  { id: "question", ws: "api-server", agent: "Claude", host: "local", kind: "question", age: "2m", unread: true,
    you: "add the email_verified column and backfill it",
    title: "Which migration strategy?",
    body: "The users table has 41M rows. How should I run the backfill?",
    options: ["Online backfill in batches", "Maintenance window tonight", "Skip it for now"] },
  { id: "message", ws: "release prep", agent: "Claude", host: "Cloud", kind: "message", age: "4m", unread: true,
    you: "cut the 1.4 release branch",
    last: "Branch release/1.4 is ready. Waiting on the changelog.",
    from: "coordinator", state: "queued",
    body: "Hold the v1.4 tag until #15302 merges." },
  { id: "finished", ws: "docs site", agent: "Codex", host: "big-red", kind: "finished", age: "7m", unread: true,
    you: "document agent.message.* in the socket reference",
    body: "Updated 14 pages for the new socket API. The docs build passes and every link checks clean." },
  { id: "error", ws: "scratch", agent: "Claude", host: "local", kind: "error", age: "21m", unread: false,
    you: "summarize yesterday's CI failures",
    body: "API error 529 (overloaded). The turn stopped after 3 retries." },
];

const KIND = {
  question: { glyph: "?", label: "Question", line: it => it.title },
  message: { glyph: "&#8594;", label: "Message", line: it => `From ${it.from}: ${it.body}` },
  finished: { glyph: "&#10003;", label: "Finished", line: it => it.body },
  error: { glyph: "!", label: "Error", line: it => it.body },
};

const glyph = it => `<span class="k k-${it.kind}">${KIND[it.kind].glyph}</span>`;
const who = it => `${esc(it.ws)} <span class="dim">&middot; ${esc(it.agent)} &middot; ${esc(it.host)}</span>`;

// The focused exchange: the human's last prompt, what the agent said, and the reply box.
function detail(it, { compact = false, history = false } = {}) {
  let out = `<div class="dt">`;
  if (history) {
    out += `<div class="turn"><span class="lbl">You</span>${esc(it.you)}</div>`;
  } else {
    out += `<div class="you">You: ${esc(it.you)}</div>`;
  }
  if (it.kind === "question") {
    out += `<div class="q"><b>${esc(it.title)}</b> ${esc(it.body)}</div><div class="opts">`;
    it.options.forEach((o, i) => { out += `<span class="opt${i === 0 ? " hi" : ""}"><span class="n">${i + 1}</span>${esc(o)}</span>`; });
    out += `</div>`;
  } else if (it.kind === "message") {
    if (history || !compact) out += `<div class="${history ? "turn" : "said"}">${history ? `<span class="lbl">${esc(it.agent)}</span>` : ""}${esc(it.last)}</div>`;
    out += `<div class="msg"><div class="mh">Message from <b>${esc(it.from)}</b><span class="st">queued</span></div>${esc(it.body)}`;
    if (!compact) out += `<div class="mf">Delivers when Claude stops or you send a prompt</div>`;
    out += `</div>`;
  } else {
    out += `<div class="${history ? "turn" : "said"}${it.kind === "error" ? " err" : ""}">${history ? `<span class="lbl">${esc(it.agent)}</span>` : ""}${esc(it.body)}</div>`;
  }
  const verb = it.kind === "question" ? "Answer, or pick 1-3" : `Reply to ${it.agent}`;
  out += `<div class="rb"><span class="ph">${verb}&hellip;</span><span class="kb">&#8617;</span></div>`;
  if (!compact) out += `<div class="safe">Sent as a cmux agent message, never typed into the terminal</div>`;
  return out + `</div>`;
}

function row(it, focus, { expand = true, compact = false, twoLine = true } = {}) {
  const on = it.id === focus;
  let out = `<div class="it${on ? " on" : ""}${it.unread ? " un" : ""}">`;
  out += `<div class="ih">${glyph(it)}<span class="iw">${who(it)}</span><span class="age">${it.age}</span>${it.unread ? `<span class="ud"></span>` : ""}</div>`;
  if (twoLine && !(on && expand)) out += `<div class="il">${esc(KIND[it.kind].line(it))}</div>`;
  if (on && expand) out += detail(it, { compact });
  return out + `</div>`;
}

// A cmux window: titlebar, workspace sidebar, a terminal, and whatever the contender adds.
function sidebarRows(focus, { peek = false } = {}) {
  const wss = [
    { t: "api-server", s: "feature/auth", it: "question" },
    { t: "release prep", s: "release/1.4", it: "message" },
    { t: "docs site", s: "main  big-red", it: "finished" },
    { t: "scratch", s: "~", it: "error" },
  ];
  let out = `<div class="sb">`;
  for (const w of wss) {
    const it = ITEMS.find(i => i.id === w.it);
    const sel = w.t === "api-server";
    out += `<div class="ws${sel ? " sel" : ""}${peek && it.id === focus ? " peeked" : ""}"><div class="wt">${peek ? glyph(it) : ""}<span>${esc(w.t)}</span>${!peek && it.unread ? `<span class="bdg">1</span>` : ""}</div><div class="wsub">${esc(w.s)}</div></div>`;
  }
  out += `<div class="sbf">${peek ? `<span class="ibtn">Inbox <span class="bdg">3</span></span>` : ""}</div>`;
  return out + `</div>`;
}

const TERM = `<div class="term"><div>&#10095; cargo test -p api</div><div class="dim">running 212 tests</div><div class="dim">test result: ok. 212 passed</div><div>&#10095; <span class="cur"></span></div></div>`;

function win(a, inner, { titleExtra = "", peek = false, focus } = {}) {
  return `<div class="win ${a.theme.id}"><div class="tb"><span class="tl"></span><span class="tl"></span><span class="tl"></span><span class="ttl">api-server</span>${titleExtra}</div><div class="bd">${sidebarRows(focus, { peek })}${inner}</div></div>`;
}

const CHIPS = (active = "All") => `<div class="chips">${["All", "Questions", "Messages", "Done", "Errors"].map(c => `<span class="chip${c === active ? " on" : ""}">${c}</span>`).join("")}</div>`;
const SEARCH = ph => `<div class="search">&#9906; <span class="ph">${ph}</span></div>`;

const CONTENDERS = [
  { id: "sidebar-mode", name: "Inbox sidebar mode", note: "A new right-sidebar tab next to Feed, Ctrl-5",
    draw: (a, f) => win(a, `${TERM}<div class="rs"><div class="tabs"><span>Files</span><span>Find</span><span>Feed</span><span class="on">Inbox <span class="bdg">3</span></span></div>${SEARCH("Search agents and history")}${CHIPS()}<div class="list">${ITEMS.map(it => row(it, f, { compact: true })).join("")}</div></div>`, { focus: f }) },

  { id: "palette", name: "Palette overlay", note: "Cmd-Shift-I over any workspace, list plus exchange",
    draw: (a, f) => {
      const it = ITEMS.find(i => i.id === f);
      return win(a, `${TERM}<div class="scrim"></div><div class="pal">${SEARCH("Search agents and history")}<div class="pb"><div class="pl">${ITEMS.map(x => row(x, f, { expand: false })).join("")}</div><div class="pd"><div class="pdh">${glyph(it)} ${who(it)}</div>${detail(it)}</div></div></div>`, { focus: f });
    } },

  { id: "popover", name: "Titlebar popover", note: "Inbox button in the titlebar, like Cmd-I notifications",
    draw: (a, f) => win(a, `${TERM}<div class="pop"><div class="arrow"></div><div class="poph"><b>Inbox</b><span class="dim">3 unread</span></div><div class="list">${ITEMS.map(it => row(it, f, { compact: true })).join("")}</div></div>`,
      { focus: f, titleExtra: `<span class="tbtn on">&#9993; <span class="bdg">3</span></span>` }) },

  { id: "feed", name: "Feed gains messages", note: "Today's Feed with a Messages filter and unread, every row open",
    draw: (a, f) => win(a, `${TERM}<div class="rs"><div class="tabs"><span>Files</span><span>Find</span><span class="on">Feed</span></div><div class="seg"><span>Actionable</span><span class="on">All</span><span>Messages</span></div><div class="list feedlist">${ITEMS.map(it => `<div class="card${it.id === f ? " on" : ""}"><div class="ih">${glyph(it)}<span class="iw">${who(it)}</span><span class="age">${it.age}</span>${it.unread ? `<span class="ud"></span>` : ""}</div>${detail(it, { compact: true })}</div>`).join("")}</div></div>`, { focus: f }) },

  { id: "row-peek", name: "Sidebar row peek", note: "Click or hover a workspace row; no separate list",
    draw: (a, f) => {
      const it = ITEMS.find(i => i.id === f);
      const top = { question: 30, message: 72, finished: 114, error: 156 }[f];
      return win(a, `${TERM}<div class="peek" style="top:${top}px"><div class="parrow"></div><div class="pdh">${glyph(it)} ${who(it)}<span class="age">${it.age}</span></div>${detail(it, { history: true })}</div>`, { focus: f, peek: true });
    } },

  { id: "pane", name: "Inbox pane tab", note: "Opens as a pane tab with full searchable history",
    draw: (a, f) => {
      const it = ITEMS.find(i => i.id === f);
      return win(a, `<div class="pane"><div class="ptabs"><span>api-server</span><span class="on">Inbox <span class="bdg">3</span></span></div><div class="pb">${`<div class="pl">${SEARCH("Search history")}${CHIPS()}${ITEMS.map(x => row(x, f, { expand: false })).join("")}</div>`}<div class="pd"><div class="pdh">${glyph(it)} ${who(it)}<span class="age">${it.age}</span></div><div class="older">Earlier today: 6 turns</div>${detail(it, { history: true })}</div></div></div>`, { focus: f });
    } },
];

// Draw at a fixed size and scale to the card, so every layout keeps real proportions.
const W = 780, H = 470;
function scaled(html, h) {
  const box = h("div", { class: "scaler" });
  const inner = h("div", { class: "scaled", html });
  box.append(inner);
  const fit = () => { const s = box.clientWidth / W; if (s > 0) inner.style.transform = `scale(${s})`; };
  new ResizeObserver(fit).observe(box);
  requestAnimationFrame(fit);
  return box;
}

Thunderdome.start({
  id: "cmux-agent-inbox",
  title: "Agent Inbox Thunderdome",
  lede: "Six places to put one inbox for every agent (local, big-red, Cloud): questions waiting on you, agent-to-agent messages, finished turns and errors, with a quick reply that goes through <code>cmux agent message</code> instead of typed keystrokes. Each card shows the same four items with one in focus. Pick the one you would rather reach for twenty times a day. Design: <code>manaflow-ai/cmuxterm-hq#876</code>.",
  contenderLabel: "Placement",
  contenders: CONTENDERS,
  arena: {
    dimensions: [
      { id: "theme", label: "Window", options: [
        { id: "light", name: "Light", dark: false },
        { id: "dark", name: "Dark", dark: true },
      ] },
      { id: "focus", label: "In focus", options: [
        { id: "question", name: "Question waiting" },
        { id: "message", name: "Agent message" },
        { id: "finished", name: "Finished turn" },
      ] },
    ],
  },
  split: {
    values: [{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }],
    of: a => a.theme && (a.theme.dark ? "dark" : "light"),
  },
  tag: a => `${a.theme.name.toLowerCase()} · ${a.focus.name.toLowerCase()}`,
  describe: (a, v) => [a.theme ? a.theme.name : v.theme, a.focus ? a.focus.name.toLowerCase() : v.focus].join(", "),
  render: (c, a, { h }) => scaled(c.draw(a, a.focus.id), h),
});
