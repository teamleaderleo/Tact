# Microcraft calibration studio

Interactive implementation of Tact's **monthly micro-craft calibration** experiment from `WORKBENCH.md` and `notes/taste-to-diagnosis-microcraft.md`.

The studio is built for one-variable visual diagnosis. Every trial follows the same loop:

```text
blind comparison
-> pick the stronger version
-> write the diagnosis
-> reveal the exact delta
-> compare the intended defect and vocabulary
-> repeat
```

The browser stores attempt history locally and summarizes current-month accuracy plus categories worth revisiting. No account, build step, package install, analytics, or network access is required.

## Run

From the repository root:

```bash
cd experiments/microcraft
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

Stop the server with `Ctrl-C`.

Opening `index.html` directly also works in current browsers, but the local HTTP server is the intended repeatable run path.

## Controls

- `1` — choose the left variant
- `2` — choose the right variant
- `Enter` — reveal after making a choice
- `N` — next comparison after reveal
- `Space` — replay a motion comparison
- **Blind** — hides the category and changed variable until reveal
- **Subtle / Obvious** — changes the amplitude of the defect while keeping the same category
- **Repeat same category** — immediately runs another drill in the current category

If you can perceive a difference and cannot yet name it, use **I can feel it; I can’t name it yet**. That records the attempt without pretending the diagnosis exists.

## Current drill set

The first pass implements controlled pairs for:

- typography — small-metadata tracking pressure;
- spacing — group gap versus row cadence;
- alignment — a 1–2 px glyph centerline error;
- hierarchy — selection-state emphasis;
- contrast — one secondary luminance tier pushed too high;
- material — popover border contrast added to an existing fill + shadow stack;
- iconography — one glyph with excess optical stroke weight;
- density — identical sidebar content at different row cadence;
- motion duration — identical compact popovers at different timings;
- motion easing — identical 200 ms popovers with different easing tails.

Every reveal states the calibration target, exact values, intended defect, and diagnostic vocabulary. The values are training targets for these specific surfaces rather than universal design rules.

## Issues this follows

This implementation follows existing Tact work instead of creating a parallel roadmap:

- #18 — one-pixel sabotage and blind A/B diagnosis;
- #19 — typography optical-size and hierarchy matrix;
- #20 — optical icon alignment and family coherence;
- #21 — color, contrast, and material as one hierarchy;
- #22 — motion timing, easing, and transition causality;
- #23 — compress a sidebar without losing hierarchy or rhythm.

The first implementation advances slices of those issues. Keep the issues open until repeated runs produce measurements worth recording. Update `WORKBENCH.md` candidate principles only after the prototype changes or sharpens a claim.

## Add a drill

Add one object to `challenges` in `app.js`. A useful drill has:

1. one changed variable;
2. a clear calibration target for the exact surface;
3. a subtle and obvious delta;
4. neutral randomized left/right placement;
5. an exact value reveal;
6. an intended defect described in perceptual language;
7. a diagnosis that names a reusable lever.

Avoid pairs where several CSS values move together. The studio trains causal diagnosis, so a prettier result with ambiguous causality is a weak drill.
