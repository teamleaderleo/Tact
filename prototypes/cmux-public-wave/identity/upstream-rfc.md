# RFC: expose the existing stable local surface/workspace identity in read projections

A reader of `surface.catalog` can retain a local resource reference such as `local/terminal/<panel UUID>`, but cannot reconnect that reference after restore if the runtime panel UUID changes. CMUX already owns the required durable identity internally. This proposes exposing its relationship to the current projection; it does not propose another ID service or a replacement resource grammar.

Audited public main: `ad34966d0641efcacc436ecd264fda9105285c49` (2026-09-20). Related: [Tact identity investigation](https://github.com/teamleaderleo/Tact/issues/81), [current-work read model](https://github.com/teamleaderleo/Tact/issues/88).

## Existing contract and concrete gap

1. [LocalSurfaceProvider](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/LocalSurfaceProvider.swift#L50) keys resources by the current panel UUID.
2. [SessionPanelSnapshot](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L1712) separately persists `stableSurfaceId`; [SessionWorkspaceSnapshot](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L1786) separately persists `stableId`.
3. [Restore](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Workspace%2BSessionRestoreIdentity.swift#L12) adopts stable surface identity when non-colliding. [Remote projection restoration](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/Workspace%2BSurfaceCatalog.swift#L38) explicitly has an old-to-new panel mapping.
4. [Public catalog resource and projection payloads](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceSocketCommands.swift#L1148) expose resource, workspace, panel and remote placement IDs, without this persisted local identity join.

A current-work view/evidence bookmark should be able to retain the same semantic local surface across restore and then discover its current runtime binding. Matching on label or cwd would silently confuse two ordinary same-named tabs.

## Smallest proposed addition

Add optional `stable_surface_id` and `stable_workspace_id` to the projection read payload, sourced directly from the current panel/workspace owners in the same accepted export. The exact field location is open: an existing canonical workspace/surface read descriptor can supply them instead if all readers can join it without scraping session files.

```json
{
  "resource": "local/terminal/<current-panel-uuid>",
  "surface_id": "<current-panel-uuid>",
  "workspace_id": "<current-workspace-uuid>",
  "stable_surface_id": "<persisted-stable-surface-uuid>",
  "stable_workspace_id": "<persisted-stable-workspace-uuid>"
}
```

Keep `resource`, `surface_id`, and selector behavior unchanged. Absence means unknown; a consumer must not synthesize durable identity from a name, path, PID or runtime UUID. A duplicated/restored instance that collides with a live stable identity keeps the owner's fresh identity behavior.

For Cloud projections, the machine-namespaced daemon public resource ID remains the resource identity; local stable IDs describe the local projection, not a new Cloud graph. Existing cursor generations and mutation admission remain authoritative. Reading a stable ID grants no mutation authority and is not a stale-handle escape hatch.

## Acceptance fixtures

- A local surface moves between panes/workspaces: surface identity survives; placement updates.
- A saved surface restores under a new panel UUID: stable ID survives when valid; catalog exposes its new runtime binding.
- A copied restore conflicts with a live identity: no duplicate stable ID is published.
- Two surfaces share label/cwd: an exact durable join remains unambiguous.
- A Cloud resource closes/reopens its local mirror: daemon identity is unchanged; local projection IDs may change.
- An old Cloud cursor cannot authorize an effect after generation replacement.

The [Tact prototype and full identity map](https://github.com/teamleaderleo/Tact/tree/codex/cmux-public-wave-20260920/prototypes/cmux-public-wave/identity) model these transitions and the absence of today's public join with ten passing deterministic synthetic-fixture tests. It is evidence for the contract question, not a claim that current native tests execute the proposed fields.

## Boundaries / alternatives

Documenting the internal stable ID alone leaves the external join unavailable. Renaming local resource keys to stable UUIDs would unnecessarily alter existing consumers. This additive join is narrower. A universal work ID across local/Cloud migration is out of scope until an actual migration requires it.
