# Identity/lifetime conformance, v1

Read-only [Tact #81](https://github.com/teamleaderleo/Tact/issues/81) slice for
[#87](https://github.com/teamleaderleo/Tact/issues/87). This executes existing
owners rather than introducing a resource graph or public protocol. It extends
the earlier `cmux-public-wave/identity` synthetic audit with production execution.

| Inspected source | Immutable revision |
|---|---|
| manaflow-ai/cmux | `b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110` |
| manaflow-ai/cmux-browser | `6696b66ec83925c616f869a2d4f89454046b4eb9` |
| teamleaderleo/elatura | `b323290a0532b4080e468ab30d3a29bb7bf8d2fa` |

## Identity/lifetime matrix

“Durable” is bounded by the owning resource/store's lifetime, never a promise of
universal identity across machines, registry replacement, or destructive close.
Every source link below pins the revision above.

| Representative object / canonical owner | Durable identifier | Runtime identifier | Generation/currentness domain | Current projection | Recovery route |
|---|---|---|---|---|---|
| Local terminal / `Workspace` panel, `LocalSurfaceProvider` → `SurfaceCatalog` | Persisted `SessionPanelSnapshot.stableSurfaceId`; workspace `stableId`. Catalog key itself is runtime-based. [N1][n1] [N2][n2] | `panel.id` UUID, PTY/process; `local/terminal/<panel UUID>` | No daemon generation. Live panel ownership and collision exclusion govern restore. | Workspace/panel UUID; pane/Bonsplit placement. Moving transfers the same resource. | Restore creates a panel, then adopts the stable ID unless already live. Ordinary close ends its local resource; reopening is reconstruction. [N3][n3] [N4][n4] |
| Native browser / `BrowserPanel` + session persistence | Same persisted `stableSurfaceId` mechanism; catalog `local/browser/<panel UUID>`. [N1][n1] [N2][n2] | Panel UUID and web-view instance | Panel lifetime and page navigation are distinct; no daemon generation for ordinary local page | Native workspace/panel/pane | Persisted browser state reconstructs the page; it does not preserve the renderer or authenticated application work. Stable-ID adoption remains collision-aware. [N3][n3] |
| Resumable agent terminal / resume binding + provider session owner | Surface stable ID **and separately** binding `kind + checkpointId` (for `source=agent-hook`); Pi/OMP UUID and JSONL path normalize to the same session. [N5][n5] | Current panel UUID/process/TTY, launch command | Provider conversation identity and resume approval/claim are separate from process and daemon epochs. No work-authority generation is established by these fields. | Binding joins session to the terminal; labels/cwd are metadata. | Restore consumes binding/restorable-agent snapshot; canonical session comparison prevents borrowing a different checkpoint's launch state. Collision-aware panel adoption still applies. [N6][n6] |
| Cloud terminal / cmux-tui `Mux` + `WorkspaceRegistry`; native catalog is a projection | Provider `term_*` under machine/session/registry ownership; terminal registry also tracks `terminal_id` + incarnation. Workspace public ID differs from numeric row ID. [C1][c1] | Numeric raw attach `surfaceID`; native mirror panel UUID | Opaque daemon `CloudVMCursor.generation` + UInt64 revision; registry identity is an additional store boundary. | Zero/many `tab_*` views, remote workspace/screen/pane; optional native projections | Resolve durable terminal to current numeric surface; if no placement, ensure a view and resolve again. Restore remaps local panel IDs while retaining remote resource/tab refs. Missing transport is retryable, not proof of exit. [C2][c2] [C3][c3] |
| CMUX Browser web surface / canonical tab graph + `WindowModel`; renderer owns actual `WebContents` | `SurfaceTab.backend_resource_id` is a **`tab_*` identity**; empty means not yet canonically associated. It is not a URL, profile, terminal ID, or work item. [B1][b1] [B2][b2] | `SurfaceTab.id` local handle; `backend_id` daemon-local numeric surface; `WebContents` binding | Registry identity + daemon boot generation; frontend connection epoch; application/document navigation is a separate adapter domain | Window/workspace/screen/pane/tab; `web_contents_by_surface_` resolves local surface to genuine page | Clearing canonical numeric IDs retains durable tab ID; topology reconciles by that ID. Cross-window adoption can remap local handles. Reacquiring a page/document after renderer loss needs the renderer/adapter, not just a tab ID. [B3][b3] [B4][b4] |
| Browser terminal / terminal registry + utility host; Browser is a frontend | Terminal host `terminal_id + terminal_incarnation`; each view has a distinct durable `tab_*` | Recovery binding `surface` plus `server_generation`; local tab ID | Host incarnation fences replacement process; daemon generation fences routing lease | Multiple distinct tabs may project one terminal | `CmuxTerminalRecovery` invalidates routing only, resolves exact identity, rejects incarnation mismatch, never creates an unrelated replacement after learning identity. [B5][b5] [B6][b6] |
| Elatura application lane / `ApplicationLaneRuntimeV1` | `laneRef` identifies managed lane; `(laneRef, generation)` is its current identity | Host binding stays outside generic lane envelopes | Application/lane generation; **neither daemon nor work authority** | Adapter-owned current surface/document/placement | Upsert newer generation clears pending requests; stale responses rejected. Host adapter must independently revalidate current binding around reads/jump. [E1][e1] [E2][e2] |

## Relationship to work and authority

An agent conversation/checkpoint may be attached to a surface by the resume
binding; it is not the surface identity. The same terminal can resume different
work, and one host terminal can have multiple tab projections. Persisted
`SessionWorkspaceSnapshot.taskCreateOperationID` is a creation-operation
correlation, not evidence of a scheduler work item or dispatch authority. [N8][n8]

Neither a Browser `tab_*` nor an Elatura `laneRef` proves a work-item join. The
fixture's `work_item_ref` and `work_authority` are explicitly `null` (unknown).
An integration may retain an existing scheduler-owned join when supplied; it
must not synthesize one from titles, provider session IDs, or equal generation
numbers. Elatura events/responses explicitly carry `grantsWorkAuthority: false`
and `authorizesWorkDispatch: false`. [E1][e1]

Three independent invalidation domains must survive the #87 adapter:

- Application/navigation: document or application-session replacement invalidates
  pending page reads/actions. Lane generation must reflect that adapter decision.
- Daemon: restart replaces numeric routing and its cursor lineage while durable
  resources may survive. Browser connection counter and registry UUID are
  different representations even within this domain; do not compare them numerically.
- Work authority: only its owning scheduler/lease can establish or replace it.
  Neither of the other two generations confers permission to dispatch work.

Movement changes placement; it need not change semantic work or application
identity. Exact projection-sensitive operations must still revalidate placement.
Cloud accepts an unseen daemon lineage only after the provider's retired-generation
fence; a receipt comparison alone is insufficient. [C4][c4]

## Run and consume

```sh
python3 prototypes/cmux-identity-conformance/run.py --sources-root /path/to/Projects
```

The source root must contain Git repositories (or symlinks) named `cmux`,
`cmux-browser`, and `elatura`, with the pinned commits available. Requirements:
Python 3.10+, `clang++` with C++20, `swiftc` with Foundation, Node 22+, and the
Elatura-installed TypeScript compiler (or `--typescript /path/to/tsc`, TS 5.6+).
No network request, dependency installation, branch switch, daemon restart, or
application effect occurs. TypeScript is emitted with `--noCheck`; this is runtime
conformance, not an Elatura typecheck. The runner reads immutable Git blobs and
checks all 19 SHA256 digests in [sources.json](sources.json). Temporary build
files stay under Tact's `.local` and are removed on exit; shared caches are untouched.

#87 can set `IDENTITY_ROOT` to this directory and invoke
`python3 "$IDENTITY_ROOT/run.py" --sources-root "$SOURCE_ROOT"` as a required
subprocess. Exit 0 means all owner tests and shape checks passed; absent sources,
tools, or failing assertions fail the run rather than silently skipping a domain.
Consume the mapping here and the versioned [fixtures.json](fixtures.json), especially
`browser_lane_binding` and `elatura`. The binding record is an explanatory test
input, **not** an adapter/public wire schema. Retain each owner's native fields.

| Fixture / executed owner | What it proves | Limit |
|---|---|---|
| `native_cases.swift` + extracted production declarations | Resource parser, display alias, slash-bearing keys; exact UInt64 parsing; opaque/retired daemon generations; stale/conflicting receipts; stale graph cannot authorize; nested restore collisions; Pi/OMP session canonicalization | Executes complete pure declarations, not AppKit restore or PTY launch |
| Upstream `window_model_test.cc` (450 checks) | Movement, cross-window remapping, restart reconciliation, duplicate titles, distinct durable terminal views | No actual window or renderer |
| `browser_cases.cc` + production `WindowModel` | Close local projection, rematerialize retained canonical tab under fresh local ID, reject stale local handle and duplicate durable IDs | Canonical graph retention is a **synthetic input**; no claim that live web-tab close retains the page |
| Upstream `cmux_terminal_recovery_test.cc` (61 checks) | Restart resolves current binding, ambiguous create does not duplicate terminal, incarnation mismatch fails closed, exited host does not respawn | Simulated host/daemon replies; no live utility process |
| Upstream `cmux_tui_protocol_test.cc` (134 checks) | Production wire/registry fencing and revision validation | Not a live Rust daemon or database restart |
| `elatura_cases.mjs` + four production TS modules | Navigation generation clears pending reads; late/duplicate replies rejected; a current request can complete | Same-lane correlation does not validate external daemon, document, projection, or work lease |
| `test_conformance.py::SanitizedShapes` | Lost local catalog join, duplicate-label ambiguity, differing close semantics, explicit unknown work identity | Hand-authored source-shaped minimal payloads, not captures or native serializers |

Observed on 2026-09-20: **9 harness tests pass**, including **645 upstream C++
checks**, the added model test, Swift and Elatura cases. No authenticated content,
profile identifiers, credentials, DOM, screenshots, or live payloads are committed.
Native app restore, live Rust registry restart, WebContents recovery, and
cross-machine migration remain unexecuted in this pure suite. #87 owns its physical trial.

### Live native follow-up

`live_native.py` exercises an explicitly selected, already-running tagged native
app through its actual JSON socket. It creates two disposable workspaces, uses
only their exact IDs for mutations, keeps focus unchanged, and cleans them up.
This runner **does mutate its owned test workspaces**; it is separate from the
read-only source fixture runner above. No credentials or remote machines are used.

```sh
python3 prototypes/cmux-identity-conformance/live_native.py \
  --socket /tmp/cmux-debug-YOUR-TAG.sock --receipt .local/native-identity.json
```

Optional `--wait-for-reopen` pauses after closing a uniquely named test terminal.
Invoke **History → Reopen Last Closed** once while that exact test terminal is
the most recent closed item. The runner checks its new runtime ID and current
catalog binding. This exercises close-history reconstruction, not app restart.
If cleanup fails, the adjacent `.recovery.json` retains exact owned workspace IDs
for local recovery; do not commit that file.

[Live result](live-native-results.json), 2026-09-20: **8 checks passed** on native
CMUX 0.64.22 (102), bundled CLI revision `4c190f2c5` (a downstream build, distinct
from the pure suite's upstream pin). Real terminals with duplicate titles kept
distinct IDs; terminal and `about:blank` browser movement preserved catalog
resource identity and changed placement; close removed each local resource;
the old resource reference was rejected. The test used direct JSON requests
because the bundled CLI commands timed out while the socket itself responded.

The optional History UI step timed out. A process sample found the main thread
waiting in rendering (`CA::Layer::display_if_needed` → `__ulock_wait2`); subsequent
mutation/cleanup requests timed out although cached reads still responded.
Restore is **not passed**, and two owned workspaces remain pending cleanup in
the captured result. This was a shared tag with an existing user session, so it
was not force-restarted. The receipt preserves that incomplete outcome rather
than converting eight successful checks into a successful whole run.

## Three highest-value incompatibilities at these pins

1. **A saved local catalog resource cannot be joined after panel recreation.**
   Native persistence already has `stableSurfaceId`, but `surfaceResourcePayload`
   publishes the runtime panel key without that join. The fixture changes the
   panel UUID and supplies two identical labels; neither old ID nor label can
   recover the owner. This is the existing [CMUX #13244](https://github.com/manaflow-ai/cmux/issues/13244)
   flow, not a new field proposal. The separate native implementation owner owns
   the repair. [N7][n7]
2. **“Close projection” is not a portable resource-lifetime operation.** Local
   `projectionDidEnd` removes its resource; Cloud can retain a resource with no
   views. A generic close/reopen must use the owning recovery route and must not
   promise local process or web-page survival. Native source and shape fixtures
   establish the asymmetry; the Browser model verifies rematerialization only
   when the canonical graph still retains the tab. [N4][n4] [N7][n7]
3. **Generic lane correlation cannot fence a replaced host/work binding.** The
   production Elatura runtime accepts a correctly correlated response at the
   same lane generation even when our external binding fixture changed daemon,
   projection, or work-authority state. Those fields are intentionally outside
   its protocol. #87 must fence the host mapping before consuming that response
   or jumping; generic acceptance is no authorization. This is an integration
   boundary, not an Elatura defect or grounds for a new lane protocol. [E2][e2]

Existing cases **conform**: duplicate titles are compatible with exact IDs;
Browser tab identity survives daemon numeric renumbering; host incarnation
mismatch is rejected; the current terminal binding is reacquired without a new
create; Cloud retired-generation fencing and native restore collision checks
work. Production graph changes stay with Cloud #13108 / Tact #80; package moves
and stable read-field implementation stay with their respective owners.

[n1]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Surfaces/LocalSurfaceProvider.swift#L50
[n2]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/SessionPersistence.swift#L1712
[n3]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Workspace%2BSessionRestoreIdentity.swift#L12
[n4]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Surfaces/LocalSurfaceProvider.swift#L92
[n5]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/SessionPersistence.swift#L270
[n6]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/SurfaceResumeBindingSnapshot%2BManagedSessionIdentity.swift#L3
[n7]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Surfaces/SurfaceSocketCommands.swift#L1148
[n8]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/SessionPersistence.swift#L1786
[c1]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/cmux-tui/crates/cmux-tui-core/src/workspace_registry.rs#L2697
[c2]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Surfaces/CmuxTuiSurfaceProvider%2BManualMirror.swift#L147
[c3]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Surfaces/Workspace%2BSurfaceCatalog.swift#L31
[c4]: https://github.com/manaflow-ai/cmux/blob/b334a7deeb0ff65bc9ee4d1c6a2bf7d454795110/Sources/Surfaces/CmuxTuiSurfaceProviders.swift#L473
[b1]: https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/overlay/chrome/browser/cmux_term/window_model.h#L91
[b2]: https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/overlay/chrome/browser/cmux_term/cmux_tui_client.h#L40
[b3]: https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/overlay/chrome/browser/cmux_term/cmux_views.cc#L1386
[b4]: https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/overlay/chrome/browser/cmux_term/cmux_views.cc#L13916
[b5]: https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/overlay/chrome/browser/cmux_term/cmux_terminal_recovery.h#L16
[b6]: https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/overlay/chrome/browser/cmux_term/cmux_terminal_backend.cc#L844
[e1]: https://github.com/teamleaderleo/elatura/blob/b323290a0532b4080e468ab30d3a29bb7bf8d2fa/packages/core/src/application-lane.ts#L44
[e2]: https://github.com/teamleaderleo/elatura/blob/b323290a0532b4080e468ab30d3a29bb7bf8d2fa/packages/core/src/application-lane-runtime.ts#L229
