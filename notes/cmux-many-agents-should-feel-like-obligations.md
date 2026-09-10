# CMUX: when many coding agents are active, surface obligations

**Applied case study · 2026-09-10**

Question: **What should CMUX actually surface when many coding agents are active?**

## Judgment

CMUX already has enough semantic information to make 20 active agents feel like two or three human decisions.

The main sidebar should separate five classes of information:

| Class | CMUX-sized treatment | Existing cheap signal |
|---|---|---|
| Machine activity | quiet ambient indicator per workspace | running lifecycle count / `activeCodingAgentCount` |
| Meaningful state change | passive unseen update / latest result | semantic notification category, unread summary, completion event |
| Human obligation | explicit sticky `Needs you` row, typed by request | `needsInput`, Feed request ID, approval/question/plan-review event |
| Population-level warning | one exception-only warning above rows | independent scan of raw journal events, starting with correlated error bursts |
| Forensic detail | exact pane, terminal transcript, Feed timeline, notification history | surface IDs, Feed store + JSONL, notification ledger, agent journal/events |

The highest-emphasis unit should be **the thing a person must decide or repair**, rather than the worker that happened to encounter it.

A CMUX-sized version of the attention-compiler model fits the current product:

- **Commitment:** use the workspace as the default commitment container. Workspace title, checklist item, PR, and git state can strengthen the label when present. This avoids inventing a new project-management object.
- **Human obligation:** use unresolved attention requests and `needsInput` as the authoritative foreground. Approval, question, and plan review should retain their type.
- **Independent audit:** keep a small reducer beside the normal workspace reducer. Read raw journal facts directly. Materialize one warning only when a population condition crosses a useful threshold.
- **Receipts:** keep worker identity and exact event history one click deeper in Feed, notifications, the terminal, JSONL, or the event stream.

CMUX currently lacks a first-class child-agent tree in the main app. That is useful restraint here: worker hierarchy can remain provenance while the sidebar stays organized around workspaces and obligations.

## What CMUX already knows

The proposal needs very little new sensing.

### Agent lifecycle

The agent journal distinguishes:

- `running` — agent is actively working;
- `needsInput` — approval, question, or plan review is blocking on the user;
- `idle` — the last turn completed and nothing is pending;
- `error` — the agent reported an error and stopped making progress;
- `unknown`.

The sidebar projection currently has `running`, `needsInput`, `idle`, and `unknown`; journal-side `error` is projected onto the needs-input treatment because the sidebar lacks its own error rendering.

On app restart CMUX deliberately restores unresolved `needsInput` and `error` states, while live activity has to prove itself again. That is already the right persistence rule for obligations.

### Completion and background work

The semantic notification path carries categories including:

- `turn-complete`;
- `needs-permission`;
- `idle-reminder`;

and a `pending` bit for background work.

The reconciler also keeps completion identity separate from attention-request identities. A root turn completion can be held while child/background work continues. Real approval/question/plan-review requests remain attention events even while background work exists.

This gives CMUX a clean distinction between:

```text
machine still working
turn reached a meaningful boundary
person must answer something
```

### Workspace state

Workspace task status already compresses live signals in this order:

```text
any agent needs input
→ any agent running
→ open PR
→ merged/closed PR set
→ dirty git tree
→ todo
```

So CMUX already thinks at workspace scale rather than forcing the user to inspect every agent.

### Badges and activity

The main sidebar row already receives:

- `activeCodingAgentCount`;
- `unreadCount`;
- latest notification text / ID / timestamp;
- exact unread surface identities;
- workspace task status when that beta/remote-gated feature is enabled.

The visible activity indicator is currently a spinner whenever at least one coding agent is `running`.

The unread badge and spinner default to the same **leading** status slot. In the AppKit row implementation, a visible leading spinner hides the leading unread badge. Routine machine activity can therefore win the exact pixels that otherwise communicate unseen change.

### Attention requests

Feed already has the desired semantic split. Its primary rows are the three human-response cases:

- permission;
- exit-plan review;
- user question.

Other agent events live in the informational timeline and append-only audit. Feed request IDs can route a response back to the blocked hook, and Feed rows can jump to the originating workspace/surface.

The main sidebar can borrow this ranking without duplicating Feed.

## Applied case 1 — twelve agents, one permission, five completions

### Context

A workspace has twelve coding agents/panes. Eleven are running. One agent is waiting for permission. Five completion notifications are still unseen.

The user wants one answer in a glance: **do I owe CMUX anything?**

### Existing experience

Schematic of the current main-sidebar signals with default leading positions:

```text
┌────────────────────────────────────┐
│ ⟳  auth-refactor                   │
│    …latest notification text…      │
└────────────────────────────────────┘

machine activity: 11 running
unread state:     6 unseen events
human obligation: 1 permission request in Feed / lifecycle
```

The running spinner occupies the leading slot, so the leading unread badge is hidden. The generic unread count also mixes completion receipts with the permission request. If workspace task status is enabled, its tiny title-line glyph can elevate to `needs-attention`; Feed still holds the actual decision.

### Reaction

“I have twelve agents doing things. Tell me whether one of them needs me.”

### Diagnosis

Three different meanings compete in one narrow row:

1. **machine activity** — eleven workers are running;
2. **meaningful change** — five completed turns are unseen;
3. **human obligation** — one approval blocks progress.

The current data model distinguishes all three. The main-row presentation partially collapses them back into spinner + unread count + optional status glyph.

### Proposed alternative

```text
┌──────────────────────────────────────────────┐
│ auth-refactor                         ⟳ 11   │
│ ● Needs you · Permission                  1  │
│   5 updates · latest: tests passed           │
└──────────────────────────────────────────────┘
```

Interaction:

- `⟳ 11` is quiet machine activity. It can sit trailing, shrink to a spinner, or disappear under tight width.
- `Needs you · Permission` is sticky and high-emphasis. Clicking it opens the exact Feed decision or focuses the originating surface.
- `5 updates` is passive unseen change. Clicking it opens the notification history/latest result.
- When the permission resolves, the `Needs you` line clears immediately. The five updates remain until read.
- A completion received while background work remains updates passive state only when the semantic completion reconciler accepts the boundary. It never masquerades as a human request.

Minimal implementation path:

1. Give human-obligation presentation precedence over activity in the sidebar row.
2. Expose a tiny obligation summary from existing lifecycle + Feed attention state: count + strongest type + target surface.
3. Keep generic unread for passive updates.
4. Move activity to its own low-priority slot or let it yield whenever width is scarce.

### Judgment

**Keep:** activity spinner, unread history, Feed decision cards, exact surface routing.

**Change:** let `needsInput` become an explicit typed row in the main sidebar; let machine activity yield to human obligations and unseen changes.

**Reject:** one generic badge as the sole summary of completions and approvals.

**Unresolved:** whether passive update count should remain a number at high volume or collapse to a single dot + latest result.

## Applied case 2 — a correlated error burst

### Context

Twenty agents are spread across several workspaces. Two genuine user decisions are pending. Seven agents report errors within two minutes because a shared dependency or environment assumption broke.

The user should still see **two decisions**, plus one warning that the population itself has become suspicious.

### Existing experience

CMUX has honest journal-side `error` state, but the main sidebar currently projects error onto the same treatment as `needsInput`. Notifications, unread counts, and per-workspace elevation can therefore scatter the incident across several rows.

A user can reconstruct the pattern through notification history, Feed/event history, and terminals. That reconstruction is forensic work.

### Proposed alternative

Normal sidebar stays obligation-first:

```text
workspaces

billing-tests
  ● Needs you · Permission

auth-refactor
  ● Needs you · Question

search-index
  Agent error
```

Only when a cheap population invariant trips, add one temporary audit line above the rows:

```text
⚠ Agent population · 7 errors · 5 workspaces · 2m   Review
```

`Review` opens a filtered event/notification view showing the seven underlying errors and their workspaces/surfaces.

This is the CMUX-sized independent audit. It can start with a single rule built from data the journal already has:

```text
count distinct agent sessions with errorReported
within a short rolling window
across more than one workspace/surface
```

The audit reducer should read raw journal events directly instead of reading `effectiveTaskStatus`. That keeps it independent from the normal workspace summary and gives it a chance to catch a locally plausible but globally suspicious pattern.

CMUX can keep this reducer latent during healthy operation. The sidebar gains one warning only when there is something population-level to say.

Later audit candidates should earn their place from replay evidence. Cheap possibilities include repeated process/lifecycle disagreement or a burst of identical failures. Cost, premise validity, source freshness, and verification coverage require richer agent facts and belong later.

### Judgment

**Keep:** per-workspace state and exact receipts.

**Change:** render journal `error` as its own semantic state; add one exception-only population warning for correlated bursts.

**Reject:** a permanent fleet dashboard, worker grid, per-agent health matrix, or always-visible green audit score.

**Unresolved:** the threshold that catches correlated incidents while staying quiet during ordinary parallel failure/retry noise.

## The resulting CMUX hierarchy

For a sidebar with many active agents, the scan order should be:

```text
1. NEEDS YOU
   unresolved approvals / questions / plan reviews

2. POPULATION WARNING, when present
   one independently reduced correlated anomaly

3. UNSEEN MEANINGFUL CHANGES
   completions, errors, review transitions, latest result

4. MACHINE ACTIVITY
   running count / spinner, visually quiet

5. FORENSICS
   Feed timeline, notification ledger, agent events, terminal transcript
```

The ordering answers the human question before the machine question.

## Product rule

> When many coding agents are active, CMUX should summarize **obligations first, outcomes second, activity third**. Worker-level detail stays available as evidence. A separate audit reducer gets one narrow escape hatch for population-wide anomalies.

That preserves the useful part of the attention-compiler result at CMUX scale without turning the terminal sidebar into an enterprise monitoring console.

## CMUX evidence inspected

- `Packages/macOS/CmuxAgentJournal/Sources/CmuxAgentJournal/AgentNotificationReconciler.swift`
- `Packages/macOS/CmuxAgentJournal/Sources/CmuxAgentJournal/AgentLifecyclePhase.swift`
- `Packages/macOS/CmuxAgentJournal/Sources/CmuxAgentJournal/AgentJournalReplayPolicy.swift`
- `Sources/AgentHibernation/AgentHibernationLifecycleState.swift`
- `Sources/Workspace+Todos.swift`
- `Packages/macOS/CmuxWorkspaces/Sources/CmuxWorkspaces/Values/WorkspaceTaskStatus.swift`
- `Sources/SidebarAgentActivitySummary.swift`
- `Sources/Sidebar/AppKitList/Cells/SidebarWorkspaceRowCellView.swift`
- `Packages/macOS/CmuxNotifications/Sources/CmuxNotifications/SidebarUnreadSnapshot.swift`
- `Sources/AgentNotificationGate.swift`
- `Sources/Workspace+PanelLifecycle.swift`
- `Sources/Feed/FeedCoordinator.swift`
- `docs/feed.md`
- `docs/notifications.md`
- `docs/subagents-panel-plan.md`

Related Tact inputs:

- `APPLIED.md`
- `notes/when-100-agents-feel-like-three-decisions.md`
- `experiments/adversarial-attention-compiler/findings.md`

— Vela 🦊
