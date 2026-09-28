# ExecutionRequest: compile one intent to an existing shared owner

**Disposition: Tact prototype. No new upstream API or RFC proposed.** Source audited on 2026-09-20 at public `manaflow-ai/cmux` commit [`ad34966d0641efcacc436ecd264fda9105285c49`](https://github.com/manaflow-ai/cmux/commit/ad34966d0641efcacc436ecd264fda9105285c49). Context: [Tact #89](https://github.com/teamleaderleo/Tact/issues/89), [#81](https://github.com/teamleaderleo/Tact/issues/81), [#85](https://github.com/teamleaderleo/Tact/issues/85). No live execution, VM provisioning, native build, or Cloud spend occurred.

The useful shared request is **“open an interactive project terminal at this explicitly selected existing target, and show/focus it in this local workspace.”** Both implementations already share `surface.new_terminal`. Adding a second provider abstraction would obscure an owner CMUX already has.

`execution_request.py` is a pure compiler and observation adapter, with no executor. One `ExecutionRequest` plans against a local and a Cloud `ResolvedTarget`. The request carries a caller-owned work reference, source reference, label, the single proven operation/tool, capability requests, backend-default persistence, explicit placement and open/focus return intent. Target resolution supplies the machine-specific absolute cwd and exact existing destination identities. It does not clone a repo, assign resources or schedule work.

## Concrete current paths

| Layer | Local | CMUX Cloud |
| --- | --- | --- |
| Public CLI | `cmux surface new-terminal --machine local --cwd /Users/fixture/Projects/cmux --workspace <local-UUID> --name 'CMUX review' --json` | `cmux surface new-terminal --machine <existing-machine-id> --cwd /home/fixture/cmux --remote-workspace <existing-ws-id> --workspace <local-UUID> --name 'CMUX review' --json` |
| Public socket | `surface.new_terminal {machine: "local", cwd, name, workspace_id, open: true, focus: true}` | Same method, machine id plus `remote_workspace_id` |
| Authoritative dispatch | `TerminalController.surfaceNewTerminal` → registered `SurfaceProvider` | Same dispatch and catalog |
| Terminal creation | `LocalSurfaceProvider.createTerminal` → `SurfacePaneFactory.makeTerminalPane` | `CmuxTuiSurfaceProvider.createTerminal` → current machine link → `CloudTuiRequests.runArguments` → daemon `workspace.run` |
| Default command | Omitted: local configured shell behavior | Omitted: provider supplies `['bash', '-l']` |
| Cwd | `workingDirectory: cwd` | Native daemon `cwd` field; deliberately no `sh -c 'cd …'` wrapper |
| Projection | Catalog project into the requested local destination | Same catalog project, with Cloud source placement |
| Currentness/retry | No shared replay guarantee exposed | Provider lifecycle generation guarded before/after awaits; internal Cloud creation request retains idempotency/correlation across supported explicit retries |

Source anchors:

- [CLI parser and public method, lines 2035–2061](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/CLI/CMUXCLI%2BVMTui.swift#L2035).
- [Socket input, Cloud policy gate and dispatch, lines 73–100](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceSocketCommands.swift#L73).
- [Shared creation/project owner and exact result fields](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/TerminalController%2BCloudTerminalCreation.swift#L5).
- [Existing provider interface](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/SurfaceProvider.swift#L32).
- [Local creation and argv quoting](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/LocalSurfaceProvider.swift#L239).
- [Cloud mutation queue, lifecycle fences, creation recovery and native cwd](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Surfaces/CmuxTuiSurfaceProvider%2BTerminalCreation.swift#L33).
- [Daemon `workspace.run` builder](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Cloud/CloudTuiPersistentRequestBuilder.swift#L51), [default shell](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Cloud/CloudTuiCommandLine.swift#L361).
- [Existing internal retry/receipt owner](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Cloud/CloudTerminalCreationRequest.swift#L3).

## Identity and receipt boundaries

`request_ref` and `source_ref` are caller references, never backend authority or asserted CMUX resource identities. The compiler never inserts them as unsupported socket fields. Repo/cwd are sufficient **only after caller resolution of an already-present checkout**; equal paths on two machines do not prove equal repositories, revisions, or filesystem contents. No source identity survives migration by virtue of this prototype.

The success result already carries `resource`, `terminal_id`, `machine`, `remote_workspace_id`, and, when opened, local `workspace_id`/`surface_id`. The observation adapter preserves owner-returned ids without parsing or renaming them. The resource is separate from its local projection. Durability follows the owner's actual restore contract, not an assertion that a local panel UUID survives restart. Missing generation, cursor and mutation receipt remain null. No daemon numeric id, PID, socket token or credentials are invented or stored.

`owner-reported-created-and-projected` is deliberately weaker than “agent started”, “command succeeded”, “durably resumable”, or “capabilities verified.” Requested capability names describe the selected operation; `effective_capabilities` stays unknown until independently observed. Both fixtures use synthetic results and reference them as fixtures, not measured launches. The receipt is suitable as evidence for a future current-work projection; it is not a second current-work database or mutation token.

The concrete gap is **caller-visible retry reconciliation across creation and projection failure**. The socket owner first creates a resource and then projects it. A failure/timeout after creation can therefore leave an effect whose identity the caller never received. The Cloud internal request has receipt recovery, but the shared socket call constructs a fresh request and its result does not return that correlation identity, authoritative generation/revision or accepted-request status. Reissuing the same pure plan is not idempotent. This prototype disables automatic retry and rejects incomplete results as success receipts; it does not claim an error proves no terminal exists.

That gap warrants a focused reproduction before an upstream field/RFC: inject a projection failure after provider creation, lose the socket response, then measure existing owner lookup/reconciliation options. If a caller-visible contract is needed, evolve this existing creation owner and its receipts alongside the identity lane. Do not add an independent ExecutionRequest lifecycle ledger.

## Deliberate limits and backend ownership

- Exactly two actual paths, one operation. Arbitrary command execution and agent resume are outside this proof. Current code can take argv, but equivalence of native agent startup/resume has not been tested here.
- Backend-default persistence is accepted; guaranteed process continuity, restart recovery and agent resume are rejected. Cloud's existing daemon resource/session graph and local session/resume owners keep their respective semantics.
- The local provider first creates a split in the currently selected/first workspace and focuses it, then shared dispatch projects into the requested destination. The planner does not claim background execution or source-workspace selection fencing. Concurrent selection changes remain owner behavior.
- Cloud machine/workspace ids must already exist. Connection, wake behavior, scheduling, authentication, policy, machine lifecycle, retries, limits and billing remain backend owned. No CPU/memory/network/security capability hints are exposed because this operation does not enforce them.
- No automatic placement, portability guarantee, strict shell equivalence, hidden transcript access or provider-specific VM object in the request. The local configured shell and Cloud bash login shell are intentionally backend defaults.
- Existing socket call can wait up to 240 seconds. This limited already-provisioned-target operation does not establish a new asynchronous job-status contract. VM creation latency is excluded, not concealed.

## Validation and promotion decision

Run from this directory:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v
PYTHONDONTWRITEBYTECODE=1 python3 demo.py
```

Nine tests cover the two exact socket plans, wrong source and placement, unsupported persistence/security/placement/return promises, non-interpolated target paths, truthful receipt unknowns, wrong response destinations, missing evidence and partial failures. These verify the pure contract against audited source shapes; they do not claim native integration coverage or live local/Cloud execution parity.

`demo.py` prints the same intent compiled twice, synthetic owner-shaped results, and bounded observations. For the current-work consumer the exact seam is: group by the existing `resource_ref`; expose placement/projection as views, reference `evidence_refs`, and keep unknown generation/cursor/agent/capability facts unknown. `request_ref` is provenance only. `state` is a historical creation observation, never ongoing liveness; a current owner snapshot and its freshness must supersede it. The demo does not write to a ledger or mutate CMUX.

**Promote now:** the evidence that the existing `surface.new_terminal` operation is already the shared local/Cloud execution seam, plus this bounded compatibility fixture and honest receipt boundaries. **Keep in Tact:** the intent/compiler experiment and failure-reconciliation question until real owner-path integration tests are available. **Stop:** a broad provider-neutral execution service, new scheduler, speculative providers, or new upstream API merely for naming consistency. No blocking review findings are known; native fault-injection and real target integration remain unperformed.
