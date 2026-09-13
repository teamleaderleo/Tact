# Local agents in cmux: observed integration and next experiments

This is working evidence for the founding-team conversation, not a proposed upstream submission. Trials used isolated marker-file directories on Leo's Mac, Claude Code 2.1.270 and Codex CLI 0.154.0. They used existing authentication and agent modes. No cloud machine, new credential grant, or global hook installation was needed.

## Intended path

Type `claude` or `codex` in a cmux terminal. cmux's shell wrappers attach hooks to that invocation; the hooks supply actual session identity, activity and restore information. The Codex wrapper preserves existing hooks and notification configuration. Persistent `cmux hooks setup codex` is another installation path, not a prerequisite for the wrapper trial.

This differs from `cmux agent ...`, which manages cloud agent execution. The docs should introduce local launch, persistent integration, and cloud execution as distinct choices. The current hook guide's opening describes other agents as installed through setup, obscuring the working Codex wrapper path.

Feed is an opt-in beta, disabled by default. The command palette's **Enable Feed** action exposed it; **Disable Feed** restored the original state afterward. The JSON settings helper did not recognize `betaFeatures.feed`; a temporary trial write was restored byte-for-byte. Feed's introductory documentation should explain the beta gate. Codex approvals/questions remain in its terminal UI; its Feed hook integration is non-blocking telemetry rather than a replacement decision surface.

Sources: [cmux agent hooks](https://github.com/manaflow-ai/cmux/blob/main/docs/agent-hooks.md), [Feed](https://github.com/manaflow-ai/cmux/blob/main/docs/feed.md), local wrapper/runtime source at `6487065eaf58924c80ed4671c84e6c1da5eb7512`, and [official Codex advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced). Upstream links move; observations refer to September 12's checkout.

## Real trials

| Scenario | Observed result | Limit |
| --- | --- | --- |
| Fresh Claude and Codex launch | Both returned their requested ready marker; real session IDs appeared in hook records | One Mac, existing accounts and defaults |
| Read a local fixture | Both read `marker.txt` and returned `TACT_LOCAL_FIXTURE` | No real project changes tested |
| Explicit exit and exact-session resume | Both resumed; Codex remembered the marker | Ctrl-D did not exit these sessions; `/exit` and `/quit` did |
| Resume before another prompt | Claude emitted SessionStart promptly; Codex's ledger retained the old PID until another prompt | Removing startup noise does not fix this binding gap |
| Claude AskUserQuestion | Alpha/Beta question appeared; Tact Triage isolated the correct surface; terminal answer completed | Selecting the row targeted the correct workspace, but AX focus remained in sidebar search; keyboard handoff is not proven |
| Codex request_user_input in Plan mode | Native question appeared, accepted Alpha, and confirmed completion | No claim that Feed can answer Codex questions |
| Tagged build during a question | Build succeeded but closed the running tagged app; Codex recorded an interrupted conversation | Build-only means no launch here, not no disruption |
| App restoration | Owned workspaces and agent conversations returned; workspace UUIDs survived, short refs changed | Status sources disagreed during restoration |
| Feed after terminal answer and restoration | Feed still offered the older Claude question as actionable, although Claude was at its idle prompt | Observed stale presentation; exact invalidation cause not isolated; no stale answer submitted |

A live Codex surface also appeared as “Ended · outcome unknown” during part of resume testing. Later its title signaled “Action Required” while the Tact status line reported Idle. These observations are evidence of disagreement between projections, not proof of a specific reducer bug. A quiet or idle roster cannot serve as an independent audit.

## Changes actually made

- cmux: removed a dangling pre-launch call to missing `cmux_codex_resume_session_id`. Fresh and resume entrypoints emitted a shell diagnostic even though the agent continued. The fix retains native-hook identity instead of inventing a session from command-line arguments. Test-only commit `1b6402cfb` demonstrates local failure; fix `6487065ea` passes the executable regression. CI red/green was not independently observed.
- Tact: gave the surface row's text stack the available width. Real agent names/context exposed premature truncation caused by its trailing spacer. Fixture and actual upstream sidebar-runtime checks pass; the native extension reloaded successfully. This is a readability repair, not a measured retrieval-speed improvement.
- Native managed build at cmux `6487065ea`: 58.16 seconds, existing cache reused, clean source before/after. This is one build observation, not a benchmark distribution. A subsequent exact-session Codex resume opened successfully in the rebuilt app.

Private bounded evidence lives in `recovery/cmux-agent-paths-20260912` under the canonical Projects directory. Agent conversation history is preserved. The trials changed no agent authentication or global hook configuration.

## Highest-value next experiments

1. **A decision has a lifecycle, not just a card.** Record session identity, request identity, originating surface, resolution and last confirmed state. Reconcile terminal answers and app restoration. Test answering in terminal while Feed is closed, answering in Feed, timeout, agent exit, restart, and duplicate delivery. A stale card must be visibly stale and must not act on a newer request.
2. **Resume needs an honest intermediate state.** Distinguish process launched, session identity confirmed, and current activity known. Test explicit ID, picker, last-session and fork without submitting a prompt. Avoid interpreting old session records as current liveness.
3. **Attention should take the user all the way to the action.** Compare Home/Triage with native Feed using the same questions. Measure correct destination, actual keyboard focus, mistaken actions and recovery—not only click count. Show data age or uncertainty when source states disagree.
4. **Glaeda should protect active work during warming.** Separate compilation/cache preparation from replacing a running tagged bundle. The current cmux profile inherits reload.sh's stop-and-replace behavior. Before changing it, test an explicit activation step against active agent sessions; generic orchestration should declare disruption in the plan and defer activation while work is live.
5. **Then carry selected objects into agents.** Connect Tact's selection/evidence experiment to these real sessions only after identity and decision handling are trustworthy. A source/build receipt should say which runtime was verified and preserve unresolved claims after edits or pulls.

Upstream discussion should start with reproducible flows and tradeoffs. The startup diagnostic has a bounded patch; stale decisions, status reconciliation and non-disruptive warming need further isolation and regression coverage before being presented as solved.
