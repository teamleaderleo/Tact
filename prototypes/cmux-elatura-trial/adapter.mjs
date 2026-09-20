// CMUX-specific experimental transport. Elatura owns protocol/runtime admission.
// All host identifiers stay in memory; public results contain no host handles.
const fields = ['registryId', 'resourceId', 'daemonGeneration', 'backendId',
  'surfaceId', 'webContentsEpoch', 'documentEpoch', 'windowId', 'workspaceId', 'paneId'];
const healthStates = { available: 'active', unavailable: 'unavailable',
  recovery_needed: 'recovery_needed', drifted: 'drifted' };
const noAuthority = { grantsWorkAuthority: false, authorizesWorkDispatch: false };
const freeze = value => Object.freeze(structuredClone(value));

function binding(value) {
  if (!value || fields.some(key => typeof value[key] !== 'string' ||
      !value[key] || value[key].length > 240) ||
      !Number.isSafeInteger(value.applicationGeneration) || value.applicationGeneration < 1 ||
      !/^[1-9][0-9]*$/.test(value.backendId) || BigInt(value.backendId) > 2n ** 64n - 1n) {
    throw new Error('missing-exact-host-binding');
  }
  return freeze(Object.fromEntries([...fields, 'applicationGeneration'].map(key => [key, value[key]])));
}
const same = (a, b) => [...fields, 'applicationGeneration'].every(key => a[key] === b[key]);

/** Host must supply synchronous current owner snapshots and atomic jumpExact.
 * This is an injected experiment port, not a claim that a public CMUX API exists.
 * runtime is the existing ApplicationLaneRuntimeV1, already owning the lane.
 */
export class CmuxLaneAdapter {
  #runtime; #host; #laneRef; #resourceId; #registryId; #clock; #pending = new Map();
  #counts = { reads: 0, noChangeReads: 0, jumps: 0, rejected: 0, events: 0 };
  constructor({ runtime, host, laneRef, resourceId, registryId, clock = Date.now }) {
    this.#runtime = runtime; this.#host = host; this.#laneRef = laneRef;
    this.#resourceId = resourceId; this.#registryId = registryId; this.#clock = clock;
  }
  #descriptor() {
    return this.#runtime.snapshot().lanes.find(row => row.descriptor.laneRef === this.#laneRef)?.descriptor;
  }
  #current() {
    const current = binding(this.#host.current(this.#resourceId));
    if (current.resourceId !== this.#resourceId || current.registryId !== this.#registryId ||
        current.applicationGeneration !== this.#descriptor()?.generation) throw new Error('stale-binding');
    return current;
  }
  #authority(expected) {
    const current = this.#host.currentAuthority();
    return expected && typeof expected.workGeneration === 'string' && expected.workGeneration &&
      typeof expected.interactionEpoch === 'string' && expected.interactionEpoch &&
      Number.isSafeInteger(expected.expiresAtMs) && expected.expiresAtMs > this.#clock() &&
      current?.workGeneration === expected.workGeneration &&
      current?.interactionEpoch === expected.interactionEpoch &&
      current?.expiresAtMs === expected.expiresAtMs;
  }
  #reject(outcome, effect = 'none') {
    this.#counts.rejected++;
    return Object.freeze({ outcome, effect, ...noAuthority });
  }
  prepare(request, authorization = null) {
    if (request.laneRef !== this.#laneRef || !['status', 'observe', 'activate'].includes(request.operation)) {
      throw new Error('unsupported-request');
    }
    if (this.#pending.size >= 16) throw new Error('pending-limit');
    if ([...this.#pending.values()].some(record => record.request.requestId === request.requestId)) {
      throw new Error('duplicate-request');
    }
    const expected = this.#current();
    if (request.laneGeneration !== expected.applicationGeneration) throw new Error('stale-binding');
    const authority = authorization && freeze(authorization);
    if (request.operation === 'activate' && !this.#authority(authority)) throw new Error('expired-authority');
    const admitted = this.#runtime.beginRequest(request);
    if (admitted.outcome !== 'accepted') throw new Error(admitted.outcome);
    // Caller cannot change the admitted request, target or authority through the ticket.
    const ticket = Object.freeze({});
    this.#pending.set(ticket, { request: admitted.value, expected, authority, running: false, cancelled: false });
    return ticket;
  }
  cancel(ticket) {
    const record = this.#pending.get(ticket);
    if (!record) return false;
    if (this.#descriptor()?.generation === record.request.laneGeneration) this.#runtime.cancelRequest(record.request.requestId);
    record.cancelled = true;
    // Retain a bounded tombstone while the physical request can still reply.
    if (!record.running) this.#pending.delete(ticket);
    return true;
  }
  async execute(ticket) {
    const record = this.#pending.get(ticket);
    if (!record || record.running) return this.#reject('unknown-ticket');
    record.running = true;
    const { request, expected, authority } = record;
    let effect = 'none';
    try {
      if (!same(expected, this.#current())) return this.#reject('stale-binding');
      const jumping = request.operation === 'activate';
      if (jumping && !this.#authority(authority)) return this.#reject('expired-authority');
      let reply;
      if (jumping) {
        // Atomic owner-side compare-and-jump is mandatory. Never reopen a URL,
        // fall back to a title, or retry against a replacement projection.
        if (!this.#host.jumpExact) return this.#reject('unsupported-host-jump');
        effect = 'unknown';
        reply = await this.#host.jumpExact({ expected, authority, requestId: request.requestId });
        effect = reply.jumped === true ? 'jumped' : reply.jumped === false ? 'none' : 'unknown';
        if (effect === 'jumped') this.#counts.jumps++;
      } else {
        this.#counts.reads++;
        reply = await this.#host.observeExact(expected);
      }
      if (record.cancelled) return this.#reject('cancelled', effect);
      if (!same(expected, this.#current()) || !same(expected, binding(reply.binding))) {
        return this.#reject('stale-binding', effect);
      }
      if (jumping && !this.#authority(authority)) return this.#reject('expired-authority', effect);
      if (jumping && effect !== 'jumped') return this.#reject('host-refused', effect);
      if (!Object.hasOwn(healthStates, reply.health) || typeof reply.changed !== 'boolean') {
        return this.#reject('invalid-observation', effect);
      }
      if (!jumping && !reply.changed) this.#counts.noChangeReads++;
      const state = healthStates[reply.health];
      const payload = request.operation === 'status'
        ? { ...this.#descriptor(), state, observedAt: reply.observedAt }
        : jumping ? { receiptRef: `cmux:jump:${request.requestId}` }
          : { observationRef: `cmux:observation:${request.requestId}`, freshness: 'fresh',
            contentType: 'application/json', content: [{ health: reply.health, changed: reply.changed }],
            omitted: true, sourceRefs: [] };
      const response = { ...request, payload, outcome: 'ok', state,
        observedAt: reply.observedAt, sourceRefs: [], ...noAuthority };
      const admitted = this.#runtime.acceptResponse(response);
      const observation = !jumping && admitted.outcome === 'accepted'
        ? Object.freeze({ health: reply.health, changed: reply.changed, observedAt: reply.observedAt }) : null;
      return Object.freeze({ outcome: admitted.outcome, effect, observation, ...noAuthority });
    } catch (error) {
      // Transport errors and raw host payloads never escape into public evidence.
      return this.#reject(error.message === 'stale-binding' ? 'stale-binding' : 'host-unavailable-or-invalid', effect);
    } finally {
      if (!record.cancelled && this.#descriptor()?.generation === request.laneGeneration) {
        this.#runtime.cancelRequest(request.requestId);
      }
      this.#pending.delete(ticket);
    }
  }
  admitEvent(expected, event) {
    try {
      if (!same(binding(expected), this.#current()) || event.laneRef !== this.#laneRef) {
        return this.#reject('stale-binding');
      }
      // Rebuild the content-free event; host refs cannot leak through sourceRefs.
      const admitted = this.#runtime.admitEvent({ version: 1, eventId: event.eventId,
        laneRef: this.#laneRef, laneGeneration: expected.applicationGeneration,
        eventType: event.eventType, observedAt: event.observedAt,
        confidence: 'exact', freshness: 'fresh', sourceRefs: [], ...noAuthority });
      if (admitted.outcome === 'accepted') this.#counts.events++;
      return Object.freeze({ outcome: admitted.outcome, ...noAuthority });
    } catch { return this.#reject('host-unavailable-or-invalid'); }
  }
  snapshot() { return Object.freeze({ ...this.#counts, pending: this.#pending.size, ...noAuthority }); }
}
