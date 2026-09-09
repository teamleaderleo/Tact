# Append-only memory and the computed present

Leo's preference for Discord servers as personal notes, ChatGPT conversation history, email, logs, searchable chats, old Reddit, and chronological feeds points at a coherent interaction model:

> Capture into a durable stream. Preserve the original context. Retrieve later. Compute cleaner views only when they earn their cost.

The strongest version of this idea is **an append-only journal plus a computed present**.

```text
cheap capture
-> append-only journal
-> automatic context envelope
-> lexical + semantic + temporal retrieval
-> derived current-state views
-> contextual resurfacing
-> a few durable user signals such as pins / stars
```

The journal is the evidence. The views are caches.

This is close to two old ideas that deserve to be taken much more seriously in personal software: Yale's **Lifestreams**, which made a time-ordered stream the underlying personal information store, and **event sourcing**, which keeps the sequence of changes while deriving current application state from it.

It also sharpens the existing Tact instinct in [`leo-interface-instincts.md`](leo-interface-instincts.md): `capture -> preserve -> search -> recover context`. Search alone is too weak. The missing pieces are current-state projection, queryless resurfacing, and a small amount of stable navigation.

## Capture should feel like sending a message

The case for low-friction capture is unusually strong.

Bernstein, Van Kleek, Karger, and schraefel's study of **information scraps** found knowledge workers keeping notes in Post-its, miscellaneous text files, and emails to themselves because those media offered ease of capture, flexible content, and availability at the moment of need. Their later List-it study followed 420 users of a micronote tool over two years and again found that speed, ease, and freedom from rigid information types attracted use.

That maps almost perfectly onto Discord-as-notes:

- the input field is already there;
- a thought can be incomplete;
- no title is required;
- no destination decision is required beyond perhaps a channel;
- the timestamp arrives automatically;
- surrounding conversation supplies extra meaning;
- the entry becomes searchable immediately.

A knowledge tool that asks for a folder, title, tags, object type, backlink strategy, and canonical location before accepting the thought is collecting clerical work at the moment when attention is most fragile.

A useful rule:

> **Capture should accept ambiguity. Interpretation can happen later.**

There is still a boundary. Sellen and Whittaker's critique of lifelogging, **Beyond Total Capture**, argues that indiscriminate recording can produce huge archives with weak practical value. The goal should be cheap capture of authored, encountered, or intentionally retained material — not an ambient recording of everything merely because storage is cheap.

Append-only is strongest when the stream contains events that meant enough to enter the person's working life.

## Chronology is an excellent write model and an incomplete read model

Lifestreams, developed at Yale in the 1990s, proposed replacing conventional files and directories with a time-ordered stream of documents. Every created or received document entered the stream; filters, summaries, and monitoring operated over it.

The appealing part is deeper than "sort by date."

Chronology gives every item one effortless initial location. It also preserves neighboring context. If a note appeared after a meeting, beside a link, during a conversation with a particular person, those nearby events become retrieval cues without any deliberate metadata work.

This is why chat history, email, logs, old Reddit threads, and chronological feeds often feel more inhabitable than highly modeled databases. The user can scroll through lived sequence instead of reconstructing an ontology.

Chronology weakens as a default reading surface when:

- the stream becomes large enough that recent scrolling stops working;
- the same subject recurs across months or years;
- newer entries supersede older ones;
- the user needs a complete set rather than one remembered item;
- task state has to be understood at a glance;
- several contradictory claims all look equally alive;
- a useful item has fallen so far back that the user forgets it exists.

The answer is not to rewrite the journal into a tidy hierarchy. It is to derive other views from it.

## Event sourcing gives the cleanest model for “what is true now?”

Martin Fowler's description of **event sourcing** separates two things:

1. an event log containing the sequence of changes; and
2. application state derived from that log.

The log can reconstruct prior states. The current state can be cached or snapshotted because it remains derivable from the events.

That translates beautifully into personal knowledge.

Imagine the historical stream contains:

```text
March:  "Use Redis for the queue."
April:  "Redis caused deployment trouble; try Postgres."
May:    "Postgres queue is live."
August: "Queue moved to SQS after throughput testing."
```

A chronological search for `queue` should preserve all four entries.

A query for **"what queue do we use now?"** should return a projection:

```text
Current: SQS
Changed: August
Supersedes: Postgres queue
Evidence: [August message] [May message] [April decision]
```

The synthesized answer should remain regenerateable from source events. It should carry dates and lineage. A summary becomes a performance optimization and an interface convenience, never a replacement for the evidence that produced it.

This suggests a strong principle for LLM memory systems:

> **History is append-only evidence. “Current truth” is a dated projection with provenance.**

A system can maintain topic-specific materialized views — current project status, current preference, current decision, current configuration, current ownership — and rebuild them when relevant events arrive.

This is much safer than continuously editing one giant canonical memory document whose relationship to the underlying conversations becomes increasingly obscure.

## Conversational context is metadata the user already paid for

Microsoft Research's **Stuff I've Seen** indexed previously encountered email, web pages, documents, appointments, and other material in one place. In use by more than 230 employees, it found that **time and people were important retrieval cues**.

Conversation systems contain even richer cues automatically:

- timestamp;
- speaker / author;
- channel or thread;
- reply target;
- nearby messages;
- links and attachments;
- task or project being discussed;
- words used immediately before and after the item;
- whether the item caused a decision or follow-up;
- later replies that revised it.

That means a chat log is already a lightly annotated knowledge store.

Search should therefore retrieve **context neighborhoods**, not isolated matching snippets. A result can include the matched message plus the few messages that made it intelligible. The useful unit is often a conversational turn, exchange, or local episode.

This also helps semantic retrieval. The phrase `the blue one` is nearly useless as a standalone note. Inside the conversation where three designs were compared, it may be perfectly precise.

A knowledge system can harvest that context without asking the user to classify anything.

## Search beats filing for some jobs; navigation still earns a place

The strongest evidence for Leo's instinct comes from email.

Whittaker and colleagues instrumented a modern email client across 345 long-term users and more than 85,000 refinding actions. People who built complex folder systems relied on them, yet the preparatory filing work was inefficient and did not improve retrieval success. Search and threading supported more effective finding.

That is a serious argument against mandatory taxonomies for personal streams.

There is an important counterexample. Research on personal file retrieval has repeatedly found that users often prefer navigating folders to query-based search, even when desktop search improves. Bergman and colleagues describe this persistent navigation preference, and later work connected folder navigation with spatial-navigation processes.

The distinction seems to be about the job being done.

Search is excellent when:

- the target can be described;
- enough of it is remembered to form a query;
- content or sender clues exist;
- the user wants one or a few items;
- the corpus is text-rich.

Navigation is excellent when:

- recognition is easier than recall;
- the user wants an overview of a known area;
- the same collection is revisited repeatedly;
- stable location itself becomes a memory cue;
- the desired item is hard to name;
- the user wants to browse a complete neighborhood.

So the better Tact position is stronger than "search beats folders":

> **Deep manual taxonomy should be optional. Search needs a small number of stable places to work beside it.**

Discord channels are a good example. They are folders with very low ambition. `ideas`, `cars`, `work`, `links`, and `random` can be enough. They provide landmarks without demanding that every item receive a perfect home.

Explicit organization earns its cost when repeated use proves that a stable collection is valuable.

## Semantic retrieval should be hybrid

Semantic search makes append-only systems much more viable because the user no longer has to remember exact wording.

It also creates a tempting failure mode: treating embeddings as a replacement for exact search.

Dense semantic retrievers can miss rare entities, exact phrases, IDs, filenames, dates, and unusual tokens that lexical retrieval handles well. Work such as SPAR explicitly targets this weakness, while modern retrieval systems increasingly combine sparse lexical and dense semantic signals.

For a personal journal, a robust ranker should combine:

```text
exact lexical match
+ semantic similarity
+ recency / requested time
+ people / channel / thread
+ conversational adjacency
+ stable project or place
+ explicit pin / star
+ prior successful retrieval
+ supersession / current-state signals
```

The user should be able to type either:

```text
that conversation about making notes work like discord
```

or:

```text
9f2a7c queue-worker
```

and have both work.

Dense-only retrieval makes the second class needlessly fragile.

## Resurfacing is the half that search cannot provide

Search assumes the user remembers enough to initiate a search.

Personal knowledge systems fail constantly before that point. A useful note can remain perfectly searchable forever and still be functionally lost because the user never remembers to ask for it.

The **Remembrance Agent** explored this in the 1990s. It continuously used the user's current context to suggest old notes and documents, keeping the suggestions lightweight enough to ignore. Its authors also identified the critical distinction between something being **relevant** and being **useful**: an old event announcement may be semantically relevant to the current topic and useless because the date has passed.

That gives resurfacing two jobs:

1. recognize contextual similarity;
2. understand temporal/state validity.

Good resurfacing triggers might include:

- the current conversation resembles an older one;
- a new claim contradicts a prior decision;
- a pinned item becomes relevant to current work;
- a future intention reaches its useful time window;
- a long-running project resumes after dormancy;
- a repeated question has a prior answer whose status may have changed.

The interaction should stay cheap: a one-line suggestion, a subtle related-history row, or a small `you discussed this before` affordance. The archive can whisper before it shouts.

## Lightweight bookmarking is a signal, not a filing system

Pins, stars, saves, unread marks, and "keep this" gestures are useful because they capture one bit of human judgment with almost no planning:

> this deserves a slightly stronger future claim on my attention

A bookmark can influence retrieval ranking, create a small stable collection, or ask for future resurfacing.

It should not require immediate ontology work.

A useful model is:

```text
append normally
-> optionally star / pin
-> system learns that this item deserves persistence or resurfacing
-> later organization appears only if a repeated pattern earns it
```

The bookmark itself can also carry a tiny intent when needed:

```text
keep
review later
canonical example
decision
follow up
```

That is enough to add future behavior without turning capture into form-filling.

## Where append-only systems become unwieldy

Append-only works beautifully as a **write model**. It fails when people force the raw stream to answer every read problem.

Warning signs:

### 1. Search latency becomes cognitive latency

The problem is not milliseconds. It is the repeated need to invent a query, inspect results, and reconstruct the surrounding state for common questions.

If the same question is asked repeatedly, export that cognition into a derived view.

### 2. Old truth competes with current truth

A semantic search for `pricing` may happily return a brilliant obsolete decision. Temporal validity and supersession must influence ranking and synthesis.

### 3. The user needs a complete set

Search is probabilistic retrieval. Some jobs require `show me every active commitment` or `all decisions for this release`. Those deserve explicit projections or collections whose completeness can be checked.

### 4. The user forgets to search

Resurfacing, reminders, and future-dated events solve prospective memory better than a passive archive.

### 5. The stream contains too much low-value capture

Total capture creates retrieval competition and maintenance burden. Automatic deduplication, retention boundaries, and selective capture can keep the journal useful.

### 6. Recognition repeatedly beats recall

If the user keeps browsing the same conceptual neighborhood, give it a stable place. A shallow channel, saved search, persistent view, or project page can be worth more than another clever ranking model.

### 7. Synthesis loses lineage

When an AI-produced summary starts circulating independently of its sources, the projection has escaped its evidence. Current-state views should remain linked to the events they summarize.

## Do personal knowledge systems over-invest in organization?

Often, yes.

Many systems charge the user organization cost at capture time in exchange for hypothetical future retrieval value. The information-scraps work shows why people route around that bargain. The email refinding work shows that elaborate filing can consume effort without improving success.

The mistake is assuming that information becomes valuable because it has been classified.

A better progression is:

```text
capture cheaply
-> preserve context automatically
-> retrieve opportunistically
-> observe repeated retrieval patterns
-> promote useful patterns into saved views / projections / anchors
```

Organization becomes a **late optimization**.

That still leaves a real role for deliberate organization. It pays when it supports recognition, complete-set inspection, shared coordination, stable recurring work, or prospective action.

The principle should therefore be:

> **Spend organization after use proves where it pays.**

## A candidate Tact model

For a personal knowledge system built around Leo's actual preferences:

### The journal

One append-only chronological substrate for notes, conversations, decisions, links, logs, and captures. Preserve source boundaries and exact evidence.

### Context envelopes

Automatically attach people, time, thread, channel, source app, neighboring events, links, and task context. Avoid asking the user to type metadata already present in the interaction.

### Hybrid retrieval

Use lexical + semantic + temporal + contextual ranking. Retrieve local conversation neighborhoods. Keep exact IDs and dates first-class.

### The computed present

Maintain regenerable current-state projections for topics where supersession matters. Every synthesized claim exposes the evidence and date that produced it.

### Resurfacing

Continuously compare current context with the archive and offer old material only when it has a credible claim on the next action or understanding.

### Lightweight bookmarks

Pins and stars strengthen retrieval and resurfacing without demanding a taxonomy.

### Stable anchors

Allow a few shallow channels, projects, saved searches, or persistent views when repeated browsing makes location valuable.

This produces a useful split:

```text
write model:  append-only, chronological, permissive
read model:   search, browse, resurface, synthesize, project
truth model:  current views derived from dated evidence
```

That feels like the strongest version of the instinct: preserve the messy human trail, then make the computer do the clerical work.

## Experiments worth running

1. **Discord-notes retrieval replay** — Take a real export or synthetic Discord-style note stream. Compare exact search, semantic search, hybrid search, and hybrid + conversational neighborhood. Measure success on remembered wording, paraphrase, rare token, person/time cue, and "what is true now?" queries.
2. **Computed-present prototype** — Feed a stream of decisions that supersede each other. Produce a current-state answer with citations to source events. Measure stale-answer rate and whether users can inspect why the projection changed.
3. **Resurfacing without annoyance** — Use current text as context and surface at most one old item. Compare pure semantic similarity with semantic + recency + future-validity + pin signals. Measure useful accepts versus irrelevant interruptions.
4. **Organization tax test** — Give the same capture workload to an append-only inbox, shallow channels, and a folder/tag-heavy system. Measure capture time, later refinding, forgotten items, and subjective confidence.
5. **Stable anchor threshold** — Start with a flat stream and allow saved searches/channels to emerge only after repeated retrieval. Test whether generated anchors outperform upfront taxonomy.

## Sources and useful ancestors

- Eric Freeman, Scott Fertig, David Gelernter — [Lifestreams project](https://www.cs.yale.edu/homes/freeman/lifestreams.html) and [Lifestreams: An Alternative to the Desktop Metaphor](https://www.cs.yale.edu/homes/freeman/ericchi96.html).
- Martin Fowler — [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html).
- Susan Dumais et al. — [Stuff I've Seen: A System for Personal Information Retrieval and Re-Use](https://www.microsoft.com/en-us/research/publication/stuff-ive-seen-a-system-for-personal-information-retrieval-and-re-use/).
- Michael Bernstein et al. — [Information Scraps: How and Why Information Eludes Our Personal Information Management Tools](https://eprints.soton.ac.uk/266461/).
- Max Van Kleek et al. — [Finders/Keepers: a longitudinal study of people managing information scraps in a micro-note tool](https://eprints.soton.ac.uk/500664/).
- Steve Whittaker et al. — [Am I wasting my time organizing email? A study of email refinding](https://research.ibm.com/publications/am-i-wasting-my-time-organizing-email-a-study-of-email-refinding).
- Ofer Bergman et al. — [Improved search engines and navigation preference in personal information management](https://dl.acm.org/doi/10.1145/1402256.1402259).
- Y. Benn et al. — [Navigating through digital folders uses the same brain structures as real world navigation](https://www.nature.com/articles/srep14719).
- Abigail Sellen, Steve Whittaker — [Beyond Total Capture: A Constructive Critique of Lifelogging](https://www.microsoft.com/en-us/research/publication/beyond-total-capture-a-constructive-critique-of-lifelogging/).
- Bradley Rhodes, Thad Starner — [Remembrance Agent](https://faculty.cc.gatech.edu/~thad/p/032_40_agents%26ubicomp/remembrance-agent.html).
- Xilun Chen et al. — [Salient Phrase Aware Dense Retrieval](https://arxiv.org/abs/2110.06918).
- Sheng-Chieh Lin, Jimmy Lin — [A Dense Representation Framework for Lexical and Semantic Matching](https://arxiv.org/abs/2206.09912).
- Eric Pedersen et al. — [Automatic generation of research trails in web history](https://research.google.com/pubs/archive/35610.pdf).

— Nori 🦦
