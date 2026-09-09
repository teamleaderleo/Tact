# Operator loop: turn the prototypes into evidence

Tact has enough research and enough first-pass code. Leo's job now is **use, react, repeat, and leave evidence**.

The goal is not to become the project manager for six little demos. The goal is to let the prototypes push back on Leo's instincts.

A useful default rule:

> Do not start another general research swarm until one of the current prototypes has produced human evidence, a broken harness, or a changed belief.

`WORKBENCH.md` still owns priorities and promoted principles. This note is the operating loop for collecting the evidence that can change it.

## The first session

Do these in order. One session can be roughly an hour. Stop before it turns into homework.

### 1. Koi's microcraft calibration — establish a baseline

Run:

```bash
cd experiments/microcraft
python3 -m http.server 4173
```

Open `http://localhost:4173`.

Use **Blind** mode. Start with **Subtle** defects. Run roughly 30 comparisons across the available categories.

For every trial:

1. pick the stronger version before revealing the answer;
2. write the diagnosis if a word comes naturally;
3. use **I can feel it; I can't name it yet** when that is genuinely the state;
4. reveal the exact changed variable;
5. notice whether the revealed vocabulary matches what the eye was reacting to.

Do not turn this into a score-chasing game. The interesting output is:

- categories where the eye is already reliable;
- categories where preference is reliable but diagnosis is vague;
- categories where the eye itself misses the defect;
- exact words that begin replacing "this feels wrong."

At the end, write down the current-month accuracy and the 2–3 categories that deserve another pass.

**What this is for:** turning artistic discrimination into product-design diagnosis.

### 2. Luma's Clutch Lab — test repair, not demo magic

Run:

```bash
cd prototypes/microphone-clutch
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser with microphone support. Use the deterministic voice simulator when real speech recognition gets in the way of comparing conditions.

Start with one task, preferably **Failed request**. Run this small matrix:

1. clean pointer + keyboard;
2. clean voice-only;
3. clean mixed selection + voice;
4. voice-only with wrong referent;
5. mixed with wrong referent;
6. voice-only with wrong intent;
7. mixed with wrong intent.

If the comparison is interesting, repeat it on **Merge work** and **Spacing edit**.

Pay attention to:

- how many words are spent naming something already visible;
- whether a wrong slot can be repaired locally;
- whether the `Heard -> Understood -> Did` receipt explains the mistake quickly;
- whether the interpretation card becomes another interface to babysit;
- whether mixed interaction feels like steering the artifact or operating a voice product;
- whether speech is still attractive after the first novelty wears off.

Export the JSON results after a useful run.

**What this is for:** deciding where voice actually removes serialization and repair cost.

### 3. Sumi's causal debugger — judge the interaction after the model already survived

Run:

```bash
cd prototypes/causal-debugger
npm start
```

Open `http://127.0.0.1:4317`.

Walk the first thread exactly once:

```text
Save changes
-> Trace failure
-> traverse browser/runtime/request/log/source
-> Apply smallest fix
-> Rebuild + reload
-> Replay reproduction
-> Capture visible verification
```

Then use **Break task model** and follow the two-task/shared-source case.

The implementation has already produced one conceptual result: task membership behaves better as a many-to-many human grouping over lower-level artifacts/events than as ownership of those objects. The human test is now about the interface.

Record only a few observations:

- where did I lose the causal thread?
- where did I know exactly what had happened without opening another view?
- which receipt/event felt redundant?
- which transition preserved my thought?
- did the causal ribbon feel like navigation, explanation, or chrome?
- when the two tasks converged on one shared edit, did the UI make that fact obvious?

**What this is for:** deciding whether the causal graph is presented as one understandable debugging activity rather than a data-model demo.

Then stop.

Three small human runs are more useful than opening ten more tabs of design research.

## The second session

### Warm field — browse now, measure after the harness repair

`prototypes/warm-field/` is already useful for informal poking. Try cropped edges, scaled mini-windows, MRU, and search. Notice which one your hand reaches for.

Do **not** treat the current timed density results as evidence yet.

Rook found several confounds and opened follow-up work around:

- edge-balanced 4/8/12/24-task fixtures;
- hostile similar-looking identities and long names;
- non-target status churn;
- arbitrary disappearance/reappearance;
- actual display-topology changes;
- isolated method comparisons versus realistic shared-history hybrid use.

The current prototype can teach feel. The repaired harness should teach boundaries.

When those conditions land, run repeated warm-target trials rather than a five-minute first impression. The central question is whether stable geography earns permanent screen space beside strong MRU and search controls.

### Nori's capture/retrieve app — use real-ish material, then hand it to a stranger

Run:

```bash
cd experiments/capture-retrieve-handoff-delete
python app.py --seed-demo
```

Open `http://127.0.0.1:8787`.

After learning the mechanics, create a local corpus with 20–50 ordinary notes or decisions that actually resemble how Leo captures thoughts. Keep sensitive material out of the experiment and use synthetic secrets for deletion tests.

Then test four distinct jobs:

1. refind something by remembered wording;
2. refind something using different wording;
3. ask what is currently true after several superseding claims;
4. retrieve a set where completeness matters.

The important follow-up is the **stranger handoff**. Export the corpus and give it to a fresh chat or person with the prescribed tasks and no explanation of where the answers live.

The author understanding their own archive proves very little. A stranger finding the current answer and its provenance is much stronger evidence.

### Vela's attention compiler — inspect the rule, not every worker

The current simulator already demonstrated the useful failure mode: the primary reducer can continue to show three human obligations while the worker population has a correlated problem.

The current lesson is:

```text
commitment field
+ human obligation queue
+ independent population audit
+ exact receipts beneath all three
```

Leo does not need to stare at 100 synthetic workers for an hour. The next useful implementation work belongs to the auditor: remove convenient ground-truth fields and see whether population hazards can still be detected from weaker evidence.

## What Leo should write after using something

Keep observation records short and concrete.

A good entry is:

```text
Prototype / condition:
What I expected:
What I did:
Where I hesitated:
What became easier after repetition:
What became more annoying after repetition:
What I reached for instead:
Exact failure or surprise:
Belief affected: stronger / weaker / narrower / unchanged
Next test that could falsify this:
```

Prefer:

> In mixed voice, selecting the request removed six spoken identifier words, but repairing wrong intent still made me stare at the interpretation card.

over:

> Mixed multimodality is the future.

Prefer:

> After 20 edge-bookmark switches I acquired the four warm tasks without reading labels, but after the laptop remap I used search for three of the first four returns.

 over:

> Spatial memory works.

The experiment should leave behind a scar: a stronger claim, a weaker claim, a narrower boundary, or a killed idea.

## What Leo should not do yet

- Do not add another broad design doctrine because one prototype feels cool once.
- Do not build native macOS versions before the fake interaction earns its cost.
- Do not optimize the demos into products before the question they test becomes clearer.
- Do not treat synthetic simulator success as human usability evidence.
- Do not turn every observation into a new issue. Open an issue when there is a specific buildable next test.
- Do not spend the entire day measuring. Tact should sharpen the eye and the hand, not become a second job.

## Current division of labor

Leo is the primary instrument for **taste, fluency, irritation, continuity, repair, and repeated-use evidence**.

The scout/builders can continue handling:

- harness hardening;
- adversarial fixtures;
- deterministic replay;
- measurement plumbing;
- browser/runtime integration;
- synthesis after evidence arrives.

That division is intentional. Leo should spend more time experiencing the interaction than maintaining the experiment framework.

— Pudding 🐻
