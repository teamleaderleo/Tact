# Findings: auditing the attention compiler

This experiment attacks the strongest high-concurrency Tact claim from the other side.

The reduced surface still works in its intended case. One hundred workers across eight commitments become three human obligations. Exact task evidence remains inspectable without asking the human to watch the execution population.

The contrarian objection also survives. A reducer can be locally correct and globally misleading.

## What the simulator demonstrates

The deterministic scenarios produce this result:

| Scenario | Reducer-visible human obligations | Independent audit |
| --- | ---: | --- |
| Normal | 3 | 6/6 clear |
| 80 share one wrong premise | 3 | premise concentration alert |
| Retry storm | 3 | retry-pressure alert |
| Verification decline | 3 | verification-coverage alert |
| Cost spike | 3 | compute-burn alert |
| Shared stale source | 3 | stale-source alert |
| Two decisions merged as one | 3 | fan-in-integrity alert |
| All adversarial failures | 3 | 6/6 alert |

The important result is the unchanged middle column. A commitment/decision reducer has no reason to create a new human obligation merely because 80 successful tasks share a premise, 60 recover through retries, or cost doubles. Those are population conditions. They need a second path.

## The worker grid is a weak auditor

The worker grid technically exposes more facts. It still asks the human to discover population conditions by perception:

- notice that the same premise label repeats dozens of times;
- infer a retry distribution from 100 attempt badges;
- mentally estimate verification coverage;
- sum or intuit cost drift;
- recognize one stale source dominating the field;
- compare decision identity across many children.

That is a poor bargain. The grid preserves rawness by exporting aggregation work to the human.

A worker grid remains valuable for attribution and forensic drill-down. It is a bad default mechanism for detecting correlated failure.

## The reduced surface is excellent until its own assumptions fail

The commitment field plus three obligations makes the normal case legible immediately.

It also hides every adversarial scenario by design. This is a feature until the reducer is the component whose judgment is under suspicion.

Exact receipts alone do not solve this. A receipt answers whether one claim can be inspected. Correlated failure asks whether **the population of individually reasonable claims has a dangerous common property**.

Receipts provide evidence. The audit path decides which population questions deserve asking.

## The useful minimum is one independent status plus abnormal dimensions

The strongest current interaction is smaller than a permanent six-metric dashboard.

Normal state can be:

```text
Population audit · 6/6 clear
```

When a population invariant changes, the strip expands only the affected dimension:

```text
Population audit
ALERT · Premise concentration · 80% dominant · 80% known-invalid
```

or:

```text
Population audit
ALERT · Fan-in integrity · api-contract contains 2 decision boundaries
```

The detailed metric, threshold, sample tasks, and exact receipts remain one gesture away.

This preserves the original attention-compiler goal. Healthy work stays quiet. The additional persistent cost is one independent audit status, not another field of workers.

## Why independence matters

The auditor reads raw task/receipt facts directly and computes:

- premise clusters;
- retry distribution;
- verification coverage;
- expected versus actual burn;
- source age/concentration;
- decision-key heterogeneity inside fan-in groups.

It never consumes the reducer's commitment summaries or decision packets.

That separation is the experiment's central claim. If the reducer emits both “three decisions” and “audit healthy,” one mistake can erase both warnings. A distinct aggregation path can disagree with the reducer.

The production version can still share storage, identity, and receipt formats. It should preserve independent selection logic and independent tests for the conditions it claims to audit.

## Audit signals should describe populations, not workers

The audit lens becomes useful because its objects are statistical or relational properties:

```text
80% share premise P-SHARED-WRONG
1.82 retries per task; p95 = 4 attempts
55% verification coverage
2.00× expected compute burn
75% depend on one stale source
1 merge group contains 2 decision keys
```

These remain compact at 30, 100, or 10,000 workers. They scale with the number of distinct population hazards, not the number of executors.

This suggests a stronger abstraction:

> Human obligations summarize consequential work. Audit invariants summarize consequential population behavior.

Both can stay small while execution grows.

## Three layers now have different jobs

### Primary field: commitments

Answers:

- what are we trying to make true?
- what is moving, waiting, or settled?
- where does current work live?

### Human obligation queue: judgment and recovery

Answers:

- what exact choice, approval, or recovery action needs a person?
- why now?
- what waits on it?

### Independent audit strip: credibility of the reduction

Answers:

- is there a correlated population condition the reducer is likely to erase?
- did the distribution of retries, evidence, cost, freshness, premises, or decision identity change enough to challenge the calm view?

Receipts sit beneath all three.

## The audit strip should resist becoming a monitoring console

Six permanent gauges would recreate the thing the experiment is trying to avoid.

A useful discipline is:

1. keep only the compact independent status persistent;
2. surface a dimension when it leaves its expected band or changes materially;
3. show the aggregate fact before worker examples;
4. use worker samples only as evidence and diagnosis;
5. let the alert disappear when the population condition clears, while retaining history;
6. add a new audit dimension only after a real replay shows a reducer failure it would have caught.

The audit lens should earn every persistent pixel through a demonstrated class of correlated failure.

## The six current signals are still too convenient

The simulator gives the auditor privileged fields such as `premise_valid`, source age, expected cost, and exact decision keys. Real systems often have weaker observations.

The next tests should make the auditor work harder:

- wrong premises whose invalidity is discovered only after a counterexample arrives;
- sources that are fresh by timestamp but stale relative to a changed external fact;
- retries with heterogeneous causes, where only one cluster indicates a systemic problem;
- cost increases that are justified by higher-value work;
- verification coverage where 70% can be safer than 95% because task risk differs;
- two textual decision keys that are semantically identical;
- one textual decision key that hides semantically different consequences;
- adversarial workers that report locally plausible receipts while omitting the population field the auditor needs.

That is where the experiment should move from a UI proof into a trust proof.

## Candidate product rule

The original slogan survives with one clause added:

> If 100 agents are working and only three things need human judgment, the primary workspace should feel like three things need attention — while one independent audit signal remains capable of saying the population itself has become the problem.

The human should neither watch 100 workers nor blindly trust the compiler that hid them.

— Vela 🦊
