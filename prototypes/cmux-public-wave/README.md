# Public CMUX product/API wave

This is the connected research and implementation artifact for
[Tact #85](https://github.com/teamleaderleo/Tact/issues/85), audited against public
CMUX main [`ad34966d0641efcacc436ecd264fda9105285c49`](https://github.com/manaflow-ai/cmux/commit/ad34966d0641efcacc436ecd264fda9105285c49)
on 2026-09-20. Three parallel implementation agents covered five lanes; the
coordinator built the pack transaction, reviewed the joins and integrated results.
The first-wave audit preserved the existing CMUX checkout and its unrelated local edits. Subsequent native work uses the coordinated canonical checkout on a dedicated branch.

## Results and ownership

| Requested lane | Existing authority | Delivered artifact | Promotion decision |
| --- | --- | --- | --- |
| A. [Identity](identity/) / [#81](https://github.com/teamleaderleo/Tact/issues/81) | SurfaceCatalog, session snapshots/resume owners, daemon graph and cursors | Five-layer identity map, conformance fixtures/tests, [upstream RFC #13244](https://github.com/manaflow-ai/cmux/issues/13244) | Promote the evidenced catalog-to-persisted-identity join; retain existing IDs |
| B. [Current work](current/) / [#88](https://github.com/teamleaderleo/Tact/issues/88) | Catalog plus explicitly joined owner facts | Bounded deterministic JSON, text second consumer, freshness/provenance tests | Keep Tact prototype until native owner adapters and live mixed local/Cloud verification |
| C. [Templates](templates/) / [#71](https://github.com/teamleaderleo/Tact/issues/71) | Existing layout save/list/get/open/delete and workspace.create | Portable allowlisted template, minimal birth-intent sidecar, live scratch roundtrip receipt | Evolve the existing layout owner; managed/native-session resume needs typed intent |
| D. [PR obligations](obligations/) / [CMUX #13088](https://github.com/manaflow-ai/cmux/issues/13088) | GitHub PR head, threads, comments, reviews and checks | Read-only ledger, recent real CMUX PR fixtures, regression tests | Promote read-side distinctions; no merge gate/reply/resolution automation |
| E. [ExecutionRequest](execution/) / [#89](https://github.com/teamleaderleo/Tact/issues/89) | Existing surface.new_terminal → local/Cloud SurfaceProvider | Pure request planner and bounded observed-receipt adapter for both actual paths | Stop redundant execution API; test existing creation/projection reconciliation next |
| F. [Packs](packs/) / [#47](https://github.com/teamleaderleo/Tact/issues/47), [#48](https://github.com/teamleaderleo/Tact/issues/48), [#77](https://github.com/teamleaderleo/Tact/issues/77) | Existing schema/settings helper/config watcher | Two tiny presets; exact preview, validation, apply, verification, receipt, rollback | Tact prototype; upstream helper defect [#13243](https://github.com/manaflow-ai/cmux/issues/13243) |

Each lane README contains source anchors, exact gaps, runnable examples,
verification scope and unperformed checks. These are Tact prototypes, not a claim
that `cmux current`, `cmux pack`, a new execution service, or a PR merge gate has
shipped upstream.

## Production follow-through

The identity join is implemented in [CMUX PR #13247](https://github.com/manaflow-ai/cmux/pull/13247), based on `b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110`. The shared catalog/VM-tree projection payload adds `stable_surface_id` and `stable_workspace_id` captured from exact current owners. Existing runtime/resource IDs and mutation selectors retain their meaning. Eight native owner tests and a scratch socket regression are authored; native execution and live verification remain pending.

The current-work prototype now has an explicit-socket, read-only collector and consumes those identity fields when present. Its JSON and text consumers share the same reduced payload. A read-only live capture from the existing older tagged build returned 37 resources/projections successfully; see the [aggregate receipt](current/live-read-receipt.json). New native identity fields were absent as expected. The full six-lane suite passes **71 tests**, including 23 current-work/collector tests. This is still a Tact consumer, not a shipped native `cmux current` command.

The settings helper discrepancy discovered by packs is fixed in [CMUX PR #13250](https://github.com/manaflow-ai/cmux/pull/13250). Four actual helper subprocess regressions fail twice before the fix and all pass afterward. The fix reuses the existing generated path reference and adds the tests to the existing skill-contract CI workflow. It does not change the native settings transaction or prove effective UI state.

## Shared contracts

- Owner resource identity, persisted stable identity, runtime binding, projection
  identity and mutation receipt/currentness are separate facts. No aesthetic ID
  renaming, inferred identity from labels, or second resource graph.
- Current-work consumes explicit resource joins and provenance. Missing stable
  identity remains unknown; a local runtime resource ref is not called durable.
- A response that creation succeeded is weaker than process readiness, agent
  progress, durable resume or replay-safe authorization. The execution adapter
  preserves these unknowns for later read-model use.
- PR reply/resolution/outdated state does not establish a fixed finding or current
  head completion. The ledger cannot authorize writes or merges.
- Template slot numbers describe portable layout position, never cloned resource
  identity. Credentials, PIDs, socket tokens, daemon-generation IDs and process
  ancestry do not become portable birth intent.
- Pack receipts are bounded install evidence and private undo bytes. They do not
  become runtime truth, a workflow database or an execution scheduler.

## Verification

Python standard library only. The pack lane also reads pinned objects from a
CMUX Git checkout; set its location explicitly when needed:

```sh
CMUX_SOURCE_REPO=/path/to/cmux python3 prototypes/cmux-public-wave/verify.py
```

The template live proof exercised three scratch workspaces, three surfaces and
nested split geometry through the real layout API, then cleaned up. It ran on the
already-running **0.64.22 (102), `4c190f2c5`** tagged app, not a newly built current-main
binary; see [the receipt](templates/live-receipt.json). Source conformance audits
use the newer pinned upstream SHA above. No Cloud VM was provisioned, no native
app was rebuilt or relaunched, and no user's normal profile was modified by packs.

All model tests are bounded contract regressions. They do not substitute for
native CI, mixed local/Cloud end-to-end testing, managed-agent template roundtrips,
native effective-setting readback or fault injection during creation/projection.
Those promotion gates remain explicit in the owning lanes.
