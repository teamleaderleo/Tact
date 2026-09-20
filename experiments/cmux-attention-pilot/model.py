"""Deterministic obligation projection. Observations never confer completion."""
import hashlib
import json
import re

REPLACEMENT = re.compile(r'Replaces\s+https://github.com/manaflow-ai/cmux/pull/(\d+)', re.I)
FAILURES = {'failure', 'timed_out', 'action_required', 'startup_failure'}


def evidence(url, label, at, identifier=None):
    return dict(url=url, label=label, source_at=at, id=identifier)


def relationships(facts):
    prs = {p['number']: p for p in facts['prs']}
    edges = []
    for p in prs.values():
        for old in REPLACEMENT.findall(p.get('body') or ''):
            edges.append(dict(kind='replaces', source=p['number'], target=int(old),
                              evidence=p['html_url'], source_at=p['updated_at'],
                              basis='explicit public PR body; author assertion'))
    # Narrow, reviewed extraction; no semantic dependency guesses from every #mention.
    p = prs.get(13117)
    if p and 'Admin-merge #13114' in (p.get('body') or ''):
        edges.append(dict(kind='depends_on', source=13117, target=13114,
                          evidence=p['html_url'], source_at=p['updated_at'],
                          basis='explicit rollout prerequisite in PR body'))
    return edges


def latest_checks(pr):
    latest = {}
    for c in pr.get('checks', []):
        if c.get('head_sha') != pr['head']:
            continue
        key = ((c.get('app') or {}).get('id'), c['name'])
        # A newer queued check may have no started_at. GitHub check-run IDs order
        # creation; do not let an old started failure outrank its replacement.
        if c['id'] > latest.get(key, {}).get('id', -1):
            latest[key] = c
    return list(latest.values())


def project(facts):
    edges = relationships(facts)
    by_number = {p['number']: p for p in facts['prs']}
    replacement = {e['target']: e['source'] for e in edges if e['kind'] == 'replaces'}

    def canonical(n):
        seen = set()
        while n in replacement and replacement[n] in by_number:
            if n in seen:
                raise ValueError('replacement cycle')
            seen.add(n)
            n = replacement[n]
        return n

    obligations, lines = [], []
    for n, p in sorted(by_number.items()):
        if canonical(n) != n:
            continue
        history = [k for k in sorted(by_number) if canonical(k) == n]
        lines.append(dict(id=n, title=p['title'], history=history, url=p['html_url'],
                          head=p['head'], observed_at=p['observed_at'], state=p['state'],
                          missing=p.get('missing', []),
                          merged_at=p.get('merged_at'), completion='unknown',
                          note='GitHub merge/close is an observation, not delivery or rollout acceptance.'))
        downstream = [e['source'] for e in edges if e['kind'] == 'depends_on' and e['target'] in history]

        def add(kind, action, why, owner, refs, suffix='', certainty='observed', waits=None):
            obligations.append(dict(id=f'{n}:{kind}' + (':' + suffix if suffix else ''),
                work=n, history=history, title=p['title'], kind=kind, action=action,
                why_now=why, owner=owner, waits_on=waits or
                (['PR acceptance assessment'] + [f'#{x} prerequisite decision' for x in downstream]),
                head=p['head'], observed_at=p['observed_at'], evidence=refs,
                certainty=certainty, completion='unknown'))

        if not p.get('head_stable', True) or not p.get('metadata_stable', True):
            add('recapture', 'Refresh this observation before deciding',
                'Source changed during the multi-request capture; the snapshot is not atomic.',
                'evidence reader', [evidence(p['html_url'], 'Current PR', p['updated_at'])])
            continue
        if p['state'] == 'open':
            queue = [e for e in p.get('timeline', []) if e.get('event') in
                     {'enqueued', 'dequeued', 'added_to_merge_queue', 'removed_from_merge_queue'}]
            queue.sort(key=lambda e: (e.get('created_at') or '', str(e.get('id', ''))))
            if queue and queue[-1].get('event') in {'dequeued', 'removed_from_merge_queue'}:
                q = queue[-1]
                add('queue', 'Establish why this PR left the queue before deciding whether to retry',
                    'Latest explicit queue event records removal. Cause and retry authority remain with the queue owner.',
                    'queue owner', [evidence(q.get('html_url') or p['html_url'],
                    'Queue removal observation', q.get('created_at'), q.get('id'))])
            failed = [c for c in latest_checks(p) if c.get('conclusion') in FAILURES]
            if failed:
                add('checks', 'Decide how to recover the current failing checks',
                    f'{len(failed)} latest check contexts failed on the observed head; requiredness is separate.',
                    'contributor / CI owner', [evidence(c.get('html_url') or c['details_url'],
                    c['name'], c.get('completed_at'), c['id']) for c in failed])
            bad_statuses = {}
            for s in sorted(p.get('statuses', []), key=lambda x: (x['created_at'], x['id'])):
                bad_statuses[s['context']] = s
            for context, s in bad_statuses.items():
                if s['state'] in {'failure', 'error'}:
                    add('status', f'Inspect the {context} status', 'Latest commit status reports failure.',
                        'contributor / status owner', [evidence(s.get('target_url') or p['html_url'],
                        context, s['created_at'], s['id'])], suffix=context)
            for t in p.get('threads', []):
                if t['isResolved'] or t['isOutdated']:
                    continue
                comments = t['comments']['nodes']
                if not comments:
                    continue
                reviewer = (comments[0].get('author') or {}).get('login', 'unknown reviewer')
                latest = next((c for c in reversed(comments)
                               if (c.get('author') or {}).get('login') == reviewer), comments[0])
                fresh = (latest.get('commit') or {}).get('oid') == p['head']
                incomplete = t['comments']['pageInfo']['hasNextPage']
                headings = re.findall(r'\*\*(.{1,150}?)\*\*', latest['body'])
                title = headings[0].strip() if headings else 'Review finding ' + t['id']
                add('review', 'Decide disposition: ' + title,
                    ('The thread is open; its reviewed head matches this observation.' if fresh else
                     'The thread is open, but its finding is anchored to another or unknown head.') +
                    (' Comment history is incomplete.' if incomplete else ''),
                    f'contributor + {reviewer}', [evidence(latest['url'],
                    latest['body'][:180], latest['createdAt'], latest['id'])], suffix=t['id'],
                    certainty='current-head finding' if fresh and not incomplete else 'needs revalidation')
            # Latest review per author supersedes that author's older review, not others.
            reviews = {}
            for r in sorted(p.get('reviews', []), key=lambda r: (r.get('submitted_at') or '', r['id'])):
                if r['state'] in {'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'}:
                    reviews[(r.get('user') or {}).get('login')] = r
            for author, r in reviews.items():
                if r['state'] == 'CHANGES_REQUESTED':
                    add('requested_changes', 'Resolve or obtain disposition of requested changes',
                        'Latest submitted review by this reviewer requests changes; source freshness must be checked.',
                        f'contributor + {author}', [evidence(r['html_url'], 'Requested changes',
                        r.get('submitted_at'), r['id'])], suffix=str(r['id']))
            # A failed observation alone does not establish a human decision.
            # Preserve it in line coverage and the independent audit; do not
            # turn a retryable provider read into an operator chore.
        if n == 13117 and 'CI_PULL_REQUEST_SUITE=compile-only' in (p.get('body') or ''):
            add('rollout', 'Ask the repository admin to establish rollout state and paired prerequisites',
                'The published rollout pairs compile-only with a merge queue. Public PR completion does not prove configuration.',
                'repository administrator', [evidence(p['html_url'], 'Maintainer rollout instructions', p['updated_at'])],
                certainty='configuration unknown', waits=['Safe compile-only rollout assessment'])
    return dict(schema='tact-attention-view/v1', observed_at=facts['observed_at'],
                completion='unknown', lines=lines, relationships=edges,
                obligations=obligations, missing=facts.get('missing', []))


def event_index(facts):
    """Order source events without pretending current mutable fields existed in the past."""
    events = []
    for p in facts['prs']:
        for i, e in enumerate(p.get('timeline', [])):
            at = e.get('created_at') or e.get('submitted_at') or (e.get('committer') or {}).get('date')
            events.append(dict(pr=p['number'], kind=e.get('event', 'unknown'), source_at=at,
                observed_at=p['observed_at'], id=str(e.get('id') or e.get('sha') or f'timeline:{i}'),
                url=e.get('html_url') or p['html_url'], raw_pointer=f'/prs/{facts["prs"].index(p)}/timeline/{i}'))
    # Unknown timestamps sort last; same-time tie order is deterministic, not claimed causality.
    return sorted(events, key=lambda e: (e['source_at'] is None, e['source_at'] or '', e['pr'], e['id']))


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()
