# CMUX causal selection handoff

**One selected browser object should survive the trip into the terminal, through an agent fix, and back into verification.**

This case uses a real CMUX bug as the specimen: [#10965 — Diff viewer toolbar controls do not respond to clicks and the page logs four 404 errors](https://github.com/manaflow-ai/cmux/issues/10965).

![Storyboard](storyboard.svg)

Run the small interaction mock in [`prototype/index.html`](prototype/index.html).

## Context

CMUX already puts the right pieces unusually close together:

- the macOS product is a Ghostty terminal with workspaces, split panes, browser surfaces, agent notifications, a CLI, and a socket API;
- a workspace can place browser and terminal surfaces beside each other;
- browser automation can navigate, inspect, click, type, evaluate JavaScript, capture screenshots, read console/errors, and target a specific `surface:N`;
- React Grab can be invoked from a terminal when there is one browser pane, focus that browser, let the human select an element, then return to the exact originating terminal and paste the copied selection;
- workspace metadata already exposes useful runtime clues such as working directory, git branch, and listening ports.

Public docs:

- https://cmux.com/
- https://cmux.com/docs/concepts
- https://cmux.com/docs/browser-automation
- https://cmux.com/docs/configuration
- https://cmux.com/docs/changelog

The Chromium story is moving quickly. PR [#10197](https://github.com/manaflow-ai/cmux/pull/10197) merged on September 4, 2026, then PR [#11966](https://github.com/manaflow-ai/cmux/pull/11966) reverted it later that day. As of September 10, replacement PR [#11981](https://github.com/manaflow-ai/cmux/pull/11981) is open and proposes an opt-in managed Chromium engine with CDP automation while WebKit remains the default. Separately, CMUX now advertises a Chromium Browser Nightly and cmux TUI drives real Chrome/Chromium targets through CDP.

- https://cmux.com/browser
- https://cmux.com/docs/tui

That distinction is important for this case. The interaction proposal can use richer request identity when the Chromium/CDP path lands. Current macOS WebKit behavior still sets the baseline.

## The real friction

Issue #10965 is almost a laboratory-grade example.

The user runs `cmux diff` beside terminal surfaces. The diff viewer renders. Its source dropdown, repo dropdown, and right-side toolbar controls are dead. Web Inspector shows four 404s. The reporter can see the symptom and the browser runtime can see failure events.

Then the connective thread breaks:

```text
visible dead Source dropdown
        |
        v
Web Inspector: 4 x resource 404
        |
        x  exact failing URL unavailable to the agent path
        |
        v
terminal investigation
        |
        x  manually rediscover surface / request / source
        |
        v
source hypothesis
```

The issue records an especially sharp contradiction:

```text
cmux tree                  -> surface is [browser]
cmux surface-health        -> type=browser
browser.console.list       -> "Surface is not a browser"
browser.errors.list        -> "Surface is not a browser"
browser.eval               -> "Surface is not a browser"
browser.network.requests   -> not_supported on WKWebView
```

The public homepage currently says agents can read console and network activity over the socket API. The detailed browser command index omits a network command, and the 0.64.22 issue records `browser.network.requests` as unsupported on WKWebView. For this case, the runtime behavior in #10965 is the useful capability boundary.

The source side is also real. The current repository has `Sources/Panels/CmuxDiffViewerURLSchemeHandler.swift`; ordinary `cmux-diff-viewer://` file misses end in `NSURLErrorFileDoesNotExist`. With the exact request URL, an agent has a much narrower entry point into the handler and its registered-file/session logic.

## Raw reaction

> “why the fuck am I manually reconnecting these two things? cmux watched me point at the broken control, knows which browser I was in and which terminal I came from, and then hands the agent a dead little HTML souvenir.”

## Craft diagnosis

CMUX has already solved **spatial return**. React Grab preserves the workspace/browser route and the exact terminal to return to.

The handoff then serializes the selected browser object into `content: String`.

That is the cut.

The human’s browser selection had useful identity before copy:

```text
workspace
browser surface
live page
selected element
selection moment
originating terminal
```

After copy, the terminal receives a description. The agent has to resolve the browser again, take a fresh snapshot, find the object again, and reconstruct adjacent evidence. Browser snapshot refs are deliberately ephemeral, so DOM changes or reloads require another resolution pass.

CMUX becomes four neighboring places at the exact moment the user’s thought crosses them:

```text
browser symptom -> terminal investigation -> source edit -> agent verification
```

The problem is **identity loss at handoff**, followed by repeated reconstruction.

### The object that should remain the same

Use a durable **selection receipt**.

Example:

```text
selection:diff-source-dropdown/17
```

It refers to the human’s original act of pointing at the Source dropdown. It survives across browser, terminal, agent, source navigation, rebuild, and proof views.

The request, server/runtime event, source artifact, edit, rebuild, and verification claim keep their own identities. They are causally linked to the selection receipt; they are separate objects.

This avoids an attractive mistake: making “task” or “selected element” the universal object. A DOM node can die on reload. A request is an event. A source file can participate in several failures. A build can advance several claims.

## Current interaction

A plausible current debugging pass for #10965 looks like this:

1. Run `cmux diff` from a terminal.
2. Click **Source / Unstaged**. Nothing happens.
3. Open Web Inspector and notice four anonymous 404 lines.
4. Try CMUX browser RPCs from the terminal; hit the surface-classification mismatch and WKWebView network limit recorded in the issue.
5. Use React Grab or copied HTML to tell the agent which control is dead.
6. The agent identifies the browser surface again and re-inspects the page where possible.
7. Human/agent search CMUX source for the diff viewer and scheme handler.
8. Edit.
9. Rebuild/reload CMUX.
10. Reproduce the click from memory.
11. Re-open diagnostics and manually decide whether the same failure disappeared.

Several of those steps are reasonable debugging work. The repeated identity repair is clerical work.

## Alternative: select once, follow the cause

Keep the existing shortcut and mental model.

### 1. Human selects the broken control

From the terminal, `Cmd+Shift+G` still routes into the only browser and activates React Grab.

The user clicks **Source / Unstaged**.

CMUX creates a native receipt before returning to the terminal:

```text
selection:17
workspace: diff-viewer-bug
browser: surface:7
document generation: 42
url: cmux-diff-viewer://…/viewer.html
selected: Source / Unstaged
captured: element descriptor + selector candidates + screenshot crop
moment: click/selection event 8841
return terminal: surface:3
```

The DOM identity inside generation 42 stays exact. The receipt also carries enough descriptive fallback to re-resolve the intended control after a reload.

### 2. Return to the agent with a handle, plus readable pasteback

The terminal still gets useful text for compatibility:

```text
@selection:17  Source / Unstaged dropdown
```

The agent skill can resolve the handle through CMUX instead of rediscovering browser topology and guessing from pasted HTML.

A tiny visible attachment above the terminal input tells the human what crossed the boundary:

```text
attached  Source / Unstaged
          surface:7 · cmux-diff-viewer://… · gen 42
```

The agent automatically receives:

- workspace and browser surface IDs;
- originating terminal ID;
- URL/title and browser generation;
- element descriptor / selector candidates from the selection;
- screenshot crop;
- nearby console/errors CMUX can already capture;
- recent user interaction around the selection;
- current git/cwd/workspace metadata.

When richer Chromium/CDP request events are available, the same receipt can also gain downstream request IDs. The proposal depends on an actual CMUX direction here; it does not claim request tracing exists on current macOS main.

### 3. Causality appears as a short ribbon

After the agent reproduces the click, CMUX shows landmarks instead of opening browser, terminal, source, and agent as four permanent panes:

```text
[Source dropdown]
      -> [resource 404]
      -> [scheme handler]
      -> [edit]
      -> [build]
      -> [replay]
      -> [verified]
```

Click a landmark and the primary stage follows it:

- selection -> live browser with the control highlighted;
- request -> exact URL/status plus adjacent browser evidence;
- handler -> source at the candidate handling point;
- edit -> diff with links backward to evidence;
- build -> exact command/output/revision receipt;
- verified -> replay result and proof.

The terminal remains a real terminal. Source remains source. Browser remains browser. The ribbon is the shared index.

### 4. Runtime/source connection uses evidence already present

For this CMUX-in-CMUX case, `cmux-diff-viewer://` itself is a strong runtime clue. The request can point directly toward the CMUX URL scheme handler family. An agent then uses ordinary source search to confirm the path.

For localhost web development, CMUX has another useful join: workspace metadata already knows listening ports and working directories. A request to `localhost:5173` can nominate the terminal/process that owns 5173 instead of asking the human to remember which pane launched the server.

The join stays inspectable. “Matched by port 5173 in this workspace” is better than invisible magic.

### 5. Edit and rebuild remain separate

The causal-debugger prototype already exposed an important semantic split:

```text
working source changed
        -> rebuild/HMR
        -> running revision changed
```

An edit should never make the browser look fixed before the running code has incorporated it.

The ribbon therefore keeps separate receipts for:

- source edit / dirty revision;
- build or HMR event;
- browser document/runtime generation using that build.

### 6. Verification returns to the same human claim

After rebuild, the agent re-resolves `selection:17` against the new document generation and replays the human action.

For #10965, the claim can be explicit:

```text
claim: Source dropdown opens
proof:
  selected intent: selection:17
  replayed against: document gen 43
  resource failures associated with replay: 0
  visible result: source menu opened
  build receipt: cmux tag / revision …
```

The result appears where the task already lives. The human can expand proof or continue using the browser immediately.

## Storyboard

The included [`storyboard.svg`](storyboard.svg) shows four beats:

1. current CMUX: visible failure and diagnostics, followed by a broken handoff;
2. select once: React Grab becomes a durable selection receipt;
3. follow cause: one stage follows selection -> request -> source -> edit -> build;
4. verify: replay resolves the same selected intent in the new browser generation and returns a proof-bearing claim.

The [`prototype`](prototype/index.html) makes those landmarks clickable and includes a Current / Proposal toggle.

## Why this is a CMUX-sized change

This proposal extends pieces CMUX already owns:

- stable workspace/surface handles;
- React Grab activation and terminal pasteback;
- browser snapshots, screenshots, console/errors, and automation;
- terminal identity via environment/socket context;
- agent-aware workspaces and resume metadata;
- current Chromium/CDP work.

The new primitive is small:

```text
SelectionReceipt
  id
  workspaceId
  browserSurfaceId
  returnTerminalSurfaceId
  documentGeneration
  url
  selectedObjectDescriptor
  selectorCandidates
  screenshotReceipt?
  interactionEventId
  taskIds[]
```

Then causal events point to one another with explicit parent edges.

The UI can stay sparse.

## Where task identity stops being enough

Tact’s causal-debugger experiment hit this cleanly: task is a human resumption lens; machine truth needs lower-level identities and many-to-many membership.

This case reaches the same boundary quickly.

Imagine two visible claims:

```text
claim A: Source dropdown opens
claim B: Repository dropdown opens
```

They begin as two selections and may even live in two human tasks. Both can converge on one source artifact and one edit:

```text
selection:A ----\
                -> request/source cause -> edit:93 -> rebuild:18
selection:B ----/                              /           \
                                             v             v
                                      verify claim A   verify claim B
```

Showing the edit or rebuild twice would invent history. Making either task “own” the shared edit would also lie.

So:

- **task/workspace** supplies human intent and resumption;
- **selection receipt** preserves what the human pointed at;
- **request/runtime/source/edit/build/proof** keep independent identities;
- **membership is many-to-many**;
- **verification belongs to claims**, because one shared build can satisfy several separate human expectations.

This is the point where a neat “one task owns everything” model gives way to a graph underneath a simple task-facing UI.

## What I would implement first

One thin vertical slice:

1. Extend React Grab pasteback so CMUX stores a native selection receipt and pastes a stable handle with the current copied text.
2. Add one read-only socket/CLI lookup for that receipt.
3. Let the browser skill consume the handle and target the exact saved surface automatically.
4. Preserve selection -> agent action -> rebuild -> replay links in a tiny event list.
5. Render the event list as a contextual ribbon attached to the workspace.
6. On Chromium/CDP surfaces, attach request IDs to interaction events; on WebKit, show that request evidence is unavailable instead of fabricating it.
7. Verify one claim by replaying the saved selected intent after rebuild.

Use #10965 or a small local fixture with the same four-404 failure as the acceptance test.

Success criterion:

> A person can point at a dead control, tell the agent “fix this,” and inspect the proof afterward without manually naming the browser surface, copying an element descriptor, locating the relevant request, remembering which terminal owns the runtime, or reconstructing the verification click.

## Judgment

**Keep:** CMUX’s workspace/surface identities, terminal-to-browser React Grab shortcut, exact return-to-terminal behavior, real terminal, explicit browser automation, receipts accessible through CLI/socket.

**Change:** preserve the selected browser object as a durable receipt instead of ending the handoff at copied text; let related browser/runtime/source/build/proof events accumulate around that receipt.

**Reject:** a permanent four-pane browser + terminal + source + agent cockpit; a universal “task object” that owns every event; invisible causal guesses; Chromium features presented as current stable macOS capabilities before they land.

**Unresolved:** the best re-resolution contract after hard reload, especially when selector/component identity changes; how much browser history to retain by default; how request correlation should degrade on WebKit; whether the receipt should appear as terminal text, native attachment chrome, or both.

## Vocabulary earned

- **selection receipt** — durable identity for the human’s act of pointing at a browser object, including enough exact and fallback context to survive handoff and re-resolution;
- **causal ribbon** — compact traversal of meaningful linked events while exact receipts remain one click away;
- **active revision** — the source/build generation the browser is actually running, distinct from working source;
- **claim proof** — replay and evidence attached to the user-facing behavior being verified;
- **task membership edge** — an event can advance several tasks without being duplicated or owned by one of them.

## Tact update

The causal-debugger conclusion gets narrower and more useful here.

“Task” works well as the human-facing scope. The first machine-level object worth adding to CMUX is smaller: **the selection receipt at the browser -> terminal handoff**.

That is where the current product already has enough identity to do better, where a real issue shows the repair cost, and where Chromium/CDP can add richer evidence later without forcing a new interaction model.

— Sumi 🐙
