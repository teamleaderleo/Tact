# Identity conformance: current public owners

Owner: [Tact #81](https://github.com/teamleaderleo/Tact/issues/81). Audited public upstream `ad34966d0641efcacc436ecd264fda9105285c49` on 2026-09-20. This is a Tact conformance prototype, not a new identity owner or a mutation API.

## Concrete map

| Layer | Local terminal/browser | Resumable terminal agent | Cloud/cmux-tui |
|---|---|---|---|
| Durable semantic identity | `Panel.stableSurfaceId`; `Workspace.stableId` persisted separately from runtime IDs | Same surface identity plus `(kind, checkpointId)` for the provider conversation; two different things | Registry public IDs (`term_…`, workspace public ID etc.), namespaced by machine in `SurfaceResourceID`; persistent registry session public ID |
| Catalog resource identity | `local/terminal/<panel.id>` or `local/browser/<panel.id>` | Same runtime-keyed resource; checkpoint is not a catalog ID | `<machine>/terminal/<term_…>`; existing daemon graph is authoritative |
| Generation/currentness | No public local generation/cursor contract found in these catalog exports; don't invent one | Binding `updatedAt` is observation metadata, not a daemon generation or grant of authority | `CloudVMCursor {generation, revision}`; revision string represents UInt64, ordered only within one generation; provider lifecycle/refresh generations separately fence in-flight local callbacks |
| Runtime binding | Current panel UUID and underlying terminal/PTy or WebView; do not persist a PID as semantic identity | Current process, launch flavor and owner-managed resume claim; native session process-store UUID is a runtime handle | Numeric surface ID hidden behind `term_…` attach resolution; transport/link and process are runtime state |
| Projection | Window/workspace/pane/Bonsplit tab/panel placement; CLI `workspace:N`, `surface:N` etc. are convenience selectors | Same placement; agent session can be resumed into a new current surface | Local mirror panel/workspace IDs plus exact daemon workspace/tab/screen/pane IDs; one resource can have multiple remote views |
| Mutation evidence | No equivalent catalog-wide authoritative cursor in audited payload | Restore claims/approval state stay in resume owner, never copied as template authority | Graph cursor plus pending mutation receipt for create/rename; pending row is read-your-write evidence, not another graph |

These are related identities, not synonyms. Do not rename existing IDs for aesthetic consistency.

## Survival and important asymmetries

- Local move keeps the same panel/resource and moves its projection. Local close removes its catalog resource. **Zero projections does not preserve an ordinary local terminal process.** The remote close/reopen rule cannot be generalized to local resources.
- Session restore can adopt `stableSurfaceId` when it is not live elsewhere; colliding restores get a fresh identity. Workspace runtime ID reuse is also conditional. Remote projection records explicitly remap old panel IDs to new panel IDs.
- Browser URL, profile, zoom, history and mute state belong to private session restore state. A portable template needs only an approved destination; it must not copy profile/auth/history as birth identity.
- Cloud projection close/reopen can preserve the daemon resource. Daemon generation replacement invalidates old receipts even if the new revision is numerically larger. Registry-backed IDs are meaningful only while that underlying registry/resource survives; this is not a guarantee that a PTY survives a daemon restart.
- A machine move changes the machine component of catalog identity. No cross-machine universal work ID is proven by this audit; that requires a migration product contract. This prototype does not manufacture one.
- Native agent UI `AgentSessionProcessStore.start` creates a fresh UUID. `AgentSessionRunningSession` distinguishes it from e.g. `openCodeSessionID`. `SessionAgentSessionPanelSnapshot` persists renderer/provider/cwd only. A process-store UUID must not be presented as a durable provider conversation ID.

## Source evidence

All links pin the audited public commit.

- [Resource/projection distinction and wire resource IDs](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceCatalogModel.swift#L3), [cursor](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceCatalogModel.swift#L103), [mutation authority and receipts](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceCatalogModel.swift#L1473).
- [Local keys and close behavior](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/LocalSurfaceProvider.swift#L50), [remote restore old/new projection mapping](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/Workspace%2BSurfaceCatalog.swift#L31).
- [Persisted panel identity](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L1712), [workspace identity and Cloud binding](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L1778), [collision-aware stable adoption](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Workspace%2BSessionRestoreIdentity.swift#L12).
- [Resume binding fields](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L270), [canonical managed session identity](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SurfaceResumeBindingSnapshot%2BManagedSessionIdentity.swift#L3).
- [Cloud attach numeric-ID bridge](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/CmuxTuiSurfaceProvider%2BManualMirror.swift#L7), [persistent registry identity and fresh generation](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/cmux-tui/crates/cmux-tui-core/src/workspace_registry.rs#L2697).
- [Public resource/projection JSON](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceSocketCommands.swift#L1148), [cursor/freshness/pending receipts](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceSocketCommands.swift#L1233).
- [Native process-store UUID](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Panels/AgentSessionProcessStore.swift#L23), [runtime/provider distinction](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Panels/AgentSessionRunningSession.swift#L3), [native session persistence](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionAgentSessionPanelSnapshot.swift#L3).

## One missing public contract

`surface.catalog` exports runtime-keyed local resource and projection IDs, but no join to the existing persisted stable surface/workspace identities. A read-only current-work consumer cannot reliably reconnect a saved local reference after restore when the panel UUID changes. Labels/cwd cannot fill that hole: two same-named surfaces in the same directory are valid.

The [RFC draft](upstream-rfc.md) proposes an additive owner-sourced identity join, not replacing resource IDs or widening mutation authority. This is the only identity RFC recommended by this lane. Cross-machine universal identity remains an explicit stop pending a concrete migration flow.

## Verification

```sh
python3 -m unittest discover -s prototypes/cmux-public-wave/identity -p 'test_*.py'
```

Ten tests pass: same-generation receipt coverage, replacement generation fencing, UInt64 precision/rejections, local/remote close asymmetry, projection reopen, restore binding join, collision rejection, label non-identity and slash-bearing resource keys. Fixtures are synthetic explanatory inputs grounded in the source, **not captures or native Swift/Rust execution**. The helper is a conservative reader specification; it does not claim byte-for-byte decoder parity (e.g. source decoder permits some whitespace/numeric compatibility forms this reader rejects).

Promotion: upstream RFC for the missing stable join; retain model/fixtures in Tact until the API owner picks the exact payload location. No native change is claimed. No open code-review finding at handoff; native conformance and Cloud restart execution remain unrun.
