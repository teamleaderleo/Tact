# Existing layouts → portable template → recreated workspace

Owner: [Tact #71](https://github.com/teamleaderleo/Tact/issues/71). Public source audit: `ad34966d0641efcacc436ecd264fda9105285c49`, 2026-09-20. Result: **Tact prototype with a real local roundtrip**, plus a narrow proposed birth-intent contract; no new template engine.

## What current main already owns

The original #71 finding has partly been overtaken by upstream work:

| Owner | Current behavior | Remaining loss |
|---|---|---|
| `layout.save/list/get/open/delete` + `SavedLayoutStore` | Named layout persistence and opening through existing `CmuxWorkspaceDefinition` | No new save/apply-template verbs needed for ordinary layouts |
| `Workspace.captureLayoutDefinition` | Captures nested geometry, tab order, names, cwd, browser URL and focused surface; returns unsupported count | Terminal `command` is intentionally nil; no typed resume intent; unsupported native agent surface becomes counted shell placeholder |
| `CmuxSurfaceDefinition` | `type`, `name`, `command`, `cwd`, `env`, `url`, `focus` | No provider/session-reference birth field |
| Session persistence/resume binding | Higher-level provider `kind` + `checkpointId`, launch flavor, approval/claim semantics | Those semantics are not part of portable saved-layout capture |
| Browser session restore | URL/profile/zoom/history/mute and internal restore state | Shareable template should not copy profile/auth/history/runtime URLs |
| Cloud | Daemon workspace/terminal public IDs and generation fences; native projection binding stores machine + remote workspace | A reusable template should create fresh instances, not reattach someone else's machine/workspace or copy daemon generation |

Native UI session IDs deserve separate treatment. `AgentSessionProcessStore.start` allocates a new UUID for the running process record; provider conversation IDs can be different (`openCodeSessionID` is explicit). `SessionAgentSessionPanelSnapshot` persists provider/renderer/cwd, not a durable provider session ref. These runtime IDs are not a safe resume spec.

Source evidence: [capture](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Workspace%2BLayoutCapture.swift#L19), [terminal/browser/unsupported capture](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Workspace%2BLayoutCapture.swift#L111), [layout schema](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/CmuxConfig.swift#L1610), [saved open](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/TabManager%2BSavedLayouts.swift#L5), [socket methods](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Packages/macOS/CmuxControlSocket/Sources/CmuxControlSocket/Coordinator/Layout/ControlCommandCoordinator%2BLayout.swift#L5), [upstream live test](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/tests_v2/test_layout_save_open.py#L72), [resume fields](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L270), [browser restore](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L1596), [native process ID](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/Panels/AgentSessionProcessStore.swift#L23), [native persistence](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionAgentSessionPanelSnapshot.swift#L3), [Cloud persistence](https://github.com/manaflow-ai/cmux/blob/ad34966d0641efcacc436ecd264fda9105285c49/Sources/SessionPersistence.swift#L1778).

## Smallest birth record

Birth intent and the identity of an instantiated resource are distinct. A reusable template's surface slot must mint a new instance, not clone an existing stable ID. Geometry stays entirely in the existing layout. Proposed optional per-surface intent:

```json
{
  "version": 1,
  "kind": "terminal",
  "cwd": ".",
  "intent": {
    "kind": "resume",
    "provider": "codex",
    "session_ref": "<owner-verified checkpointId>"
  }
}
```

For shell use `{"kind":"shell"}`; for browser use `{"kind":"navigate","url":"https://example.org/docs"}`. A fresh agent session needs provider but no checkpoint. Resume and fork are distinct modes; the owner must retain its existing claims, liveness checks and approval behavior. Merely importing a template never grants resume authority.

Session references are machine/account-specific and may be sensitive metadata. **Default portable export should use fresh-session intent; including a durable session ref must be explicit and marked non-shareable or environment-dependent.** Do not silently degrade a requested resume into a new shell. If an owner cannot resolve the requested session at the destination, report unresolved intent before creating it. This prototype does not execute proposed resume intents.

No PID, socket path/token, environment dump, daemon generation, process ancestry or launch-command reconstruction belongs in the portable record. Requested provider capabilities/placement belong to ExecutionRequest and backend admission, not this layout file. Local/Cloud placement mappings are for future integration with those existing owners.

## Executable proof

```sh
python3 -m unittest discover -s prototypes/cmux-public-wave/templates -p 'test_*.py'
python3 prototypes/cmux-public-wave/templates/roundtrip.py
# Explicit opt-in: creates then removes only uniquely named scratch workspaces/layouts.
python3 prototypes/cmux-public-wave/templates/roundtrip.py \
  --socket /path/to/cmux.sock --cwd /path/to/existing/project \
  --output /path/to/receipt.json
```

Offline mode produces existing `workspace.layout` grammar and a read-only birth-intent description. There is no template database, persisted identity registry or execution engine. Portable capture allowlists existing fields, refuses commands/environments/resume data, rejects paths outside the root, and refuses credential-bearing/custom/runtime URLs.

The live harness creates a two-terminal + `about:blank` browser workspace with nested splits, saves it, lists/gets it, opens the existing saved layout, then recreates another workspace from the portable JSON via **existing `workspace.create`**. It recaptures both recreated workspaces and compares their portable layout values with the first capture. Cleanup targets only IDs/names returned by this run, never existing layouts.

[Live receipt](live-receipt.json): passed on running app **0.64.22 (102), `4c190f2c5`**. Three distinct workspace instances, three surfaces each, 0.4/0.65 splits, capture/open/recreate equality, scratch cleanup complete. This is older than the audited source pin. The system production CLI was a different version; the harness deliberately addressed the discovered running socket. No native build or current-main binary run is claimed. Public API results only; no user workspace/transcript content captured.

The tested source workspace contains known shell intent. An arbitrary existing terminal with a missing resume binding cannot be certified as a faithful process/agent roundtrip from `layout.get` alone: capture intentionally omits the command. This is the exact boundary, not evidence that a hidden invocation can be reconstructed safely.

Eight deterministic tests also pass: existing grammar/idempotence, geometry and surface count, birth intent, runtime-field exclusion, command/environment/resume refusal, root-relative paths, URL restrictions, unsupported native session refusal.

## Promotion decision

Promote the live roundtrip evidence and the narrowly scoped typed birth-intent question in Tact #71. Keep implementation here until the layout/resume owners agree on fresh-vs-resume sharing semantics; do not open another broad workspace template RFC or duplicate engine. A native follow-up should extend `CmuxSurfaceDefinition` and its existing capture/apply path only after that product choice, with native agent and Cloud end-to-end fixtures. Existing geometry/cwd/browser workflows already work.

Explicit stops: agent-session resurrection, native UI conversation persistence and Cloud template placement are audited/designed, not live-proven here. No provider account/session was launched. Per-pane selected-tab state is already explicitly excluded by capture and tracked upstream in #7444.
