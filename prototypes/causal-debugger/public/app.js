const root = document.querySelector("#app");
const pageId = sessionStorage.getItem("tact-causal-page") || `page:${crypto.randomUUID().slice(0, 8)}`;
sessionStorage.setItem("tact-causal-page", pageId);

const ui = {
  model: null,
  activeTaskId: "task:profile-save",
  focusId: "focus:profile-save",
  selectedEventId: null,
  mode: "browser",
  results: new Map(),
  busy: false,
  receiptId: null,
  pendingVerificationTaskIds: [],
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-causal-page-id": pageId,
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  return { ok: response.ok, status: response.status, body };
}

async function refresh() {
  const { body } = await api("/api/state");
  ui.model = body;
}

function task(taskId = ui.activeTaskId) {
  return ui.model.tasks.find((candidate) => candidate.id === taskId);
}

function eventById(id) {
  return ui.model.events.find((event) => event.id === id);
}

function receiptById(id) {
  return ui.model.receipts.find((receipt) => receipt.id === id);
}

function latestEvent(predicate) {
  return [...ui.model.events].reverse().find(predicate);
}

function html(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function short(value, length = 28) {
  if (!value) return "—";
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function setBusy(value) {
  ui.busy = value;
  render();
}

function setActiveTask(taskId) {
  ui.activeTaskId = taskId;
  ui.focusId = task(taskId).focusId;
  ui.mode = "browser";
  ui.receiptId = null;
  const relevant = latestEvent((event) => event.taskIds.includes(taskId));
  ui.selectedEventId = relevant?.id ?? null;
  render();
}

function selectEvent(id) {
  const event = eventById(id);
  if (!event) return;
  ui.selectedEventId = id;
  ui.focusId = event.focusId || ui.focusId;
  if (event.taskIds.length === 1) ui.activeTaskId = event.taskIds[0];
  ui.receiptId = null;
  ui.mode = event.kind.startsWith("browser.") ? "browser" : "event";
  history.replaceState(null, "", `#event=${encodeURIComponent(id)}`);
  render();
}

function openReceipt(id) {
  ui.receiptId = id;
  ui.mode = "receipt";
  history.replaceState(null, "", `#receipt=${encodeURIComponent(id)}`);
  render();
}

function browserEvent({ taskIds, taskId, focusId, action, label, visibleText, parentEventId, kind }) {
  return api("/api/browser-event", {
    method: "POST",
    body: JSON.stringify({ taskIds, taskId, pageId, focusId, action, label, visibleText, parentEventId, kind }),
  });
}

async function reproduce(taskId, { keepTask = true } = {}) {
  const currentTask = task(taskId);
  setBusy(true);
  const interaction = await browserEvent({
    taskId,
    focusId: currentTask.focusId,
    action: "click",
    label: `human clicks ${currentTask.action}`,
    visibleText: currentTask.action,
  });
  const response = await api(currentTask.endpoint, {
    method: "POST",
    headers: {
      "x-causal-focus-id": currentTask.focusId,
      "x-causal-parent-event": interaction.body.event.id,
    },
    body: JSON.stringify(currentTask.payload),
  });
  ui.results.set(taskId, {
    status: response.status,
    body: response.body,
    visibleMessage: response.ok ? visibleSuccess(taskId, response.body.result) : `${currentTask.action} failed: ${response.body.result?.error || "server error"}`,
  });
  await refresh();
  if (keepTask) {
    ui.activeTaskId = taskId;
    ui.focusId = currentTask.focusId;
    ui.selectedEventId = interaction.body.event.id;
    ui.mode = "browser";
  }
  setBusy(false);
  render();
  return response;
}

function visibleSuccess(taskId, result) {
  return taskId === "task:profile-save"
    ? `Saved “${result?.displayName ?? "profile"}”`
    : `Invite ready for “${result?.role ?? "role"}”`;
}

function traceVisibleFailure(taskId) {
  const failure = latestEvent((event) => event.taskIds.includes(taskId) && event.kind === "server.log" && event.data.status === 500);
  if (failure) selectEvent(failure.id);
}

async function applyFix() {
  setBusy(true);
  const response = await api("/api/edit", {
    method: "POST",
    body: JSON.stringify({ pageId, focusId: ui.focusId }),
  });
  await refresh();
  ui.selectedEventId = response.body.event.id;
  ui.mode = "event";
  setBusy(false);
  render();
}

async function rebuildAndReload() {
  const edit = eventById(ui.selectedEventId)?.kind === "source.edit"
    ? eventById(ui.selectedEventId)
    : latestEvent((event) => event.kind === "source.edit");
  setBusy(true);
  const rebuild = await api("/api/rebuild", {
    method: "POST",
    body: JSON.stringify({ editEventId: edit?.id, pageId, focusId: ui.focusId }),
  });
  const reload = await browserEvent({
    taskIds: rebuild.body.event.taskIds,
    focusId: ui.focusId,
    action: "reload",
    label: "browser reloads the rebuilt runtime",
    parentEventId: rebuild.body.event.id,
    kind: "browser.reload",
  });
  await refresh();
  ui.selectedEventId = reload.body.event.id;
  ui.mode = "event";
  setBusy(false);
  render();
}

async function replayTasks(taskIds) {
  setBusy(true);
  const parent = ui.selectedEventId;
  let lastVerification = null;
  ui.pendingVerificationTaskIds = [...taskIds];
  for (const taskId of taskIds) {
    const currentTask = task(taskId);
    const response = await api("/api/replay", {
      method: "POST",
      body: JSON.stringify({ taskId, pageId, focusId: currentTask.focusId, parentEventId: parent }),
    });
    ui.results.set(taskId, {
      status: response.status,
      body: response.body.execution,
      visibleMessage: response.ok
        ? visibleSuccess(taskId, response.body.execution.result)
        : `Replay still fails: ${response.body.execution.result?.error || "server error"}`,
    });
    lastVerification = response.body.verificationEvent;
  }
  await refresh();
  if (lastVerification) ui.selectedEventId = lastVerification.id;
  ui.mode = "event";
  setBusy(false);
  render();
}

async function captureUiProof(taskIds) {
  setBusy(true);
  let last = null;
  for (const taskId of taskIds) {
    const currentTask = task(taskId);
    const result = ui.results.get(taskId);
    const passed = result?.status === 200 && result.visibleMessage?.length > 0;
    const networkVerification = latestEvent((event) => event.kind === "verification.network" && event.taskIds.includes(taskId) && event.data.status === 200);
    const response = await api("/api/verify-ui", {
      method: "POST",
      body: JSON.stringify({
        taskId,
        pageId,
        focusId: currentTask.focusId,
        parentEventId: networkVerification?.id || ui.selectedEventId,
        passed,
        summary: passed ? `browser visibly shows: ${result.visibleMessage}` : "browser still shows failure",
        visibleText: result?.visibleMessage || null,
      }),
    });
    last = response.body.event;
  }
  await refresh();
  if (last) ui.selectedEventId = last.id;
  ui.mode = "event";
  setBusy(false);
  render();
}

async function breakTaskModel() {
  setBusy(true);
  const parent = latestEvent((event) => event.kind === "verification.ui")?.id || ui.selectedEventId;
  await api("/api/scenario/braid", {
    method: "POST",
    body: JSON.stringify({ pageId, parentEventId: parent }),
  });
  ui.results.clear();
  await refresh();
  setBusy(false);
  await reproduce("task:profile-save", { keepTask: false });
  await reproduce("task:invite-role", { keepTask: false });
  await refresh();
  const sharedSource = latestEvent((event) => event.kind === "source.link" && event.taskIds.includes("task:profile-save"));
  ui.activeTaskId = "task:profile-save";
  ui.focusId = "focus:profile-save";
  ui.selectedEventId = sharedSource?.id || null;
  ui.mode = "event";
  render();
}

async function resetPrototype() {
  setBusy(true);
  await api("/api/reset", { method: "POST", body: "{}" });
  ui.results.clear();
  ui.activeTaskId = "task:profile-save";
  ui.focusId = "focus:profile-save";
  ui.selectedEventId = null;
  ui.mode = "browser";
  ui.receiptId = null;
  ui.pendingVerificationTaskIds = [];
  await refresh();
  setBusy(false);
  history.replaceState(null, "", location.pathname);
  render();
}

function taskButtons() {
  const tasks = ui.model.tasks.filter((candidate) => candidate.id === "task:profile-save" || ui.model.scenario === "braided-shared-cause");
  return tasks.map((candidate) => `
    <button class="task-chip ${candidate.id === ui.activeTaskId ? "active" : ""}" data-task="${candidate.id}">
      ${html(candidate.id.replace("task:", ""))}
    </button>
  `).join("");
}

function identityBar() {
  const runtime = ui.model.runtime;
  const dirty = runtime.workingRevision !== runtime.activeRevision.replace(/\+build:\d+$/, "");
  const hasUiProof = ui.model.events.some((event) => event.kind === "verification.ui" && event.data.passed);
  return `
    <header class="identity">
      <div class="brand">Tact / causal debugger</div>
      ${taskButtons()}
      <div class="identity-chip runtime" title="${html(runtime.id)}">runtime ${html(short(runtime.id, 22))}</div>
      <div class="identity-chip page" title="${html(pageId)}">page ${html(pageId.replace("page:", ""))}</div>
      <div class="identity-chip" title="${html(ui.focusId)}">focus ${html(ui.focusId.replace("focus:", ""))}</div>
      <div class="identity-chip ${dirty ? "status-warn" : ""}" title="working ${html(runtime.workingRevision)} / active ${html(runtime.activeRevision)}">
        source ${html(short(runtime.workingRevision, 24))}${dirty ? " · pending rebuild" : ""}
      </div>
      <div class="spacer"></div>
      ${hasUiProof && ui.model.scenario === "single-task" ? `<button class="control danger" data-action="break-model" ${ui.busy ? "disabled" : ""}>Break task model</button>` : ""}
      <button class="control" data-action="reset" ${ui.busy ? "disabled" : ""}>Reset</button>
    </header>
  `;
}

function browserStage() {
  const currentTask = task();
  const result = ui.results.get(currentTask.id);
  const isProfile = currentTask.id === "task:profile-save";
  const braid = ui.model.scenario === "braided-shared-cause";
  return `
    <div class="stage-inner">
      <div class="stage-kicker">browser surface · ${html(pageId)}</div>
      <h1>Select the failure in the application.</h1>
      <p class="lede">The visible object already carries task, page, runtime, focus, and revision identity. Its causal ribbon is built from exact events and receipts.</p>
      <div class="browser-frame">
        <div class="browser-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><div class="address">http://localhost:4317/demo</div></div>
        <div class="browser-content">
          <div class="app-tabs">
            <button class="app-tab ${isProfile ? "active" : ""}" data-task="task:profile-save">Profile</button>
            ${braid ? `<button class="app-tab ${!isProfile ? "active" : ""}" data-task="task:invite-role">Invite</button>` : ""}
          </div>
          ${isProfile ? profileForm(result) : inviteForm(result)}
          ${braid ? `<div class="scenario-note"><strong>Shared-cause case is live.</strong> Profile save and Invite are separate human tasks, yet both fail in the same <code>source:shared-input-normalizer</code> artifact. Fixing it once should produce one edit/rebuild receipt with two task memberships.</div>` : ""}
        </div>
      </div>
    </div>
  `;
}

function profileForm(result) {
  return `
    <div class="form-card">
      <h2>Profile</h2>
      <p>Update the name other people see.</p>
      <div class="field"><label>Display name</label><input value="Ada Lovelace" readonly /></div>
      <button class="app-action" data-action="reproduce" data-task-id="task:profile-save" ${ui.busy ? "disabled" : ""}>Save changes</button>
      ${resultBlock("task:profile-save", result)}
    </div>
  `;
}

function inviteForm(result) {
  return `
    <div class="form-card">
      <h2>Invite teammate</h2>
      <p>Assign a role to the invitation.</p>
      <div class="field"><label>Role</label><input value="Platform Engineer" readonly /></div>
      <button class="app-action" data-action="reproduce" data-task-id="task:invite-role" ${ui.busy ? "disabled" : ""}>Send invite</button>
      ${resultBlock("task:invite-role", result)}
    </div>
  `;
}

function resultBlock(taskId, result) {
  if (!result) return "";
  if (result.status >= 400) {
    return `<div class="result error" data-focus-object="${html(task(taskId).focusId)}"><span>${html(result.visibleMessage)}</span><button data-action="trace-failure" data-task-id="${taskId}">Trace failure</button></div>`;
  }
  return `<div class="result success" data-focus-object="${html(task(taskId).focusId)}"><span>${html(result.visibleMessage)}</span></div>`;
}

function eventStage() {
  const event = eventById(ui.selectedEventId);
  if (!event) return browserStage();
  if (event.kind === "source.link" || event.kind === "source.edit") return sourceStage(event);
  return evidenceStage(event);
}

function tagsFor(event) {
  return `
    <div class="event-meta">
      <span class="tag">${html(event.id)}</span>
      <span class="tag">${html(event.kind)}</span>
      <span class="tag">${html(event.runtimeId)}</span>
      ${event.pageId ? `<span class="tag">${html(event.pageId)}</span>` : ""}
      ${event.focusId ? `<span class="tag">${html(event.focusId)}</span>` : ""}
      <span class="tag">${html(event.revision)}</span>
      ${event.taskIds.map((id) => `<span class="tag ${event.taskIds.length > 1 ? "shared" : ""}">${html(id)}</span>`).join("")}
    </div>
  `;
}

function sourceStage(event) {
  const sourceReceipt = event.receiptIds.map(receiptById).find((receipt) => receipt?.type === "source");
  const source = sourceReceipt?.raw || "Select the source receipt to inspect the executed revision.";
  const line = event.data.highlightedLine || sourceReceipt?.meta?.highlightedLine || 1;
  const lines = source.split("\n").map((text, index) => `<div class="source-line ${index + 1 === line ? "highlight" : ""}"><code>${html(text || " ")}</code></div>`).join("");
  const canFix = event.kind === "source.link" && event.data.status === 500;
  const canRebuild = event.kind === "source.edit";
  return `
    <div class="stage-inner">
      <div class="stage-kicker">source lens · ${html(event.data.sourceArtifactId || "source")}</div>
      <h1>${html(event.label)}</h1>
      <p class="lede">This source identity came from the selected visible interaction through runtime, network, and server evidence. No filename search was required.</p>
      <div class="source-card">
        <h2>${html(event.data.path || "runtime/shared-input.mjs")}</h2>
        ${tagsFor(event)}
        <pre class="source-lines">${lines}</pre>
        ${receiptLinks(event)}
        <div class="actions">
          <button class="control" data-action="browser">Back to browser</button>
          ${canFix ? `<button class="control primary" data-action="apply-fix" ${ui.busy ? "disabled" : ""}>Apply smallest fix</button>` : ""}
          ${canRebuild ? `<button class="control primary" data-action="rebuild" ${ui.busy ? "disabled" : ""}>Rebuild + reload</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function evidenceStage(event) {
  const replayable = event.kind === "browser.reload" || event.kind === "runtime.rebuild";
  const verifyable = event.kind === "verification.network" && event.data.status === 200;
  const taskIds = event.kind === "verification.network" && ui.pendingVerificationTaskIds.length
    ? ui.pendingVerificationTaskIds
    : (event.taskIds.length ? event.taskIds : [ui.activeTaskId]);
  return `
    <div class="stage-inner">
      <div class="stage-kicker">causal event · ${html(event.id)}</div>
      <h1>${html(event.label)}</h1>
      <p class="lede">Move backward through parent edges or forward through the ribbon. Each landmark preserves the exact receipt that supports it.</p>
      <div class="event-card">
        ${tagsFor(event)}
        <pre>${html(JSON.stringify(event.data, null, 2))}</pre>
        ${event.parents.length ? `<p><strong>caused by:</strong> ${event.parents.map((id) => `<button class="control" data-event="${id}">${html(id)}</button>`).join(" ")}</p>` : ""}
        ${receiptLinks(event)}
        <div class="actions">
          <button class="control" data-action="browser">Show browser surface</button>
          ${replayable ? `<button class="control primary" data-action="replay" data-task-ids="${html(taskIds.join(","))}" ${ui.busy ? "disabled" : ""}>Replay ${taskIds.length > 1 ? "both reproductions" : "reproduction"}</button>` : ""}
          ${verifyable ? `<button class="control good" data-action="capture-proof" data-task-ids="${html(taskIds.join(","))}" ${ui.busy ? "disabled" : ""}>Capture visible verification</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function receiptLinks(event) {
  if (!event.receiptIds.length) return `<div class="empty">No receipt attached.</div>`;
  return event.receiptIds.map((id) => {
    const receipt = receiptById(id);
    return `<a class="receipt-link" href="${html(receipt.href)}" data-receipt="${html(id)}"><strong>${html(receipt.title)}</strong><br><span>${html(receipt.summary)}</span></a>`;
  }).join("");
}

function receiptStage() {
  const receipt = receiptById(ui.receiptId);
  if (!receipt) return eventStage();
  return `
    <div class="stage-inner">
      <div class="stage-kicker">exact receipt · ${html(receipt.id)}</div>
      <h1>${html(receipt.title)}</h1>
      <p class="lede">The ribbon keeps this compact; the exact evidence stays recoverable here.</p>
      <div class="receipt-card">
        <div class="event-meta">
          <span class="tag">${html(receipt.type)}</span>
          ${receipt.taskIds.map((id) => `<span class="tag ${receipt.taskIds.length > 1 ? "shared" : ""}">${html(id)}</span>`).join("")}
        </div>
        <p>${html(receipt.summary)}</p>
        <pre>${html(receipt.raw)}</pre>
        <div class="actions">
          ${receipt.eventIds.map((id) => `<button class="control" data-event="${html(id)}">Open ${html(id)}</button>`).join("")}
          <button class="control" data-action="browser">Show browser surface</button>
        </div>
      </div>
    </div>
  `;
}

function ribbonEvents() {
  const selected = eventById(ui.selectedEventId);
  const relevantTaskIds = selected?.taskIds?.length > 1 ? selected.taskIds : [ui.activeTaskId];
  return ui.model.events.filter((event) => event.taskIds.some((id) => relevantTaskIds.includes(id)));
}

function ribbon() {
  const events = ribbonEvents();
  return `
    <footer class="ribbon-wrap">
      <div class="ribbon-head"><strong>Causal ribbon</strong><span>${events.length ? "select any event to move the single stage" : "reproduce the visible failure to begin"}</span></div>
      <div class="ribbon">
        ${events.length ? events.map((event) => `
          <button class="ribbon-event ${event.id === ui.selectedEventId ? "selected" : ""} ${event.taskIds.length > 1 ? "shared" : ""}" data-event="${event.id}">
            <div class="ribbon-kind">${html(event.kind)}</div>
            <div class="ribbon-label">${html(event.label)}</div>
            <div class="ribbon-tasks">${html(event.taskIds.map((id) => id.replace("task:", "")).join(" + "))}</div>
          </button>
        `).join("") : `<div class="empty">No causal events yet.</div>`}
      </div>
    </footer>
  `;
}

function render() {
  if (!ui.model) return;
  const stage = ui.mode === "receipt" ? receiptStage() : ui.mode === "event" ? eventStage() : browserStage();
  root.innerHTML = `<div class="shell">${identityBar()}<main class="workspace"><section class="stage">${stage}</section></main>${ribbon()}</div>`;
  bind();
}

function bind() {
  root.querySelectorAll("[data-task]").forEach((element) => element.addEventListener("click", () => setActiveTask(element.dataset.task)));
  root.querySelectorAll("[data-event]").forEach((element) => element.addEventListener("click", () => selectEvent(element.dataset.event)));
  root.querySelectorAll("[data-receipt]").forEach((element) => element.addEventListener("click", (event) => {
    event.preventDefault();
    openReceipt(element.dataset.receipt);
  }));
  root.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", async () => {
    const action = element.dataset.action;
    if (action === "reproduce") return reproduce(element.dataset.taskId);
    if (action === "trace-failure") return traceVisibleFailure(element.dataset.taskId);
    if (action === "apply-fix") return applyFix();
    if (action === "rebuild") return rebuildAndReload();
    if (action === "replay") return replayTasks(element.dataset.taskIds.split(","));
    if (action === "capture-proof") return captureUiProof(element.dataset.taskIds.split(","));
    if (action === "break-model") return breakTaskModel();
    if (action === "reset") return resetPrototype();
    if (action === "browser") {
      ui.mode = "browser";
      ui.receiptId = null;
      history.replaceState(null, "", location.pathname);
      return render();
    }
  }));
  root.querySelectorAll("[data-focus-object]").forEach((element) => element.addEventListener("click", () => {
    ui.focusId = element.dataset.focusObject;
  }));
}

async function start() {
  await refresh();
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  if (hash.get("receipt")) {
    ui.receiptId = hash.get("receipt");
    ui.mode = "receipt";
  } else if (hash.get("event")) {
    ui.selectedEventId = hash.get("event");
    ui.mode = "event";
  }
  render();
}

start();
