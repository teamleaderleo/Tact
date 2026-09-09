# Starting points

A first capture of design/product ideas worth testing rather than merely remembering.

## Taste and product craft are different skills

Artistic taste can make wrongness obvious: weak proportion, dead hierarchy, visual noise, awkward rhythm, fake polish, a detail trying too hard. That instinct is valuable.

Product design adds another loop:

```text
notice friction
-> identify the user goal
-> understand the state and constraints
-> make several concrete alternatives
-> use them
-> keep the one that makes the work easier and feels right
-> repeat
```

The skill to build is not learning to imitate a "designer" vocabulary. It is becoming reliable at translating judgment into interfaces.

A useful standard:

> Taste tells me I hate it. Craft lets me explain why, make something better, and prove it works.

## Utility first; personality can survive

"Pretty" and "useful" are a weak binary. Great software can have a strong authorial voice while remaining effortless to operate.

The product constraint is stronger than the art constraint: someone is trying to accomplish something. Visual personality, animation, density, color, texture, sound, and novelty should help orientation, comprehension, pleasure, identity, or memory — or at least avoid taxing repeated use.

The ideal can be quiet:

> If you notice it, you love it. If you don't, you can just work.

## The hundredth-use test

Design for the repeated gesture, not the demo.

Questions to ask:

- How many times per day will someone do this?
- Does the interface force a decision that can be inferred safely?
- Does a confirmation protect a real consequence, or merely add ceremony?
- Does the animation still feel good after the hundredth repetition?
- Is the information visible because it changes action, or because the system happens to possess it?
- Can a common path become one gesture without hiding an important boundary?

Terminal-kit grew from exactly this kind of annoyance: smaller sidebars, familiar navigation, calmer interaction, and a workspace pleasant enough to inhabit all day.

## Agent software is increasingly an attention-design problem

At low concurrency, a user can watch terminals. At high concurrency, "show me every worker" becomes a poor interface.

A more useful funnel is:

```text
raw events / command output
-> exact receipts
-> task / worker state
-> meaningful change
-> blocker / exception / decision
-> human attention
```

The interface should make healthy work cheap to ignore while making consequential uncertainty easy to inspect.

This connects several existing experiments:

- [Lazy Commander](https://github.com/teamleaderleo/Lazy-Commander) asks how much command output deserves automatic model context while retaining exact raw evidence.
- [Stensibly](https://github.com/teamleaderleo/stensibly) asks which work, responsibility, authority, blocker, decision, or continuation state must survive disposable workers.
- [Cultist](https://github.com/teamleaderleo/cultist) asks which repository evidence would change the next justified action.

The product-design question across all three is the same: **what deserves foreground attention now?**

## Output reduction is useful; round-trip reduction is often bigger

A historical Lazy Commander replay admitted 2,437 commands and reduced their automatic visible output from 13,578,014 characters to 913,664 — 93.27% — while keeping exact raw output recoverable. The current implementation has since moved toward faithful bounded views and explicit expansion rather than optimizing for that percentage.

Source: [semantic command replay](https://github.com/teamleaderleo/Lazy-Commander/blob/main/docs/benchmarks/semantic-command-replay-2026-08-31.md).

But context compression is only one class of waste. Repeated remote observations can dominate complete-loop latency.

Glaeda's resident repository-evidence dogfood compared a GitHub baseline at a 4,444 ms median / five outer calls with a resident `repo-query/v1` result at 39.008 ms internally / about 40 ms through the wrapper / one outer call.

Source: [Glaeda README](https://github.com/teamleaderleo/glaeda#measured-results).

That suggests a broader optimization order for agent-facing products:

```text
remove unnecessary work
-> remove unnecessary round trips
-> keep useful deterministic state close
-> reduce automatic context
-> optimize the remaining hot path
```

A product can feel dramatically smarter because it asks the world fewer questions.

## Export repeated thinking into deterministic places

A recurring personal question:

> How much of what I repeatedly think about can become a deterministic, inspectable part of the environment?

Examples:

- successful test noise -> bounded semantic result;
- repeated repository rediscovery -> resident exact query;
- worker responsibility -> durable ledger state;
- repeated failure lesson -> deterministic preflight or selected evidence;
- workspace preference -> reproducible terminal configuration;
- human memory of "what should happen next" -> explicit continuation.

The point is not to automate judgment blindly. The point is to stop paying human/model attention for mechanical cognition that software can perform reliably.

## Browser + terminal + agent

The browser DevTools model is a useful analogy: a visual application and a console attached to the same thing.

A richer workspace can bring together:

```text
browser surface
+ terminal
+ source / files
+ agent
+ programmatic browser control
+ shared task identity and state
```

An agent can then observe the application, inspect browser state, run local tools, change source, watch the development server, refresh, compare, and report — with fewer seams between "the work" and "the tool controlling the work."

The design question is how to make those capabilities feel like one place instead of a pile of adjacent panes.

## Practice agenda

Some first issue-sized exercises:

1. Collect ten interfaces that feel unusually calm under heavy use. Explain exactly why.
2. Take one cmux interaction and make three materially different versions, not three visual skins.
3. Study sidebar density: what should always be visible, conditionally visible, or hidden until requested?
4. Study command palettes across several products and identify where they become dumping grounds.
5. Design a 30-agent workspace view where only three agents need attention.
6. Compare one visually expressive interface with one nearly invisible interface that solves the same class of problem.
7. Learn enough typography to diagnose hierarchy instead of relying only on instinct.
8. Keep a running list of "this feels wrong" moments during ordinary work, then revisit only the recurring ones.
9. Prototype a browser + terminal + agent workflow around one real debugging task.
10. Record principles only after repeated examples earn them.

The repository should accumulate better questions, better examples, and better decisions — not doctrine for its own sake.
