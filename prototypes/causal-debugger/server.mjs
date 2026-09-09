import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rm, copyFile, stat } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(HERE, "public");
const BUGGY_TEMPLATE = join(HERE, "runtime", "shared-input.buggy.mjs");
const FIXED_TEMPLATE = join(HERE, "runtime", "shared-input.fixed.mjs");
const LOGICAL_SOURCE_PATH = "runtime/shared-input.mjs";
const SOURCE_ARTIFACT_ID = "source:shared-input-normalizer";

const TASKS = {
  profile: {
    id: "task:profile-save",
    title: "Profile save rejects a human name",
    endpoint: "/api/profile",
    focusId: "focus:profile-save",
    action: "Save changes",
    payload: { displayName: "Ada Lovelace" },
  },
  invite: {
    id: "task:invite-role",
    title: "Invite rejects a multi-word role",
    endpoint: "/api/invite",
    focusId: "focus:invite-role",
    action: "Send invite",
    payload: { role: "Platform Engineer" },
  },
};

const TASK_BY_ID = Object.fromEntries(Object.values(TASKS).map((task) => [task.id, task]));

function sha(value) {
  return createHash("sha256").update(value).digest("hex");
}

function tryGitHead() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: HERE, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "working-copy";
  }
}

function json(res, status, body) {
  const encoded = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(encoded),
    "cache-control": "no-store",
  });
  res.end(encoded);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function contentType(path) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
  }[extname(path)] ?? "application/octet-stream";
}

export async function createPrototype({ port = 0, quiet = false } = {}) {
  const runtimeDir = join(tmpdir(), `tact-causal-debugger-${process.pid}-${randomUUID().slice(0, 8)}`);
  const workingSourcePath = join(runtimeDir, "working-shared-input.mjs");
  const activeSourcePath = join(runtimeDir, "active-shared-input.mjs");
  await mkdir(runtimeDir, { recursive: true });

  const gitHead = tryGitHead();
  const runtimeId = `runtime:${process.pid}:${randomUUID().slice(0, 8)}`;
  const startedAt = new Date().toISOString();

  const state = {
    runtimeId,
    startedAt,
    gitHead,
    buildGeneration: 1,
    workingRevision: null,
    activeRevision: null,
    scenario: "single-task",
    events: [],
    receipts: [],
    knownPages: new Set(),
    eventSeq: 0,
    receiptSeq: 0,
  };

  const eventById = new Map();
  const receiptById = new Map();

  const nextEventId = () => `event:${String(++state.eventSeq).padStart(4, "0")}`;
  const nextReceiptId = (type) => `receipt:${type}:${String(++state.receiptSeq).padStart(4, "0")}`;

  async function workingSource() {
    return readFile(workingSourcePath, "utf8");
  }

  async function activeSource() {
    return readFile(activeSourcePath, "utf8");
  }

  async function computeWorkingRevision() {
    const content = await workingSource();
    return `rev:${gitHead.slice(0, 8)}+src:${sha(content).slice(0, 10)}`;
  }

  async function computeActiveRevision() {
    const content = await activeSource();
    return `rev:${gitHead.slice(0, 8)}+src:${sha(content).slice(0, 10)}+build:${state.buildGeneration}`;
  }

  async function seedBuggy({ incrementBuild = false } = {}) {
    await copyFile(BUGGY_TEMPLATE, workingSourcePath);
    await copyFile(BUGGY_TEMPLATE, activeSourcePath);
    if (incrementBuild) state.buildGeneration += 1;
    state.workingRevision = await computeWorkingRevision();
    state.activeRevision = await computeActiveRevision();
  }

  await seedBuggy();

  function addReceipt({ type, title, summary, raw, taskIds = [], eventIds = [], meta = {} }) {
    const receipt = {
      id: nextReceiptId(type),
      type,
      title,
      summary,
      raw,
      taskIds: [...new Set(taskIds)],
      eventIds: [...new Set(eventIds)],
      createdAt: new Date().toISOString(),
      meta,
    };
    receipt.href = `#receipt=${encodeURIComponent(receipt.id)}`;
    state.receipts.push(receipt);
    receiptById.set(receipt.id, receipt);
    return receipt;
  }

  function addEvent({ kind, label, taskIds = [], pageId = null, focusId = null, parents = [], receiptIds = [], revision = state.activeRevision, data = {} }) {
    const event = {
      id: nextEventId(),
      seq: state.eventSeq,
      at: new Date().toISOString(),
      kind,
      label,
      taskIds: [...new Set(taskIds)],
      runtimeId,
      pageId,
      focusId,
      revision,
      parents: [...new Set(parents.filter(Boolean))],
      receiptIds: [...new Set(receiptIds)],
      data,
    };
    state.events.push(event);
    eventById.set(event.id, event);
    for (const receiptId of event.receiptIds) {
      const receipt = receiptById.get(receiptId);
      if (receipt && !receipt.eventIds.includes(event.id)) receipt.eventIds.push(event.id);
    }
    return event;
  }

  function latestFailureSourceEvents() {
    const latest = new Map();
    for (const event of state.events) {
      if (event.kind !== "source.link" || event.data.sourceArtifactId !== SOURCE_ARTIFACT_ID || event.data.status !== 500) continue;
      for (const taskId of event.taskIds) latest.set(taskId, event);
    }
    return [...latest.values()];
  }

  async function loadActiveModule() {
    const url = `${pathToFileURL(activeSourcePath).href}?revision=${encodeURIComponent(state.activeRevision)}&nonce=${Date.now()}-${Math.random()}`;
    return import(url);
  }

  async function executeTask({ task, pageId, focusId, parentEventId, payload, replay = false }) {
    const runtimeEvent = addEvent({
      kind: "runtime.event",
      label: replay ? `Replay dispatches ${task.action}` : `${task.action} handler runs`,
      taskIds: [task.id],
      pageId,
      focusId,
      parents: [parentEventId],
      data: { handler: task.id === TASKS.profile.id ? "saveProfile()" : "sendInvite()" },
    });

    const requestReceipt = addReceipt({
      type: "network",
      title: `${task.endpoint} request`,
      summary: `POST ${task.endpoint}`,
      raw: JSON.stringify({ method: "POST", url: task.endpoint, body: payload, runtimeId, pageId, focusId }, null, 2),
      taskIds: [task.id],
      meta: { method: "POST", url: task.endpoint, payload },
    });

    const requestEvent = addEvent({
      kind: "network.request",
      label: `POST ${task.endpoint}`,
      taskIds: [task.id],
      pageId,
      focusId,
      parents: [runtimeEvent.id],
      receiptIds: [requestReceipt.id],
      data: { method: "POST", url: task.endpoint, payload },
    });

    let status = 200;
    let result;
    let error = null;
    try {
      const runtimeModule = await loadActiveModule();
      result = task.id === TASKS.profile.id ? runtimeModule.saveProfile(payload) : runtimeModule.sendInvite(payload);
    } catch (caught) {
      status = 500;
      error = caught instanceof Error ? caught.message : String(caught);
      result = { error };
    }

    const logLine = `${new Date().toISOString()} ${status} ${task.endpoint} ${status === 200 ? "ok" : error}`;
    if (!quiet) process.stdout.write(`[${runtimeId}] ${logLine}\n`);
    const logReceipt = addReceipt({
      type: "server-log",
      title: `${task.endpoint} server log`,
      summary: status === 200 ? "server completed request" : error,
      raw: logLine,
      taskIds: [task.id],
      meta: { status, endpoint: task.endpoint },
    });

    const logEvent = addEvent({
      kind: "server.log",
      label: status === 200 ? `server ${status}` : `server ${status}: ${error}`,
      taskIds: [task.id],
      pageId,
      focusId,
      parents: [requestEvent.id],
      receiptIds: [logReceipt.id],
      data: { status, error, endpoint: task.endpoint },
    });

    const sourceText = await activeSource();
    const sourceReceipt = addReceipt({
      type: "source",
      title: LOGICAL_SOURCE_PATH,
      summary: `${SOURCE_ARTIFACT_ID} at ${state.activeRevision}`,
      raw: sourceText,
      taskIds: [task.id],
      meta: {
        sourceArtifactId: SOURCE_ARTIFACT_ID,
        path: LOGICAL_SOURCE_PATH,
        activeRevision: state.activeRevision,
        highlightedLine: status === 500 ? 3 : 2,
      },
    });

    const sourceEvent = addEvent({
      kind: "source.link",
      label: status === 500 ? "failure maps to normalizeText()" : "request executed normalizeText()",
      taskIds: [task.id],
      pageId,
      focusId,
      parents: [logEvent.id],
      receiptIds: [sourceReceipt.id],
      data: {
        status,
        sourceArtifactId: SOURCE_ARTIFACT_ID,
        path: LOGICAL_SOURCE_PATH,
        symbol: "normalizeText",
        highlightedLine: status === 500 ? 3 : 2,
      },
    });

    return {
      status,
      result,
      chain: [runtimeEvent.id, requestEvent.id, logEvent.id, sourceEvent.id],
      sourceEventId: sourceEvent.id,
      requestEventId: requestEvent.id,
    };
  }

  function taskForEndpoint(pathname) {
    if (pathname === TASKS.profile.endpoint) return TASKS.profile;
    if (pathname === TASKS.invite.endpoint) return TASKS.invite;
    return null;
  }

  function publicState() {
    return {
      runtime: {
        id: runtimeId,
        startedAt,
        buildGeneration: state.buildGeneration,
        activeRevision: state.activeRevision,
        workingRevision: state.workingRevision,
        gitHead,
        sourceArtifactId: SOURCE_ARTIFACT_ID,
        sourcePath: LOGICAL_SOURCE_PATH,
      },
      scenario: state.scenario,
      tasks: Object.values(TASKS),
      knownPages: [...state.knownPages],
      events: state.events,
      receipts: state.receipts,
    };
  }

  async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const { pathname } = url;

    if (req.method === "GET" && pathname === "/api/state") {
      return json(res, 200, publicState());
    }

    if (req.method === "GET" && pathname === "/api/source") {
      return json(res, 200, {
        sourceArtifactId: SOURCE_ARTIFACT_ID,
        path: LOGICAL_SOURCE_PATH,
        source: await workingSource(),
        workingRevision: state.workingRevision,
        activeRevision: state.activeRevision,
        dirty: state.workingRevision !== state.activeRevision.replace(/\+build:\d+$/, ""),
      });
    }

    if (req.method === "POST" && pathname === "/api/browser-event") {
      const body = await readJson(req);
      const taskIds = Array.isArray(body.taskIds) ? body.taskIds : [body.taskId].filter(Boolean);
      const pageId = body.pageId || req.headers["x-causal-page-id"] || null;
      if (pageId) state.knownPages.add(pageId);
      const receipt = addReceipt({
        type: "browser",
        title: body.label || body.action || "browser event",
        summary: `${body.action || "interaction"} on ${body.focusId || "unknown focus"}`,
        raw: JSON.stringify(body, null, 2),
        taskIds,
        meta: { pageId, focusId: body.focusId, action: body.action },
      });
      const event = addEvent({
        kind: body.kind || "browser.interaction",
        label: body.label || body.action || "browser interaction",
        taskIds,
        pageId,
        focusId: body.focusId || null,
        parents: body.parentEventId ? [body.parentEventId] : [],
        receiptIds: [receipt.id],
        data: { action: body.action, visibleText: body.visibleText || null },
      });
      return json(res, 201, { event, receipt });
    }

    const endpointTask = taskForEndpoint(pathname);
    if (req.method === "POST" && endpointTask) {
      const payload = await readJson(req);
      const pageId = req.headers["x-causal-page-id"] || null;
      const focusId = req.headers["x-causal-focus-id"] || endpointTask.focusId;
      const parentEventId = req.headers["x-causal-parent-event"] || null;
      if (pageId) state.knownPages.add(pageId);
      const execution = await executeTask({
        task: endpointTask,
        pageId,
        focusId,
        parentEventId,
        payload,
        replay: false,
      });
      return json(res, execution.status, execution);
    }

    if (req.method === "POST" && pathname === "/api/edit") {
      const body = await readJson(req);
      const failureSources = latestFailureSourceEvents();
      const relevantSources = body.taskIds?.length
        ? failureSources.filter((event) => event.taskIds.some((taskId) => body.taskIds.includes(taskId)))
        : failureSources;
      const taskIds = [...new Set(relevantSources.flatMap((event) => event.taskIds))];
      const parents = relevantSources.map((event) => event.id);
      const before = await workingSource();
      const fixed = await readFile(FIXED_TEMPLATE, "utf8");
      await writeFile(workingSourcePath, fixed, "utf8");
      const beforeRevision = state.workingRevision;
      state.workingRevision = await computeWorkingRevision();
      const receipt = addReceipt({
        type: "diff",
        title: "Edit normalizeText()",
        summary: `working source ${beforeRevision} → ${state.workingRevision}`,
        raw: [
          `--- ${LOGICAL_SOURCE_PATH}@${beforeRevision}`,
          `+++ ${LOGICAL_SOURCE_PATH}@${state.workingRevision}`,
          "@@ normalizeText",
          "- reject any whitespace",
          "+ trim and collapse whitespace; reject only empty text",
          "",
          fixed,
        ].join("\n"),
        taskIds,
        meta: { sourceArtifactId: SOURCE_ARTIFACT_ID, beforeRevision, afterRevision: state.workingRevision },
      });
      const event = addEvent({
        kind: "source.edit",
        label: taskIds.length > 1 ? "one shared edit addresses both tasks" : "edit normalizeText()",
        taskIds,
        pageId: body.pageId || null,
        focusId: body.focusId || null,
        parents,
        receiptIds: [receipt.id],
        revision: state.workingRevision,
        data: {
          sourceArtifactId: SOURCE_ARTIFACT_ID,
          path: LOGICAL_SOURCE_PATH,
          beforeRevision,
          afterRevision: state.workingRevision,
          activeRevisionStill: state.activeRevision,
          changed: before !== fixed,
        },
      });
      return json(res, 200, { event, receipt, state: publicState() });
    }

    if (req.method === "POST" && pathname === "/api/rebuild") {
      const body = await readJson(req);
      const editEvent = body.editEventId ? eventById.get(body.editEventId) : [...state.events].reverse().find((event) => event.kind === "source.edit");
      await copyFile(workingSourcePath, activeSourcePath);
      state.buildGeneration += 1;
      state.activeRevision = await computeActiveRevision();
      const taskIds = editEvent?.taskIds ?? body.taskIds ?? [];
      const receipt = addReceipt({
        type: "build",
        title: `dev server rebuild #${state.buildGeneration}`,
        summary: `active runtime now ${state.activeRevision}`,
        raw: JSON.stringify({ runtimeId, buildGeneration: state.buildGeneration, activeRevision: state.activeRevision, workingRevision: state.workingRevision }, null, 2),
        taskIds,
        meta: { runtimeId, buildGeneration: state.buildGeneration, activeRevision: state.activeRevision },
      });
      const event = addEvent({
        kind: "runtime.rebuild",
        label: `rebuild activates ${state.workingRevision}`,
        taskIds,
        pageId: body.pageId || null,
        focusId: body.focusId || null,
        parents: editEvent ? [editEvent.id] : [],
        receiptIds: [receipt.id],
        revision: state.activeRevision,
        data: { buildGeneration: state.buildGeneration, activeRevision: state.activeRevision },
      });
      return json(res, 200, { event, receipt, state: publicState() });
    }

    if (req.method === "POST" && pathname === "/api/replay") {
      const body = await readJson(req);
      const task = TASK_BY_ID[body.taskId];
      if (!task) return json(res, 400, { error: "unknown task" });
      const pageId = body.pageId || null;
      const focusId = body.focusId || task.focusId;
      if (pageId) state.knownPages.add(pageId);
      const replayReceipt = addReceipt({
        type: "reproduction",
        title: `Replay ${task.action}`,
        summary: `same payload against ${state.activeRevision}`,
        raw: JSON.stringify({ taskId: task.id, action: task.action, payload: task.payload, pageId, focusId }, null, 2),
        taskIds: [task.id],
        meta: { payload: task.payload },
      });
      const replayEvent = addEvent({
        kind: "replay",
        label: `replay ${task.action}`,
        taskIds: [task.id],
        pageId,
        focusId,
        parents: body.parentEventId ? [body.parentEventId] : [],
        receiptIds: [replayReceipt.id],
        data: { payload: task.payload },
      });
      const execution = await executeTask({
        task,
        pageId,
        focusId,
        parentEventId: replayEvent.id,
        payload: task.payload,
        replay: true,
      });
      const verificationReceipt = addReceipt({
        type: "verification",
        title: execution.status === 200 ? `${task.action} replay passed` : `${task.action} replay still fails`,
        summary: `HTTP ${execution.status} at ${state.activeRevision}`,
        raw: JSON.stringify({ taskId: task.id, status: execution.status, result: execution.result, runtimeId, pageId, activeRevision: state.activeRevision, reproductionReceiptId: replayReceipt.id }, null, 2),
        taskIds: [task.id],
        meta: { status: execution.status, activeRevision: state.activeRevision, reproductionReceiptId: replayReceipt.id },
      });
      const verificationEvent = addEvent({
        kind: "verification.network",
        label: execution.status === 200 ? "network verification passed" : "network verification failed",
        taskIds: [task.id],
        pageId,
        focusId,
        parents: [execution.sourceEventId],
        receiptIds: [verificationReceipt.id],
        data: { status: execution.status, result: execution.result },
      });
      return json(res, execution.status, { replayEvent, execution, verificationEvent, verificationReceipt });
    }

    if (req.method === "POST" && pathname === "/api/verify-ui") {
      const body = await readJson(req);
      const taskIds = Array.isArray(body.taskIds) ? body.taskIds : [body.taskId].filter(Boolean);
      const receipt = addReceipt({
        type: "ui-proof",
        title: body.passed ? "visible UI verification passed" : "visible UI verification failed",
        summary: body.summary || "browser assertion",
        raw: JSON.stringify(body, null, 2),
        taskIds,
        meta: { pageId: body.pageId, focusId: body.focusId, activeRevision: state.activeRevision },
      });
      const event = addEvent({
        kind: "verification.ui",
        label: body.passed ? "visible result verified" : "visible result failed verification",
        taskIds,
        pageId: body.pageId || null,
        focusId: body.focusId || null,
        parents: body.parentEventId ? [body.parentEventId] : [],
        receiptIds: [receipt.id],
        data: { passed: !!body.passed, summary: body.summary || null },
      });
      return json(res, body.passed ? 200 : 409, { event, receipt });
    }

    if (req.method === "POST" && pathname === "/api/scenario/braid") {
      const body = await readJson(req);
      await seedBuggy({ incrementBuild: true });
      state.scenario = "braided-shared-cause";
      const receipt = addReceipt({
        type: "scenario",
        title: "Inject shared cause",
        summary: "restore the buggy shared normalizer so two human tasks fail on one source artifact",
        raw: JSON.stringify({ sourceArtifactId: SOURCE_ARTIFACT_ID, taskIds: [TASKS.profile.id, TASKS.invite.id], activeRevision: state.activeRevision }, null, 2),
        taskIds: [TASKS.profile.id, TASKS.invite.id],
        meta: { sourceArtifactId: SOURCE_ARTIFACT_ID, activeRevision: state.activeRevision },
      });
      const event = addEvent({
        kind: "scenario.braid",
        label: "shared cause reintroduced for two tasks",
        taskIds: [TASKS.profile.id, TASKS.invite.id],
        pageId: body.pageId || null,
        parents: body.parentEventId ? [body.parentEventId] : [],
        receiptIds: [receipt.id],
        revision: state.activeRevision,
        data: { sourceArtifactId: SOURCE_ARTIFACT_ID, activeRevision: state.activeRevision },
      });
      return json(res, 200, { event, receipt, state: publicState() });
    }

    if (req.method === "POST" && pathname === "/api/reset") {
      state.events.length = 0;
      state.receipts.length = 0;
      state.eventSeq = 0;
      state.receiptSeq = 0;
      eventById.clear();
      receiptById.clear();
      state.scenario = "single-task";
      await seedBuggy({ incrementBuild: true });
      return json(res, 200, publicState());
    }

    if (req.method === "GET") {
      let filePath = pathname === "/" ? join(PUBLIC_DIR, "index.html") : join(PUBLIC_DIR, normalize(pathname).replace(/^[/\\]+/, ""));
      if (!filePath.startsWith(PUBLIC_DIR)) return json(res, 403, { error: "forbidden" });
      try {
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) throw new Error("not a file");
        const body = await readFile(filePath);
        res.writeHead(200, { "content-type": contentType(filePath), "content-length": body.length });
        return res.end(body);
      } catch {
        return json(res, 404, { error: "not found" });
      }
    }

    return json(res, 404, { error: "not found" });
  }

  const server = createServer((req, res) => {
    handler(req, res).catch((error) => {
      if (!quiet) console.error(error);
      if (!res.headersSent) json(res, 500, { error: error.message });
      else res.end();
    });
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    server,
    url: `http://127.0.0.1:${actualPort}`,
    runtimeDir,
    state,
    close: async () => {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      await rm(runtimeDir, { recursive: true, force: true });
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prototype = await createPrototype({ port: Number(process.env.PORT || 4317) });
  console.log(`Tact causal debugger running at ${prototype.url}`);
  console.log(`runtime ${prototype.state.runtimeId}`);
  const shutdown = async () => {
    await prototype.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
