# Warm-field switching prototype

Small browser prototype for Workbench experiment 2: **edge geography vs MRU vs search**.

The prototype deliberately uses fake windows. The first question is whether the switching interaction itself earns its keep before paying for macOS window-control integration.

## Run it

No build step and no dependencies.

```bash
cd prototypes/warm-field
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Opening `index.html` directly also works in current desktop browsers.

## What exists

Four switchers share the same 12 fake tasks:

1. **Cropped edge bookmarks** — full-scale window fragments remain in stable normalized edge positions. The visible crop is narrow while the pointer target extends much farther inward.
2. **Scaled mini-windows** — the same tasks occupy the same stable slots, but each cue is a scaled full-window thumbnail.
3. **MRU rail** — tasks reorder by last successful/free focus.
4. **Search** — task-name/app/state search with direct selection.

The focus window occupies the middle of the field and never displaces the edge geography. `Esc` collapses focus while leaving the map intact.

Two screen presets change the field from a wide desktop proportion to a laptop proportion. Spatial variants keep each task on the same edge and at the same normalized position, so the experiment can test how much semantic identity survives when absolute pixel geography moves.

Task count can vary from 4 to 16 in steps of two. This is the crude first probe for the clutter threshold.

## Recognition cues

Every fake task has:

- a human task name;
- an app/type label;
- a fixed edge + position;
- a distinct accent/glyph and faux content pattern;
- one terse state: `steady`, `changed`, `blocked`, or `done`.

For cropped bookmarks, a full-scale fake window sits behind a narrow clipping region. For scaled bookmarks, the same fake window is reduced to a miniature. This keeps the comparison centered on **cropping vs scaling the same source representation**.

The visual strip and the interaction target are deliberately different sizes. A left/right crop is ~31 px deep, while the button hit region is 78 × 92 px. Top/bottom crops use the same idea. This lets a sliver remain visually peripheral while still being easy to acquire with a pointer.

`training labels` exposes task names beside bookmarks. Turn it off after familiarization so recognition relies more heavily on the visual cue + learned location. Hover/focus still reveals the label as a recovery path.

## Instrumentation

`N` starts a measured target-acquisition trial. Trial classes rotate through warm, recent, and cold targets.

- **warm** repeatedly samples a four-task working set;
- **recent** picks from prior focus history;
- **cold** prefers unseen or least-recently accessed tasks.

A wrong selection stays in the same trial and increments the error count. A correct selection completes it.

Completed-trial records include:

- switcher mode;
- screen profile;
- visible task count;
- label-training state;
- target class and task identity;
- stable edge + normalized position;
- acquisition latency;
- wrong selections before success;
- approximate pointer distance from trial start;
- amount of prior access history.

The event log also records mode changes, screen changes, search openings/query lengths, free focus changes, selections, and focus collapse.

Data persists in `localStorage`. Export the session as JSON for full event analysis or CSV for completed-trial comparison.

## Suggested first run

Keep the task corpus fixed. Avoid tuning the layout between methods.

1. **Familiarize:** cropped mode, 12 tasks, wide screen, labels on. Freely switch for 2–3 minutes.
2. **Warm trials:** labels off. Run at least 24 trials in cropped mode.
3. Repeat 24 trials in scaled mode.
4. Repeat in MRU and search.
5. Switch back to cropped and scaled after the MRU/search blocks. The return matters because learned geography may show its value only after interruption.
6. Change from wide to laptop without clearing data. Run another 12–24 trials per spatial mode.
7. Repeat selected blocks at 6, 10, 12, 14, and 16 tasks to look for the point where the edge becomes visually or motorically crowded.

For a cleaner comparison, run separate sessions per method with `Clear`, then concatenate exported CSV files. For a learning-curve study, keep one session and use the exported trial index/access depth.

## Builder observations

These are implementation observations, not user-study results.

### Cropping can preserve legible fragments while scaling quickly destroys them

At the current sizes, the cropped version can retain original-scale chrome, title fragments, dominant color, and watermark pieces. The scaled version preserves global silhouette and more of the window but turns text into texture. That is exactly the trade the prototype should test.

A useful follow-up is to make cue content more realistic. The present fake windows share a common skeleton and vary accent/glyph/task text. Real browser pages, terminals, documents, and image surfaces may make cropping substantially stronger because their local fragments are more distinctive.

### The hit target must be decoupled from the visible sliver

A literal 20–30 px strip is unnecessarily fiddly. The current bookmark owns an invisible/transparent interaction region extending into the field while keeping the visible crop narrow. This feels like an important requirement for any native version.

### Stable geography survives focus cleanly when focus is an allocation change

The center window changes task content; the peripheral layer stays mounted in exactly the same slots. There is no intermediate overview layout to rebuild and no reflow after focus. This makes collapse cheap and lets the user keep partial awareness during deep focus.

### Laptop proportions expose the likely pressure point

The same normalized slots fit, but the shorter/narrower field gives each bookmark less separation and gives the center less breathing room. The prototype keeps the mapping on purpose instead of automatically packing harder. That lets us observe when preserving geography becomes worse than remapping it.

### MRU and search need to remain genuinely strong controls

The prototype gives MRU full readable names and search full semantic labels because the experiment is about boundary conditions, not making the spatial variants win. Search should dominate cold named retrieval. MRU should be excellent when the desired task is among the last few. A spatial system earns complexity only if repeated warm switching becomes faster or easier enough to justify it.

## Next questions

1. **How local can the cue be?** Replace the shared fake-window skeleton with more realistic surfaces and test 18 / 26 / 34 / 46 px crops.
2. **Does user placement outperform assigned slots?** Let a user drag tasks to edge slots during familiarization, then freeze those positions for measurement.
3. **Does position beat cue, or cue beat position?** After learning, swap only the task visuals between slots while preserving labels; then swap only positions while preserving visuals.
4. **What counts as clutter first?** Visual competition, pointer overlap, remembering too many locations, or center-region starvation may fail at different task counts.
5. **Should laptop transfer preserve normalized positions, edge membership only, or task clusters?** The current prototype preserves normalized positions. Other transfer rules are worth testing.
6. **How should status change without becoming peripheral noise?** The current dot is static. Test brief one-shot emphasis on `changed/blocked`, then decay back to a quiet persistent state.
7. **Do cropped bookmarks still work when windows share app chrome?** Several browser tabs or terminal windows may need task-level labels/landmarks because app identity contributes little.
8. **What should native macOS control first?** A thin wrapper around real window screenshots and activation would test recognition with authentic surfaces while leaving window movement/manual arrangement under macOS.

— Miso 🐈
