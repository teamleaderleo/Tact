#!/usr/bin/env python3
"""Explicit, read-only GitHub snapshot. No dispatch/review/merge/comment APIs."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

REPO = 'manaflow-ai/cmux'
COHORT = [13114, 13117, 13128, 13201, 13235, 13240,
          13042, 13210, 12981, 13211, 13053, 13216, 12994, 13229]


def now():
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


def api(path, *, paginate=False, query=None):
    cmd = ['gh', 'api', path]
    if paginate:
        cmd += ['--paginate', '--slurp']
    if query:
        cmd += ['-f', 'query=' + query]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError('GitHub endpoint timed out: ' + path) from exc
    if result.returncode:
        # Never persist stderr: it can contain machine-specific context.
        raise RuntimeError('GitHub endpoint unavailable: ' + path)
    try:
        value = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError('GitHub endpoint returned invalid JSON: ' + path) from exc
    if query and value.get('errors'):
        raise RuntimeError('GraphQL query unavailable')
    return value


def pages(path, key=None):
    result = api(path + ('&' if '?' in path else '?') + 'per_page=100', paginate=True)
    return [item for page in result for item in (page[key] if key else page)]


def threads(number):
    result, cursor = [], None
    while True:
        after = ', after:' + json.dumps(cursor) if cursor else ''
        query = '''query { repository(owner:"manaflow-ai", name:"cmux") {
          pullRequest(number:%s) { reviewThreads(first:100%s) {
            pageInfo { hasNextPage endCursor }
            nodes { id isResolved isOutdated comments(first:100) {
              pageInfo { hasNextPage } nodes { id url body createdAt updatedAt
              author { login __typename } commit { oid } } } }
          } } } }''' % (number, after)
        conn = api('graphql', query=query)['data']['repository']['pullRequest']['reviewThreads']
        result.extend(conn['nodes'])
        if not conn['pageInfo']['hasNextPage']:
            return result
        cursor = conn['pageInfo']['endCursor']


def capture_pr(number):
    started = now()
    path = f'repos/{REPO}'
    pr = api(f'{path}/pulls/{number}')
    # Save only public, relevant source fields; never collect local session data.
    fields = ['number', 'html_url', 'title', 'body', 'state', 'created_at', 'updated_at',
              'closed_at', 'merged_at', 'merge_commit_sha', 'draft']
    out = {k: pr.get(k) for k in fields}
    out.update(head=pr['head']['sha'], base=pr['base']['sha'],
               base_ref=pr['base']['ref'], author=pr['user']['login'],
               started_at=started, missing=[])
    calls = {
        'reviews': lambda: pages(f'{path}/pulls/{number}/reviews'),
        'comments': lambda: pages(f'{path}/issues/{number}/comments'),
        'timeline': lambda: pages(f'{path}/issues/{number}/timeline'),
        'threads': lambda: threads(number),
        'checks': lambda: pages(f'{path}/commits/{out["head"]}/check-runs?filter=all', 'check_runs'),
        'statuses': lambda: pages(f'{path}/commits/{out["head"]}/statuses'),
        'runs': lambda: pages(f'{path}/actions/runs?head_sha={out["head"]}', 'workflow_runs'),
    }
    for name, call in calls.items():
        try:
            out[name] = call()
            if name == 'timeline':
                # Authenticated timelines may expose private cross-references. Do not export them.
                public_events = []
                for event in out[name]:
                    issue = (event.get('source') or {}).get('issue') or {}
                    if issue and (issue.get('repository') or {}).get('private') is not False:
                        out['missing'].append('private_or_unverified_cross_reference_omitted')
                        continue
                    public_events.append(event)
                out[name] = public_events
        except RuntimeError:
            out[name] = []
            out['missing'].append(name)
    out['jobs'] = []
    for run in out['runs']:
        for attempt in range(1, run['run_attempt'] + 1):
            try:
                jobs = pages(f'{path}/actions/runs/{run["id"]}/attempts/{attempt}/jobs', 'jobs')
                out['jobs'].extend(dict(j, run_attempt=attempt, run_event=run['event']) for j in jobs)
            except RuntimeError:
                out['missing'].append(f'jobs:{run["id"]}:{attempt}')
    end = api(f'{path}/pulls/{number}')
    out.update(observed_at=now(), head_after=end['head']['sha'],
               head_stable=out['head'] == end['head']['sha'],
               metadata_stable=out['updated_at'] == end['updated_at'])
    return out


def capture(output):
    if output.exists():
        raise ValueError('Refusing to overwrite a frozen observation; choose a new path')
    meta = api(f'repos/{REPO}')
    if meta['private']:
        raise ValueError('Only public repositories can enter this cohort')
    result = dict(schema='tact-attention-facts/v1', repository=REPO, public=True,
                  capture_started_at=now(), cohort=COHORT, missing=[],
                  coverage={'checks': 'current observed PR heads, all available attempts',
                            'queue': 'public timeline only; no inferred membership',
                            'logs': 'not collected; test counts and signatures often unknown',
                            'history': 'available current API history; edited/deleted prior bodies unavailable'})
    try:
        result['rules'] = api(f'repos/{REPO}/rules/branches/main')
    except RuntimeError:
        result['rules'] = None
        result['missing'].append('required_rules')
    with ThreadPoolExecutor(max_workers=3) as pool:
        result['prs'] = list(pool.map(capture_pr, COHORT))
    result['observed_at'] = now()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'path': str(output), 'prs': len(result['prs']),
                      'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
                      'observed_at': result['observed_at'],
                      'missing': result['missing']}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    capture(parser.parse_args().output)
