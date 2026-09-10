# Patterns

**Reusable design moves that have earned their names.**

Patterns are promoted from real work. This directory should stay small.

A pattern belongs here when several substantially different cases suggest the same move, the boundary is understood well enough to state, and somebody could apply the idea to a new problem without copying a particular UI.

Do not promote a phrase because it sounds good.

## Promotion test

A useful pattern normally has:

1. two or more real cases from different contexts;
2. a clear user/problem condition;
3. a concrete interaction or visual move;
4. at least one counterexample or failure boundary;
5. links to the artifacts/cases that earned it.

## Pattern format

```md
# <pattern name>

## Problem

What recurring user/product problem makes this useful?

## Move

What should the design actually do?

## Why

What cost does it remove or capability does it add?

## Evidence

- case / artifact
- case / artifact

## Boundary

When does this move lose?

## Tells

What symptoms suggest this pattern might apply?

## Related language

Terms worth using when discussing the decision.
```

## Current candidates — do not promote automatically

The current repository contains several plausible candidates:

- **preserve object identity across views**;
- **change salience before location** for a learned warm working set;
- **decision-relevant density** rather than density for its own sake;
- **visible route + learned accelerator** for expert fluency;
- **speech carries intent; selection carries referent**;
- **human obligation above machine activity**;
- **independent population audit beneath attention reduction**;
- **show the difference, then name the difference** as a critique/making method;
- **character rides with operation** rather than charging extra ceremony.

Some already have strong notes. That does not mean they all deserve separate pattern files yet.

## Relationship to signature

[`SIGNATURE.md`](../SIGNATURE.md) asks “what does Leo repeatedly choose?”

A pattern asks “what reusable design move seems to work under these conditions?”

They can overlap without being identical. A pattern can be useful even if Leo rarely uses it. A signature preference can remain personal even if it never becomes general advice.
