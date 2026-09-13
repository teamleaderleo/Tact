// Live cmux trial for Tact #36 and #37. Native horizontal tabs remain unchanged.
// Upstream contract: e9ec596d12d854d6569b53b38bb21b62f8126d56.
const [query, setQuery] = signal("");
const [grouped, setGrouped] = signal(false);
const [compact, setCompact] = signal(false);
const [mode, setMode] = signal("home");
const [allStates, setAllStates] = signal(false);
const [page, setPage] = signal(0);
const PAGE_SIZE = 40;

const STATUS = {
  needs_input: { label: "Needs input", rank: 0 },
  unknown: { label: "Unknown state", rank: 1 },
  working: { label: "Working", rank: 2 },
  idle: { label: "Idle", rank: 3 },
  ended: { label: "Ended · outcome unknown", rank: 4 },
  untracked: { label: "No agent signal", rank: 5 }
};

function attention(agents) {
  if (!agents.length) return { status: "untracked", agentCount: 0 };
  const states = agents.map(a => Object.prototype.hasOwnProperty.call(STATUS, a.status)
    && a.status !== "untracked" ? a.status : "unknown");
  const status = states.reduce((best, next) => STATUS[next].rank < STATUS[best].rank ? next : best);
  return { status, agentCount: agents.length };
}

function unlinkedAgents(workspaces) {
  let count = 0;
  for (const w of workspaces || []) {
    const ids = new Set((w.tabs || []).map(t => t.id).filter(Boolean));
    count += (w.agents || []).filter(a => !a.panelId || !ids.has(a.panelId)).length;
  }
  return count;
}

function surfaceRows(workspaces, search) {
  const needle = String(search || "").trim().toLowerCase();
  const rows = [];
  for (const w of workspaces || []) {
    for (const t of w.tabs || []) {
      // At the pinned upstream head, surface.focus indexes ws.panels by id.
      // t.surfaceId is the Bonsplit tab UUID and fails that API lookup, despite
      // the current sidebar docs. Verified with the running app and dispatcher.
      const title = t.title || "Untitled surface";
      const context = w.title || "Untitled workspace";
      if (needle && ![title, context, t.directory, t.branch]
        .some(value => String(value || "").toLowerCase().includes(needle))) continue;
      // panelId is the explicit hosting tabs[].id relation. Do not infer a
      // target from titles, workspace membership or the Bonsplit surfaceId.
      const agents = (w.agents || []).filter(a => t.id && a.panelId === t.id);
      const state = attention(agents);
      rows.push({ ...state, key: w.id + ":" + t.id, workspaceId: w.id,
        surfaceId: t.id, title, context,
        focused: Boolean(w.selected && t.focused) });
    }
  }
  return rows;
}

function focusSurface(row) {
  if (!row.workspaceId || !row.surfaceId) return;
  cmux("surface.focus", { workspace_id: row.workspaceId, surface_id: row.surfaceId });
}

function projectRows(rows, view, includeRoutine) {
  if (view !== "triage") return rows;
  return rows.filter(row => includeRoutine || ["needs_input", "unknown"].includes(row.status))
    .slice().sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank);
}

function selectMode(view) { setMode(view); setPage(0); }
const rows = computed(() => surfaceRows(data.workspaces() || [], query()));
const matches = computed(() => projectRows(rows(), mode(), allStates()));
const unlinked = computed(() => unlinkedAgents(data.workspaces() || []));
const lastPage = computed(() => Math.max(0, Math.ceil(matches().length / PAGE_SIZE) - 1));
const currentPage = computed(() => Math.min(page(), lastPage()));
const visible = computed(() => matches().slice(currentPage() * PAGE_SIZE, (currentPage() + 1) * PAGE_SIZE)
  .map((row, i, rows) => ({ ...row,
    heading: mode() === "triage"
      ? (i === 0 || rows[i - 1].status !== row.status ? STATUS[row.status].label : "")
      : grouped() && (i === 0 || rows[i - 1].workspaceId !== row.workspaceId) ? row.context : "" })));

function choice(label, active, action) {
  return Button(label, action, [Text(label).font(11).weight("semibold")
    .paddingHorizontal(8).paddingVertical(5).cornerRadius(6)
    .background(() => active() ? "#80808033" : null)
    .hoverBackground("#80808022").lineLimit(1)])
    .frame({ width: label.length * 7 + 20 });
}

sidebar(() => VStack({ spacing: 6 }, [
  HStack({ spacing: 6 }, [Text("Surfaces").font(14).weight("semibold"), Spacer(),
    Text(() => String(matches().length)).font(11).secondary()]),
  HStack({ spacing: 4 }, [
    choice("Home", () => mode() === "home", () => selectMode("home")),
    choice("Triage", () => mode() === "triage", () => selectMode("triage"))]),
  Text(() => mode() === "home" ? "Stable places · attention stays visible" : allStates() ? "All states · outcomes unverified" : "Input requests and unknown states")
    .font(10).secondary().lineLimit(2),
  HStack({ spacing: 4 }, [
    ForEach({ items: () => mode() === "home" ? ["Flat"] : [], key: x => x }, () =>
      choice("Flat", () => !grouped(), () => setGrouped(false))),
    ForEach({ items: () => mode() === "home" ? ["Grouped"] : [], key: x => x }, () =>
      choice("Grouped", grouped, () => setGrouped(true))),
    ForEach({ items: () => mode() === "triage" ? ["All states"] : [], key: x => x }, () =>
      choice("All states", allStates, () => { setAllStates(!allStates()); setPage(0); })),
    Spacer(), choice("Compact", compact, () => setCompact(!compact()))]),
  TextField("", { placeholder: "Find a surface or workspace", autofocus: false,
    onEdit: text => { setQuery(text || ""); setPage(0); } }),
  Text(() => unlinked() ? `${unlinked()} unlinked agent${unlinked() === 1 ? "" : "s"} · no exact jump` : "")
    .font(10).secondary().lineLimit(2).frame({ height: () => unlinked() ? 28 : 0 }),
  Divider(),
  Text(() => matches().length ? "" : mode() === "triage" && !allStates() ? "No matching linked input requests" : "No matching surfaces").font(12).secondary()
    .frame({ height: () => matches().length ? 0 : 18 }),
  ForEach({ items: visible, key: row => row.key }, row =>
    VStack({ spacing: 2 }, [
      Text(() => row().heading).font(11).weight("semibold").secondary()
        .frame({ height: () => row().heading ? 16 : 0 }),
      Button(() => row().title, () => focusSurface(row()), [HStack({ spacing: 6 }, [
        Circle({ size: 6 }).fill(() => row().focused ? "accent" : "clear"),
        VStack({ spacing: 2 }, [
          Text(() => row().title).font(12).lineLimit(1).truncation("tail"),
          Text(() => row().surfaceId ? row().context : row().context + " · unavailable")
            .font(10).secondary().lineLimit(1).truncation("tail"),
          Text(() => row().agentCount ? `${STATUS[row().status].label} · ${row().agentCount} agent${row().agentCount === 1 ? "" : "s"}` : "")
            .font(10).color(() => row().status === "needs_input" ? "#E6A040" : "secondary")
            .lineLimit(1).frame({ height: () => row().agentCount ? 14 : 0 })]),
        Spacer()])
        .paddingHorizontal(8).paddingVertical(() => compact() ? 3 : 7)
        .cornerRadius(6).background(() => row().focused ? "#80808033" : null)
        .hoverBackground("#80808022")])
    ])),
  ForEach({ items: () => lastPage() > 0 ? ["pages"] : [], key: x => x }, () => HStack({ spacing: 6 }, [
    choice("Previous", () => false, () => setPage(Math.max(0, currentPage() - 1))),
    Spacer(), Text(() => `${currentPage() + 1} / ${lastPage() + 1}`).font(10).secondary(), Spacer(),
    choice("Next", () => false, () => setPage(Math.min(lastPage(), currentPage() + 1)))]))
]).padding(10));
