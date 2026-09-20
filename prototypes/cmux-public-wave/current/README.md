# Current-work read projection (Tact #88 / #52)

Decision: **Tact prototype**, with a narrow native read-service/CLI promotion seam. This does not add or ship `cmux current`. It proves the pure reduction and JSON/text consumer contract; it does not prove the full live local/Cloud product success test.

From the repository root:

```sh
python3 prototypes/cmux-public-wave/current/current.py prototypes/cmux-public-wave/current/fixture.json --now 2026-09-20T15:00:00Z --json
python3 prototypes/cmux-public-wave/current/current.py prototypes/cmux-public-wave/current/fixture.json --now 2026-09-20T15:00:00Z
python3 -m unittest discover -s prototypes/cmux-public-wave/current -v
```

The default text renderer and `--json` consume the same derived payload. `--render-payload` renders previously emitted JSON directly. The fixture is explicitly synthetic and uses current public wire field names.

## Owner map, audited public source

Pinned source: `manaflow-ai/cmux@ad34966d0641efcacc436ecd264fda9105285c49`.

| Fact | Existing owner / seam | Treatment |
| --- | --- | --- |
| Resources, local/Cloud placement, projections, agent badge, lifecycle | [SurfaceSocketCommands catalog export](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceSocketCommands.swift#L1097) | Read the existing `surface.catalog` payload; never store another graph. |
| Cloud freshness, generation/revision, pending write receipts | [Cloud-state export](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceSocketCommands.swift#L1233) | Preserve stale state and opaque cursor; receipt is evidence of pending write, not completion. |
| Atomic catalog + accepted remote graph observation | [SurfaceCatalogExport](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceCatalogModel.swift#L1753) | Native implementation should capture once in the same owner turn. |
| Project path, unread count, workspace-associated PR URLs | [CmuxSidebarProviderWorkspace](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Packages/macOS/CmuxSidebarProviderKit/Sources/CmuxSidebarProviderKit/Snapshot/CmuxSidebarProviderWorkspace.swift#L4) | Optional Codable snapshot adapter joins exact workspace UUID through catalog projections. Workspace PR association stays explicitly workspace-scoped. |
| Existing attention UI | [AttentionQueueSidebar](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Examples/CmuxExtensionSidebarExamples/Sources/CmuxExtensionSidebarExamples/AttentionQueueSidebar.swift#L76) | Already derives unread/notification/connection state; shared native current payload can replace divergent derivation later. |
| Basic linked PR state | [ControlSidebarPullRequestInfo](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Packages/macOS/CmuxControlSocket/Sources/CmuxControlSocket/Coordinator/Sidebar/ControlSidebarPullRequestInfo.swift#L4) | Number/status/URL/label are known; review threads and validated head are not implied. |

Input envelope is `{observed_at, catalog, sidebar_observed_at?, sidebar_workspaces?, facts?}`. `catalog` is the existing socket result. Sidebar records use the existing Codable camelCase fields. Extra facts require explicit `resource_ref`, `kind`, `value`, `owner`, `evidence`, `observed_at`, and `freshness`; native agent/session/attention owners must supply these facts, not a transcript parser. Source evidence points into the exact input with JSON pointers. External evidence remains its original URL/ref.

Local `ref` is a **runtime resource ref** (panel UUID), not the separately persisted stable surface identity. `durable_work_ref` remains null; see the identity lane's missing bridge. Cloud refs are provider-scoped and cursor generation remains separate. Terminal `detail` is a known cwd hint; browser detail is never interpreted as cwd. No repository or work/session identity is guessed from a path or label.

Bounds: default 100 resources, maximum 200; 16 projections, 8 pending receipts, 24 joined facts per resource; CLI input <=2 MB. Omission counts are explicit. Freshness uses a documented prototype 60-second observation TTL and a caller-provided clock for reproducibility; absent/future times are unknown. Cloud stale remains stale. Current human obligations require both current resource observation and current, provenance-bearing attention facts. Unread alone is not a human obligation.

`link_ledger.py` accepts an already-derived PR ledger plus explicit `--resource` and `--expected-head`. It emits facts for this envelope. A head mismatch stays stale; only a current-head actionable finding requiring response emits `review_needed`. It never discovers workspace ownership by guessing. JSON fixtures and ledger adapters are read-only; there is no storage, polling daemon, mutation verb, ranking model, or transcript scraping.

## Validation and remaining proof

Eleven tests cover current/stale/future/missing observations, deterministic row ordering, duplicate identity rejection, exact sidebar join, provenance enforcement, JSON/text reuse, bounds, null optional collections, resolvable pointers, browser cwd exclusion, and head-gated ledger joins.

Live attempt on 2026-09-20: default `cmux ls --json` found no default live socket. The separately running development app was identified by the identity lane as `0.64.22 (102) [4c190f2c5]`, older than the audit pin. A read-only `surface.catalog` request to its known debug socket timed out after 10 seconds. No user workspace data was retained and no app was launched/rebuilt. Thus live multi-session/Cloud validation remains open, not silently substituted by synthetic fixtures.

Promotion: implement a pure native CurrentWorkQueryService over the atomic catalog and existing sidebar/attention owners, add the durable identity bridge from lane A, then expose the same payload in CLI and a debug/sidebar consumer. The thread ledger remains separately sourced with its own observation/head provenance. This prototype is enough to review that boundary, not enough to claim the live success criterion is met.
