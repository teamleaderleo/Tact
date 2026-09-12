// Live cmux trial for Tact #36. Native horizontal tabs remain unchanged.
// Upstream contract: e9ec596d12d854d6569b53b38bb21b62f8126d56.
const [query, setQuery] = signal("");
const [grouped, setGrouped] = signal(false);
const [compact, setCompact] = signal(false);
const [page, setPage] = signal(0);
const PAGE_SIZE = 40;

function surfaceRows(workspaces, search) {
  const needle = String(search || "").trim().toLowerCase();
  const rows = [];
  for (const w of workspaces || []) {
    for (const t of w.tabs || []) {
      // A panel id is not a surface id. Missing identity is visible but inert.
      const title = t.title || "Untitled surface";
      const context = w.title || "Untitled workspace";
      if (needle && ![title, context, t.directory, t.branch]
        .some(value => String(value || "").toLowerCase().includes(needle))) continue;
      rows.push({ key: w.id + ":" + t.id, workspaceId: w.id,
        surfaceId: t.surfaceId, title, context,
        focused: Boolean(w.selected && t.focused) });
    }
  }
  return rows;
}

function focusSurface(row) {
  if (!row.surfaceId) return;
  cmux("surface.focus", { workspace_id: row.workspaceId, surface_id: row.surfaceId });
}

const matches = computed(() => surfaceRows(data.workspaces() || [], query()));
const lastPage = computed(() => Math.max(0, Math.ceil(matches().length / PAGE_SIZE) - 1));
const currentPage = computed(() => Math.min(page(), lastPage()));
const visible = computed(() => matches().slice(currentPage() * PAGE_SIZE, (currentPage() + 1) * PAGE_SIZE)
  .map((row, i, rows) => ({ ...row,
    heading: grouped() && (i === 0 || rows[i - 1].workspaceId !== row.workspaceId) ? row.context : "" })));

function choice(label, active, action) {
  return Button(label, action, [Text(label).font(11).weight("semibold")
    .paddingHorizontal(8).paddingVertical(5).cornerRadius(6)
    .background(() => active() ? "#80808033" : null)
    .hoverBackground("#80808022")]);
}

sidebar(() => VStack({ spacing: 6 }, [
  HStack({ spacing: 6 }, [Text("Surfaces").font(14).weight("semibold"), Spacer(),
    Text(() => String(matches().length)).font(11).secondary()]),
  HStack({ spacing: 4 }, [
    choice("Flat", () => !grouped(), () => setGrouped(false)),
    choice("Grouped", grouped, () => setGrouped(true)),
    Spacer(), choice("Compact", compact, () => setCompact(!compact()))]),
  TextField("", { placeholder: "Find a surface or workspace", autofocus: false,
    onEdit: text => { setQuery(text || ""); setPage(0); } }),
  Divider(),
  Text(() => matches().length ? "" : "No matching surfaces").font(12).secondary(),
  ForEach({ items: visible, key: row => row.key }, row =>
    VStack({ spacing: 2 }, [
      Text(() => row().heading).font(11).weight("semibold").secondary(),
      Button(() => row().title, () => focusSurface(row()), [HStack({ spacing: 6 }, [
        Circle({ size: 6 }).fill(() => row().focused ? "accent" : "clear"),
        VStack({ spacing: 2 }, [
          Text(() => row().title).font(12).lineLimit(1).truncation("tail"),
          Text(() => row().surfaceId ? row().context : row().context + " · unavailable")
            .font(10).secondary().lineLimit(1).truncation("tail")]),
        Spacer()])
        .paddingHorizontal(8).paddingVertical(() => compact() ? 3 : 7)
        .cornerRadius(6).background(() => row().focused ? "#80808033" : null)
        .hoverBackground("#80808022")])
    ])),
  HStack({ spacing: 6 }, [
    choice("Previous", () => false, () => setPage(Math.max(0, currentPage() - 1))),
    Spacer(), Text(() => `${currentPage() + 1} / ${lastPage() + 1}`).font(10).secondary(), Spacer(),
    choice("Next", () => false, () => setPage(Math.min(lastPage(), currentPage() + 1)))])
]).padding(10));
