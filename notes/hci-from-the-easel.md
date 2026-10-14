# HCI from the easel

**Carrying a painter's training into interaction design, and the parts that are new.**

## Why this note exists

10-14, cmux team chat:
- Austin proposed having agents capture Codex, Claude, T3, Aside and Cursor into a reference knowledge base, so we could generate UI variants from it.
- Lawrence pushed back: references should be done by hand, because "only if done manually will we get a feel for why others made certain decisions." The point is learning how others design, not owning a pile of screenshots.

Leo is an artist who has done master studies but has little formal HCI. This note maps what transfers and names what doesn't, so manual reference work builds judgment instead of a collection.

## What transfers

| Studio habit | Interface equivalent |
| --- | --- |
| Master copy | Rebuild one screen at true size, then *use* it. Spacing, hit targets and states you'd skim past become obvious. |
| Value and composition | Visual hierarchy: what reads first, second, third. Squint at a UI the way you squint at a painting. |
| Gesture and rhythm | Motion and timing: duration, easing, what moves and what holds still. |
| Lost and found edges | Grouping by proximity and enclosure (Gestalt). The stray left indent is a found edge in the wrong place. |
| The viewer's eye path | The user's task path: the goal, the number of steps, what goes wrong. |

## What is new

A painting is judged as one frame. An interface is judged as **behavior over time**, under repetition, interruption and error. Most interface arguments come down to a few named levers:

- **Fitts's law:** bigger, nearer targets are faster to hit.
- **Hick's law:** more choices mean slower decisions.
- **Recognition over recall:** show the options instead of making people remember them.
- **Progressive disclosure:** show the basics first and reveal depth on demand.
- **Affordances and signifiers** (Norman): a thing should look like what it does.
- **Interruption cost:** what an alert takes from the work in progress, and whether it gives back more. This is the core of notification design.

Naming the lever is what turns "this feels wrong" into a change someone else can argue with ([`taste-to-diagnosis-microcraft.md`](taste-to-diagnosis-microcraft.md)).

## Reference study loop

For each reference:

1. Do the real task in the app by hand.
2. Screenshot every state: idle, hover, loading, empty, error, done.
3. Write one line per decision: what they chose and why they probably chose it.
4. Say what you would change, then make that change as a [study](../studies/).

## Agent teardowns

Agents can still capture references when a PR needs them. Every capture set ships with a teardown in the same shape, so Leo can compare his read against theirs:

```md
Decision:
Tradeoff they took:
Lever / principle:
Steal or avoid:
```

Agent captures support the manual pass; they never replace it.

## Short reading list

Read these in order; stop when the returns drop:

1. *Refactoring UI* (Wathan and Schoger): concrete visual hierarchy.
2. [Laws of UX](https://lawsofux.com): the named principles, one page each.
3. *The Design of Everyday Things* (Norman): signifiers, mapping, mental models.
4. Apple Human Interface Guidelines, macOS: the conventions cmux lives inside.
5. Bret Victor's talks ("Inventing on Principle", "Magic Ink"): taste and ambition.
