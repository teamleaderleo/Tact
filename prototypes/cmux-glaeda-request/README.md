# CMUX → Glaeda external semantic request

This is the CMUX-side example for [Tact #89](https://github.com/teamleaderleo/Tact/issues/89)
and [Glaeda #1050](https://github.com/teamleaderleo/glaeda/issues/1050). The Glaeda implementation
is proposed in [Glaeda #1051](https://github.com/teamleaderleo/glaeda/pull/1051).

Tact #89 already found a useful shared CMUX local/Cloud owner for interactive terminals:
`surface.new_terminal`. That experiment legitimately needs CMUX placement/presentation facts such
as cwd, selected existing machine/workspace and open/focus behavior.

The Glaeda request is a different projection of the same broader CMUX work object. CMUX keeps those
presentation/target facts. Only the semantic execution facts cross the Glaeda seam.

## Example

```python
from cmux_glaeda_request import CmuxGlaedaExecution

request = CmuxGlaedaExecution(
    request_ref="cmux:exec:1050:fixture-1",
    work_ref="cmux:work:1050",
    repository="teamleaderleo/glaeda",
    commit="0409c2f4e82385d0770bb2b34f34fd3e6e2dbc36",
    tree="03613a93ce152aefddbb246613084705043b1397",
).request()
```

The exact emitted request is `request.json`:

```json
{
  "document_type": "glaeda-external-execution-request",
  "schema_version": 1,
  "external_request_ref": "cmux:exec:1050:fixture-1",
  "source": {
    "repository": "teamleaderleo/glaeda",
    "commit": "0409c2f4e82385d0770bb2b34f34fd3e6e2dbc36",
    "tree": "03613a93ce152aefddbb246613084705043b1397"
  },
  "operation": "verify_focused",
  "requested_capability_class": "credentialless_project",
  "reuse_hint": "prefer_valid_reuse",
  "correlation": {
    "work_ref": "cmux:work:1050"
  }
}
```

## Ownership split

CMUX keeps:

- human/current-work identity and presentation;
- local workspace/window/pane/surface/terminal ids;
- local or Cloud target resolution;
- cwd and checkout presentation;
- open/focus/attention/return behavior;
- how the bounded Glaeda receipt appears in current-work UX.

Glaeda receives only:

- caller correlation refs;
- canonical repository plus exact commit/tree;
- one useful operation;
- requested capability class;
- an advisory reuse preference.

Glaeda then resolves the exact `verify-focused/v1` generation, fixed resource profile, credentialless
execution boundary, local backend/node/admission state, reuse eligibility, physical attempt and
durable recovery.

The CMUX request has no shell/argv, environment, host path, machine/backend, cgroup/systemd values,
Glaeda profile generation, attempt id, reservation id, cache generation or recovery command.

## Relationship to the earlier Tact #89 local/Cloud experiment

The earlier prototype on `codex/cmux-public-wave-20260920` remains valid for the
`surface.new_terminal` question. This example does not replace it or add a broad CMUX provider
interface.

Instead, it demonstrates a caller projection rule:

```text
one CMUX work object
  ├─ presentation/interactive terminal request -> existing CMUX local/Cloud owner
  └─ exact useful verification request         -> bounded Glaeda semantic envelope
```

The same CMUX work reference can correlate both views while carrying zero Glaeda execution authority.

`result.json` is the paired bounded Glaeda `planned` receipt. `observe_receipt` verifies the
external request digest, request/work correlation, exact source, zero-authority object and allowed
state before returning only the facts CMUX needs: work ref, state, request digest and optional
terminal workload-receipt digest. It does not consume the resolved workload generation as CMUX
execution authority.

Run:

```sh
cd prototypes/cmux-glaeda-request
python3 -m unittest -v
```

The tests prove exact request bytes, the intentionally tiny CMUX field set, fixed operation/capability
mapping, source/reuse validation, bounded result correlation, and rejection of a false terminal result
without workload evidence. No local terminal, Cloud target or Glaeda node is contacted.
