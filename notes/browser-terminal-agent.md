# Browser + terminal + agent: one task, many lenses

Research note, 2026-09-09.

The DevTools analogy is the right starting point: a visual application and a console attached to the same runtime. The larger opportunity is to stop treating browser, terminal, source, dev server, automation, and agents as neighboring tools and instead make them different lenses on one debugging task.

The core product idea:

> The persistent object is the task. Browser, terminal, source, timeline, and agent are views onto the same evolving reality.

A conventional IDE owns files and happens to contain a terminal. A browser owns pages and happens to contain DevTools. An agent chat owns a conversation and happens to call tools. A stronger environment would own the complete causal thread: what the human tried, what the application did, what code produced it, what the server emitted, what changed, who changed it, and what evidence proved the result.

That is a deeper integration than putting six panes in one window.

## Existing precedents worth stealing from

The useful precedents each solve one piece of the problem.

### Chrome DevTools: many views, one runtime

DevTools works because Elements, Console, Sources, Network, Performance, Application, and the inspected page all refer to the same live browser target. Selecting something in one panel can lead directly to the related object elsewhere.

Two less-obvious ideas are especially relevant:

- **Workspaces** map network resources back to local source files, so browser inspection and file editing can share identity instead of relying on filenames and guesswork.
- **Local Overrides** let a browser observation become an experiment immediately: change a response, header, CSS file, or script and inspect the consequence in the same place.

Chrome has now pushed the model outward with **DevTools for agents**: MCP, a CLI, and agent skills can attach an AI agent to a live Chrome instance, including an existing browser session when explicitly connected.

Sources:

- https://developer.chrome.com/docs/devtools/workspaces
- https://developer.chrome.com/docs/devtools/overrides
- https://developer.chrome.com/docs/devtools/agents
- https://developer.chrome.com/docs/devtools/agents/get-started

### Playwright Trace Viewer: time as the coordinating axis

Playwright's Trace Viewer is one of the strongest precedents for causality. Pick an action or a time range and the screenshot, DOM snapshot, source location, console, network activity, and errors all move together. The filmstrip gives visual memory; the selected action gives a precise slice of evidence.

The important idea is larger than test traces:

> A time selection can coordinate every debugging surface.

A live environment could use the same idea continuously, while the bug is happening, instead of only after a recorded test.

Source:

- https://playwright.dev/docs/trace-viewer

### Replay: jump from visible event to executed code

Replay pushes the temporal model further. A recorded interaction can jump into the event handler that ran. Console messages are seek points. Source lines have execution history. The application can be inspected as it existed at a previous moment.

This closes a painful gap in ordinary debugging: humans usually begin with a visible symptom, then manually reconstruct which code and asynchronous chain produced it.

The interaction worth stealing is **event -> code**, with time preserved.

Sources:

- https://docs.replay.io/learn/comparisons/devtools
- https://docs.replay.io/basics/replay-devtools/browser-devtools/replay-viewer
- https://docs.replay.io/basics/replay-devtools/browser-devtools/source-viewer

### VS Code browser tools: human and agent can share the same page

VS Code's current browser-agent loop is close to the proposed environment in capability. An agent can edit code, start or find the development server, use an integrated browser, inspect screenshots and console errors, run Playwright code, fix the source, and verify again.

The human can also select rendered elements, attach their HTML/CSS/screenshots, comment directly on page elements, and then share that same browser page with the agent so it continues from the current browser state.

That last detail is important: the human should be able to point at reality, then hand the exact object over to the agent.

Sources:

- https://code.visualstudio.com/docs/agents/run/browser-tools
- https://code.visualstudio.com/docs/debugtest/integrated-browser

### Cursor: preserve browser evidence cheaply

Cursor's native browser tools expose browser actions, screenshots, console logs, and network traffic to the agent. One particularly good decision is writing verbose browser logs to files so the agent can grep and read only the relevant lines while exact evidence remains available.

That matches the Lazy Commander / Tact instinct: preserve the receipt; reduce the automatic view.

Source:

- https://cursor.com/docs/agent/tools/browser

### VS Code Agent Sessions and Warp: task identity is becoming a first-class product object

VS Code now treats an agent session as a unit of work with conversation, context, workspace, changes, execution state, tool calls, handoff, and history. Sessions can move between local, background, cloud, and different agent harnesses while remaining the same task.

Warp is attacking the adjacent problem from the terminal side: terminal-native agent sessions, worktree / branch / pull-request metadata, notifications, review, and handoff between local and cloud work.

These systems point toward a useful distinction:

- panes are places;
- **tasks are durable identities**.

Sources:

- https://code.visualstudio.com/docs/agents/concepts/sessions
- https://code.visualstudio.com/blogs/2026/08/26/agent-host-architecture
- https://www.warp.dev/agents

## What state should actually be shared?

Sharing everything creates spooky coupling. Sharing too little recreates tab-copy-paste hell. The environment needs a small set of common identities that every lens can refer to.

### 1. Task identity

Every action belongs to a task.

A task carries:

- goal / current hypothesis;
- repository and working copy;
- branch or worktree;
- agent participants and their authority;
- relevant browser session(s);
- dev-server process(es);
- accumulated receipts;
- current verification status.

A terminal command, browser click, file edit, screenshot, agent message, and test result should all be able to answer: **which task am I part of?**

This is the join key for the whole environment.

### 2. Runtime target

The browser and terminal should agree on which running application they mean.

The shared runtime record should include:

```text
process identity
cwd
command that launched it
environment fingerprint
port / URL
current build or revision
HMR / reload state
stdout / stderr receipt stream
browser pages attached to it
```

Today the human often has to remember that terminal tab 4 owns localhost:5173 while browser tab 7 points at a different worktree. The computer already knows enough to remove this class of mistake.

### 3. Current object of attention

There should be a first-class **focus object** shared across lenses.

Examples:

- a DOM element;
- a React component;
- a source line or function;
- a console exception;
- a network request;
- a server log event;
- a test assertion;
- a browser interaction;
- a diff hunk.

Selecting a button in the browser should create a durable handle. Source can show the owning component. Console can filter events involving it. Network can show requests causally downstream from its click. The agent can refer to the same handle without converting the whole thing into prose.

This is stronger than "attach screenshot to chat." It is shared object identity.

### 4. Time cursor

A debugging task should have a common time cursor.

If the user selects the moment when a button was clicked, every lens should be able to answer relative to that moment:

- what did the page look like?
- what event handler ran?
- which requests started?
- what did the server print?
- which source revision was active?
- what did the agent do immediately before and after?

Playwright already proves how powerful this is in a trace. The new move is keeping a lightweight live trace for ordinary development.

### 5. Revision identity

The browser needs to know which source state produced what it is showing.

A useful runtime revision might combine:

```text
git HEAD
+ dirty diff fingerprint
+ dev-server build id
+ browser load / HMR generation
```

Then a screenshot or console error can say exactly which code produced it. "I fixed it" becomes a claim against a known revision, followed by evidence from a later revision.

### 6. Browser session state, with a visible privilege boundary

Cookies, local storage, auth, feature flags, viewport, geolocation, throttling, and emulation often determine whether a bug exists. They belong to the task's runtime state.

The agent should be able to inherit a human browser session when the user explicitly shares it, as Chrome and VS Code now allow. The environment should keep that privilege visible because an authenticated browser carries real authority.

### 7. History and receipts

The task should preserve exact evidence while presenting a much smaller automatic summary.

Receipts can include:

- commands and outputs;
- browser actions;
- DOM / accessibility snapshots;
- screenshots;
- network records;
- console and server logs;
- file edits and diffs;
- test runs;
- agent tool calls;
- approvals;
- checkpoints;
- verification claims.

The default view should show causal landmarks. Exact material stays one gesture away.

## Interaction model 1: the causal cursor

The most useful new primitive may be a cursor that points into **causality**, not merely space.

Imagine clicking the failed "Save" button in the browser and pressing a debug gesture.

The environment captures:

```text
Save button
-> click event
-> onSave()
-> POST /api/profile
-> 500 response
-> server exception
-> src/profile/update.ts:81
```

Now the browser, source viewer, network view, server log, and agent all share that causal selection.

The human can move backward or forward along the chain. The agent can say "the failure begins here" and point at an exact edge. The terminal can open already filtered to the server process and relevant log interval.

This is much stronger than synchronizing tabs. It turns debugging into traversal through a graph of consequences.

### Why this would feel good

The user's thought remains continuous:

> I clicked this; why did that happen?

The interface follows that sentence directly.

## Interaction model 2: human gesture -> agent handoff

The cheapest high-bandwidth prompt is often a gesture.

The human should be able to:

1. use the application normally;
2. point at the broken thing;
3. say or type "this jumps when the menu opens";
4. hand the live state to the agent.

The agent receives the selected element, screenshot region, page URL, browser state, nearby console/network events, source mapping, runtime revision, and recent interaction history automatically.

The agent can then move through tools without asking the human to restate context:

```text
observe visual symptom
-> inspect element / accessibility / computed style
-> follow source mapping
-> inspect recent causal events
-> run a terminal query or test
-> edit source
-> wait for rebuild
-> replay the same interaction
-> compare before / after
-> return the task at the exact place the human left it
```

The important design detail: **handoff should preserve the object and moment, not just the conversation.**

## Interaction model 3: executable history

History can become more than a transcript.

Every meaningful task event can be replayable or forkable:

- rerun this command;
- repeat this click sequence;
- restore this browser checkpoint;
- reapply this diff;
- rerun verification from this point;
- fork before the agent's change and try another fix.

A human reproducing a bug already generates an implicit test. The environment should quietly record enough to turn that interaction into a reusable reproduction recipe.

After a bug is understood, one command could promote the observed sequence into a Playwright test or other durable check.

This creates a beautiful progression:

```text
human encounters bug
-> environment records reproduction
-> agent diagnoses
-> code changes
-> reproduction replays
-> result compares
-> successful reproduction becomes regression test
```

Debugging, verification, and test authoring become one continuous activity.

## Interaction model 4: one stage, contextual instruments

A pile of panes appears when every capability gets a permanent rectangle.

Avoid that.

Use one primary **stage** and a small number of stable edge anchors.

The stage can currently be:

- the live application;
- source;
- terminal;
- a trace;
- a diff;
- an agent conversation.

Contextual instruments appear because of the selected object. If the user selects a network failure, a narrow request/server-log instrument can appear. Select a DOM node and style/source details appear. Select an agent edit and the diff/verification receipt appears.

Two rules make this workable:

### Follow by default

Secondary views follow the shared causal cursor. The user changes the selected event or object once; related instruments update automatically.

### Pin deliberately

Anything can be pinned when spatial persistence is useful. A pinned server log, source file, or browser page stays put while the rest of the environment follows the task.

This preserves the useful "papers on a desk" quality without forcing the user to manage a cockpit full of rectangles.

## Interaction model 5: a causal ribbon instead of an agent transcript

Agent chat is a weak default visualization for debugging because it gives words equal visual weight to actions and evidence.

A better persistent view is a compact causal ribbon:

```text
human click
  ↓
POST /api/profile 500
  ↓
server exception
  ↓
agent inspected update.ts:81
  ↓
agent edited 3 lines
  ↓
server rebuilt
  ↓
replayed click
  ↓
POST /api/profile 200
  ↓
verified: UI persisted after reload
```

Each item opens its exact receipt. Routine tool chatter collapses. The visual emphasis goes to state transitions, failures, edits, decisions, and proofs.

This also gives the human a legible answer to "why did the agent do that?" Select an edit and walk backward through the evidence that motivated it.

The task becomes inspectable in both directions:

- **cause -> effect**: what happened because of this action?
- **effect -> cause**: what evidence caused this edit or conclusion?

## Interaction model 6: verification as a first-class state

Agents currently tend to end with prose such as "fixed" or "tests pass." The environment can make verification concrete.

A task can have claims with attached receipts:

```text
claim: Save no longer jumps
proof:
  reproduction recipe #12
  before screenshot / after screenshot
  browser console: no errors
  POST /api/profile: 200
  persisted after reload
  source revision: abc123 + diff:7f2...
```

The human sees the claim first and expands proof when needed.

This fits Tact's attention model: healthy evidence stays quiet; uncertainty, failed verification, or missing proof earns foreground attention.

## Interaction model 7: task-scoped command language

A unified environment still needs direct expert control. The terminal should remain a real terminal.

But commands can gain task-aware references.

Examples:

```text
open @failure
logs @server --since @click
replay @repro
inspect @request
show-source @element
compare @before @after
ask-agent fix @failure and replay @repro
```

The interesting part is not the exact syntax. It is that browser objects, terminal processes, files, events, and agent observations share names inside one task.

This makes programmatic control feel native instead of requiring every layer to rediscover the world through strings, ports, selectors, and filenames.

## How an agent should move between seeing and acting

The agent loop should preserve exact handles whenever possible:

```text
SEE
visual / DOM / accessibility / console / network observation

FOLLOW
resolve selected object into source, process, request, event, or prior receipt

ACT
browser gesture / terminal command / file edit / server control

WAIT
observe the consequence tied to that action

VERIFY
replay the triggering interaction and compare against an explicit claim

REPORT
return the task with causal links and receipts intact
```

The agent should avoid repeatedly converting the world into prose and then rediscovering it. Handles survive the transition between modalities.

A screenshot region can remain linked to a DOM node. A DOM node can remain linked to source. A network request can remain linked to the interaction that caused it and the server logs it produced. A file edit can remain linked to the evidence that motivated it.

That connective tissue is where the environment becomes one place.

## What should the human see while the agent works?

Most of the time: very little.

Useful ambient state:

- task goal;
- current phase: observing / changing / waiting / verifying;
- current focus object;
- one-line latest causal landmark;
- changed-file count;
- verification status;
- blocker or requested judgment.

When the agent acts in the browser, briefly reveal the target and action on the live page. When it edits code, mark the causal link back to the symptom. When it runs a command, preserve the exact receipt without opening a terminal pane unless output needs attention.

The product should make it easy to watch closely and equally easy to let healthy work disappear.

## One debugging journey

A concrete end-to-end journey is a better test than a feature checklist.

Suppose a dropdown closes immediately after opening.

1. Human opens the app and reproduces it.
2. Environment records the click sequence and creates a reproduction handle.
3. Human selects the dropdown and says "it closes immediately."
4. Agent receives element identity, interaction history, screenshot, console/network slice, runtime revision, and source mapping.
5. Agent replays the reproduction once.
6. Causal cursor shows `pointerdown -> document listener -> closeMenu()`.
7. Source lens opens at the listener; no separate search step.
8. Agent runs the narrow relevant test command in the task terminal.
9. Agent edits the event handling.
10. Dev server rebuild is attached to the edit automatically.
11. Agent replays the exact human reproduction.
12. Before/after interaction trace compares the result.
13. Agent promotes the reproduction into a regression test.
14. Human sees: **fixed + verified**, with the causal ribbon collapsed underneath.
15. Clicking the claim expands every receipt from symptom to proof.

The whole sequence should feel like following one thought.

## Product principles this suggests

### One task, many lenses

Do not make the human move context between tools that already share the same task.

### Shared identity beats duplicated context

Prefer exact handles for runtime objects, processes, events, files, revisions, and receipts. Use prose to explain; use identity to connect.

### Time is a universal debugging coordinate

A common time cursor can align visual state, console, network, server logs, source execution, agent action, and revision.

### Causality deserves a native visualization

History should reveal why an event happened and why an agent acted, while routine mechanics remain collapsed.

### Human gestures are high-bandwidth context

Pointing at the application should be enough to establish the object of attention.

### Reproduction should become executable

Ordinary debugging interactions can quietly accumulate into replayable recipes and then regression tests.

### Stable places, dynamic detail

Keep a small number of spatial anchors. Let contextual instruments follow the task. Pin only the things worth remembering spatially.

### Verification should be inspectable

"Done" is a claim. The environment should attach proof automatically.

## Prototype directions worth trying

### Prototype A: causal cursor on one React bug

Build the smallest possible loop where one browser click links to:

- selected DOM / component;
- event handler source;
- network request;
- server log slice;
- file edit;
- replayed verification.

Ignore general IDE features. Prove whether moving through causality feels better than moving through panes.

### Prototype B: live executable history

Record a human browser interaction plus terminal/dev-server activity. Let the user scrub it like Playwright Trace Viewer, then rerun the selected interaction against the current revision.

The key test: can a naturally occurring debugging session turn into a regression test with almost no clerical work?

### Prototype C: one stage + follow/pin

Make a workspace with one large primary stage and one contextual instrument area. Switching focus objects changes the instrument automatically. Any instrument can be pinned.

Test whether this gives the power of many panels without visual bookkeeping.

### Prototype D: causal receipts for agent edits

For every agent diff hunk, preserve:

```text
observed symptom
-> evidence inspected
-> hypothesis
-> edit
-> rebuild
-> verification
```

Then make the default agent view show only meaningful landmarks. Measure how often the human needs the raw transcript afterward.

## The bigger possibility

DevTools made the browser application and its console feel attached because they shared a runtime.

The next environment can attach **the entire act of making software** to the same task:

```text
human intention
+ rendered application
+ runtime objects
+ source
+ processes
+ commands
+ agents
+ time
+ causality
+ receipts
+ verification
```

The magic would come from continuity. You touch a broken thing, follow its consequences into code, change it, watch the application answer, and keep the proof. Human and agent can trade control anywhere along that path while remaining inside the same thought.

— Sumi 🐙
