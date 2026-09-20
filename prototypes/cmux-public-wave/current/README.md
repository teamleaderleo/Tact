# Current-work read projection (Tact #88 / #52)

Decision: **Tact prototype**, with a narrow native read-service/CLI promotion seam. This does not add or ship `cmux current`. It proves the pure reduction and JSON/text consumer contract; it does not prove the full live local/Cloud product success test.

From the repository root:

```sh
python3 prototypes/cmux-public-wave/current/current.py prototypes/cmux-public-wave/current/fixture.json --now 2026-09-20T15:00:00Z --json
python3 prototypes/cmux-public-wave/current/current.py prototypes/cmux-public-wave/current/fixture.json --now 2026-09-20T15:00:00Z
python3 -m unittest discover -s prototypes/cmux-public-wave/current -v
```

The default text renderer and `--json` consume the same derived payload. `--render-payload` renders previously emitted JSON directly. The fixture is explicitly synthetic and uses current public wire field names.

## Read-only collection from an explicitly selected app

```sh
python3 prototypes/cmux-public-wave/current/collector.py --socket /exact/tagged/cmux.sock --json
python3 prototypes/cmux-public-wave/current/collector.py --socket /exact/tagged/cmux.sock
python3 prototypes/cmux-public-wave/current/collector.py --socket /exact/tagged/cmux.sock --envelope > /explicit/output/capture.json
```

The collector sends exactly one newline-framed v2 `surface.catalog` request with `refresh: false`. It neither discovers a default socket nor retries, refreshes Cloud, scans processes, reads transcripts, or writes owner state. The default total deadline is 10 seconds (maximum 60); the entire response is capped at 2 MB. It checks response ID, success, required catalog arrays, and framing. `--envelope` explicitly exports the capture for replay; otherwise it emits the projection or renders that exact projection as text. No capture is automatically stored.

Optional `--sidecar path.json` accepts only `sidebar_observed_at`, `sidebar_workspaces`, and `facts`, supplied explicitly from public owners. It cannot replace the catalog or its observation timestamp. Sidecar timestamps are preserved, and collection metadata marks the sidecar as a separate observation. This external collector cannot claim the native atomic multi-owner snapshot proposed below.

The protocol was checked against upstream `CLI/SocketClient+V2.swift`: the v2 request is `{id, method, params}` followed by a newline; the result is `{id, ok, result}` followed by a newline. Fake-socket tests prove framing and bounded failure handling. They do not establish the cause of the earlier live timeout, or prove that a currently running app supports the identity bridge.

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

Local `ref` remains the **runtime resource ref** (panel UUID), even when a native catalog projection includes optional `stable_surface_id` and `stable_workspace_id`. Both fields are preserved on each projection. `durable_surface_id` exposes an unambiguous local surface identity when present; conflicting local stable IDs are rejected. Old catalogs yield null. `durable_work_ref` remains null: a durable surface does not establish a durable work item. Cloud refs remain provider-scoped; their local projection stable IDs never become the Cloud resource's identity. Cursor generation remains separate. JSON and text both expose these distinctions. Terminal `detail` is a known cwd hint; browser detail is never interpreted as cwd. No repository or work/session identity is guessed from a path or label.

Bounds: default 100 resources, maximum 200; 16 projections, 8 pending receipts, 24 joined facts per resource; CLI input <=2 MB. Omission counts are explicit. Freshness uses a documented prototype 60-second observation TTL and a caller-provided clock for reproducibility; absent/future times are unknown. Cloud stale remains stale. Current human obligations require both current resource observation and current, provenance-bearing attention facts. Unread alone is not a human obligation.

`link_ledger.py` accepts an already-derived PR ledger plus explicit `--resource` and `--expected-head`. It emits facts for this envelope. A head mismatch stays stale; only a current-head actionable finding requiring response emits `review_needed`. It never discovers workspace ownership by guessing. JSON fixtures and ledger adapters are read-only; there is no storage, polling daemon, mutation verb, ranking model, or transcript scraping.

## Validation and remaining proof

Twenty-three tests cover current/stale/future/missing observations, deterministic row ordering, duplicate identity rejection, exact sidebar join, provenance enforcement, JSON/text reuse, bounds, null optional collections, resolvable pointers, browser cwd exclusion, head-gated ledger joins, stable local identity across runtime rebinding, Cloud projection identity separation, and fake Unix socket collection. Collector regressions include fragmented frames, byte limits, one total deadline despite continuing byte arrival, error/mismatched responses, and preserving separately observed sidecar timestamps.

Live attempt on 2026-09-20: default `cmux ls --json` found no default live socket. The separately running development app was identified by the identity lane as `0.64.22 (102) [4c190f2c5]`, older than the audit pin. A read-only `surface.catalog` request to its known debug socket timed out after 10 seconds. No user workspace data was retained and no app was launched/rebuilt. Thus live multi-session/Cloud validation remains open, not silently substituted by synthetic fixtures.

Promotion: implement a pure native CurrentWorkQueryService over the atomic catalog and existing sidebar/attention owners, add the durable identity bridge from lane A, then expose the same payload in CLI and a debug/sidebar consumer. The thread ledger remains separately sourced with its own observation/head provenance. This prototype is enough to review that boundary, not enough to claim the live success criterion is met.

## Native promotion seam, audited at b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110

The next native slice can put pure Sendable/Codable input/output values and reduction in the existing `Packages/macOS/CmuxCore` package, with standalone Swift Testing tests. An injected `Sources/Surfaces/CurrentWorkQueryService.swift` should capture existing owners synchronously in one main-actor turn, then reduce/encode off-main. A new read-only `current.list` socket method can serve `cmux current --json` and its text rendering. **These native current-work files/commands are a design, not shipped by this prototype.**

Capture `SurfaceCatalog.export`, `AppDelegate.surfaceCatalogWorkspaces()`, the notification owner's existing `SidebarUnreadSnapshot`, and `AgentChatTranscriptService.sessionRecords(workspaceID: nil)`. The latter is an in-memory registry read; do not call process observation, transcript reading, or binding refresh during this query. Local catalog resources currently have `agent: nil`, so a catalog-only implementation cannot provide useful local agent attention.

Join the registry's `surfaceID` as an exact UUID to catalog `projection.panelID`. Do not fall back to the registry's stored workspace ID to assign a session to a particular resource: that binding can be stale after moves/restores. `AgentChatSessionRecord` already owns `sessionID`, `agentKind`, state, `hasHookLifecycleState`, `lastActivityAt`, and monotonic `version`. Preserve these as evidence; process-observed idle does not prove hook lifecycle state. Only an exactly bound, current, hook-established `needsInput` should produce a possible human obligation. Exclude transcript paths, PIDs, and transcript-derived titles from this slice.

Known PR summaries come from `Workspace.sidebarPullRequestsInDisplayOrder()` and retain workspace association scope. No head SHA, review response obligation, or CI conclusion is inferred from that summary. `SidebarUnreadSnapshot.unreadSurfaceKeys` can distinguish surface unread from workspace-wide unread; neither is sufficient by itself to imply a human obligation. Preserve Cloud observation freshness, generation/revision, and pending write receipts from the catalog export.

Native wiring requires the socket worker dispatch/capability list, `ControlCommandExecutionPolicy`'s off-main lane, CLI dispatch/help, and app/unit PBX membership for new app files. CmuxCore supplies a standalone test seam; managed native build and `cmux-unit` compilation remain necessary to validate the actual owner adapter. The current CLI imports CmuxFoundation rather than CmuxCore, so a shared typed renderer needs explicit Core product linkage, or the first text consumer can consume the emitted JSON object.
