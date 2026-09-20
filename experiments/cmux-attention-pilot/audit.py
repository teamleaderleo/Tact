"""Independent raw-fact selection. Deliberately does not import model or its summaries."""
from collections import defaultdict
from datetime import datetime
import re


def audit(facts):
    alerts, unknown = [], []

    def alert(kind, fact, concern, refs, threshold):
        alerts.append(dict(kind=kind, measured=fact, concern=concern,
                           evidence=refs, threshold=threshold, completion='unknown'))

    stale, failure_groups, zero, canceled, unavailable = [], defaultdict(list), [], [], []
    total_seconds = 0
    seen_jobs = set()
    for p in facts['prs']:
        if not p.get('head_stable', True):
            unknown.append(f'#{p["number"]}: head changed while capturing')
        # Latest submitted review for each actor; never count obsolete reviews as current approval.
        reviews = {}
        for r in sorted(p.get('reviews', []), key=lambda x: (x.get('submitted_at') or '', x['id'])):
            if r['state'] in {'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'}:
                reviews[(r.get('user') or {}).get('login')] = r
        if p['state'] == 'open':
            for r in reviews.values():
                if r['state'] == 'APPROVED' and r.get('commit_id') != p['head']:
                    stale.append(dict(pr=p['number'], reviewed_head=r.get('commit_id'),
                                      head=p['head'], url=r['html_url']))
        has_counts = False
        for c in p.get('checks', []):
            # Literal execution totals in provider output only. PR prose is not execution.
            output = c.get('output') or {}
            text = '\n'.join(output.get(k) or '' for k in ('summary', 'text'))
            counts = re.findall(r'(?m)^\s*(?:Executed|Ran) (\d+) tests?\b', text)
            has_counts |= bool(counts)
            if '0' in counts:
                zero.append(dict(pr=p['number'], check=c['name'], head=c.get('head_sha'),
                                 url=c.get('html_url') or c.get('details_url')))
        if not has_counts:
            unknown.append(f'#{p["number"]}: executed test counts unavailable (success is not coverage)')
        for job in p.get('jobs', []):
            identity = (job['id'], job.get('run_attempt'))
            if identity in seen_jobs:
                continue
            seen_jobs.add(identity)
            refs = dict(pr=p['number'], job=job['id'], url=job['html_url'],
                        attempt=job.get('run_attempt'), event=job.get('run_event'))
            failed_steps = [s['name'] for s in job.get('steps', []) if s.get('conclusion') == 'failure']
            for step in failed_steps:
                # Exact provider step name is a coarse cluster, not a root-cause signature.
                failure_groups[step].append(refs)
            seconds = None
            if job.get('started_at') and job.get('completed_at'):
                seconds = max(0, (datetime.fromisoformat(job['completed_at'].replace('Z', '+00:00')) -
                                  datetime.fromisoformat(job['started_at'].replace('Z', '+00:00'))).total_seconds())
                total_seconds += seconds
            if job.get('conclusion') == 'cancelled':
                canceled.append(dict(refs, runner_wall_seconds=seconds))
        for c in p.get('comments', []):
            actor = c.get('user') or {}
            # Do not classify the contributor's discussion of rate limiting as a provider failure.
            if actor.get('type') == 'Bot' and re.search(r'rate limit|usage limit|spend limit', c.get('body') or '', re.I):
                unavailable.append(dict(pr=p['number'], provider=actor.get('login'), url=c['html_url']))
        unknown.extend(f'#{p["number"]}: {x} unavailable' for x in p.get('missing', []))
    if stale:
        alert('stale_review_head', {'count': len(stale)},
              'A latest approval concerns another head; it does not establish current-head review.', stale, '>= 1 latest stale approval on an open PR')
    for step, refs in sorted(failure_groups.items()):
        if len(refs) >= 3:
            alert('clustered_failures', {'step': step, 'jobs': len(refs), 'prs': len({r['pr'] for r in refs})},
                  'Inspect a shared failure or retry loop; identical step names do not establish identical root cause.',
                  refs, '>= 3 failed jobs with the exact same provider step name')
    if zero:
        alert('zero_tests', {'checks': len(zero)}, 'A literal provider result reports zero tests. Inspect selection and scope.',
              zero, '>= 1 explicit zero-test execution summary')
    cancel_seconds = sum(r['runner_wall_seconds'] or 0 for r in canceled)
    if cancel_seconds >= 600:
        alert('queue_waste_candidate', {'cancelled_runner_wall_seconds': cancel_seconds,
              'observed_job_wall_seconds': total_seconds, 'jobs': len(canceled)},
              'Cancelled work consumed runner time. Queue attribution, avoidability and billing remain unknown.',
              canceled, '>= 600 measured cancelled job wall seconds; descriptive, not a savings claim')
    grouped = defaultdict(list)
    for r in unavailable:
        grouped[r['provider']].append(r)
    for provider, refs in sorted(grouped.items()):
        if len({r['pr'] for r in refs}) >= 2:
            alert('provider_unavailable', {'provider': provider, 'prs': len({r['pr'] for r in refs})},
                  'Historical provider limit notices affect several items. Recovery/current availability is unknown.',
                  refs, '>= 2 PRs with explicit bot limit notices')
    unknown += ['Queue membership/reasons, job-to-merge-group joins and historical-head job costs are incomplete.',
                'Artifact identity and launched artifact unavailable; premise validity unknown.',
                'Required review satisfaction is not inferred from APPROVED or successful check names.']
    return dict(schema='tact-attention-audit/v1', observed_at=facts['observed_at'],
                status='concerns' if alerts else 'no_observed_hazard', alerts=alerts,
                unknown=unknown, coverage='bounded current-head jobs + available public reviews/check output; never all-clear')
