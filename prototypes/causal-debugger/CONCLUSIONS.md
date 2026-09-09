# Causal debugger prototype conclusions

Built and tested 2026-09-09.

## Result

The clean thread works with a compact identity graph:

```text
human click
-> browser interaction event
-> runtime handler event
-> network request receipt
-> server log receipt
-> source artifact + active revision
-> working-source edit + diff receipt
-> runtime rebuild + new active revision
-> browser reload event
-> replay receipt
-> network verification
-> visible UI proof
```

Selecting one landmark moves one primary stage. The causal ribbon supplies traversal. Network, logs, source, diff, and proof appear contextually from the selected event, which kept the prototype away from a six-pane cockpit.

The executable test also forced working source and active runtime source to carry separate revisions. A replay immediately after the edit still fails. A replay after rebuild passes. That distinction gives the edit -> rebuild edge real semantic content.

## The neat task model breaks cleanly

The shared-cause scenario creates two human tasks:

```text
task:profile-save ----\
                       > source:shared-input-normalizer
 task:invite-role ----/
```

Each task begins from a different visible object, focus identity, browser interaction, request, and server-log receipt. Both source events resolve to the same source artifact and buggy active revision.

The fix then converges:

```text
profile source failure ----\
                            > one source.edit
invite source failure -----/          |
                                      v
                              one runtime.rebuild
                                  /        \
                                 v          v
                         profile replay   invite replay
                                 |          |
                                 v          v
                           profile proof   invite proof
```

The shared edit and rebuild carry `taskIds: [task:profile-save, task:invite-role]`. The edit has two causal parents. Duplicating either event per task would invent false history.

## “Task” is a human-facing lens

The experiment supports a narrower persistent model:

> A task is a durable human grouping and resumption lens over a lower-level graph of independently identified runtime artifacts, browser pages, focus objects, source artifacts/revisions, causal events, and receipts.

Task membership is an edge, not object ownership.

That lets tasks split, merge, overlap, and retire while evidence keeps exact identity. A source artifact can belong to several tasks. One edit can satisfy several tasks. One runtime rebuild can advance several tasks. Verification can fan back out because the human claims differ even when the mechanism is shared.

The lower-level graph carries machine truth. Task supplies human intent, responsibility, naming, and a useful scope for resumption.

## Which identities earned their place

### Runtime identity

Useful and stable. A runtime survives several source revisions and build generations. The build generation belongs beneath runtime identity instead of replacing it.

### Browser/page identity

Useful as a session handle. It distinguishes the exact page participating in the causal thread and survives soft task switching. A future prototype should test tab duplication, hard reload, browser restart, and human/agent handoff.

### Focus object

Useful as the bridge from visible selection into the graph. It should remain an independently identified referent because one task can contain several focus objects and one source artifact can serve several focus objects.

### Source revision

Essential. The prototype needed two forms: working revision and active runtime revision. Collapsing them would falsely claim that an edit had already changed the running application.

### Causal/time event

Essential, with one correction: timestamp and sequence alone are insufficient. Explicit `parents[]` carries the causal relation. Time orders observations; parent edges explain why one event follows from another.

### Receipt/evidence link

Essential. Compact event cards stay readable because exact payloads, logs, source, diffs, builds, replays, and proofs remain one handle away. Receipts can also belong to several tasks when the underlying action is shared.

## Product scars

1. **Source is a better join point than task for shared causes.** The second failure became obvious as soon as both source events resolved to the same `sourceArtifactId` and active revision.
2. **Edit and rebuild need different identities.** Otherwise the interface implies code change and runtime change happen atomically.
3. **Causality needs edges.** Chronological ribbons become misleading once tasks braid; the UI can still present a ribbon while the data underneath is a graph.
4. **Verification belongs to claims.** The shared rebuild is one event, while “Profile saves” and “Invite role accepts spaces” remain two separately verified human claims.
5. **Many-to-many membership should be primitive.** Adding it later would force migration precisely when the interesting debugging cases appear.
6. **The reducer should display shared events once.** A shared edit shown twice under two tasks would make the human think two edits happened.

## Next implementation pressure

The next prototype should replace one simulated browser handoff with a real instrumented browser target and test these harder transitions:

- two pages attached to one runtime;
- one page switching between two runtimes/worktrees;
- browser hard reload while preserving task/evidence lineage;
- a source artifact changing outside the causal-debugger process;
- one agent taking over a human-selected focus object and returning verification;
- a shared runtime event whose task membership remains unknown until later evidence links it.

That last case would test whether task membership sometimes needs to be derived retroactively instead of attached at event creation.
