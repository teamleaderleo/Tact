// Executes pinned owner modules emitted by TypeScript, without runtime rewrites.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [directory, fixturePath] = process.argv.slice(2);
const { ApplicationLaneRuntimeV1 } = await import(pathToFileURL(join(directory, 'application-lane-runtime.js')));
const f = JSON.parse(await readFile(fixturePath, 'utf8'));
const { descriptor, request, response } = f.elatura;
const runtime = new ApplicationLaneRuntimeV1();
assert.equal(runtime.upsertDescriptor(descriptor).outcome, 'inserted');
assert.equal(runtime.beginRequest(request).outcome, 'accepted');
assert.equal(runtime.upsertDescriptor({ ...descriptor, generation: 8 }).outcome, 'generation-replaced');
assert.equal(runtime.acceptResponse(response).outcome, 'stale-generation');
assert.equal(runtime.beginRequest(request).outcome, 'stale-generation');
const current = { ...request, requestId: 'fixture:current', laneGeneration: 8 };
assert.equal(runtime.beginRequest(current).outcome, 'accepted');
assert.equal(runtime.acceptResponse({ ...response, requestId: current.requestId, laneGeneration: 8 }).outcome, 'accepted');
assert.equal(runtime.acceptResponse({ ...response, requestId: current.requestId, laneGeneration: 8 }).outcome, 'unknown-request');

// Observed boundary: same lane generation/request correlates even if an external
// daemon, projection, or work-authority binding changed. Those are absent from
// this owner protocol. This is an adapter obligation, not an Elatura defect.
for (const domain of ['daemon', 'projection', 'work_authority']) {
  const isolated = new ApplicationLaneRuntimeV1();
  isolated.upsertDescriptor(descriptor);
  isolated.beginRequest(request);
  const binding = structuredClone(f.browser_lane_binding);
  if (domain === 'projection') binding.surface.local_id += 1;
  else binding.generations[domain] = 'synthetic-replacement';
  assert.notDeepEqual(binding, f.browser_lane_binding);
  assert.equal(isolated.acceptResponse(response).outcome, 'accepted');
}
assert.equal(response.grantsWorkAuthority, false);
assert.equal(response.authorizesWorkDispatch, false);
console.log('Elatura identity cases passed (external binding fence remains adapter-owned)');
