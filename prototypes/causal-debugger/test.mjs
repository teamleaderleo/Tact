import assert from "node:assert/strict";
import { createPrototype } from "./server.mjs";

const proto = await createPrototype({ port: 0, quiet: true });
const base = proto.url;
const pageId = "page:test";

async function call(path, { method = "GET", body, headers = {} } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "content-type": "application/json", "x-causal-page-id": pageId, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, json: await response.json() };
}

async function interaction(taskId, focusId, label) {
  const { json } = await call("/api/browser-event", {
    method: "POST",
    body: { taskId, pageId, focusId, action: "click", label },
  });
  return json.event;
}

async function reproduce({ taskId, endpoint, focusId, payload }) {
  const click = await interaction(taskId, focusId, `click ${endpoint}`);
  const { response, json } = await call(endpoint, {
    method: "POST",
    headers: { "x-causal-parent-event": click.id, "x-causal-focus-id": focusId },
    body: payload,
  });
  return { click, response, json };
}

try {
  const state0 = (await call("/api/state")).json;
  assert.match(state0.runtime.id, /^runtime:/);
  assert.equal(state0.tasks.length, 2);
  assert.equal(state0.scenario, "single-task");

  const profile = await reproduce({
    taskId: "task:profile-save",
    endpoint: "/api/profile",
    focusId: "focus:profile-save",
    payload: { displayName: "Ada Lovelace" },
  });
  assert.equal(profile.response.status, 500);
  assert.equal(profile.json.chain.length, 4);

  let state = (await call("/api/state")).json;
  const profileKinds = state.events.filter((event) => event.taskIds.includes("task:profile-save")).map((event) => event.kind);
  assert.deepEqual(profileKinds.slice(-5), ["browser.interaction", "runtime.event", "network.request", "server.log", "source.link"]);
  assert.ok(state.receipts.some((receipt) => receipt.type === "network"));
  assert.ok(state.receipts.some((receipt) => receipt.type === "server-log"));
  assert.ok(state.receipts.some((receipt) => receipt.type === "source"));

  const beforeEditActive = state.runtime.activeRevision;
  const edit = await call("/api/edit", { method: "POST", body: { pageId, focusId: "focus:profile-save" } });
  assert.deepEqual(edit.json.event.taskIds, ["task:profile-save"]);
  assert.notEqual(edit.json.state.runtime.workingRevision, beforeEditActive.replace(/\+build:\d+$/, ""));
  assert.equal(edit.json.state.runtime.activeRevision, beforeEditActive);

  const prebuildReplay = await call("/api/replay", {
    method: "POST",
    body: { taskId: "task:profile-save", pageId, focusId: "focus:profile-save", parentEventId: edit.json.event.id },
  });
  assert.equal(prebuildReplay.response.status, 500, "working source should not affect active runtime before rebuild");

  const rebuild = await call("/api/rebuild", { method: "POST", body: { editEventId: edit.json.event.id, pageId } });
  assert.equal(rebuild.response.status, 200);
  assert.notEqual(rebuild.json.event.revision, beforeEditActive);

  const reload = await call("/api/browser-event", {
    method: "POST",
    body: { taskIds: rebuild.json.event.taskIds, pageId, focusId: "focus:profile-save", action: "reload", label: "browser reload", parentEventId: rebuild.json.event.id, kind: "browser.reload" },
  });
  const replay = await call("/api/replay", {
    method: "POST",
    body: { taskId: "task:profile-save", pageId, focusId: "focus:profile-save", parentEventId: reload.json.event.id },
  });
  assert.equal(replay.response.status, 200);
  assert.equal(replay.json.execution.result.displayName, "Ada Lovelace");
  const uiProof = await call("/api/verify-ui", {
    method: "POST",
    body: { taskId: "task:profile-save", pageId, focusId: "focus:profile-save", parentEventId: replay.json.verificationEvent.id, passed: true, summary: "Saved Ada Lovelace" },
  });
  assert.equal(uiProof.response.status, 200);

  const braid = await call("/api/scenario/braid", { method: "POST", body: { pageId, parentEventId: uiProof.json.event.id } });
  assert.equal(braid.json.state.scenario, "braided-shared-cause");

  const profile2 = await reproduce({
    taskId: "task:profile-save",
    endpoint: "/api/profile",
    focusId: "focus:profile-save",
    payload: { displayName: "Ada Lovelace" },
  });
  const invite = await reproduce({
    taskId: "task:invite-role",
    endpoint: "/api/invite",
    focusId: "focus:invite-role",
    payload: { role: "Platform Engineer" },
  });
  assert.equal(profile2.response.status, 500);
  assert.equal(invite.response.status, 500);

  const sharedEdit = await call("/api/edit", { method: "POST", body: { pageId } });
  assert.deepEqual(new Set(sharedEdit.json.event.taskIds), new Set(["task:profile-save", "task:invite-role"]));
  assert.equal(sharedEdit.json.event.parents.length, 2);

  const sharedRebuild = await call("/api/rebuild", { method: "POST", body: { editEventId: sharedEdit.json.event.id, pageId } });
  assert.deepEqual(new Set(sharedRebuild.json.event.taskIds), new Set(["task:profile-save", "task:invite-role"]));

  const profileReplay = await call("/api/replay", { method: "POST", body: { taskId: "task:profile-save", pageId, focusId: "focus:profile-save", parentEventId: sharedRebuild.json.event.id } });
  const inviteReplay = await call("/api/replay", { method: "POST", body: { taskId: "task:invite-role", pageId, focusId: "focus:invite-role", parentEventId: sharedRebuild.json.event.id } });
  assert.equal(profileReplay.response.status, 200);
  assert.equal(inviteReplay.response.status, 200);

  state = (await call("/api/state")).json;
  const sourceArtifactIds = new Set(state.events.filter((event) => event.kind === "source.link").map((event) => event.data.sourceArtifactId));
  assert.deepEqual([...sourceArtifactIds], ["source:shared-input-normalizer"]);
  assert.ok(state.events.some((event) => event.kind === "source.edit" && event.taskIds.length === 2));
  assert.ok(state.events.some((event) => event.kind === "runtime.rebuild" && event.taskIds.length === 2));
  assert.ok(state.receipts.every((receipt) => receipt.href.startsWith("#receipt=")));

  console.log("causal-debugger prototype tests passed");
} finally {
  await proto.close();
}
