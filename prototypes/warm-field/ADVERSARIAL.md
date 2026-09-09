# Warm-field adversarial evaluation

This is a break-the-thesis pass over the current browser prototype. It treats the field as a switching instrument and asks where persistent geography stops earning its screen space.

The current prototype is already useful enough to expose test-harness failures. Several requested conditions are absent, so this file separates **static failures we can establish from the code** from **timed trials that still need to run in the browser**.

## Static measurements from the current prototype

Reference stage geometry from `styles.css`:

| Profile | Reference stage | Focus inset | Focus area | Clearance between focus and edge hit zones |
| --- | ---: | ---: | ---: | ---: |
| wide | 1440 × 900 | 9.2% L/R, 8.5% T/B | 67.7% of stage | 54.5 px L/R, **8.5 px T/B** |
| laptop | 1100 × 720 | 12% L/R, 10% T/B | 60.8% of stage | 54 px L/R, **4 px T/B** |

The bookmark interaction targets are 78 × 92 px on left/right and 136 × 68 px on top/bottom. On the laptop profile, the invisible top/bottom target band therefore ends only **4 px** before the focus region begins. The sliver looks peripheral; the clickable territory consumes much more of the field.

At the current 16-task layout, minimum free distance between adjacent hit targets is:

| Profile | left | right | top | bottom |
| --- | ---: | ---: | ---: | ---: |
| wide | 70 px | 61 px | 65.6 px | 65.6 px |
| laptop | 37.6 px | 30.4 px | **18 px** | **18 px** |

So 16 tasks still avoid literal hit-target overlap. The laptop top and bottom edges are already close enough that another source of ambiguity—long labels, similar cues, status animation, or topology remapping—can become the dominant failure before pointer geometry does.

A balanced 24-task condition with six items per edge at normalized positions 0.10, 0.26, 0.42, 0.58, 0.74, 0.90 also fits mechanically on the laptop profile: 23.2 px free vertical spacing between left/right hit targets and 40 px free horizontal spacing between top/bottom hit targets. This is useful: **if 24 tasks fails, the first failure can be cognitive/visual before gross target overlap.**

With the same 0.10–0.90 placement rule, 28 tasks (seven per edge) approaches the motor limit: ~4 px free between vertical-edge targets and ~10.7 px between horizontal-edge targets. At 32 tasks, hit targets necessarily overlap on the laptop profile.

## Failure 1: the current task-count curve is confounded

`visibleTasks()` is `tasks.slice(0, taskCount)`. The slider therefore changes identity, edge load, and warm-set membership along with count.

| visible tasks | edge distribution | warm targets present |
| ---: | --- | ---: |
| 4 | 3 left / 1 right | **2** |
| 8 | 3 left / 3 right / 2 top | **4** |
| 12 | 3 per edge | 4 |
| 16 | 4 per edge | 4 |

A 4→8→12→16 latency curve cannot be called a density curve. The 4-task condition is especially friendly to one edge and has half the warm vocabulary.

**Required repair:** generate balanced fixtures: 4 = one per edge; 8 = two per edge; 12 = three per edge; 24 = six per edge. Keep the same four warm identities present at every count.

## Failure 2: the current corpus is unusually easy for spatial recognition

The 16 tasks mostly have distinct app labels, glyphs, accent colors, names, and faux content cues. That gives cropped geography several independent identifiers.

Run a hostile corpus where eight tasks share:

- the same app;
- the same glyph;
- the same accent/background;
- the same fake-window skeleton;
- a long common name prefix.

Example family:

```text
Production incident — authentication service — request timeout — shard 01
Production incident — authentication service — request timeout — shard 02
...
Production incident — authentication service — request timeout — shard 08
```

Place four of these in the warm set. With labels off, spatial location is doing the actual work. With labels on, long names stress the recovery path. MRU truncates names with ellipsis; search can exploit the discriminating suffix.

**Prediction worth killing:** stable geography should recover after training even when cue identity collapses. If it does not, the thesis depends more heavily on visual distinctiveness than the current note admits.

## Failure 3: long names can turn training/recovery into junk

Spatial bookmark labels use `white-space: nowrap` and a 180 px maximum box while overflow remains visually permissive. The laptop's closest top/bottom task centers are only 154 px apart at 16 tasks. Long common-prefix labels can therefore collide during training and can spill into the focus field during recovery.

Run three name regimes:

1. short: 10–18 characters;
2. long-distinct: 48–64 characters with the distinguishing token near the front;
3. long-similar: 48–64 characters with the distinguishing token at the end.

Measure wrong selections and acquisition latency with labels on, then off, then hover-only recovery.

## Failure 4: status is currently static

Every task receives one fixed `steady`, `changed`, `blocked`, or `done` state. The prototype cannot test the exact point where peripheral awareness becomes peripheral interruption.

Script unrelated status changes at:

- 0 events/s;
- 0.5 events/s;
- 2 events/s;
- 4 events/s.

Keep target identity and target state fixed during each acquisition trial. Change only non-target tasks. Record latency/error inflation against the 0 events/s baseline.

A useful pre-registered junk-drawer signal: **if unrelated churn raises warm spatial median latency by >25% or doubles wrong-pick rate while MRU/search stay within 10% of baseline, the persistent field is spending attention faster than it returns orientation.**

Also test one-shot emphasis with decay versus permanently vivid changed/blocked markers.

## Failure 5: disappearance/reappearance is only partially represented

Reducing `taskCount` hides only the tail of the array. Restoring the count returns those exact tasks to their fixed positions. This does test one useful case: 16 → 12 → 16 preserves the geography of the four returning tasks.

It does not test arbitrary disappearance, holes, compaction, task replacement, or identity reuse.

Repeatable lifecycle trial:

1. familiarize at 16 tasks;
2. select each of the four tail tasks twice;
3. switch to 12 for 20 acquisitions;
4. return to 16;
5. immediately acquire each returned task once in cropped, MRU, and search;
6. record first-return latency and wrong picks.

Then add the hostile variant: remove two tasks from the middle of the field. Compare **leave holes** versus **compact surviving tasks**. If compaction wins immediately but loses after delayed return, that is the real stability/cleanup trade.

## Failure 6: wide → laptop is scaling, not a topology change

The current screen switch preserves edge membership and normalized position. That is a useful transfer test, but it keeps the topology intact.

Add at least these transitions:

- single wide → laptop;
- dual side-by-side displays → laptop;
- dual side-by-side → single external display;
- landscape → portrait;
- external monitor removed, then reattached.

For each task preserve semantic identity while varying the mapping rule:

1. preserve normalized coordinates globally;
2. preserve edge membership only;
3. preserve task clusters/neighborhoods;
4. abandon geography and recover through search.

Measure first-return acquisition time for the four warm tasks, number of wrong edge guesses, and trials required to return within 10% of pre-transition median.

## Failure 7: MRU/search comparison needs two protocols

MRU is computed from one shared `accessHistory` that also records selections made in spatial and search modes. That is realistic for a hybrid product but contaminates an isolated switcher comparison. Search trials also open the search overlay automatically after the timer begins, so overlay invocation keystrokes are excluded while typing/filtering time remains included.

Run both:

### Isolated method

- identical seeded task fixture;
- identical preloaded access history;
- identical target sequence;
- no free-focus actions between measured trials;
- separate persisted history per switcher;
- two search measurements: overlay pre-opened and invocation-inclusive.

### Hybrid product

Use one shared history and allow free switching. Measure which method the user voluntarily chooses for warm, recent, and cold targets.

The isolated protocol tests mechanism. The hybrid protocol tests whether the field earns a place beside MRU and search in actual use.

## Core test matrix

For each method—cropped geography, MRU, search—run:

- task count: **4 / 8 / 12 / 24**;
- display: wide / laptop;
- identity: distinct / similar;
- names: short / long-similar;
- churn: 0 / 2 events per second;
- lifecycle: stable / disappear-reappear;
- topology: unchanged / changed after learning.

Use the same four warm targets in every task-count condition. Run at least 24 acquisitions per method/condition after familiarization; keep target schedules seeded and export the raw trial records.

Primary measures:

- median and p95 acquisition latency;
- wrong picks per 24 trials;
- first-return latency after disappearance or topology change;
- trials-to-recover within 10% of pre-change median;
- search characters to unique match;
- MRU rank at selection;
- spatial edge + slot at selection.

## Operational boundary: useful field → visual junk drawer

Treat the boundary as crossed for a condition when **two or more** of these occur after familiarization:

- warm spatial median latency is >25% worse than its 12-task static baseline;
- warm spatial p95 is worse than MRU p95;
- wrong-pick rate exceeds 5%;
- unrelated status churn inflates spatial median latency >25%;
- first-return after a display/topology change needs more than 8 trials to recover within 10% of the pre-change median;
- users invoke search for a warm target more often than they use the visible field in the hybrid protocol.

These thresholds are deliberately falsifiable. Revise them after the first pilot if they classify obvious successes/failures badly, then freeze them before the comparative run.

## Current verdict before timed trials

The thesis survives the 12-task geometry check. The current prototype cannot yet establish a density threshold because task count is confounded, 24 tasks are absent, identities are friendly, status never churns, arbitrary lifecycle events are absent, and the display transition preserves topology.

The laptop profile is already the sharper adversary: only 4 px separate the invisible top/bottom hit band from the focus region, and at 16 tasks only 18 px separate the closest top/bottom hit targets. That is exactly where similar-looking tasks, long labels, and live status should be introduced before anyone concludes the field remains calm.

— Rook 🐦‍⬛
