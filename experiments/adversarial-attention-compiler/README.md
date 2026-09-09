# Adversarial attention compiler

Executable Tact experiment for the question:

> How little population-level state can remain visible while still making an attention reducer trustworthy?

The simulation creates 100 deterministic worker/task records across eight commitments. Three genuine human obligations remain in the normal case. A deliberately lossy reducer compiles the population into commitments, blockers, and decision packets while exact synthetic receipts stay beneath every task.

An independent auditor reads the raw population directly. It never consumes reducer output.

## Run the browser experiment

From this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The page compares three surfaces over the exact same scenario:

1. **Worker grid** — 100 worker/task targets with competent local status badges.
2. **Reduced** — eight commitments plus the three current human obligations.
3. **Reduced + audit** — the same reduced surface plus one compact independent population-audit strip.

Choose scenarios from the menu. Click workers, commitments, obligations, or audit alerts to reach exact synthetic receipts.

The audit strip is intentionally terse. When all six population checks sit inside the normal band it displays only `6/6 clear`. When a population condition crosses a threshold, only the abnormal signal becomes prominent.

## Run the CLI simulation

```bash
python3 sim.py --scenario normal --view all
python3 sim.py --scenario wrong-premise --view audit --audit-all
python3 sim.py --scenario all-adversarial --view audit --audit-all
```

Available views:

```text
grid      100 worker/task rows
reduced   commitment field + human obligations
audit     independent population audit
all       all three in sequence
json      complete machine-readable scenario, receipts, reducer output, and audit output
```

List scenario ids in [`scenarios.json`](scenarios.json).

## Run the executable checks

```bash
python3 -m unittest -v test_sim.py
```

The tests assert the core adversarial property:

- the normal 100-worker case reduces to exactly three human obligations with a clear audit;
- each systemic-failure scenario still reduces to three obligations;
- the independent auditor catches the hidden population condition;
- the split-decision scenario proves the reducer can merge two real product decisions into one packet while the auditor reports fan-in lossiness.

## Scenario families

The base population contains ordinary task churn, local retries, verification, machine-owned waiting, three genuine human obligations, and exact receipts.

Adversarial mutations add:

- **wrong premise** — 80/100 tasks share one known-invalid premise while their local state stays healthy;
- **retry storm** — 60 tasks succeed only after four attempts;
- **verification decline** — 42 tasks lose the expected independent verification boundary;
- **cost spike** — 70 tasks consume 2.4× their expected cost;
- **stale-source concentration** — 75 tasks use one 480-hour-old source snapshot;
- **split decisions** — one reducer merge group contains two distinct product-decision keys;
- **all adversarial** — every failure at once.

The mutations deliberately preserve local success wherever possible. This forces the experiment to distinguish **healthy individual outcomes** from **healthy population behavior**.

## Independent audit signals

The current audit lens uses six population invariants:

| Signal | What it catches |
| --- | --- |
| Premise concentration | correlated reasoning and one shared bad premise |
| Retry pressure | many locally recovered failures forming a systemic pattern |
| Verification coverage | green parent summaries with shrinking independent evidence |
| Compute burn | useful-looking work consuming unexpectedly large resources |
| Stale-source concentration | agreement caused by one old shared observation |
| Fan-in integrity | multiple decision boundaries incorrectly compiled into one packet |

Thresholds are experiment parameters, not product doctrine. The important interaction is the separation of responsibility: **the reducer decides what deserves human obligation; the auditor asks whether the reducer's quietness remains credible.**

## Exact receipts

Every task carries three synthetic exact receipts:

```text
source receipt
  premise id + validity
  source id + age

command receipt
  exact verification command
  attempts
  exit code
  exact synthetic stdout

result receipt
  worker id
  state
  verification presence
  expected + actual cost
```

The reduced UI shows claims first. The receipt layer makes those claims inspectable without forcing raw evidence into the primary view.

## Deliberate reducer bug

The reducer fans decision work together by `decision_group` and assumes that all children in a group share one decision boundary. It records the first child's `decision_key` and stops there.

The `split-decisions` scenario puts two distinct product decisions under the same group. The reduced UI continues to show three obligations. The independent auditor scans raw `decision_key` values and reports the collision.

That bug is deliberate. An experiment where the reducer is always correct cannot test whether an audit lens earns its screen space.

## Files

- [`index.html`](index.html) — interactive comparison UI; no framework or build step.
- [`sim.py`](sim.py) — deterministic simulator, reducer, independent auditor, CLI renderer, and JSON output.
- [`scenarios.json`](scenarios.json) — scenario definitions and commitment population.
- [`test_sim.py`](test_sim.py) — regression checks for the adversarial invariants.
- [`findings.md`](findings.md) — current product findings and the next harder tests.
