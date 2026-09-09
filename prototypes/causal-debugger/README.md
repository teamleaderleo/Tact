# Causal debugger prototype

This is Experiment 4 from [`WORKBENCH.md`](../../WORKBENCH.md): one real debugging thread where a visible browser failure can be traversed through runtime, request/log evidence, source, edit, rebuild/reload, replay, and verification.

The interface has one primary stage plus a causal ribbon. Selecting an event moves the stage to the relevant browser, source, or evidence view. Exact receipts stay behind the event that produced them.

## Run

```bash
cd prototypes/causal-debugger
npm start
```

Open <http://127.0.0.1:4317>.

Run the executable checks with:

```bash
npm test
```

The prototype uses only Node built-ins and browser APIs.

## First thread

1. On the Profile browser surface, click **Save changes**.
2. Select the visible failure and **Trace failure**.
3. Traverse the causal ribbon:

   ```text
   browser interaction
   -> runtime event
   -> POST /api/profile
   -> server log
   -> source:shared-input-normalizer
   ```

4. Open the source event and choose **Apply smallest fix**.
5. Choose **Rebuild + reload**. Working-source revision and active-runtime revision remain separate until this step.
6. **Replay reproduction** against the rebuilt runtime.
7. **Capture visible verification** to attach the browser-visible result as evidence.

The task, runtime, page, focus, source revision, event, and receipt identities remain visible as handles throughout the thread.

## Break the task model

After the first thread verifies, choose **Break task model**.

The prototype restores the buggy shared normalizer and reproduces two separate human tasks:

- `task:profile-save` — `Ada Lovelace` fails;
- `task:invite-role` — `Platform Engineer` fails.

Both failures resolve to the same lower-level artifact: `source:shared-input-normalizer`.

Applying the fix once produces one `source.edit` event with two causal parents and two task memberships. Rebuilding produces one shared runtime event. Verification fans back out into separate replays and UI proofs for the two human tasks.

## Identity model

Every event carries the smallest useful joins:

```text
event.id
runtimeId
pageId
focusId
revision
taskIds[]
parents[]
receiptIds[]
```

Key properties:

- `taskIds` is many-to-many from the beginning;
- runtime identity survives source edits and rebuild generations;
- working source revision and active runtime revision are distinct;
- browser page identity comes from `sessionStorage` and is supplied on every browser/server hop;
- focus identity names the visible flow the human selected;
- parent event IDs encode causality independently from wall-clock order;
- receipts preserve exact network, log, source, diff, build, replay, and verification evidence;
- receipt links are stable local handles such as `#receipt=receipt:server-log:0004`.

The tracked `runtime/shared-input.*.mjs` files are templates. The running prototype copies them into a temporary working/runtime directory, so using **Apply smallest fix** never mutates the repository checkout.
