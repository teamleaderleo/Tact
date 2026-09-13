# CMUX inquiry map — September 12

Working material for Leo's conversation with the founding team. This is not a
finished pitch or a claim that the prototypes have won their comparisons.
Start with [#35](https://github.com/teamleaderleo/tact/issues/35), whose central
question is what object people mean to operate, rather than which container
happens to hold it.

## What already exists

| Work | Current evidence | What it does not establish |
| --- | --- | --- |
| [Live surface navigator](../prototypes/cmux-surface-navigator/) | Native custom sidebar; exact surface focus; Flat/Grouped, density, Home/Triage and search trials | Preference, faster retrieval, native selected-tab/focus styling |
| [Causal debugger](../prototypes/causal-debugger/) | Executable working-source/active-runtime distinction; two tasks sharing one edit and rebuild; separate verification claims | A real cmux browser selection carried into an external agent |
| [Adversarial attention compiler](../experiments/adversarial-attention-compiler/) | Synthetic 100-worker population, lossy reducer, separate auditor; eight tests pass | A real fleet audit, reliable live telemetry, validated thresholds |
| [Microcraft studies, PR #34](https://github.com/teamleaderleo/tact/pull/34) | Recreated selection and notification comparisons with explicit variables | Pixel-exact current screenshots or measured improvement; kept on their own branch |
| Glaeda native workflow | Shared pending checks, retained caches, refresh, event-based collection; measured on cmux | A UX preference result or closed-Codex-task notification integration |

## 1. Places and attention need different navigation rules

Source: [#36](https://github.com/teamleaderleo/tact/issues/36),
[#37](https://github.com/teamleaderleo/tact/issues/37), and
[#17](https://github.com/teamleaderleo/tact/issues/17).

**Question:** Can an object stay where I learned it while also appearing where I
need to act on it?

The live sidebar now offers Home and Triage over the same exact surfaces. Home
retains host order and adds reported agent state without moving rows. Triage
prioritizes linked input requests and unknown states; All states includes routine
work. Ended explicitly has an unknown outcome. Missing surface relations remain
visible as an unlinked count, without a guessed jump. Search filters the chosen
view; it is not yet a separately ranked Search mode. Overview remains a separate
experiment.

Try a known-target return in Home, then an input request in Triage, then return to
Home. Include duplicate shell titles and a routine agent that changes state.
Record wrong destinations, rediscovery, missed attention, and mode confusion.
Keep names, density and grouping fixed during the Home/Triage comparison.

**Evidence that would change the design:** If the mode switch costs more than
it saves for a small working set, prefer an attention mirror within Home. If
Home grows too large to learn, test a user-selected Home subset before inventing
another grouping hierarchy. Do not silently promote the status roster into an
independent audit.

**Ask the team:** Which object should users learn a stable location for? Should
extensions own these projections while cmux supplies identity, focus, selection,
and a canonical action vocabulary?

## 2. Preserve the object I already identified

Source: [#39](https://github.com/teamleaderleo/tact/issues/39) and the
[causal debugger conclusions](../prototypes/causal-debugger/CONCLUSIONS.md).

**Question:** Can a human-selected object survive a tool handoff without being
reduced to ambiguous copied text?

The existing standalone prototype already exposes two important distinctions:
working source is different from running source, and one edit/build may serve
several human claims that still require separate verification. Show those before
proposing a broad timeline UI.

The next implementation should carry one real browser selection into a readable,
inspectable attachment and link a source/build/proof receipt back to it. Test a
hard reload, a removed target, and an edit without rebuilding. Failure to resolve
must remain visible; a durable handle is not proof that the current target is the
same object. Retention and deletion belong in that experiment from the start.

**Ask the team:** What is the smallest selection/evidence handle cmux should own?
Which references remain session-local, and which can survive reload or handoff?

## 3. Quietness needs evidence beyond the summary

Source: [#40](https://github.com/teamleaderleo/tact/issues/40),
[#5](https://github.com/teamleaderleo/tact/issues/5), and
[#7](https://github.com/teamleaderleo/tact/issues/7).

**Question:** How can the interface stay quiet without hiding a population-level
failure?

Use the existing adversarial attention experiment: compare normal against wrong
premise, retry storm, or split decisions. The reducer can look equally calm while
the separate audit detects a problem. These are explicitly synthetic scenarios,
not observations of Leo's real agents.

The live sidebar currently has status and a hosting relation, not independent
verification, premise, budget or recovery evidence. A useful next adapter would
connect exact build/check receipts to a human review obligation while preserving
request/source identity. Glaeda supplies some evidence for this, but it cannot
infer a whole agent task's success from one passing build.

**Ask the team:** What constitutes a durable human obligation? What evidence can
an extension inspect independently of the agent's own status summary?

## Smaller craft track

[#38](https://github.com/teamleaderleo/tact/issues/38) and PR #34 suggest a
controlled selection/focus/attention comparison. Keep these as separate state
channels. Test inactive panes, keyboard-only use, light/dark appearance and
reduced motion before choosing a treatment. The illustrative 700 ms attention
settlement value in the study is a variable, not a recommendation already proven
by use.

## Fresh upstream check and current limits

Fetched upstream main at `942c24e25b36f7046200260f80955da742d56bf2`.
Compared with the prior audited `e9ec596d12d854d6569b53b38bb21b62f8126d56`,
there were no changes in the sidebar docs, data builder, JS runtime, workspace
agent projection or surface-focus handler used by this experiment. The tagged
native app remains the existing local build; this was a focused seam recheck,
not a claim to have rebuilt all newest upstream commits.

The new Home/Triage behavior has fixture and real-runtime tests plus native
render/search/focus checks. Live verification had one terminal and no tracked
agents: live status transitions were exercised through the actual runtime with
fixtures, not a real fleet. Human speed/preference, keyboard traversal,
VoiceOver, light appearance and multi-window coverage remain unresolved.

Before the meeting, spend the next use session on one navigation comparison and
record the result. Then choose between the real selection-handoff slice and an
independent receipt-backed attention item. Adding more mock surfaces before that
would not resolve the central uncertainty.
