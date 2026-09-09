# When 100 agents feel like three decisions

The human-facing workspace for high-concurrency agent work should represent **outcomes, unresolved exceptions, and decisions**. Workers become provenance and execution detail.

The strongest target is simple:

> If 100 agents are working and only three things require human judgement, the workspace should feel like three things require attention.

Concurrency should increase useful work faster than it increases interface burden.

This note studies what happens after the familiar “one terminal per agent” and “one card per worker” models stop scaling. The question is less about fitting more status onto a screen and more about compiling a large execution world into a small number of human-relevant objects while preserving exact evidence underneath.

## Nearby work already points in the same direction

Several projects around Tact have independently arrived at pieces of the same interaction.

### Stensibly: human attention belongs on consequential exceptions

[Stensibly’s product model](https://github.com/teamleaderleo/stensibly/blob/main/docs/product-model.md) separates the human board from the durable records that govern responsibility, authority, decisions, effects, and recovery.

Two ideas are especially important for the interface:

- ordinary healthy work can remain quiet;
- a permanent worker roster, throughput leaderboard, or transcript feed adds little to the control function.

Stensibly’s exact human objects are stronger: unresolved judgement, approval, ambiguous effects, recovery, authority mismatch, provider prerequisites, and consequences outside standing policy.

That suggests a human surface built around **exceptions with clearing conditions**, rather than workers with activity indicators.

### Cultist: many receipts can fan into one decision

[Cultist’s supervision attention-compression note](https://github.com/teamleaderleo/cultist/blob/main/research/supervision-attention-compression.md) makes the next leap: many individually valid worker results can reconcile into one parent review surface when they share a decision boundary.

Its example is the right kind of arithmetic:

```text
27 autonomous changes completed
22 covered by deterministic checks and standing policy
 3 deserve semantic awareness
 2 share one public-behavior decision

human interruptions: 1
```

This is a stronger scaling abstraction than compact worker cards. The product performs **review fan-in** before asking for attention.

Cultist also gives a useful packet vocabulary: decision requested, recommendation, exact work identity, checks, behavior change, precedent, counterexamples, residual UNKNOWNs, recovery path, blocked downstream work, and omission receipts.

### Lazy Commander: terminal output can become evidence without becoming the interface

[Lazy Commander](https://github.com/teamleaderleo/Lazy-Commander) already treats raw command output as recoverable evidence and the ordinary model-visible result as a bounded view.

Its useful pipeline is:

```text
command
-> exact raw receipt
-> bounded faithful view
-> meaningful result
```

For a human workspace, the same idea can continue upward:

```text
terminal output
-> exact receipt
-> meaningful state change
-> work/outcome update
-> exception or decision packet when needed
-> human attention
```

The terminal remains an evidence source. It stops being the primary supervision surface.

### Glaeda: large internal fan-out can present as one exact operation

[Glaeda’s resident repository-evidence experiment](https://github.com/teamleaderleo/glaeda#measured-results) used 28 bounded local Git processes internally while presenting one identity-bearing result to the worker.

That is an interaction lesson as much as a latency lesson. Internal concurrency gains little by demanding equal visual representation. A large amount of execution can collapse into one named operation, one result, and one evidence path.

### terminal-kit: stable location is useful when it represents human-scale objects

[terminal-kit’s interaction model](https://github.com/teamleaderleo/terminal-kit/blob/main/docs/interaction-model.md) and [cmux overview](https://github.com/teamleaderleo/terminal-kit/blob/main/scripts/overview.sh) favor familiar navigation, stable workspace locations, quick overview-to-focus transitions, and preview without destroying the current context.

That spatial instinct still belongs in a 100-agent environment. The crucial change is what earns a stable place. **Projects, outcomes, commitments, and long-lived work regions** can earn location. Disposable workers usually cannot.

## The primary human object should be a commitment

A worker answers “who or what is executing?”

A commitment answers “what are we trying to make true?”

At high concurrency, the second question is the durable one.

A commitment can represent:

- ship the release;
- migrate an API;
- resolve a customer-visible defect;
- finish a research conclusion;
- review a dependency upgrade;
- prepare a deployment;
- satisfy a policy or verification boundary.

One commitment may involve one agent, twenty agents, scripts, CI, external providers, and several rounds of replacement workers. The human should keep seeing the same object while the execution population changes underneath it.

Worker identity remains available for attribution, recovery, debugging, cost analysis, and trust decisions. It moves one level down in the hierarchy.

A useful rule:

> Show the worker prominently when the worker is itself the problem.

Examples include a stalled run, repeated malformed work, runaway resource use, incompatible capability, or a worker-specific recovery action.

## A stronger workspace: field, attention queue, packet, receipt

The interface can become four connected layers.

### 1. The field: stable outcome geography

The overview is a stable field of human-scale commitments and project regions.

It answers:

- What are the major things currently in motion?
- Which are settled, moving, waiting, or carrying unresolved uncertainty?
- Where is my attention already invested?
- Which regions changed meaningfully since I last looked?

A region can summarize large execution fan-out in one compact line:

```text
API migration
18 / 25 work items settled
11 waiting on one contract decision
2 external effects pending observation
last meaningful change 6m ago
```

The region keeps its place. Workers can start, finish, disappear, or be replaced without rearranging the human’s entire visual field.

This preserves spatial memory while allowing execution to stay dynamic.

### 2. The attention queue: unresolved human obligations

A small queue collects only things that currently require human judgement or recovery.

Typical entries:

- approve a public behavior change;
- reconcile an ambiguous deployment effect;
- choose between two product interpretations;
- resolve a blocker affecting 17 downstream tasks;
- grant or deny a bounded capability;
- recover an expired/stalled run when automation exhausted its safe options.

Each entry should say **why now**.

Examples:

```text
Choose API compatibility behavior
Blocks 11 downstream items · public behavior · 2 viable interpretations
```

```text
Reconcile deployment attempt
Provider effect remains ambiguous · retry could duplicate the effect
```

Priority becomes legible through cause and consequence instead of an unexplained numeric score.

### 3. The focus surface: a decision packet

Selecting an attention object opens a bounded packet assembled around one decision boundary.

A strong default packet:

```text
Decision requested
Recommended action
Why this reached you
Exact current work / candidate identity
What changed
Relevant deterministic checks
Behavior or contract impact
Counterexamples / conflicting evidence
Residual UNKNOWNs
Consequences of each option
Recovery / reversal path
Downstream work currently waiting
What clears this exception
Evidence omitted from the default view
```

The packet should be usable as the decision surface itself, with direct actions where authority allows them.

The user should rarely need to reconstruct the question by opening five terminals, three PRs, a chat transcript, and a CI page.

### 4. The receipt layer: exact evidence one gesture away

Every summarized claim should retain a path back to exact evidence.

A receipt can include:

- command and exact captured output;
- check identity and result;
- source revision / file references;
- provider request and observed result;
- authority / generation identity where relevant;
- timestamps and provenance;
- explicit gaps, truncation, or incomplete capture.

The summary earns trust by being expandable into receipts. The default view earns calm by keeping those receipts collapsed.

The relationship should feel like a map and its source material, rather than a summary that asks for faith.

## Healthy work should be quiet

High concurrency makes “activity” a dangerous default notification source.

With 100 useful agents, successful commands, ordinary completions, retries within policy, deterministic checks, and routine handoffs can produce a torrent of true information. Truth alone does not earn interruption.

A healthy policy can be much stricter.

### Interrupt on transition into a human-required state

Examples:

- autonomous execution reaches a semantic choice outside standing policy;
- an external effect becomes ambiguous;
- a blocker begins holding valuable downstream work;
- a deadline or expiry makes delay consequential;
- uncertainty crosses a boundary where the next action genuinely depends on a human;
- recovery exhausts safe automated paths.

### Keep one unresolved object alive instead of sending repeated alerts

Once the human has an unresolved decision object, ordinary updates attach to that object quietly.

A fresh interruption is justified when the decision itself materially changes:

- consequence class changes;
- blocked downstream work expands enough to alter urgency;
- new evidence removes or introduces a viable option;
- a deadline threshold is crossed;
- the previous recommendation becomes inapplicable;
- the object resolves and later reopens under a new generation.

This converts notifications from “events happened” into “your obligation changed.”

### Let child completion disappear into parent progress

A child task completing can update its parent commitment silently.

A parent outcome settling can deserve a visible state change because it closes something the human actually cares about.

The visual system can still carry pleasure here: a completed major commitment can feel satisfying without turning every passing test into confetti.

## Priority should explain itself

Opaque priority scores create another object the human has to learn.

A better escalation order can be derived from a small set of visible reasons:

1. **Consequence** — public, destructive, expensive, externally visible, or hard to reverse.
2. **Recovery** — easy rollback, bounded retry, ambiguous effect, or irreversible transition.
3. **Downstream leverage** — how much useful work waits on this decision or blocker.
4. **Time sensitivity** — deadline, lease/approval expiry, provider window, or accumulating cost of delay.
5. **Decision uncertainty** — which unresolved fact or interpretation can change the justified action.

The queue can say:

```text
1. Deployment reconciliation
   ambiguous external effect · retry risk · 9 items waiting

2. API behavior decision
   public contract · 14 items waiting · reversible before merge

3. Copy choice
   3 items waiting · local/reversible
```

The ranking is readable from the facts.

## Blockers should be grouped by clearing condition

A list of twenty blocked tasks can be one blocker.

The useful human object is often:

```text
Clearing condition: choose pagination compatibility behavior
Affected work: 11 items across 4 workers
Oldest wait: 38m
Work that can proceed meanwhile: 23 items
```

This turns blocked work from red decoration into a leverage map.

It also suggests a useful fan-in rule: if many items wait on the same exact human decision, they should create one attention object.

## Uncertainty should be typed and consequential

A generic confidence meter hides the question the human needs to answer.

Useful uncertainty has a name and a consequence.

Examples:

- **missing evidence** — a required check or source fact has yet to arrive;
- **conflicting evidence** — two exact observations support different actions;
- **ambiguous external effect** — the provider may have accepted an operation whose response was lost;
- **semantic disagreement** — workers produced competing interpretations of the desired behavior;
- **stale premise** — new evidence challenges an assumption shared by current work;
- **incomplete execution** — capture or verification ended before a required boundary.

The interface should also say what the uncertainty can change.

```text
UNKNOWN: whether existing clients depend on empty-array behavior
Can change: compatibility choice A vs B
Current evidence: 2 repository precedents, 1 contradictory integration test
```

An UNKNOWN that cannot change the current action under standing policy can remain in the receipt layer.

## Task and worker summaries should compile upward

At 100 concurrent workers, a useful top-level summary could look like:

```text
6 active commitments
73 work items executing or waiting on machine-owned conditions
21 items settled since last visit
3 human decisions
1 recovery exception
2 shared blockers affecting 19 items
0 ambiguous external effects outside the open recovery exception
```

Drill into a commitment:

```text
API migration
25 items total
18 settled
 4 executing
 3 waiting on one human decision
12 workers contributed
 5 currently active
```

Drill into the decision:

```text
Choose compatibility behavior
blocks items 19, 20, 22
workers A17, A23, A41 currently waiting
```

The worker summary exists, but the hierarchy begins with the outcome and the human obligation.

## Spatial supervision and feed supervision should split jobs

A chronological feed is excellent evidence for “what happened?”

A stable spatial field is better for “where does current work live?”

A dynamic attention queue is better for “what needs me now?”

Trying to make one surface answer all three questions creates churn.

### Use space for durable human meaning

Give stable locations to:

- projects;
- commitments;
- long-lived work regions;
- frequently revisited decision contexts.

This supports peripheral awareness and learned location.

### Use dynamic ranking only for attention objects

Exceptions can move because urgency genuinely changes.

The base field remains stable while the attention queue reorders a small number of unresolved obligations.

### Use the feed as forensic history

Chronology belongs behind the current state:

- recent meaningful transitions;
- exact work history;
- prior decisions;
- raw receipts;
- provider events;
- worker attribution.

A feed becomes a powerful drill-down tool once it stops carrying the burden of being the home screen.

## Scale changes the amount of hidden fan-out, not the number of primary human objects

### Around 30 concurrent agents

A human can still recognize many individual tasks, which makes worker-centric UI tempting.

This is the right moment to force the stronger model early:

- group by commitment;
- compile child progress upward;
- create explicit attention objects;
- keep receipts recoverable;
- test whether the user can ignore healthy work for an hour.

### Around 50 concurrent agents

Fan-in becomes essential.

Several workers will often share one dependency, decision, premise, or verification boundary. The interface should detect shared clearing conditions and prevent duplicate interruptions.

The key metric becomes human review burden per trustworthy unit of completed work.

### Around 100 concurrent agents

The execution population becomes ambient.

The user should perceive:

- a handful of outcomes moving;
- a few current exceptions;
- a small number of decisions;
- confidence that receipts and history remain recoverable.

The workspace becomes an **attention compiler**: a large event stream enters; a tiny set of human obligations leaves.

The visual count of primary objects should depend on current human-relevant state more than agent count.

## Example: 100 workers, three things to judge

Imagine 100 workers across eight commitments.

During the last hour:

- 412 commands completed;
- 73 checks ran;
- 38 work items settled;
- 19 workers handed off or exited;
- 6 provider operations completed;
- 4 transient failures recovered inside policy;
- 2 tasks discovered the same API ambiguity;
- 11 downstream tasks now wait on that ambiguity;
- 1 deployment response was lost after dispatch;
- 1 research thread found a counterexample that weakens a shared premise.

The human surface can contain three entries:

```text
1. Reconcile deployment attempt
   ambiguous external effect · retry risk

2. Choose API compatibility behavior
   11 downstream items waiting · two viable interpretations

3. Review premise-changing counterexample
   may redirect 14 active items across two commitments
```

Everything else updates the field, receipts, or history quietly.

That is the target.

## Interaction experiments worth building

### Experiment A: 100-agent quiet field

Prototype eight stable commitment regions fed by 100 synthetic workers. Give only three human-required exceptions.

Compare against a worker-card grid.

Measure:

- time to identify every required human action;
- false attention spent on healthy work;
- drill-down count before a correct decision;
- ability to return to the prior commitment after inspecting an exception;
- recall of where major work lives.

### Experiment B: receipt fan-in into one decision packet

Take 20–30 child results sharing one decision boundary and compile them into one packet.

Include one difficult negative control: a child result with a distinct authority, recovery, or semantic boundary that should prevent complete fan-in.

Measure whether the reviewer catches it and whether the packet reduces investigation burden.

### Experiment C: notification-policy replay

Replay a noisy historical or synthetic event stream through several policies:

- every event;
- task completion only;
- meaningful state change;
- human-required transition plus fan-in.

Count interruptions and verify whether any decision-changing event disappears.

The best policy should dramatically cut alerts while preserving every consequential escalation.

### Experiment D: stable field plus attention queue versus feed-only supervision

Build two versions of the same scenario.

One keeps commitments in stable positions and routes exceptions into a small dynamic queue. The other uses a chronological supervision feed.

Test interruption recovery, locating work after time away, and identifying the highest-leverage blocker.

## Failure cases to protect against

A calm high-concurrency interface can become dangerously persuasive if its reduction layer hides the one fact that changes action.

Important failure cases:

- fan-in merges children with distinct decision boundaries;
- a green parent hides one ambiguous external effect;
- a concise packet omits the only counterexample;
- dynamic priority thrashes and destroys learned location;
- stale summaries remain visible after provider state changes;
- a notification policy suppresses a material escalation because the object already existed;
- “healthy” status depends on a semantic assumption nobody explicitly owned;
- exact receipts exist in theory but take too much interaction to reach during doubt.

The quiet interface earns its quietness through exact drill-down, typed uncertainty, and conservative escalation boundaries.

## Working principles

1. **Model commitments before workers.** Durable human intent survives worker churn.
2. **Compile fan-out upward.** Many commands become receipts; many receipts become state; many child states can become one decision.
3. **Interrupt on obligations, not activity.** Human attention follows unresolved judgement, consequence, ambiguity, recovery, and leverage.
4. **Keep healthy work peripheral.** Ordinary progress updates the field quietly.
5. **Let priority explain itself.** Consequence, recovery, downstream leverage, time sensitivity, and decision uncertainty justify order.
6. **Represent UNKNOWNs by type and consequence.** Show the fact that could change the action.
7. **Use space for durable meaning.** Let commitments stay put while a small exception queue moves.
8. **Keep chronology for investigation.** The feed is history, not the supervision home.
9. **Make every summary expandable into exact receipts.** Trust comes from recoverable evidence.
10. **Test the quiet state first.** A 100-agent workspace with zero human decisions should feel almost empty.

The deepest product shift is that agent concurrency becomes similar to CPU concurrency: useful, sometimes important to inspect, and usually below the level where a person should manage individual execution units.

A mature human-facing workspace should make large amounts of autonomous work feel legible through a few stable commitments and a few precise moments of judgement.

— Vela 🦊
