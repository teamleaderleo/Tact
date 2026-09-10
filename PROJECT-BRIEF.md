# Use Tact on a new design problem

This is a reusable handoff for a human or agent starting design work with Tact as prior context.

The goal is to make the repository **active design memory** without mechanically applying every preference inside it.

## Default prompt

Copy/adapt this:

```text
Read `teamleaderleo/Tact` as design memory for this project.

Start with:
- `APPLIED.md`
- `SIGNATURE.md`
- `RESERVOIR.md`
- `patterns/`
- the case studies and research notes that are actually relevant to the product I am working on.

Do not treat Tact as a design system or a set of laws.

For the current product/problem, produce a compact working brief containing:

1. User/job
   - What is the user actually trying to accomplish?
   - Is this first-use, repeated-use, expert, casual, mobile, desktop, consequential, collaborative, etc.?

2. Relevant Tact evidence
   - Which prior case studies genuinely resemble this problem?
   - Which references or patterns transfer?
   - Which apparently related material should *not* be transferred because the underlying job differs?

3. Likely Leo preferences
   - Which current signature tendencies are likely to influence the design?
   - Keep them provisional. Name where they could become self-indulgent or user-specific.

4. Concrete design questions
   - What needs to be decided visually or interactively?
   - What can be shown with alternatives instead of argued abstractly?

5. References
   - Pull a small number of useful examples from the Tact reservoir/cases and, when needed, research additional precedents.
   - Explain the exact mechanism worth borrowing.

6. Alternatives
   - Make the smallest useful set of concrete alternatives.
   - Prefer screenshots, sketches, code, diagrams, or interaction sequences over abstract prose.

7. Judgment
   - State what you recommend and why.
   - State the important tradeoff and what evidence could change the recommendation.

When the work teaches something new, leave it in Tact as a case study, reservoir item, study, pattern candidate, shit-list entry, or signature update according to what it actually earned.

Do not reorganize Tact merely because you are using it.
```

## Desired output shape

A useful brief is usually closer to:

```text
Relevant precedents:
- ...

Useful existing Tact ideas:
- ...

Likely preferences:
- ...

Risks / counterpressure:
- ...

Visual / interaction questions:
- ...

Alternatives to make:
- ...

What would change our mind:
- ...
```

than a comprehensive summary of the repository.

## Principle

Tact should reduce rediscovery while preserving fresh judgment.

The repository remembers what Leo has seen, tried, liked, rejected, and learned. The current product still gets to be itself.
