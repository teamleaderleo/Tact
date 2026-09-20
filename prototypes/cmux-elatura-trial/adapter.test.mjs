import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { CmuxLaneAdapter } from './adapter.mjs';
import { ApplicationLaneRuntimeV1, lifecycle } from './elatura.mjs';
const fixture = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url)));
const at = '2026-09-20T17:01:00.000Z';
function setup() {
  const runtime = new ApplicationLaneRuntimeV1();
  runtime.upsertDescriptor(fixture.descriptor);
  const host = {
    binding: structuredClone(fixture.binding), authority: structuredClone(fixture.authority), effects: [],
    current() { return this.binding; }, currentAuthority() { return this.authority; },
    response() { return { binding: structuredClone(this.binding), health: 'available', changed: true, observedAt: at }; },
    async observeExact() { return this.response(); },
    async jumpExact({ expected, authority, requestId }) {
      if (!isDeepStrictEqual(expected, this.binding) ||
          !isDeepStrictEqual(authority, this.authority)) return { ...this.response(), jumped: false };
      this.effects.push(requestId);
      return { ...this.response(), jumped: true };
    }
  };
  let now = 100;
  const adapter = new CmuxLaneAdapter({ runtime, host, laneRef: fixture.descriptor.laneRef,
    resourceId: fixture.binding.resourceId, registryId: fixture.binding.registryId, clock: () => now });
  let seq = 0;
  function request(operation = 'observe', payload) {
    return { version: 1, requestId: `trial:${++seq}`, laneRef: fixture.descriptor.laneRef,
      laneGeneration: runtime.snapshot().lanes[0].descriptor.generation, operation,
      payload: payload ?? (operation === 'observe' ? { maxItems: 2, maxTextCodeUnits: 100, maxSerializedBytes: 512 } : {}) };
  }
  return { runtime, host, adapter, request, expire() { now = 10001; } };
}
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

test('bounded health/status use the actual Elatura runtime; no host handles escape', async () => {
  const s = setup();
  for (const operation of ['observe', 'status']) {
    const result = await s.adapter.execute(s.adapter.prepare(s.request(operation)));
    assert.equal(result.outcome, 'accepted');
    assert.deepEqual(result.observation, {health: 'available', changed: true, observedAt: at});
  }
  assert.equal(s.adapter.snapshot().reads, 2);
  const publicData = JSON.stringify([s.runtime.snapshot(), s.adapter.snapshot()]);
  for (const value of Object.values(fixture.binding).filter(v => typeof v === 'string')) assert.ok(!publicData.includes(value));
  assert.equal(s.runtime.snapshot().usage.pendingRequests, 0);
});

test('explicit jump selects genuine existing target exactly once, never opens URL', async () => {
  const s = setup(); const ticket = s.adapter.prepare(s.request('activate'), s.host.authority);
  assert.equal((await s.adapter.execute(ticket)).outcome, 'accepted');
  assert.equal((await s.adapter.execute(ticket)).outcome, 'unknown-ticket');
  assert.equal(s.host.effects.length, 1);
});

for (const [name, changes] of Object.entries(fixture.transitions)) {
  test(`${name}: in-flight reply rejected; newly bound read succeeds`, async () => {
    const s = setup(); const deferredRead = deferred(); const oldReply = s.host.response();
    s.host.observeExact = () => deferredRead.promise;
    const pending = s.adapter.execute(s.adapter.prepare(s.request()));
    Object.assign(s.host.binding, changes);
    if (changes.applicationGeneration) s.runtime.upsertDescriptor({ ...fixture.descriptor,
      generation: changes.applicationGeneration, observedAt: '2026-09-20T17:00:30.000Z' });
    deferredRead.resolve(oldReply);
    assert.equal((await pending).outcome, 'stale-binding');
    s.host.observeExact = async () => s.host.response();
    assert.equal((await s.adapter.execute(s.adapter.prepare(s.request()))).outcome, 'accepted');
    assert.equal(s.host.binding.resourceId, fixture.binding.resourceId);
    assert.equal(s.host.authority.workGeneration, fixture.authority.workGeneration);
    assert.equal(s.adapter.snapshot().pending, 0);
  });
  test(`${name}: queued jump cannot dispatch to changed projection`, async () => {
    const s = setup(); const ticket = s.adapter.prepare(s.request('activate'), s.host.authority);
    Object.assign(s.host.binding, changes);
    await s.adapter.execute(ticket);
    assert.equal(s.host.effects.length, 0);
  });
}

test('daemon disconnect backendId=0 denies access; recovery preserves application generation', async () => {
  const s = setup(); s.host.binding.backendId = '0';
  assert.throws(() => s.adapter.prepare(s.request()), /missing-exact-host-binding/);
  Object.assign(s.host.binding, fixture.transitions.daemonRecovery);
  assert.equal((await s.adapter.execute(s.adapter.prepare(s.request()))).outcome, 'accepted');
  assert.equal(s.runtime.snapshot().lanes[0].descriptor.generation, 7);
});

test('cancellation discards delayed response without publishing state', async () => {
  const s = setup(); const read = deferred(); s.host.observeExact = () => read.promise;
  const ticket = s.adapter.prepare(s.request()); const pending = s.adapter.execute(ticket);
  s.adapter.cancel(ticket); read.resolve(s.host.response());
  assert.equal((await pending).outcome, 'cancelled');
  assert.equal(s.runtime.snapshot().usage.pendingRequests, 0);
  assert.equal(s.runtime.snapshot().lanes[0].descriptor.observedAt, fixture.descriptor.observedAt);
});

for (const dimension of ['workGeneration', 'interactionEpoch', 'expiry']) {
  test(`${dimension} independently fences jumps without replacing application or daemon generation`, async () => {
    const s = setup(); const ticket = s.adapter.prepare(s.request('activate'), s.host.authority);
    if (dimension === 'expiry') s.expire(); else s.host.authority[dimension] += '-new';
    assert.equal((await s.adapter.execute(ticket)).outcome, 'expired-authority');
    assert.equal(s.host.effects.length, 0);
    assert.deepEqual(s.host.binding, fixture.binding);
  });
}

test('human interaction at physical dispatch is rejected by atomic host comparison', async () => {
  const s = setup(); const original = s.host.jumpExact.bind(s.host);
  s.host.jumpExact = envelope => { s.host.authority.interactionEpoch = 'human-new'; return original(envelope); };
  const result = await s.adapter.execute(s.adapter.prepare(s.request('activate'), s.host.authority));
  assert.equal(result.outcome, 'expired-authority'); assert.equal(result.effect, 'none');
  assert.equal(s.host.effects.length, 0);
});

test('post-dispatch replacement reports stale result and already performed effect separately', async () => {
  const s = setup(); const original = s.host.jumpExact.bind(s.host);
  s.host.jumpExact = async envelope => {
    const reply = await original(envelope);
    Object.assign(s.host.binding, fixture.transitions.movement);
    return reply;
  };
  const result = await s.adapter.execute(s.adapter.prepare(s.request('activate'), s.host.authority));
  assert.equal(result.outcome, 'stale-binding'); assert.equal(result.effect, 'jumped');
  assert.equal(s.host.effects.length, 1);
});

test('immutable request/authority and unforgeable ticket', async () => {
  const s = setup(); const request = s.request('activate'); const auth = { ...s.host.authority };
  const ticket = s.adapter.prepare(request, auth); request.operation = 'screenshot'; auth.workGeneration = 'wrong';
  assert.equal((await s.adapter.execute({})).outcome, 'unknown-ticket');
  assert.equal((await s.adapter.execute(ticket)).outcome, 'accepted');
});

test('unknown or ambiguous resource/registry/binding never falls back to a label', () => {
  for (const field of ['resourceId', 'registryId', 'webContentsEpoch', 'documentEpoch']) {
    const s = setup(); s.host.binding[field] = field.endsWith('Id') ? 'unrelated' : '';
    assert.throws(() => s.adapter.prepare(s.request()));
  }
});

test('read budgets are enforced by existing Elatura client matcher', async () => {
  const s = setup(); const ticket = s.adapter.prepare(s.request('observe', {maxItems: 1, maxTextCodeUnits: 1, maxSerializedBytes: 1}));
  assert.equal((await s.adapter.execute(ticket)).outcome, 'response-budget-exceeded');
});

test('health recovery is content-free and never marks work complete', async () => {
  const s = setup(); s.host.observeExact = async () => ({ ...s.host.response(), health: 'recovery_needed', raw: 'private body' });
  const result = await s.adapter.execute(s.adapter.prepare(s.request('status')));
  assert.equal(result.outcome, 'accepted'); assert.equal(result.grantsWorkAuthority, false);
  assert.equal(s.runtime.snapshot().lanes[0].descriptor.state, 'recovery_needed');
  assert.ok(!JSON.stringify(s.runtime.snapshot()).includes('private body'));
});

test('change/completion hints reuse event admission, reject duplicates and stale binding', () => {
  const s = setup(); const event = { eventId: 'trial:event:1', laneRef: fixture.descriptor.laneRef,
    eventType: 'possible_completion', observedAt: at, sourceRefs: ['private-content'] };
  assert.equal(s.adapter.admitEvent(fixture.binding, event).outcome, 'accepted');
  assert.equal(s.adapter.admitEvent(fixture.binding, event).outcome, 'duplicate-event');
  Object.assign(s.host.binding, fixture.transitions.movement);
  assert.equal(s.adapter.admitEvent(fixture.binding, event).outcome, 'stale-binding');
  assert.deepEqual(s.runtime.snapshot().lanes[0].lastEvent.sourceRefs, []);
  assert.equal(s.adapter.snapshot().reads, 0);
});

test('no-change reads are counted; idle/event handling creates no polling reads', async () => {
  const s = setup(); assert.equal(s.adapter.snapshot().reads, 0);
  s.host.observeExact = async () => ({...s.host.response(), changed: false});
  await s.adapter.execute(s.adapter.prepare(s.request()));
  assert.equal(s.adapter.snapshot().noChangeReads, 1);
  assert.equal(s.adapter.snapshot().reads, 1);
});

test('missing exact jump capability returns unsupported; no ambient browser automation', async () => {
  const s = setup(); delete s.host.jumpExact;
  const result = await s.adapter.execute(s.adapter.prepare(s.request('activate'), s.host.authority));
  assert.equal(result.outcome, 'unsupported-host-jump'); assert.equal(result.effect, 'none');
});

test('bounded pending ownership and cleanup', () => {
  const s = setup(); const tickets = Array.from({length: 16}, () => s.adapter.prepare(s.request()));
  assert.throws(() => s.adapter.prepare(s.request()), /pending-limit/);
  tickets.forEach(ticket => s.adapter.cancel(ticket));
  assert.equal(s.adapter.snapshot().pending, 0); assert.equal(s.runtime.snapshot().usage.pendingRequests, 0);
});

test('cancelled in-flight request cannot erase a reused request ID', async () => {
  const s = setup(); const read = deferred(); const request = s.request();
  s.host.observeExact = () => read.promise;
  const ticket = s.adapter.prepare(request); const pending = s.adapter.execute(ticket);
  s.adapter.cancel(ticket);
  assert.throws(() => s.adapter.prepare(request), /duplicate-request/);
  read.resolve(s.host.response()); await pending;
  s.host.observeExact = async () => s.host.response();
  assert.equal((await s.adapter.execute(s.adapter.prepare(request))).outcome, 'accepted');
});

test('invalid payload and lost jump acknowledgement stay content-free with uncertain effect', async () => {
  const s = setup(); s.host.jumpExact = async () => { throw new Error('secret raw application body'); };
  const result = await s.adapter.execute(s.adapter.prepare(s.request('activate'), s.host.authority));
  assert.equal(result.effect, 'unknown'); assert.ok(!JSON.stringify(result).includes('secret'));
  assert.equal(s.adapter.snapshot().pending, 0);
});

test('old-generation cleanup cannot cancel a current runtime request with the same ID', async () => {
  const s = setup(); const read = deferred(); const request = s.request(); const oldReply = s.host.response();
  s.host.observeExact = () => read.promise;
  const pending = s.adapter.execute(s.adapter.prepare(request));
  s.runtime.upsertDescriptor({...fixture.descriptor, generation: 8});
  Object.assign(s.host.binding, fixture.transitions.navigation);
  assert.equal(s.runtime.beginRequest({...request, laneGeneration: 8}).outcome, 'accepted');
  read.resolve(oldReply); assert.equal((await pending).outcome, 'stale-binding');
  assert.equal(s.runtime.snapshot().usage.pendingRequests, 1);
});

test('#81 shared binding fixture admits observation but unknown work authority cannot jump', async () => {
  if (!process.env.IDENTITY_ROOT) throw new Error('Set IDENTITY_ROOT to the pinned #81 Tact checkout');
  const shared = JSON.parse(readFileSync(`${process.env.IDENTITY_ROOT}/prototypes/cmux-identity-conformance/fixtures.json`)).browser_lane_binding;
  const s = setup();
  s.runtime.clear();
  s.runtime.upsertDescriptor({...fixture.descriptor, laneRef: shared.lane_ref, generation: shared.generations.application});
  Object.assign(s.host.binding, {resourceId: shared.surface.backend_resource_id,
    backendId: String(shared.surface.backend_id), surfaceId: String(shared.surface.local_id),
    daemonGeneration: shared.generations.daemon, applicationGeneration: shared.generations.application});
  s.host.authority = { ...fixture.authority, workGeneration: shared.generations.work_authority };
  const adapter = new CmuxLaneAdapter({runtime: s.runtime, host: s.host, laneRef: shared.lane_ref,
    resourceId: shared.surface.backend_resource_id, registryId: fixture.binding.registryId, clock: () => 100});
  const request = {...s.request(), laneRef: shared.lane_ref};
  assert.equal((await adapter.execute(adapter.prepare(request))).outcome, 'accepted');
  assert.throws(() => adapter.prepare({...request, requestId: 'shared:jump', operation: 'activate', payload: {}}, s.host.authority), /expired-authority/);
});

for (const blocker of lifecycle.applicationLaneLifecycleBlockers) {
  test(`existing lifecycle owner conservatively blocks ${blocker}`, () => {
    const facts = lifecycle.createApplicationLaneLifecycleFactsV1(fixture.descriptor, {
      browserResidency: 'background', recovery: 'verified', freezeEligibility: 'blocked',
      discardEligibility: 'blocked', blockers: [blocker] });
    const request = lifecycle.createApplicationLaneResidencyRequestV1(fixture.descriptor, 'reclaimable');
    const result = lifecycle.planApplicationLaneResidencyV1(fixture.descriptor, facts, request,
      {canWake: false, canFreeze: false, canDiscard: false, canRecoverProjection: false});
    assert.ok(!['freeze', 'discard'].includes(result.action));
  });
}
