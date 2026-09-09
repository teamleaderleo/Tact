# Tact experiments

`WORKBENCH.md` decides what deserves priority. This page is the workshop launcher: find an executable experiment, run it, and see what it records.

## Quick start

From the repository root:

```bash
python3 experiments/run.py list
python3 experiments/run.py run warm-field
```

The launcher finds executable work under `experiments/*/` and `prototypes/*/`. Static browser experiments get a free localhost port automatically so several can run side by side. Experiments with their own local app server keep their real runtime command instead of being flattened into a generic file server.

## Executable index

| Workbench | Experiment | Path | What it tests | Record / output |
| ---: | --- | --- | --- | --- |
| 2 | **Warm-field switching** | [`prototypes/warm-field/`](../prototypes/warm-field/) | Stable cropped/scaled peripheral task geography vs MRU vs search for warm, recent, and cold targets. | Measured trials persist in `localStorage`; export JSON or CSV. |
| 3 | **Adversarial attention compiler** | [`adversarial-attention-compiler/`](adversarial-attention-compiler/) | Worker grid vs reduced commitments/obligations vs the same reduction with an independent population audit. | Browser receipts plus deterministic CLI/JSON output and executable regression checks. |
| 4 | **Causal debugger** | [`prototypes/causal-debugger/`](../prototypes/causal-debugger/) | One visible failure traced through runtime, request/log, source, edit, rebuild, replay, proof, then a forced task split/merge. | Exact local receipts plus `npm test`; the runtime checkout is copied to temporary working files. |
| 5 | **Capture → retrieve → hand off → delete** | [`capture-retrieve-handoff-delete/`](capture-retrieve-handoff-delete/) | Cheap journal capture, ranked and complete-set retrieval, computed current truth, correction/deletion, and stranger handoff. | Local SQLite corpus, export/import JSON, and executable journal checks. |
| 6 | **Microphone-as-clutch** | [`prototypes/microphone-clutch/`](../prototypes/microphone-clutch/) | Pointer/keyboard vs voice-only vs mixed visible-reference + spoken-intent interaction, including injected recognition, referent, and intent errors. | Completed runs persist in `localStorage`; export JSON. |
| 9 | **Microcraft calibration** | [`microcraft/`](microcraft/) | Blind one-variable visual diagnosis across typography, spacing, alignment, hierarchy, contrast, material, iconography, density, and motion. | Attempt history and current-month accuracy persist locally in the browser. |

Use the per-experiment README for the protocol, controls, optional dependencies, and deeper commands.

### Checks and alternate runners

```bash
# Workbench 3
python3 experiments/adversarial-attention-compiler/sim.py --scenario normal --view all
(cd experiments/adversarial-attention-compiler && python3 -m unittest -v test_sim.py)

# Workbench 4
(cd prototypes/causal-debugger && npm test)

# Workbench 5
(cd experiments/capture-retrieve-handoff-delete && python3 -m unittest -v test_journal.py)
```

## Workshop rules

- New executable implementations default to `experiments/<slug>/`.
- Existing functioning work stays where it is until moving it solves a real problem. Current prototypes under `prototypes/` are indexed here instead of being moved for tidiness.
- Every executable experiment gets a short README with **Question**, **Run**, and **Record / output** information.
- Keep dependencies local to the experiment. Browser-native code, Node built-ins, and the Python standard library are preferred when they answer the question cleanly.
- Avoid a repository-wide app framework. Extract a shared component or utility only after a second experiment genuinely needs the same behavior.
- Reuse fixtures when several issues test different views or policies over the same scenario. Keep the fixture beside the experiment that owns the scenario.
- Static experiments can join the launcher with a root `index.html`. An experiment that owns a local server gets an explicit custom runner before the launcher exposes it, so a generic file server cannot silently break its API-backed UI.
- Generated screenshots and result dumps stay local by default. Commit small reference results when they preserve a finding or make comparisons easier.
- A shared helper change must be checked against every experiment that imports it before landing.

— Mochi 🐁
