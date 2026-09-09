# Clutch Lab

A dependency-free prototype for Tact's **microphone-as-clutch** experiment.

The claim under test is narrow:

> Speech should carry relationship / intent while visible selection carries the exact referent. The interpretation stays visible, and the user can repair the smallest wrong part without restarting the thought.

This is an experiment, not a voice assistant demo. It is deliberately instrumented around repair cost.

## Run it

Serve this directory from localhost so browser microphone permissions work predictably:

```bash
cd prototypes/microphone-clutch
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. Chrome-family browsers currently provide the broadest support for the Web Speech API used by the prototype.

If browser speech recognition is unavailable, open **Simulate a voice turn**. The simulator feeds the exact same interpretation and failure-injection path, so deterministic experiment runs still work.

## What is in the lab

Three expert-ish tasks use the same interaction model:

1. **Failed request**
   - pointer + keyboard: select failed + prior successful requests, compare;
   - voice-only: verbally identify both requests;
   - mixed: select the failed request, say “compare this with the previous successful one”.

2. **Merge work**
   - pointer + keyboard: multi-select tasks, keep the primary selection's owner, merge;
   - voice-only: name both tasks and the owner;
   - mixed: select two tasks, make the desired owner primary, say “keep this one as owner and merge the work”.

3. **Spacing edit**
   - pointer + keyboard: select the section, inspect the reference value, type the exact number;
   - voice-only: name target and reference sections;
   - mixed: select the target, say “match this spacing to the section above”.

The tasks are intentionally small. The experiment is about the interaction boundary, not application complexity.

## The visible contract

Every action produces a persistent receipt:

```text
Heard       -> recognition result
Understood  -> action + target + reference / owner
Did         -> actual effect
```

The `Understood` fields remain editable.

In **mixed** mode, a wrong target/reference/owner can be repaired by pressing **Pick** and selecting the correct visible object. The command context remains active after the repair, so the user can speak again immediately.

In **voice-only** mode, the same fields can be changed through compact selects or another voice turn. For strict voice-only study sessions, ignore the selects and repair by speech; the visible fields still make the error inspectable.

## Failure injection

Arm one or more failures for the **next voice turn**:

- **Recognition mistake** changes the words the system claims it heard.
- **Wrong referent** preserves the words but binds the target to the wrong object.
- **Wrong intent** preserves the words/referent but maps the relationship to the wrong action.

Failures apply once and disarm immediately. The next turn is a real repair turn, which prevents the lab from turning every correction into another synthetic failure.

The deterministic injections differ by task. Examples:

```text
compare -> replay
merge -> link
spacing -> width
```

The visible receipt makes the failure layer obvious. A user should be able to distinguish “the words are wrong” from “the target is wrong” from “the action is wrong”.

## Measures

Each completed run stores:

- elapsed time from first task action to correct outcome;
- total task actions;
- voice turns;
- spoken words;
- **referent words spoken** (words spent naming visible objects);
- typed characters;
- repair turns;
- wrong interpretations.

The results table is kept in `localStorage` and can be exported as JSON.

The lab intentionally avoids an invented combined “efficiency score”. Compare the raw costs. A mixed interaction that saves two clicks while adding twenty spoken words may still lose. A mixed interaction that saves repeated object naming and cuts a three-turn repair to one click may win even if the happy path ties.

## Suggested protocol

For each of the three tasks:

1. Run a clean pointer + keyboard baseline.
2. Run a clean voice-only condition.
3. Run a clean mixed condition.
4. Repeat voice-only with **recognition mistake**.
5. Repeat mixed with the same recognition mistake.
6. Repeat those paired runs for **wrong referent**.
7. Repeat those paired runs for **wrong intent**.

Record qualitative observations beside the JSON if useful:

- Did the user keep looking at the artifact or start looking at the command surface?
- Did selection eliminate verbal serialization?
- Which error layer was obvious first?
- Could the user repair one slot or did they restart the command?
- After repair, did the user continue speaking naturally?
- Did the mixed condition feel like steering the workspace or operating a voice UI?

## Important limits

The prototype uses the browser Web Speech API as an input source; recognition quality varies by browser, operating system, microphone, accent, and network service. The deterministic failure switches exist so the repair experiment does not depend on naturally occurring ASR errors.

The task model is intentionally local and reversible. This experiment says nothing yet about speech around destructive actions, secrets in shared rooms, or long-running agent authority.

## Success / failure read

The mixed hypothesis gets stronger if, across realistic repair runs:

- spoken referent words drop sharply versus voice-only;
- repair turns drop when the referent or intent is wrong;
- pointer/keyboard baseline needs more navigation or exact re-entry for the same relationship;
- the user returns immediately to speaking after a click/field repair;
- the receipt stays useful without becoming the main interface.

The hypothesis weakens if clean mixed runs tie the direct baseline while repair remains equally expensive, or if users spend more time managing selections and interpretation cards than they save through speech.

— Luma 🦋
