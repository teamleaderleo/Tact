# CMUX × Elatura bounded trial (#87)

This is an executable **synthetic/contract adapter**, using Elatura's actual lane runtime,
client matcher and lifecycle planner. It has no implemented live CMUX transport. The
current gap is an accessible, owner-issued durable-tab → WebContents/document binding
and an atomic binding/authority-checked frontend jump. No performance improvement,
live recovery, or authenticated application fidelity is claimed.

Owners: [Tact #87](https://github.com/teamleaderleo/Tact/issues/87),
[Elatura #116](https://github.com/teamleaderleo/elatura/issues/116), and
[identity #81](https://github.com/teamleaderleo/Tact/issues/81).
`sources.json` pins the inspected sources. Generic behavior stays in Elatura;
this directory owns only the CMUX experiment. No Chromium files are changed.

## Reproduce

Requires Node >=22, Python 3, clang++ with C++20, Swift, and the pinned Elatura
checkout with its lockfile dependencies installed. Use task-owned checkouts at
the revisions in `sources.json`; do not switch someone else's active branch.
`IDENTITY_ROOT` is the #81 Tact checkout root. `BROWSER_ROOT` is CMUX Browser,
which is distinct from native macOS `cmux`.

```sh
ELATURA_ROOT=/Users/leoli/Projects/elatura \
BROWSER_ROOT=/Users/leoli/Projects/private-browser-runtime \
CMUX_ROOT=/Users/leoli/Projects/cmux \
IDENTITY_ROOT=/Users/leoli/Projects/Tact-worktrees/identity-81 \
node prototypes/cmux-elatura-trial/run.mjs
```

The command checks pins and scoped dirty state, compiles the real Elatura core
into a disposable task-local directory, runs adapter tests and five existing
Elatura test files, then invokes #81's production-owner runner directly. That
runner reads its own pinned Git objects and fixtures, including actual CMUX
Browser WindowModel/recovery/protocol tests and native identity parsers. No
fixture or owner implementation is copied into this adapter. Build scratch and
source symlinks are removed on exit; no browser is launched or inspected.
The result is a content-free receipt. `results.json` records the observed run.

Observed: **39 adapter tests**, **62 existing Elatura tests**, and the required
[#81 suite (PR #92)](https://github.com/teamleaderleo/Tact/pull/92) pass. The latter
executes nine harness tests including 645 upstream C++ checks and custom
C++/Swift/Elatura identity cases. All are synthetic or pure contract execution;
live results remain untested.

For iteration only, `ELATURA_ROOT=... IDENTITY_ROOT=... node --test adapter.test.mjs` from this
directory uses an already built Elatura core. The combined command is the
reproducibility gate and does not depend on pre-existing `dist`.

## Exact seam and currentness

The caller supplies an existing `ApplicationLaneRuntimeV1` that already owns a
lane. It also explicitly supplies the private registry/resource pairing;
discovery by labels, URLs or numeric tab IDs is prohibited. `prepare` retains
the canonical runtime request and an immutable exact binding in a bounded
in-memory ticket. `execute` checks before dispatch and after the asynchronous
reply. `cancel` retains a bounded tombstone while an old reply is in flight.
Callers must cancel on their deadline; the adapter creates no polling timer.

| Identity/fence | Current owner and meaning |
| --- | --- |
| `laneRef`, application generation | Elatura/runtime caller; advance for navigation/application replacement |
| registry ID + resource ID | CMUX registry + `SurfaceTab.backend_resource_id` (durable `tab_*`, not terminal ID) |
| daemon generation + backend ID | Canonical daemon snapshot; UInt64 decimal string, never JS number |
| local surface ID | Process-local `SurfaceTab.id`; not durable across browser restart |
| WebContents/document epochs | Host-issued private replacement fences; required live export not found |
| window/workspace/pane | Current presentation only; movement invalidates old requests, not the lane |
| work generation | Existing work owner; never derived from an observation or a browser generation |
| interaction epoch + expiry | Interaction owner; human input supersedes a queued jump |

The injected host functions are an **experiment port**, not names of existing
public CMUX APIs:

- `current(resourceId)`: synchronous current owner snapshot with all binding
  fields in `fixtures.json`; missing/ambiguous/disconnected values fail closed.
  It must reflect navigation/renderer changes before effects, including ABA
  replacement of a document at the same URL. Application generation remains
  caller-owned and must agree with the runtime descriptor.
- `observeExact(expected)`: bounded asynchronous health/change response with
  the exact binding, canonical `observedAt`, fixed `health` token, and boolean
  `changed`. No DOM, URLs, screenshots, cookies, titles or provider bodies.
- `currentAuthority()`: current work generation, interaction epoch, and expiry.
- `jumpExact({expected, authority, requestId})`: atomically revalidate all
  binding/authority/expiry fields at the physical effect, select the existing
  genuine WebContents in its current pane/window, and return the binding plus
  `jumped`. A preflight alone does not satisfy this port. Missing capability
  returns unsupported; never reopen a URL or retry a replacement target.

Successful status/observe/activate responses go through existing Elatura
correlation and observation-budget enforcement. Change/possible-completion
events reuse runtime event admission and grant no work or dispatch authority.
The adapter returns admitted fixed-token health/change observations and exposes
aggregate counts, including reads that reported no change.
These are a diagnostic proxy, not proof that a live read was unnecessary.
An effect already performed is reported separately from stale result rejection;
a lost acknowledgement reports `effect: unknown` and must be reconciled before
any fresh authorization. There is no automatic retry.

## Source-grounded host finding

At Browser `6696b66`, `window_model.h:92–98` has the three surface identities;
`cmux_views.cc:13916` maps a local surface to actual WebContents and
`:13968` activates that WebContents through its Browser tab strip.
The canonical registry recovery at `:17518` resets numeric bindings while
retaining durable receipts. `cmux_tui_client.h:538` explicitly leaves pane and
keyboard focus frontend-local. `cmux_surface.h` has loading callbacks and an
inspectable WebContents pointer, but these are internal C++ seams.

The inspected interfaces do not provide the external atomic join/jump needed
by this port. Daemon workspace selection alone cannot prove which genuine
page received focus. Standard extension tab handles alone do not establish the
durable CMUX resource join. This is the precise live capability still needed;
no new API or Chromium patch is proposed before owner review.

The local environment check found no configured `CMUX_BROWSER_HQ`, default HQ
checkout, `hq` command, or installed CMUX Browser bundle. `/Applications/cmux.app`
is the native product and is not a substitute. An approved build/profile
location was requested. No fleet-capacity claim was made or unapproved build
attempted. Browser instructions require the existing HQ lease environment,
a unique build tag/destination, and no disruption to live dogfood bundles.

## Comparison and lifecycle gates

`comparison-plan.json` prepares three conditions: stock, ordinary CMUX, and the
identical CMUX binary with this read-only adapter. Compare 1→2 as host difference
and 2→3 as adapter effect. Unknown installed versions, digests, private pairing,
machine/power/display and workload fields remain null until frozen on the
approved host. A source Chromium version is not an installed binary identity.

The initial long ChatGPT lane precedes the declared eight-lane cohort. Timings,
rotation count, 2-second whole-browser sampling, recovery and fidelity checks
follow #116's current method. This three-condition supplement is **not** the
frozen six-condition/112-run #125 plan and cannot pass as its admitted data.
Keep browser and separately rooted CMUX daemon/broker cost in both CMUX arms;
do not hide debugger/transport overhead or substitute renderer-only memory.
Record switching/recovery, no-change reads, screenshots, useful attention delay,
resource plateau and application fidelity. Keep failed runs and negative results.

Lifecycle intervention remains disabled. The fixtures exercise every existing
Elatura blocker, including drafts, active generation/streaming, IME/modal work,
media/capture, downloads, collaboration and unknown application safety. They do
not prove physical recovery. Promotion requires live identity through daemon
restart and renderer transition, preserved unsent drafts/streams/ordinary
interaction, and a preregistered useful operational improvement without fidelity
or latency regression. Real auth expiry and human recovery remain untested.

Cookies, authentication, raw application targets, captures and private profile
paths stay in the approved host/profile/evidence locations; this repository
contains only manufactured tokens and aggregate receipts. Do not create a live
profile from a personal profile or close unrelated sessions to run the trial.
