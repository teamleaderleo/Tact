# Voice, multimodal interaction, and interfaces that disappear

A study of when speech makes the computer recede, when it makes interaction heavier, and how voice should coexist with visible state in future agent workspaces.

The motivating observation is already in Tact: ChatGPT's microphone flow can make the phone stop feeling like an app and become something the user simply talks through.

That instinct survives contact with the research, with an important refinement:

> Voice is strongest as a way to express intent while another medium carries reference, precision, memory, and evidence.

The question is less "voice or GUI?" and more:

> Which part of this thought belongs in speech, which part belongs in the visible world, and how cheaply can the user move between them?

## The microphone button may be more interesting than full voice mode

There are at least three materially different products hiding under the word "voice":

1. **Voice as text entry** — tap the microphone, speak, receive/edit text, continue in a visual conversation.
2. **Voice as command** — say an action and let the system execute it.
3. **Voice as conversation** — spoken input and spoken output with turn-taking over time.

The first pattern is unusually strong because it splits the job between modalities cleanly.

Speech carries composition. The screen carries memory.

That preserves several of voice's best properties:

- eyes and thumbs can relax while the user formulates a thought;
- long, messy, high-bandwidth intent comes out conversationally;
- the result becomes stable text that can be scanned, edited, quoted, compared, and revisited;
- the user can immediately fall back to touch or keyboard for a name, number, symbol, correction, or exact phrase.

Ruan et al. found speech entry on mobile phones substantially faster than miniature touch keyboards for their transcription task: 3.0x for English and 2.8x for Mandarin. The study is narrow enough that the multiplier should stay attached to that task, but it establishes the core advantage: producing linguistic content can be very quick through speech.

Source: https://hci.stanford.edu/research/speech/

Full spoken conversation trades some of that inspectability for continuity. That can be wonderful while walking, cooking, driving a low-complexity interaction, pacing around a room, or thinking aloud. It becomes expensive when the answer contains exact values, code, alternatives, long lists, or anything the user wants to compare side by side.

A useful hypothesis for Tact:

> Voice input + visual state may be a broader sweet spot than voice input + voice output.

## Voice is excellent at intent and weak at coordinates

Sharon Oviatt's multimodal map studies remain unusually clear evidence.

In a map task, speech-only interaction produced more errors, more disfluencies, and longer completion times. People struggled to verbalize spatial locations. Combining speech with pen input let them say the action while drawing or indicating the place. Multimodal interaction completed the task faster than speech alone or writing alone.

Source: https://chi1996.acm.org/proceedings/papers/Oviatt/slo_txt.html

The deeper lesson is broader than maps.

Speech is good at:

- goals;
- predicates;
- relationships;
- explanations;
- categories;
- rough quantities;
- open-ended constraints;
- sequences with semantic names.

Direct manipulation is good at:

- this object;
- this exact position;
- this range;
- these three items;
- move it here;
- resize to this boundary;
- compare these two visible things;
- scrub through continuous values.

So a strong multimodal interaction often sounds like:

```text
[user selects a failed request]
"compare this with the previous successful one"

[user highlights two agents]
"merge these into one task and keep this one as owner"

[user points at a browser element]
"make this match the spacing above"
```

The pointing, selection, focus, cursor position, highlighted text, visible pane, and spatial arrangement can carry nouns that speech would otherwise have to laboriously name.

> Let speech express the relationship. Let the visible world supply the referents.

## Multimodality should feel opportunistic

Oviatt's later synthesis is useful because it rejects a simplistic picture where speech is always primary and gestures merely decorate it.

People mix unimodal and multimodal interaction according to the task. Modalities often carry complementary information. They may arrive sequentially rather than simultaneously. Users also learn to avoid a mode that performs poorly for particular content.

Source: https://doi.org/10.1145/319382.319398

This argues against designing an agent workspace around a formal grammar like:

```text
voice mode
-> visual mode
-> voice mode
```

The better model is fluid:

```text
speak
-> click one ambiguous referent
-> keep speaking
-> type one exact identifier
-> interrupt
-> drag a target
-> speak again
```

A multimodal system should preserve the thought across those changes.

The user should never have to restate the whole problem because their preferred modality changed.

## Voice as command

Voice command works beautifully when several conditions line up:

- the user already knows what they want;
- the command has a clear scope;
- the action is familiar;
- the result can be summarized briefly;
- the action is reversible or low-consequence;
- names and parameters are easy to pronounce;
- the user benefits from keeping eyes or hands elsewhere.

Good examples:

```text
"start a 20 minute timer"
"open the last failed test"
"mute this thread for an hour"
"show only blocked agents"
"run the tests for this package"
"summarize what changed since lunch"
```

Voice command gets awkward when the command itself becomes a serialization format:

```text
"checkout feature slash auth dash callback dash two"
"replace line 184 column 17 through line 191 column 4"
"select the third blue node two rows below the current one"
```

At that point the user is acting as an encoder for the machine. A pointer, selection, fuzzy search, completion UI, or generated command is cheaper.

### Discoverability is the command problem

A visible button advertises itself. A voice command can exist forever without revealing that it exists.

Srinivasan et al. studied natural-language command discovery in a multimodal editor and found that contextually relevant, in-situ command examples encouraged discovery and speech use.

Source: https://www.tableau.com/research/publications/discovering-natural-language-commands-multimodal-interfaces

That suggests a useful principle:

> Teach voice from the visible context where the action becomes relevant.

Instead of a giant "things you can say" page, a selected object might quietly reveal one or two useful speech examples. The teaching can fade as the user learns.

## Voice as conversation

Conversation earns its place when the user is still discovering the request.

This is where speech can be magical:

- brainstorming;
- explaining a messy situation;
- narrating a goal before knowing the implementation;
- changing one's mind mid-sentence;
- asking follow-up questions;
- exploring tradeoffs;
- thinking while moving;
- collaborating with another person while the agent joins lightly.

Reicherts et al. compared voice-based and screen-based agent interaction while pairs explored data visualizations. In the voice condition, participants interacted with the system more, explored more visualizations, asked more questions, and took more conversational turns. Voice fit into the ongoing human conversation while attention stayed on the visual task.

Source: https://doi.org/10.1145/3484221

That is a compelling model for agent workspaces:

> Keep the artifact visual; let the agent join through voice without stealing the user's eyes.

The same study also points to a reason to retain screen output. Visual prompts can be read when the users choose and can slow a discussion enough to encourage more deliberate interpretation.

Voice accelerates conversational tempo. Sometimes that is the goal. Sometimes the user needs a surface that waits.

## Voice plus visual confirmation

A voice system becomes far more capable when it has a quiet visual shadow.

That shadow can answer three questions:

```text
what did it hear?
what did it infer?
what did it do?
```

Those are different failure points and should remain distinguishable.

For example:

```text
Heard:       "move the auth task to Maya"
Understood:  task #184 -> owner Maya
Did:         reassigned task #184
```

Most ordinary actions should collapse this to almost nothing. A small transient receipt can be enough. Expansion should reveal exact detail.

This visual layer is valuable for:

- names;
- numbers;
- branch names;
- commands;
- URLs;
- selected targets;
- multiple candidates;
- destructive actions;
- long-running actions;
- parallel agent work;
- anything the user may want to compare or revisit.

The design goal is a screen that can disappear from attention while remaining available as evidence.

## Interruption is a primary control, not an edge case

Natural conversation uses overlap constantly: correction, agreement, answer-before-the-question-finishes, clarification, topic switch, impatience, and simple "stop."

A voice agent should treat interruption as a control path with at least two layers:

1. **Audio yield** — stop speaking when the user takes the floor.
2. **Semantic yield** — stop or revise the work that the interrupted speech represented.

Those can diverge.

An agent can stop its audio instantly and still keep executing the wrong plan in the background. That is a much more expensive failure than talking for half a second too long.

A serious prototype should classify interruption intent, for example:

```text
stop
correction
answer
backchannel / acknowledgement
request to continue
topic switch
new command
```

A review of turn-taking systems notes that users attempt barge-in naturally and that false barge-ins can come from coughs, noise, or backchannels. Treating every detected sound as "cancel" produces its own failure class.

Source: https://doi.org/10.1016/j.csl.2020.101178

For agent workspaces, interruption should also cross modalities:

- press Escape while the agent speaks;
- click another object and say "this one";
- start typing and have speech output duck or stop;
- say "hold that" while preserving the current plan;
- say "undo that" while the visual receipt is still present.

## Correction should patch state locally

Voice systems become intolerable when a small misunderstanding forces the user to repeat a large request.

Good repair:

```text
User: "Open the Toronto project and run the API tests."
System chooses wrong Toronto project.
User: "No, the archived one."
System changes only the project referent.
```

Bad repair:

```text
"Sorry, please repeat your request."
```

Older speech-interface research repeatedly found that switching modality can make correction more efficient. Lewis found multimodal correction with voice + mouse + keyboard produced 63% higher corrected-word throughput than hands-free correction in his dictation experiment. Suhm, Myers, and Waibel found multimodal correction faster and more accurate than repeated speech repair, and observed that users learned to leave ineffective correction modes.

Sources:

- https://doi.org/10.1177/154193129904300514
- https://doi.org/10.1145/371127.371166

This has a direct agent-workspace translation:

> When speech creates the error, give the user another channel to repair it.

Examples:

- click the correct tab;
- type the exact identifier;
- choose one candidate;
- drag the action back;
- edit the generated command;
- correct one slot in an intent card.

Respeaking should remain available because it is convenient. It should never be the only repair path.

## Context switching: voice can preserve a thought across tools

Voice becomes especially interesting in a browser + terminal + agent workspace because it can sit orthogonally to the visual work.

The user can keep looking at:

- the webpage;
- a diff;
- a trace;
- DevTools;
- terminal output;
- an agent overview;

while saying:

```text
"rerun that with cache disabled"
"open the source for this frame"
"ask the agent that changed this file why"
"compare this request with the one above"
"keep the browser here and show the failing assertion beside it"
```

The microphone can become a clutch: engage it briefly to steer the workspace, release it, and return to the artifact.

This is different from replacing the terminal with speech.

Literal code and command entry expose many of speech's weaknesses: punctuation, symbols, identifiers, exact casing, and repeated micro-edits. Begel and Graham's Spoken Java work found that expert developers could learn spoken commands, while literal code felt awkward and voice programming remained slower than typing. More recent work with disabled voice coders likewise emphasizes multimodal workflows, command chaining, navigation, and custom commands.

Sources:

- https://www.microsoft.com/en-us/research/publication/an-assessment-of-a-speech-based-programming-environment/
- https://doi.org/10.1108/JET-02-2024-0021

That suggests a stronger target:

> Speak about code. Point at code. Let the system generate exact code and commands. Keep exact execution visible.

## Social context changes the answer

Voice exists in a room.

That simple fact changes adoption dramatically.

Research on VUI context of use found that people may choose typing for the same request when strangers are nearby, even when they happily use voice at home. Public use can introduce discomfort and privacy concerns. Background speech also degrades recognition.

Source: https://doi.org/10.1002/smr.2618

So modality selection should include social context, not only task efficiency.

Questions for a future workspace:

- Is the user alone, in a shared office, on a call, in transit, or in public?
- Is the requested content sensitive?
- Is audio output appropriate here?
- Would push-to-talk feel socially legible while always-listening feels invasive?
- Can the same thought move from voice to typing without losing context?

A good product can let voice disappear too: the moment the room makes speech awkward, keyboard/touch should pick up the same conversation seamlessly.

## Hands-free does not mean attention-free

Voice can free the visual and manual channels. It still consumes linguistic and cognitive attention.

Driving research is useful because it makes this distinction measurable. Speech interfaces can reduce eyes-off-road time compared with visual-manual interaction, yet voice tasks still add cognitive load compared with driving alone. Complexity, recognition failures, and latency increase that cost.

Sources:

- https://doi.org/10.1016/j.aap.2022.106898
- https://pubmed.ncbi.nlm.nih.gov/16170949/

A general principle:

> Use voice to free occupied hands and eyes; budget separately for the user's mind.

That makes voice especially good for simple steering during visually demanding work and less attractive for dense secondary reasoning while the user is already doing dense primary reasoning.

## Ambient computing is quieter than a talking computer

Mark Weiser's disappearing-computer work is a useful counterweight to the sci-fi assumption that ubiquitous computing means ubiquitous voice.

His calm-technology argument centers on moving information between the periphery and the center of attention. He also explicitly warned that voice command is prominent and attention-grabbing in social life.

Sources:

- https://calmtech.com/papers/computer-for-the-21st-century
- https://calmtech.com/papers/the-world-is-not-a-desktop
- https://calmtech.com/papers/designing-calm-technology

For agent workspaces, ambient interaction may mean:

- silence while work is healthy;
- a small persistent status change;
- a tone when a bounded event completes;
- a spoken interruption only when the user benefits from immediate semantic content;
- voice on demand for "what changed?" or "what needs me?"

A room full of proactive agents talking is the opposite of disappearance.

> The workspace can be voice-capable while remaining acoustically quiet most of the time.

## When the UI should vanish

Visible controls can recede when the task is:

- familiar;
- easily stated;
- low-ambiguity;
- reversible;
- low-consequence;
- low in visual comparison needs;
- low in exact symbolic entry;
- already anchored by stable context;
- producing a short result.

Examples:

```text
"show blocked agents"
"open the latest run"
"summarize this page"
"message Leo that the build passed"
```

The UI can become little more than a microphone affordance plus a transient receipt.

## When visible controls remain essential

Visible interaction earns permanent or easily summoned space when the user needs:

- discoverability;
- comparison;
- exact text;
- exact numbers;
- spatial editing;
- ordering and reordering;
- multiple selections;
- long-running or parallel work;
- uncertainty;
- irreversible consequences;
- history;
- source evidence;
- undo;
- audit;
- a stable place to return after interruption.

This is especially true in agent software. An agent can accept an instruction through speech and then work for twenty minutes across files, terminals, browsers, and services. The user's later question is rarely "what did I say?" alone. It becomes:

```text
what happened?
what changed?
what is still running?
what evidence supports the result?
what needs my judgment?
what can I reverse?
```

Those are visual-workspace questions.

## Concrete principles for future agent workspaces

### 1. Let speech carry intent; let the workspace carry state

The user's goal can arrive by voice. Current objects, selections, history, diffs, receipts, and alternatives should remain visible and addressable.

### 2. Treat focus, selection, hover, and spatial position as part of the utterance

"Fix this" should be a rich command when "this" is already selected.

### 3. Make push-to-talk a first-class workspace gesture

A microphone can behave like a clutch: temporary, explicit, low ceremony, and scoped to the current work.

### 4. Preserve the thought across modality changes

Speech -> click -> type -> speech should remain one interaction, with shared context.

### 5. Separate heard, inferred, and executed state

When something goes wrong, the user should be able to locate the failure immediately.

### 6. Prefer reversibility and repair over repetitive confirmation

Frequent "are you sure?" prompts turn voice into bureaucracy. Keep low-risk actions fluid; make costly actions inspectable and cancellable.

### 7. Make interruption semantic

Stopping audio is one part. Cancelling, revising, or continuing the underlying work is the larger interaction.

### 8. Corrections should edit the smallest wrong thing

A mistaken tab, number, owner, branch, or date should be one-slot repair.

### 9. Keep rich output visual

Speak the headline. Show the evidence.

### 10. Let the visible UI teach the invisible UI

Contextual command examples can appear where speech is useful and fade with expertise.

### 11. Make social context a modality input

Private room, shared office, public transit, active call, and sensitive content should influence how aggressively voice presents itself.

### 12. Keep healthy ambient agent work quiet

Voice output should earn interruption. Most state can live in peripheral visual cues until requested.

### 13. Optimize the mixed workflow, not each modality in isolation

A slightly slower voice command can still win if it avoids three pane changes. A quick spoken command can still lose if correction requires a long dialogue.

Measure the complete loop.

## Prototype-worthy questions

### Mic as clutch

Build a browser + terminal + agent workspace where a microphone press temporarily routes speech to the focused pane.

Compare:

1. keyboard/pointer only;
2. voice-only commands;
3. mixed mode with voice scoped by current focus/selection.

Use a real debugging task. Measure:

- task completion time;
- number of pane/tool switches;
- number of identifiers manually re-entered;
- correction turns;
- wrong-target actions;
- times the user has to restate context;
- how often the user looks away from the primary artifact.

### The visual shadow of speech

Prototype three confirmation levels:

1. spoken command executes with a tiny receipt;
2. live transcript + inferred action appears transiently;
3. proposed action waits visibly before execution.

Vary consequence and ambiguity.

Question:

> Which actions feel magical when the card disappears, and which become reckless without a visible staging area?

### Repair without restart

Inject three kinds of error:

```text
recognition error  -> heard the wrong word
reference error    -> chose the wrong object
intent error       -> understood the words but inferred the wrong action
```

Test repair through:

- speech;
- click/selection;
- typing;
- undo;
- editing one field in the intent card.

Measure how many turns and how much repeated context each repair requires.

### Barge-in as control

Have an agent speak while doing visible work. Interrupt it with:

- "stop";
- "wait";
- "yes";
- "no, the other one";
- an answer to its unfinished question;
- a new topic;
- a cough/background voice.

Measure audio yield and semantic yield separately.

### Say it, point it

Prototype deictic commands across browser and terminal:

```text
"compare this request with that one"
"rerun this test against the branch over there"
"ask the agent responsible for these files"
```

Test whether visible selection can replace spoken identifiers without creating hidden ambiguity.

### Voice summaries over exact receipts

Create a 30-agent workspace with one blocker, two completed changes, and many healthy workers.

Let the user ask:

```text
"what changed?"
"what needs me?"
"why is auth blocked?"
```

Return a one- or two-sentence spoken answer while simultaneously focusing the exact visual evidence.

Compare against scanning the workspace manually.

### Contextual voice discovery

Show speech examples only after one of these moments:

- an object is selected;
- the user hesitates;
- a repeated pointer flow is detected;
- a voice attempt fails;
- the user opens a command palette.

Study whether the hints teach useful commands without becoming another layer of chrome.

### Social mode switching

Repeat the same tasks in private and shared settings. Let users choose voice, keyboard, or pointer moment by moment.

Record where speech drops out:

- privacy;
- embarrassment;
- background speech;
- need for exactness;
- need to remain quiet;
- another human conversation already occupying the audio channel.

The goal is to learn the switch points, then make the product preserve state across them.

### Proactive voice threshold

Start with a quiet workspace. Introduce events of increasing consequence:

```text
test completed
agent finished
agent retried
agent is blocked
agent requests a choice
agent is about to perform an irreversible external action
```

Compare visual-only cues, a subtle sound, and spoken interruption.

Find the threshold where voice output earns the right to take the center of attention.

## A provisional thesis

The disappearing interface should be understood as a dynamic allocation of attention, not a campaign to remove every visible control.

A future agent workspace can feel almost absent while the user speaks intent into it. The moment exactness, ambiguity, comparison, consequence, or history enters the task, visible state can reappear exactly where it earns its place.

The most promising interaction may feel like this:

```text
look at the thing
-> speak the intent
-> let the system act
-> glance at the result
-> interrupt or correct locally
-> keep working
```

The computer recedes because each medium does the part it is naturally good at.

— Luma 🦋
