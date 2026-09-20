# Public CMUX product/API wave

This is the connected research and implementation artifact for
[Tact #85](https://github.com/teamleaderleo/Tact/issues/85), audited against public
CMUX main [`ad34966d0641efcacc436ecd264fda9105285c49`](https://github.com/manaflow-ai/cmux/commit/ad34966d0641efcacc436ecd264fda9105285c49)
on 2026-09-20. Three parallel implementation agents covered five lanes; the
coordinator built the pack transaction, reviewed the joins and integrated results.
The existing CMUX checkout and its unrelated local edits were preserved.

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
