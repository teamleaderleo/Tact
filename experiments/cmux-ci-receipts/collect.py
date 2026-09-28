#!/usr/bin/env python3
"""Read-only GitHub REST collection. Raw API/log cache is private and gitignored."""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import subprocess
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent


def stamp():
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


def dt(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


class API:
    def __init__(self, cache, retry_metadata=False):
        self.retry_metadata = retry_metadata
        self.retried = set()
        self.cache = Path(cache)
        self.cache.mkdir(parents=True, exist_ok=True, mode=0o700)

    def get(self, endpoint, raw=False):
        key = hashlib.sha256(endpoint.encode()).hexdigest()
        path = self.cache / (key + '.json')
        previous = None
        if path.exists():
            previous = json.loads(path.read_text())
            if not (self.retry_metadata and previous['error'] in ('request_failed', 'timeout_or_invalid_response', 'http_502', 'http_503') and not raw and endpoint not in self.retried):
                return previous
            self.retried.add(endpoint)
        try:
            p = subprocess.run(['gh', 'api', '--method', 'GET', endpoint], capture_output=True, timeout=90)
            # Never publish stderr (may contain a signed URL). Keep only HTTP status.
            import re
            status = re.search(rb'HTTP (\d{3})', p.stderr)
            error = ('http_' + status[1].decode()) if status else 'request_failed'
            result = {'endpoint': endpoint, 'fetched_at': stamp(), 'error': None if p.returncode == 0 else error}
            if not result['error']:
                result['data'] = p.stdout.decode(errors='replace') if raw else json.loads(p.stdout)
        except (subprocess.TimeoutExpired, ValueError):
            result = {'endpoint': endpoint, 'fetched_at': stamp(), 'error': 'timeout_or_invalid_response'}
        if previous:
            result['previous_request'] = {k:v for k,v in previous.items() if k != 'data'}
        path.write_text(json.dumps(result))
        path.chmod(0o600)
        return result

    def pages(self, endpoint, field=None):
        items, receipts = [], []
        page = 1
        while True:
            r = self.get(endpoint + ('&' if '?' in endpoint else '?') + f'per_page=100&page={page}')
            receipts.append({k: v for k, v in r.items() if k != 'data'})
            if r['error']:
                return items, receipts, False
            data = r['data'][field] if field else r['data']
            items.extend(data)
            if len(data) < 100:
                return items, receipts, True
            page += 1

    def runs(self, repo, start, end):
        # GitHub search-filtered run lists cap at 1000. Recursively split before paging.
        query = urlencode({'created': start + '..' + (dt(end) - timedelta(seconds=1)).strftime('%Y-%m-%dT%H:%M:%SZ')})
        endpoint = f'repos/{repo}/actions/runs?{query}'
        first = self.get(endpoint + '&per_page=100&page=1')
        if first['error']:
            return [], [{k: v for k, v in first.items() if k != 'data'}], False
        count = first['data']['total_count']
        if count >= 1000:
            seconds = int((dt(end) - dt(start)).total_seconds())
            if seconds <= 1:
                return [], [{'endpoint': endpoint, 'error': 'unpartitionable_1000_run_cap'}], False
            middle = (dt(start) + timedelta(seconds=seconds // 2)).strftime('%Y-%m-%dT%H:%M:%SZ')
            a, ar, ac = self.runs(repo, start, middle)
            b, br, bc = self.runs(repo, middle, end)
            return a + b, ar + br, ac and bc
        data, receipts, complete = self.pages(endpoint, 'workflow_runs')
        data = [r for r in data if start <= r['created_at'] < end]
        return data, receipts, complete and len({r['id'] for r in data}) == count


def parallel(fn, values, workers):
    with ThreadPoolExecutor(max_workers=workers) as pool:
        return list(pool.map(fn, values))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--cache', type=Path, default=ROOT / '.private')
    p.add_argument('--retry-metadata-errors', action='store_true', help='retry each transient cached metadata failure once; preserve error history')
    p.add_argument('--workers', type=int, default=6)
    args = p.parse_args()
    cfg = json.loads((ROOT / 'cohort.json').read_text())
    api = API(args.cache, args.retry_metadata_errors)
    repo = cfg['repository']
    data = {'config': cfg, 'collected_at': stamp(), 'cohorts': {}, 'runs': {}, 'attempts': [], 'rollout': [], 'sources': {}, 'logs': {}, 'artifacts': {}, 'accepted': {}}
    for name, (start, end) in cfg['windows'].items():
        runs, receipts, complete = api.runs(repo, start, end)
        data['cohorts'][name] = {'run_ids': sorted({r['id'] for r in runs}), 'requests': receipts, 'complete': complete}
        data['runs'].update({str(r['id']): r for r in runs})
        print(name, len(runs), 'runs; complete:', complete, flush=True)
    for name, rid in cfg['supplementary_runs'].items():
        result = api.get(f'repos/{repo}/actions/runs/{rid}')
        data.setdefault('supplementary', {})[name] = {k: v for k, v in result.items() if k != 'data'}
        if not result['error']:
            data['runs'][str(rid)] = result['data']
    pairs = [(r['id'], a) for r in data['runs'].values() for a in range(1, r.get('run_attempt', 1) + 1)]
    def attempt(pair):
        rid, number = pair
        jobs, receipts, complete = api.pages(f'repos/{repo}/actions/runs/{rid}/attempts/{number}/jobs', 'jobs')
        # Attempt details distinguish attempt outcome from latest run outcome.
        detail = api.get(f'repos/{repo}/actions/runs/{rid}/attempts/{number}')
        return {'run_id': rid, 'attempt': number, 'jobs': jobs, 'requests': receipts, 'complete': complete,
                'detail': detail}
    data['attempts'] = parallel(attempt, pairs, args.workers)
    print('attempts', len(pairs), 'jobs', sum(len(a['jobs']) for a in data['attempts']), flush=True)
    def artifacts(rid):
        records, receipts, complete = api.pages(f'repos/{repo}/actions/runs/{rid}/artifacts', 'artifacts')
        return str(rid), {'items': records, 'requests': receipts, 'complete': complete}
    # Artifact inventory is relevant to build/test producers and consumers, not CLA/triage.
    relevant = [r['id'] for r in data['runs'].values() if r['path'].split('/')[-1] in ('ci.yml', 'nightly.yml') or r['id'] in cfg['supplementary_runs'].values()]
    data['artifacts'] = dict(parallel(artifacts, relevant, args.workers))
    strata = {}
    for a in data['attempts']:
        r = data['runs'][str(a['run_id'])]
        cohort = next((n for n, c in data['cohorts'].items() if r['id'] in c['run_ids']), 'supplementary')
        for j in a['jobs']:
            if j.get('conclusion') == 'skipped' or not j.get('steps'):
                continue
            if r['id'] in cfg['supplementary_runs'].values():
                strata.setdefault(('supplementary', str(j['id'])), []).append(j['id'])
            elif r['id'] in relevant and any(x in j['name'].lower() for x in ('admission', 'app-host', 'package', 'release', 'seed', 'changes')):
                strata.setdefault((cohort, j.get('conclusion') or 'in_progress'), []).append(j['id'])
    sampled = sorted({jid for ids in strata.values() for jid in (min(ids), max(ids))})
    data['logs'] = dict(parallel(lambda jid: (str(jid), api.get(f'repos/{repo}/actions/jobs/{jid}/logs', raw=True)), sampled, args.workers))
    print('sampled job logs', len(sampled), flush=True)
    # Exact source snapshots for observed main CI/nightly revisions; no settings projected backwards.
    source_keys = {(r['head_sha'], r['path']) for r in data['runs'].values() if r['id'] in relevant}
    source_keys |= {(data['runs'][str(rid)]['head_sha'], '.github/actions/cache-restore/action.yml') for rid in relevant}
    def source(pair):
        sha, path = pair
        response = api.get(f'repos/{repo}/contents/{path}?ref={sha}')
        if not response['error']:
            response['data'] = base64.b64decode(response['data']['content']).decode()
        return sha + ':' + path, response
    data['sources'] = dict(parallel(source, sorted(source_keys), args.workers))
    def pr(number):
        r = api.get(f'repos/{repo}/pulls/{number}')
        comments, receipts, complete = api.pages(f'repos/{repo}/issues/{number}/comments')
        reviews, review_receipts, review_complete = api.pages(f'repos/{repo}/pulls/{number}/comments')
        return {'number': number, 'pr': r, 'comments': comments, 'comment_requests': receipts,
                'review_comments': reviews, 'review_requests': review_receipts, 'complete': complete and review_complete}
    data['rollout'] = parallel(pr, cfg['rollout_prs'], args.workers)
    # Merged PR denominator: explicit search pagination; refuse silent 1000-result truncation.
    for name, (start, end) in cfg['windows'].items():
        query = urlencode({'q': f'repo:{repo} is:pr is:merged merged:{start}..{(dt(end)-timedelta(seconds=1)).strftime("%Y-%m-%dT%H:%M:%SZ")}'})
        endpoint = 'search/issues?' + query
        first = api.get(endpoint + '&per_page=100&page=1')
        if first['error'] or first['data']['total_count'] >= 1000:
            data['accepted'][name] = {'complete': False, 'items': [], 'requests': [{k:v for k,v in first.items() if k != 'data'}]}
        else:
            records, receipts, complete = api.pages(endpoint, 'items')
            data['accepted'][name] = {'complete': complete and not first['data'].get('incomplete_results', False), 'items': records, 'requests': receipts}
    data['current_main'] = api.get(f'repos/{repo}/commits/main')
    data['settings'] = {name: api.get(f'repos/{repo}/actions/variables/{name}') for name in ('CI_PULL_REQUEST_SUITE', 'CI_CACHE_BACKEND', 'MACOS_RUNNER_15')}
    data['rulesets'] = api.get(f'repos/{repo}/rulesets/15917555')
    data['discussions'] = {}
    for number in (13095, 13182):
        issue = api.get(f'repos/{repo}/issues/{number}')
        comments, receipts, complete = api.pages(f'repos/{repo}/issues/{number}/comments')
        data['discussions'][str(number)] = {'issue': issue, 'comments': comments, 'requests': receipts, 'complete': complete}
    (args.cache / 'collection.json').write_text(json.dumps(data))
    print('private collection saved', flush=True)


if __name__ == '__main__':
    main()
