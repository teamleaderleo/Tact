# Capture → retrieve → hand off → delete

This is the smallest usable pass at Workbench experiment 5: a Discord-like journal that keeps capture cheap while making later comprehension inspectable.

It is deliberately a tiny local Python app and one SQLite database. Core capture/lexical/current-state work has no package dependencies. A small optional pretrained embedding package makes semantic retrieval useful across unfamiliar wording.

## Run

```bash
cd experiments/capture-retrieve-handoff-delete
python app.py --seed-demo
```

Open `http://127.0.0.1:8787`.

For pretrained semantic retrieval:

```bash
pip install -r requirements-semantic.txt
```

The model is loaded lazily. Exact and lexical retrieval stay local and dependency-free. If the pretrained semantic backend is absent or unavailable, the UI labels the local co-occurrence fallback instead of pretending it has general semantic understanding.

## Capture contract

The hot path is intentionally tiny:

```text
optional shallow channel + one message box + Send
```

A message may be an unfinished thought. It receives a timestamp and a pointer to the previous message in that channel automatically.

Most messages remain ordinary notes. One tiny convention opts a claim into computed-current state:

```text
queue := Redis
```

Later claims with the same topic supersede earlier ones:

```text
queue := Redis
queue := Postgres
queue := SQS
```

The raw history stays inspectable while `Current` answers `queue → SQS` and exposes every event used to reach that answer.

## Retrieval contract

Ranked retrieval and complete-set retrieval are separate jobs.

### Ranked retrieval

`Retrieve` supports:

- literal substring search;
- lexical BM25-style scoring;
- semantic scoring;
- hybrid lexical + semantic scoring;
- `after` / `before` temporal filters;
- channel filters;
- a local context neighborhood around every result.

Semantic retrieval has two explicitly named backends:

1. optional pretrained `BAAI/bge-small-en-v1.5` through FastEmbed;
2. a zero-dependency corpus-local co-occurrence fallback.

The second can connect vocabulary that co-occurs inside the corpus. It cannot be trusted to understand unseen synonyms. That boundary is visible in the API response and UI.

### Complete-set retrieval

Turn on **complete set** for a deterministic scan over stored fields. It can return every surviving entry matching:

- literal substring;
- channel;
- time range;
- kind.

The result explicitly says what it is complete *for*. A conceptual request such as “every commitment” only deserves a completeness claim after `commitment` becomes an explicit field or maintained collection. Ranked semantic results never claim completeness.

That distinction is part of the experiment, rather than an implementation detail.

## Correction and current truth

Correction appends a correction event and preserves lineage to the bad source event. A correction inherits the original event's effective time, so fixing an old fact cannot accidentally overrule a later decision.

Example:

```text
Jan 1   queue := Redis
Jan 20  queue := SQS
Feb 1   correct Jan 1 to queue := RabbitMQ
```

Current remains `SQS`.

A correction also cannot silently rename a fact into a different topic. Correct `queue` as `queue`; append a new fact for `storage`.

## Delete / redact contract

Historical purity yields to user authority over sensitive material.

**Redact** replaces the source body, clears topic/value metadata, removes pin/context metadata, and rebuilds derived answers from the surviving corpus.

**Delete** removes the source body and keeps only an opaque event tombstone. The tombstone preserves the fact that a later event existed, which prevents deletion of the newest claim from silently reviving an older value as “current.”

SQLite runs with `secure_delete=ON`; redact/delete then run `VACUUM`. This experiment stores no persistent embeddings or derived-state cache, so there is one active database file to purge.

The guarantee ends at copies outside this database: exported corpora, OS/filesystem snapshots, backups, sync products, or copied text require their own deletion policies. The export after redaction/deletion contains no original secret text.

## Hand the corpus to somebody else

The handoff format contains source events, context, shallow channels, topic lineage, and tombstones. Derived current state is deliberately absent and rebuilt by the recipient.

Sender:

```bash
python app.py --db sender.sqlite3 --seed-demo --export corpus.json --no-serve
```

Recipient:

```bash
python app.py --db recipient.sqlite3 --import corpus.json
```

Then open the recipient database normally:

```bash
python app.py --db recipient.sqlite3
```

### Stranger task protocol

Give `corpus.json` to somebody who did not create it. Give them the running app and these jobs, without explaining where the answers live:

1. Find the note about Discord-like capture using remembered exact wording.
2. Find the discussion about the queue using their own wording.
3. Answer: **what queue is used now, and why do you believe that?**
4. Return the complete set of entries in `#work`.
5. Point out which answer is a ranked retrieval guess and which answer carries a deterministic completeness claim.

Record time, wrong answers, query reformulations, provenance opened, and places where the recipient needs author-only knowledge.

The seed corpus is intentionally small. Once the interaction works, the useful test is a larger corpus authored by one person and handed to another.

## Hard-case drill

A compact manual drill catches the trust boundaries:

1. Capture `capital := Lyon`.
2. Correct it to `capital := Paris` and inspect provenance.
3. Capture a unique secret such as `credential := ULTRA_SECRET_4519`.
4. Search for it and confirm retrieval.
5. Redact or delete it.
6. Repeat literal, lexical, semantic, complete-set, current-state, and export checks.
7. Search the active SQLite file bytes for the original secret.

The automated suite covers the same contracts.

## Tests

```bash
python -m unittest -v test_journal.py
```

The suite covers:

- exact lexical retrieval;
- temporal filtering;
- context neighborhoods;
- deterministic complete sets;
- current-state provenance;
- correction ordering;
- correction topic identity;
- source + derived redaction purge;
- source + derived deletion behavior;
- export/import handoff;
- local semantic fallback;
- pretrained semantic integration contract.

## What this refuses to become

This experiment has no backlinks, graph canvas, nested folders, object-type forms, tag ontology, templating, plugin system, sync engine, reminder engine, or AI-maintained canonical notebook.

The question is narrower:

> Can capture remain almost as cheap as sending yourself a Discord message while later retrieval, correction, deletion, handoff, and current-state answers remain trustworthy enough to inspect?

The implementation is only evidence for the interaction model. The stranger handoff test is the part that can prove whether comprehension survives beyond the author.
