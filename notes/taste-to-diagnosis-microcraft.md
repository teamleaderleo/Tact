# Taste into diagnosis: a micro-craft studio

Strong taste often fires before language does. You see a sidebar, dialog, title, icon row, transition, or dense table and immediately know the quality level.

The training problem is to slow that reaction down just enough to identify the lever:

```text
reaction
-> perceptual symptom
-> likely variable
-> controlled variant
-> measurement
-> reusable diagnosis
```

The highest-value practice lives in small deltas. A glyph can sit one pixel too low. A heading can use the wrong optical size. A secondary label can be 8% too bright. A popover can spend 70 ms too long settling. A group gap can equal its internal row gap and erase the grouping. One defect rarely ruins a product; repeated tiny defects create the sense that nobody quite finished the thought.

This note builds a vocabulary for those defects and a set of drills for learning them with the hands.

Related Tact notes:

- [`starting-points.md`](starting-points.md) gives the studio loop: observe -> articulate -> imitate -> alter -> use -> revise.
- [`leo-interface-instincts.md`](leo-interface-instincts.md) maps Leo's preferences around density, continuity, personality, expert tools, and repeated use.
- [`power-from-seeing-the-field.md`](power-from-seeing-the-field.md) studies density, stable anchors, icons, labels, and expert fluency.

## 1. Learn to name the symptom before prescribing the fix

A critique becomes useful when it identifies a visible symptom with enough precision that two people can build competing corrections.

Instead of:

> This feels cheap.

Try:

> The title, selected navigation item, and primary button all occupy the top contrast tier. Three primaries compete for the first glance.

Instead of:

> The icons feel off.

Try:

> Their geometric boxes match, while their apparent sizes drift. The bell is visually smaller than the folder, the download glyph sits low because its mass is bottom-heavy, and the stroke weight exceeds the adjacent 14 px text.

Instead of:

> The spacing feels weird.

Try:

> Internal row gaps and between-group gaps are nearly equal, so the eye reads one undifferentiated list. The container also has less space above the first row than below the last row, which pulls the block upward.

Instead of:

> The animation is sluggish.

Try:

> Input feedback begins immediately, then the easing tail spends too long approaching rest. The user has understood the destination before the element finishes moving.

The goal is a diagnosis that points toward a variable you can change.

## 2. Vocabulary: the levers behind perceived quality

### Typography

**Optical size** — A typeface can use different drawing decisions for small text and display text. Small text often needs a larger x-height, sturdier details, and more open counters. Display text can carry finer detail and tighter forms.

**Apparent size** — Two fonts at the same CSS or point size can look different in size because x-height, cap height, width, and stroke distribution differ.

**Tracking pressure** — The degree to which a word feels compressed or dispersed because of letter spacing. Small text often needs more room than large display text. All-caps labels usually need extra tracking.

**Leading tension** — The relationship between text size, x-height, line length, and line height. Too little leading makes lines fuse; too much breaks the paragraph into stripes.

**Weight pairing** — The relationship between adjacent type weights. A label and icon can share one emphasis level even when their raw stroke widths differ.

**Numeral behavior** — Proportional numerals read naturally in prose; tabular numerals create stable columns in data, timestamps, prices, and changing counters.

**Type-role collision** — Two text roles have values too similar to read as distinct roles, or too different to feel related.

Useful diagnostic phrases:

- “The body text has display-like tightness at a reading size.”
- “The heading gets its emphasis from size, weight, and color simultaneously; one lever can relax.”
- “The metadata is smaller yet almost equally bright, so size and contrast send conflicting signals.”
- “The numbers jitter horizontally because proportional figures keep changing width.”

### Hierarchy

**Contrast ladder** — The ordered set of visual emphasis levels across primary, secondary, tertiary, disabled, separator, and background elements.

**Competing primaries** — Several elements demand the first glance at once.

**Emphasis budget** — The limited amount of high contrast, saturated color, large type, heavy weight, fill, or motion available before emphasis loses meaning.

**Focal pull** — The strength with which an element attracts the eye through size, contrast, location, color, isolation, or movement.

**Semantic tier** — A visual role tied to meaning: title, body, metadata, action, status, warning, selection, background.

**Edge priority** — Which boundaries the eye sees first: container edge, selected row, input, modal, divider, or content itself.

Useful diagnostic phrases:

- “The contrast ladder has collapsed into two levels: loud and faint.”
- “Selection receives fill, border, brighter text, brighter icon, and accent color; the state spends five emphasis levers.”
- “The chrome owns more focal pull than the work area.”
- “The separator is doing grouping work the spacing already communicates.”

### Spacing

**Internal / external ratio** — Related items need a visibly smaller interval than the interval between groups.

**Container breathing** — The relation between a block and its enclosing edge. Tiny padding makes content feel pinched; excessive padding can make controls feel detached from their surface.

**Row cadence** — The repeated vertical interval of rows in a list, table, sidebar, or menu.

**Gap grammar** — A small set of repeated intervals that communicates relation: e.g. 4 for icon-label, 8 for row internals, 16 for local groups, 24 for sections.

**Edge tension** — The sense that an element sits too close to an edge, corner, divider, or neighboring control for its apparent size.

**Whitespace leak** — Space appears where no semantic break exists, making one unit read as several.

Useful diagnostic phrases:

- “The section gap equals the row gap, so the grouping disappears.”
- “The icon-label pair is loose while the neighboring rows are tight; the eye reads each row as two objects.”
- “The title block has generous outer padding and cramped internal leading, producing two contradictory density signals.”

### Alignment

**Baseline alignment** — Text, icons, badges, and controls share a typographic baseline or a deliberate alternative.

**Optical alignment** — Elements are positioned according to apparent balance instead of raw bounding boxes.

**Common edge** — Repeated content begins or ends on the same line, improving scan speed.

**Centerline drift** — Items intended to share a visual center sit at subtly different heights.

**Cumulative drift** — Repeated 1 px errors create a stronger quality loss than an isolated 1 px error.

Useful diagnostic phrases:

- “The icon is geometrically centered and optically low.”
- “Three left edges differ by 2–4 px, so the column never locks.”
- “The badge aligns to the row box while the label aligns to the baseline; their centers disagree.”

### Iconography

**Apparent icon size** — The perceived footprint of a glyph after accounting for empty area, silhouette, stroke, and enclosure.

**Optical weight** — How heavy the glyph feels relative to nearby text and sibling glyphs.

**Stroke density** — The amount of dark or bright mark inside the icon box.

**Terminal language** — Rounded, square, sharp, or tapered line endings across an icon family.

**Corner grammar** — The recurring corner radii and angles that make icons feel related.

**Silhouette clarity** — How quickly the icon reads at the intended size.

**Sidebearing** — Empty horizontal area around a glyph; badges and asymmetric glyphs often need compensation.

Useful diagnostic phrases:

- “The boxes match at 16 px, while the silhouettes occupy different apparent areas.”
- “The search icon uses a heavier stroke than the adjacent text, so it reads as a primary action.”
- “One glyph uses sharp terminals inside a rounded family.”
- “The badge increases the right-side mass and makes the icon look shifted left.”

### Color and contrast

**Luminance hierarchy** — The ordering created by perceived lightness.

**Chroma hierarchy** — The ordering created by saturation or colorfulness.

**Neutral temperature** — Whether grays lean warm, cool, or near-neutral.

**Chroma spill** — Accent hue leaks into broad surfaces and makes the whole interface feel tinted.

**Local contrast** — The difference between an element and the surface immediately behind it.

**Global contrast** — The overall spread between the darkest and lightest major areas.

**State delta** — The visual distance between rest, hover, focus, selected, disabled, and pressed states.

Useful diagnostic phrases:

- “The sidebar and content differ mainly in hue, with too little luminance separation.”
- “Secondary text has enough local contrast to compete with primary text.”
- “The accent covers too much area, turning identity into background noise.”
- “Hover and selected states differ by such a small luminance delta that the interaction feels uncertain.”

### Material

**Layer separation** — How clearly one plane reads in front of another.

**Surface delta** — The lightness, opacity, tint, blur, border, and shadow difference between adjacent planes.

**Edge softness** — The character of a boundary: crisp border, diffuse shadow, translucent blur, or no explicit edge.

**Material thickness** — How much background information survives through a translucent plane.

**Depth cue stack** — The set of simultaneous cues used to lift a surface: shadow, border, blur, tint, scale, and motion.

Useful diagnostic phrases:

- “The dialog uses border, heavy shadow, darker fill, and blur; the depth cue stack is over-specified.”
- “The popover shares nearly the same value as the page and relies on a faint shadow, so the edge disappears over dark content.”
- “The sidebar is too opaque to preserve context and too translucent to provide a clean reading field.”

### Motion

**Response latency** — Time between input and visible acknowledgement.

**Travel duration** — Time spent moving between positions or states.

**Easing profile** — How velocity changes over the animation.

**Easing tail** — The final portion of the animation as motion approaches rest.

**Settle time** — Total time before the element appears fully at rest.

**Overshoot** — Motion beyond the destination followed by return.

**Perceived mass** — The weight suggested by acceleration, deceleration, distance, scale change, and spring behavior.

**Interruptibility** — Whether the next input can take control before the previous animation completes.

Useful diagnostic phrases:

- “The response begins on input, then the easing tail keeps the control visually busy after the state is understood.”
- “A tiny 8 px move uses the same duration as a full-panel transition, so the small action feels heavy.”
- “The spring overshoot gives a utility control toy-like mass.”
- “The animation owns input until settlement, turning decoration into latency.”

### Transitions

**Causal origin** — The visible relationship between the triggering object and the destination.

**Shared anchor** — An element that remains perceptually continuous across states.

**Directional logic** — Motion direction matches navigation, expansion, dismissal, or spatial relation.

**Continuity debt** — Context the user must reconstruct after a view change.

**Attention handoff** — How the transition moves focus from source to destination.

Useful diagnostic phrases:

- “The detail view appears from the screen edge even though it came from a selected row in the center.”
- “The source disappears before the destination establishes itself, creating a brief orientation gap.”
- “The sibling transition uses a depth change, implying parent-child hierarchy.”

### Visual rhythm

**Cadence** — Repeated intervals of rows, baselines, cards, separators, and section breaks.

**Beat** — One repeated unit in a list or control family.

**Syncopation** — A deliberate break in cadence used to signal a new group, special state, or focus object.

**Rhythmic noise** — Accidental variation in gaps, row heights, baselines, or control sizes.

Useful diagnostic phrases:

- “The list establishes a 32 px beat, then two ordinary rows become 34 px for accidental reasons.”
- “Every third item gains a divider and extra padding, creating a rhythm the data never asked for.”
- “The section break needs one clear syncopation; currently it uses space, rule, color, and type change together.”

### Information density

**Decision-relevant density** — Amount of state visible that can change the current judgment or next action.

**Scan compression** — More useful comparisons fit in one glance or viewport.

**Navigation tax** — Extra view changes required because useful state has been hidden.

**Metadata drag** — Secondary information consumes visual area or attention without helping the current task.

**Grouping efficiency** — How much information the eye can parse because alignment, spacing, labels, and contrast create clear chunks.

Useful diagnostic phrases:

- “The page is sparse in pixels and expensive in navigation.”
- “The table is dense in rows and calm because columns align and metadata stays in stable tiers.”
- “Secondary labels repeat information already encoded by column position.”

## 3. Example atlas: tiny changes with large perceptual effect

### Apple: optical centering can be a few pixels

Apple's icon guidance shows an asymmetric download glyph that looks low when centered by its raw box. Moving it upward by a few pixels produces optical centering. Apple explicitly calls out the large visual effect of these small adjustments.

Reference: [Apple HIG — Icons](https://developer.apple.com/design/human-interface-guidelines/icons)

What to learn:

- geometry is an input; apparent balance is the target;
- asymmetric mass needs compensation;
- repeated optical errors advertise low finish quality;
- padding can encode the compensation while keeping layout math simple.

Drill seed: place 12 glyphs in identical 16×16 assets, then adjust each by 0, 0.5, 1, and 1.5 px. Compare at native scale and 2×. Record the point where each glyph begins to look intentionally placed.

### SF Symbols: icon size, text size, and emphasis are separate controls

SF Symbols matches icon weights to San Francisco text weights and provides small, medium, and large scales relative to cap height. The scale changes emphasis while preserving weight matching. Apple also supports negative side margins when badges or asymmetric content disrupt horizontal alignment.

References:

- [Apple HIG — SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)
- [WWDC19 — Introducing SF Symbols](https://developer.apple.com/videos/play/wwdc2019/206/)

What to learn:

- a 16 px box says little about apparent size;
- icon and text can share a typographic system;
- scale, stroke, baseline, and sidebearing interact;
- a badge can shift visual mass even when the outer box remains unchanged.

Drill seed: build one toolbar with the same label text and three icon scales. Keep point size fixed. Ask which version reads as “icon supports label,” “equal partners,” and “icon leads.”

### Linear 2024: quality appears through accumulated alignment, density, contrast, and type

Linear's 2024 redesign is unusually useful because the team describes the small work directly. They adjusted the sidebar, tabs, headers, and panels to reduce visual noise while increasing hierarchy and navigation density. They spent time aligning labels, icons, and buttons vertically and horizontally on a tiny surface, describing the result as something a user feels after a few minutes.

The same redesign moved theme generation toward LCH-based surface relationships, exposed a contrast variable, reduced blue influence in chrome, increased neutral text/icon contrast, and introduced Inter Display for headings while keeping regular Inter elsewhere. The team also used an internal toggle to compare the old and new UI during dogfooding.

Reference: [Linear — How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)

What to learn:

- perceived finish often comes from many low-amplitude corrections;
- hierarchy can improve while density increases;
- color quality depends on relationships across surfaces and text, beyond a palette swatch;
- display optical type can add expression while body UI keeps a workhorse face;
- an A/B toggle turns taste discussion into direct comparison.

Drill seed: recreate one Linear-like sidebar from a screenshot, then make a “90% version” by adding five tiny defects: one icon 1 px low, one section gap too small, selected text too bright, row height +2 px, and one icon 8% heavier. Blind-test the pair.

### Linear 2026: dimming chrome can make content feel stronger

Linear's 2026 UI refresh reports redrawn and resized icons, more consistent headers/navigation/view controls, and slightly dimmer sidebars so the main content area stands out.

Reference: [Linear changelog — UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh)

What to learn:

- reducing emphasis can improve hierarchy more elegantly than adding emphasis elsewhere;
- icon redraws and resizes can improve the entire product because the same glyphs recur hundreds of times;
- a small sidebar luminance change alters the apparent priority of the whole frame.

Drill seed: keep the content panel fixed and render sidebar text/icons/background at five contrast levels. Find the lowest chrome emphasis that preserves confident scanning.

### Inter: the same family changes character across optical size

Inter has dedicated text-to-display optical sizing. Its smaller designs favor legibility with taller x-height and contrast-enhancing details; display designs use cleaner curves and finer details. Inter also exposes dynamic tracking and line-height guidance tied to optical size, plus tabular numerals for stable numeric columns.

References:

- [Inter typeface family](https://rsms.me/inter/)
- [Inter — Dynamic Metrics](https://d.rsms.me/inter-website/v3/dynmetrics/)

What to learn:

- “font choice” is too coarse a diagnosis;
- one family can feel utilitarian, elegant, cramped, or loose depending on optical size and metrics;
- tracking and leading should respond to size;
- data typography benefits from numeral choices invisible in a static label.

Drill seed: set the same heading at 24, 32, and 48 px with text optical sizing and display optical sizing. Pair each with body UI text. Rate which combination makes hierarchy feel inevitable.

### Butterick: simple type ranges become useful when used as measuring sticks

Butterick gives concrete starting ranges: roughly 120–145% line spacing for most text, 45–90 characters per line, and extra tracking for all-caps text. These are entry-level rules with unusually practical value because they create measurable baselines for controlled variants.

References:

- [Butterick — Line spacing](https://practicaltypography.com/line-spacing.html)
- [Butterick — Line length](https://practicaltypography.com/line-length.html)
- [Butterick — Letterspacing](https://practicaltypography.com/letterspacing.html)

What to learn:

- type critique improves when you can state the actual line height, width, and tracking;
- ranges create a test region; the final value still depends on the face, size, width, and context;
- tiny tracking differences become conspicuous in labels and all-caps UI.

Drill seed: take one paragraph and one settings panel. Create line-height, line-length, and tracking ladders. Print the values directly on each variant so the eye learns to associate feeling with measurement.

### Motion: 60–100 ms can change perceived mass

Material's motion guidance treats duration as a function of travel distance, velocity, and surface change. Small moves use shorter durations than large transformations. The guidance also distinguishes entry and exit easing because arriving content deserves a different attention pattern from departing content. Apple similarly emphasizes brief, precise feedback and keeping repeated interactions free of unnecessary delay.

References:

- [Material Design — Duration & easing](https://m1.material.io/motion/duration-easing.html)
- [Material Design — Movement](https://m1.material.io/motion/movement.html)
- [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

What to learn:

- duration communicates scale and mass;
- easing communicates where attention belongs;
- entering and leaving can use different curves and times;
- frequent interactions expose long easing tails immediately;
- interruptibility is part of motion quality.

Drill seed: animate one 12 px menu highlight, one 160 px popover, and one full-height panel. Give all three the same duration first. Then tune each independently. The mismatch becomes obvious once you feel the same timing applied to different travel.

### Apple materials: translucency trades context against reading contrast

Apple describes thinner standard materials as preserving more background context, while thicker materials provide stronger contrast for fine foreground content. Current guidance also distinguishes regular and clearer glass-like treatments according to background richness and legibility needs.

Reference: [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)

What to learn:

- blur and transparency have semantic roles beyond decoration;
- material thickness controls how much of the background remains present;
- text contrast and material opacity form one system;
- piling blur, tint, border, and shadow onto one plane can make depth feel overdrawn.

Drill seed: build one popover over plain text, a photo, and a dense table. Vary blur, opacity, border alpha, and foreground contrast one lever at a time. Find the smallest depth cue stack that stays readable across all three backgrounds.

## 4. The core drill: one-variable A/B

This should become the default exercise whenever the reaction is “version B somehow feels expensive.”

### Protocol

1. Pick a small surface: sidebar, menu, dialog, table header, toolbar, title block, card, notification, or transition.
2. Recreate it closely enough that measurements are under your control.
3. Duplicate it.
4. Change exactly one variable.
5. Give the variants neutral names such as 17 and 42.
6. Compare at native scale.
7. Compare after one second of exposure.
8. Compare after 30 seconds of scanning or repeated interaction.
9. Write the diagnosis before revealing the changed value.
10. Repeat the exercise with a smaller delta.

Good variables:

- font size ±1 px;
- weight 400 / 450 / 500;
- tracking ±0.01 em;
- line height ±1–2 px;
- icon vertical offset ±1 px;
- icon scale ±4–8%;
- row height ±2–4 px;
- internal gap ±2 px;
- section gap ±4 px;
- secondary text lightness ±4–8%;
- surface lightness ±2–5%;
- border alpha ±4–8%;
- blur radius ±4–8 px;
- animation duration ±40–80 ms;
- easing curve with earlier or later deceleration;
- sidebar width ±8–16 px.

The training target is sensitivity plus language. “I prefer 42” earns little. “42 keeps the same density while restoring a clear group break because the section gap moves from 12 to 20 px” earns a reusable skill.

## 5. Drill: screenshot autopsy

Take a screenshot from a product you admire and annotate it until the screenshot becomes a set of decisions.

Record:

- viewport size;
- content width;
- left/right/top/bottom padding;
- every recurring row height;
- recurring horizontal and vertical gaps;
- icon asset box and apparent glyph area;
- text size, weight, line height, and estimated tracking;
- major luminance tiers;
- border thickness and alpha;
- corner radii;
- selected / hover / rest deltas;
- persistent alignment lines;
- visible items per viewport.

Then make three overlays:

### Alignment overlay

Draw every repeated left edge, baseline, centerline, and column edge. Good interfaces often reveal a surprisingly small number of dominant lines.

### Rhythm overlay

Label every gap and row height. Build a histogram. Look for a small family of repeated values and identify intentional exceptions.

### Contrast overlay

Convert to grayscale and label the major luminance tiers. Ask which elements remain primary after hue disappears.

End with five statements in this form:

```text
I think this feels composed because ______.
The evidence is ______.
If I change ______ by ______, I predict ______.
```

Then build the change.

## 6. Drill: one-pixel sabotage

Recreate a polished surface. Make ten degraded copies, each with one tiny defect.

Possible sabotages:

- move one repeated icon 1 px down;
- shift one common left edge 2 px;
- make one icon 6% larger;
- use a 1 px thicker stroke in one glyph;
- brighten all secondary labels 6%;
- reduce the selected-row contrast 5%;
- make section spacing equal to row spacing;
- change one common radius from 8 to 10 px;
- increase one ordinary row by 2 px;
- add 70 ms to a repeated transition.

Randomize the originals and sabotaged copies. Do three passes:

1. one-second preference;
2. detailed diagnosis;
3. value reveal.

Track which defects you catch reliably. Repeat the missed categories the following week.

This is the closest thing to ear training for interface craft.

## 7. Drill: typography matrix

Use one content set:

```text
Project Aurora
12 open issues
Updated 4 minutes ago
Ship onboarding rewrite by Friday
```

Build a grid varying:

- 3 optical sizes;
- 4 text sizes;
- 3 weights;
- 4 tracking values;
- 4 line heights;
- proportional vs tabular numerals for the count/time rows.

Keep color and layout fixed.

Questions:

- Which pair makes the title feel confident without shouting?
- At what size does display optical sizing begin to earn its detail?
- Which tracking value causes small metadata to lose cohesion?
- When does semibold become a patch for weak contrast?
- Which leading makes a two-line title feel like one unit?

Then reproduce the winning hierarchy using a different typeface. This separates typographic principles from attachment to one font.

## 8. Drill: icon family correction

Take 12 simple actions:

```text
search
add
close
download
upload
folder
calendar
filter
settings
play
pause
more
```

Start with a mixed set from several icon families. Normalize them into one family.

For each icon, record:

- outer box;
- apparent footprint;
- stroke width;
- terminal style;
- corner style;
- center of visual mass;
- baseline relationship to text;
- sidebearing;
- filled area percentage.

Then build four versions:

1. raw mixed set;
2. same outer dimensions only;
3. optical size + alignment correction;
4. optical size + alignment + stroke/corner/terminal correction.

The progression teaches why “all icons are 16 px” produces weak consistency.

## 9. Drill: contrast ladder with zero hue

Build a small app frame using grayscale only:

```text
sidebar
header
content
selected row
secondary metadata
popover
primary action
```

Create six luminance tiers before adding hue.

Test:

- Can a one-second glance find the current view?
- Does the selected row read without a border?
- Does the main content outrank the sidebar?
- Can metadata remain legible while staying secondary?
- Does the popover separate from both sidebar and content?

Only after the grayscale version works, add one accent hue. Limit the accent's area deliberately.

A second pass can use LCH/OKLCH so lightness can be tuned with less accidental perceived-brightness variation across hues.

## 10. Drill: material ladder

Use one popover over three backgrounds:

- flat neutral surface;
- dense text/table;
- rich image.

Create variants that change one cue at a time:

- fill lightness;
- fill opacity;
- blur radius;
- border alpha;
- shadow blur;
- shadow opacity;
- foreground text contrast.

Then create a “cue budget” rule: each popover gets at most two primary depth cues.

Examples:

```text
fill + border
fill + shadow
blur + border
blur + foreground vibrancy
```

Compare with a version using every cue simultaneously. Learn where richness turns into visual sludge.

## 11. Drill: motion ladder

Build one popover and one panel transition in code so you can trigger them repeatedly with a key.

For the popover, test:

- 120 ms;
- 160 ms;
- 200 ms;
- 260 ms;
- 320 ms.

For each duration test:

- linear;
- ease-out;
- ease-in-out;
- a spring with low overshoot;
- a spring with obvious overshoot.

Repeat each version 30 times.

Record:

- first-frame responsiveness;
- time until the destination is understood;
- time until visible settlement;
- whether the next input can interrupt;
- perceived mass;
- fatigue after repetition.

Then repeat with a larger travel distance. Keep the exact same curves and observe how the perceived mass changes.

A strong motion critique should eventually sound like:

> “The opening duration fits the 160 px travel, while the last 20% of the ease-out is too long for a menu used dozens of times per hour.”

## 12. Drill: transition causality

Build one list -> detail interaction four ways:

1. direct swap;
2. crossfade;
3. detail expands from the selected row;
4. detail enters from a screen edge.

Keep the destination identical.

Test:

- orientation after one use;
- orientation after 25 repetitions;
- ability to reverse the transition;
- perceived relationship between row and detail;
- time before the user can act in the detail view.

Then build sibling navigation and parent-child navigation with the same motion. The comparison teaches how transition direction and depth imply hierarchy.

## 13. Drill: density ladder

Create a 30-row inbox or issue list. Give each row:

- primary title;
- status icon;
- owner;
- time;
- one secondary label.

Build four densities with row heights such as 28, 32, 36, and 40 px. Keep the information identical first.

Measure:

- visible rows per viewport;
- time to find a named item;
- time to find “the only blocked item”;
- wrong selections;
- eye travel by rough screen distance;
- number of times the user opens a detail view solely to recover hidden context.

Then improve the densest version through grouping, alignment, contrast, and metadata reduction. Compare it against the roomy version again.

This tests a core Leo instinct: density can feel calm when every pixel has a role and the eye has stable anchors.

## 14. Drill: rhythm extraction

Choose a screenshot with lists, cards, or stacked controls.

Measure every vertical interval and sort them:

```text
4 4 4 4 6 8 8 8 8 12 16 16 24 ...
```

Cluster nearby values. Ask:

- Which values form the intended cadence?
- Which variations come from text metrics?
- Which are purposeful section breaks?
- Which look accidental?

Rebuild the page using only four spacing tokens. Then add back exceptions one at a time where they improve grouping or optical balance.

The goal is visual rhythm with enough irregularity to serve the content.

## 15. A four-week studio loop

### Week 1 — See and measure

Do five screenshot autopsies:

- Linear sidebar/inbox;
- one macOS or iOS system panel;
- one dense expert tool;
- one expressive game UI;
- one interface you dislike despite obvious polish.

Output: annotated screenshots + a list of 25 diagnostic phrases.

### Week 2 — Type, icons, alignment

Do:

- typography matrix;
- icon family correction;
- one-pixel sabotage.

Output: three A/B sheets plus exact measurements.

### Week 3 — Contrast, material, density

Do:

- grayscale contrast ladder;
- material ladder;
- density ladder.

Output: one dense surface that feels calmer than its roomy version, plus a written explanation of why.

### Week 4 — Motion and transitions

Do:

- motion ladder;
- transition causality;
- 100 repetitions of the winning variants.

Output: one interaction shown in four timings and three transition models, with a short diagnosis for each.

At the end, redo the Week 1 screenshot autopsies without reading the original annotations. Compare the vocabulary. Improvement should appear as increased specificity.

## 16. The critique card

Use this on any screenshot or live product:

```text
First glance
- What wins the first second?
- What wins second?
- Does that order match the task?

Typography
- optical size
- apparent size
- weight
- tracking
- leading
- numeral style

Hierarchy
- contrast ladder
- competing primaries
- emphasis budget
- focal pull

Geometry
- row cadence
- internal / external gap ratio
- common edges
- baseline / centerline
- optical compensation

Icons
- apparent size
- stroke density
- terminals / corners
- sidebearing
- text pairing

Color / contrast
- luminance tiers
- chroma area
- state deltas
- neutral temperature

Material
- layer separation
- edge softness
- depth cue stack
- translucency vs foreground contrast

Motion
- response latency
- duration
- easing tail
- settle time
- mass
- interruptibility

Transition
- causal origin
- shared anchor
- directional logic
- attention handoff

Density / rhythm
- visible decision-relevant state
- scan compression
- metadata drag
- repeated beat
- intentional syncopation

Prediction
- Change one value.
- State what should improve.
- Build the variant.
- Compare.
```

## 17. What “alive” often means in product UI

“Alive” rarely requires more decoration. It often comes from relationships feeling exact:

- type has a deliberate voice at each scale;
- strong and quiet elements have enough distance between them;
- icons share apparent weight;
- content lands on stable edges and baselines;
- spacing reveals relation before separators explain it;
- color creates priority without flooding the frame;
- material separates planes with restraint;
- motion starts with input and ends when comprehension is complete;
- transitions preserve the origin of the user's thought;
- density earns itself through comparison and orientation;
- rhythm repeats enough to become legible, then breaks deliberately when meaning changes.

The opposite feeling usually comes from unresolved relationships. Each element can be individually competent while the set feels dead because size, weight, gap, contrast, and motion disagree about what deserves attention.

The practice is simple and demanding: measure the relationships, alter one at a time, and train the eye until the diagnosis arrives almost as quickly as the taste reaction.

## References worth revisiting

- [Linear — How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Linear — 2026 UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh)
- [Apple HIG — Icons](https://developer.apple.com/design/human-interface-guidelines/icons)
- [Apple HIG — SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)
- [Apple HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Inter typeface family](https://rsms.me/inter/)
- [Inter — Dynamic Metrics](https://d.rsms.me/inter-website/v3/dynmetrics/)
- [Butterick — Line spacing](https://practicaltypography.com/line-spacing.html)
- [Butterick — Line length](https://practicaltypography.com/line-length.html)
- [Butterick — Letterspacing](https://practicaltypography.com/letterspacing.html)
- [Material Design — Duration & easing](https://m1.material.io/motion/duration-easing.html)
- [Material Design — Movement](https://m1.material.io/motion/movement.html)

— Koi 🐟
