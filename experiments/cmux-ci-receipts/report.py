#!/usr/bin/env python3
"""Sanitize read-only receipts and deterministically render the frozen report."""
import argparse
from collections import Counter, defaultdict
from datetime import datetime
import hashlib
import gzip
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent


def seconds(start, end):
    if not start or not end:
        return None
    try:
        value = (datetime.fromisoformat(end.replace('Z', '+00:00')) - datetime.fromisoformat(start.replace('Z', '+00:00'))).total_seconds()
        return value if value >= 0 else None
    except ValueError:
        return None


def quantile(values, q):
    if not values:
        return None
    values = sorted(values)
    n = (len(values) - 1) * q
    i = int(n)
    return round(values[i] + (values[min(i+1, len(values)-1)] - values[i]) * (n-i), 3)


def summary(values):
    return {'n': len(values), 'p50_seconds': quantile(values, .5), 'p95_seconds': quantile(values, .95)}


def clean_name(value):
    value = re.sub(r'https?://\S+', '[url omitted]', value or '')
    value = re.sub(r'/(?:Users|home|private|tmp)/\S+', '[path omitted]', value)
    return value[:250]


def parse_log(text):
    """Only allowlisted output tokens leave the private cache; echoed commands are not evidence."""
    events, requested, suites, routing, test_counts = [], set(), set(), set(), []
    key = r'([A-Za-z0-9._-]{1,400})'
    in_group = False
    for raw in text.splitlines():
        line = re.sub(r'^\d{4}-\d\d-\d\dT\S+\s+', '', raw).strip()
        if '##[group]' in line:
            in_group = True
            continue
        if '##[endgroup]' in line:
            in_group = False
            continue
        match = re.fullmatch(r'(?:backend|CI_CACHE_BACKEND): (github|warp|r2)', line)
        if match:
            requested.add(match[1])
        match = re.fullmatch(r'PULL_REQUEST_POLICY: (compile-only|full)', line)
        if match:
            suites.add('requested:' + match[1])
        if in_group:
            continue
        line = re.sub(r'^##\[warning\]|^::warning::', '', line)
        m = re.fullmatch('r2-cache: restored ' + key + ' for prefix ' + key, line)
        if m:
            events.append({'backend': 'r2', 'result': 'prefix', 'key': m[1], 'prefix': m[2]})
            continue
        m = re.fullmatch('r2-cache: restored ' + key, line)
        if m:
            events.append({'backend': 'r2', 'result': 'exact', 'key': m[1]})
        m = re.fullmatch('r2-cache: no entry for ' + key, line)
        if m:
            events.append({'backend': 'r2', 'result': 'miss', 'key': m[1]})
        m = re.fullmatch('r2-cache: saved ' + key, line)
        if m:
            events.append({'backend': 'r2', 'result': 'saved', 'key': m[1]})
        m = re.fullmatch('r2-cache: ' + key + ' already exists; not saving archive, checking pointers', line)
        if m:
            events.append({'backend': 'r2', 'result': 'existing_archive_pointer_check', 'key': m[1]})
        m = re.fullmatch('r2-cache: pointer ' + key + ' was not updated', line)
        if m:
            events.append({'backend': 'r2', 'result': 'pointer_not_updated', 'key': m[1]})
        if re.fullmatch(r'r2-cache: (?:restore failed; treating as a miss|CI_CACHE_R2_PUBLIC_URL is not set; treating as a miss)', line):
            events.append({'backend': 'r2', 'result': 'miss'})
        if re.fullmatch('r2-cache: could not unpack ' + key, line):
            events.append({'backend': 'r2', 'result': 'corrupt_archive'})
        m = re.fullmatch(r'r2-cache: archive is (\d+) MB', line)
        if m:
            events.append({'backend': 'r2', 'result': 'archive_size', 'reported_MB': int(m[1]), 'bytes': None})
        m = re.fullmatch('Cache restored from key: ' + key, line)
        if m:
            events.append({'backend': 'actions_cache_backend_unverified', 'result': 'restored_match_unknown', 'key': m[1]})
        if line.startswith('Cache not found for input keys:'):
            events.append({'backend': 'actions_cache_backend_unverified', 'result': 'miss'})
        m = re.fullmatch('Cache saved with key: ' + key, line)
        if m:
            events.append({'backend': 'actions_cache_backend_unverified', 'result': 'saved', 'key': m[1]})
        m = re.search(r'Executed (\d+) tests?, with (\d+) failures?', line)
        if m:
            test_counts.append({'framework': 'XCTest', 'tests': int(m[1]), 'failures': int(m[2])})
        m = re.search(r'Test run with (\d+) tests? (passed|failed)', line)
        if m:
            test_counts.append({'framework': 'Swift Testing', 'tests': int(m[1]), 'outcome': m[2]})
        # Explicit machine outputs are distinct from the emitted shell source.
        m = re.fullmatch(r'(full_suite|compile_admitted|macos|release_build)=(true|false)', line)
        if m:
            routing.add(line)
    return {'requested_cache_backends': sorted(requested), 'suite_tokens': sorted(suites),
            'routing_tokens': sorted(routing), 'cache_events': events, 'test_summaries': test_counts,
            'producer_provenance': None, 'seed_age_seconds': None,
            'test_summary_note': 'May contain nested/duplicate summaries; never sum as unique tests.'}


def cache_assessment(requested, supported, events):
    if 'r2' in requested and supported is False:
        return 'requested_r2_unsupported_by_inspected_head_action; actual execution revision unproven'
    if any(e['backend'] == 'r2' for e in events):
        return 'r2_execution_observed; result must be read per archive event'
    return 'unknown_effective_backend'


def runner(labels):
    text = ' '.join(labels).lower()
    provider = next((p for p in ('warp', 'blacksmith', 'depot', 'tart') if p in text), 'github_or_unknown')
    os = 'macos' if any(x in text for x in ('macos', 'mac-', 'macmini')) else 'windows' if 'windows' in text else 'linux' if any(x in text for x in ('ubuntu', 'linux')) else 'unknown'
    return provider + '/' + os


def cost_class(run, job):
    name, path = job['name'].lower(), run['workflow_path'].lower()
    if any(x in name for x in ('refresh-compilation-cache', 'refresh-test-compilation-cache', 'seed', 'warmup')) or 'warmup' in path:
        return 'seed'
    if run['event'] == 'merge_group':
        return 'merge_validation'
    if any(x in path for x in ('nightly', 'release', 'appstore', 'publish')) or run['event'] == 'schedule':
        return 'nightly_release'
    if run['event'] in ('pull_request', 'pull_request_target'):
        return 'pr_admission'
    return 'other'


def normalize(data):
    out = {k: data[k] for k in ('config', 'collected_at', 'cohorts')}
    out['schema_version'] = 1
    out['external_observations'] = [json.loads((ROOT/'fixtures/observed-r2.json').read_text())]
    out['runs'], out['attempts'], out['sources'], out['rollout'] = [], [], [], []
    for raw in sorted(data['runs'].values(), key=lambda r:r['id']):
        r = {k: raw.get(k) for k in ('id', 'event', 'head_sha', 'created_at', 'run_started_at', 'status', 'conclusion', 'run_attempt')}
        r['workflow_path'] = raw['path']
        r['url'] = f'https://github.com/{data["config"]["repository"]}/actions/runs/{raw["id"]}'
        r['cohort'] = next((name for name,c in data['cohorts'].items() if raw['id'] in c['run_ids']), 'supplementary')
        r['workflow_execution_sha'] = None
        r['workflow_source_note'] = 'head_sha is run metadata; source inspected at that SHA is not proof of workflow execution SHA or checkout override.'
        r['referenced_workflows'] = [{k:v.get(k) for k in ('path','sha')} for v in raw.get('referenced_workflows', [])]
        r['requested_historical_settings'] = None
        r['discarded_merge_group'], r['cancellation_reason'] = None, None
        art = data['artifacts'].get(str(raw['id']))
        r['artifact_inventory'] = None if art is None else {'complete': art['complete'], 'requests': art['requests'], 'items': [{k:a.get(k) for k in ('id','size_in_bytes','expired','created_at','digest')} | {'name': clean_name(a.get('name'))} for a in art['items']], 'contents': 'not_downloaded; coverage/classifier contents unverified'}
        out['runs'].append(r)
    runs = {r['id']:r for r in out['runs']}
    for raw in sorted(data['attempts'], key=lambda a:(a['run_id'],a['attempt'])):
        detail = raw['detail'].get('data', {})
        a = {k: raw[k] for k in ('run_id','attempt','complete','requests')}
        a['detail_evidence'] = {k:v for k,v in raw['detail'].items() if k != 'data'}
        a['conclusion'], a['status'] = detail.get('conclusion'), detail.get('status')
        a['jobs'] = []
        for job in raw['jobs']:
            j = {k: job.get(k) for k in ('id','run_attempt','status','conclusion','started_at','completed_at')}
            j['name'], j['runner'] = clean_name(job['name']), runner(job.get('labels',[]))
            j['labels'] = [clean_name(v) for v in job.get('labels', [])]
            j['steps'] = []
            for step in job.get('steps', []):
                s = {k:step.get(k) for k in ('number','status','conclusion','started_at','completed_at')}
                s['name'] = clean_name(step['name'])
                s['executed'] = bool(step.get('started_at') and step.get('conclusion') != 'skipped')
                s['seconds'] = seconds(s['started_at'],s['completed_at']) if s['executed'] else 0
                j['steps'].append(s)
            starts = [s['started_at'] for s in j['steps'] if s['executed']]
            j['execution_start'] = min(starts) if starts else None
            j['runner_seconds'] = seconds(j['execution_start'], j['completed_at']) if starts else (0 if j['conclusion'] == 'skipped' else None)
            j['queue_to_first_step_seconds'] = seconds(runs[a['run_id']]['created_at'], j['execution_start'])
            j['cost_class'] = cost_class(runs[a['run_id']], j)
            log = data['logs'].get(str(j['id']))
            j['log_evidence'] = {'status':'not_sampled'} if log is None else {'status':log['error'] or 'available','endpoint':log['endpoint'],'fetched_at':log['fetched_at']}
            j['observed'] = parse_log(log['data']) if log and not log['error'] else {'cache_events': [], 'requested_cache_backends': [], 'suite_tokens': [], 'routing_tokens': [], 'test_summaries': [], 'producer_provenance': None, 'seed_age_seconds': None}
            source = data['sources'].get(runs[a['run_id']]['head_sha'] + ':.github/actions/cache-restore/action.yml', {})
            supported = ("inputs.backend == 'r2'" in source.get('data','')) if source.get('data') else (False if source.get('error') == 'http_404' and data['sources'].get(runs[a['run_id']]['head_sha'] + ':' + runs[a['run_id']]['workflow_path'], {}).get('data') else None)
            j['cache_configuration_assessment'] = cache_assessment(j['observed']['requested_cache_backends'], supported, j['observed']['cache_events'])
            j['test_selection_count'], j['accepted_baseline_failures'], j['new_failures'] = None, None, None
            j['cache_overhead'] = [{'step_number':s['number'],'name':s['name'],'seconds':s['seconds'],'outcome':s['conclusion']} for s in j['steps'] if s['executed'] and (('cache' in s['name'].lower() and any(v in s['name'].lower() for v in ('restore','save','upload'))) or s['name'] in ('Cache Swift packages','Save Swift packages'))]
            a['jobs'].append(j)
        executed = [j for j in a['jobs'] if any(s['executed'] for s in j['steps'])]
        a['observed_suite'] = ('full_suite_steps_reached' if any('app-host' in j['name'].lower() and any(s['executed'] and s['name'].lower().startswith('run unit tests') for s in j['steps']) for j in executed) else 'compile_without_observed_unit_test_steps' if any(('compile' in j['name'].lower() and 'admission' in j['name'].lower()) for j in executed) else 'unknown_or_routed_away')
        a['suite_note'] = 'Execution shape only; failure before tests and routed-away work do not establish compile-only policy.'
        out['attempts'].append(a)
    for key, source in sorted(data['sources'].items()):
        sha, path = key.split(':',1)
        text = source.get('data','')
        out['sources'].append({'sha':sha,'path':path,'endpoint':source['endpoint'],'fetched_at':source['fetched_at'],'error':source['error'],'availability': 'readable' if text else 'absent_at_readable_head' if source['error']=='http_404' and any(k.startswith(sha+':') and v.get('data') for k,v in data['sources'].items()) else 'unavailable', 'content_sha256': hashlib.sha256(text.encode()).hexdigest() if text else None,'cache_restore_r2_supported': (("inputs.backend == 'r2'" in text) if text else False if source['error']=='http_404' and any(k.startswith(sha+':') and v.get('data') for k,v in data['sources'].items()) else None) if path.endswith('cache-restore/action.yml') else None})
    for entry in data['rollout']:
        pr = entry['pr'].get('data', {})
        out['rollout'].append({k:pr.get(k) for k in ('number','state','merged_at','merge_commit_sha')} | {'head_sha':pr.get('head',{}).get('sha'),'base_ref':pr.get('base',{}).get('ref'),'title':clean_name(pr.get('title')),'merge_revision_note':'landed revision' if pr.get('merged_at') else 'API merge_commit_sha may be a speculative test merge, not a landed revision','url':f'https://github.com/{data["config"]["repository"]}/pull/{entry["number"]}','error':entry['pr']['error'],'fetched_at':entry['pr']['fetched_at'],'comments_complete':entry['complete']})
    out['accepted'] = {name:{'complete':a['complete'],'numbers':[v['number'] for v in a['items']],'requests':a['requests']} for name,a in data['accepted'].items()}
    out['settings'] = {name: {'value':v.get('data',{}).get('value'),'error':v['error'],'fetched_at':v['fetched_at']} for name,v in data['settings'].items()}
    main = data['current_main']
    out['current_main'] = {'sha':main.get('data',{}).get('sha'),'fetched_at':main['fetched_at'],'error':main['error']}
    rules = data['rulesets']
    out['ruleset'] = {'error':rules['error'],'fetched_at':rules['fetched_at'],'enforcement':rules.get('data',{}).get('enforcement'),'merge_queue_rules':[r for r in rules.get('data',{}).get('rules',[]) if r.get('type')=='merge_queue']}
    out['discussion_evidence'] = {n:{'url':f'https://github.com/{data["config"]["repository"]}/issues/{n}','complete':d['complete'],'comment_ids':[c['id'] for c in d['comments']], 'issue_updated_at':d['issue'].get('data',{}).get('updated_at')} for n,d in data['discussions'].items()}
    return out


def metrics(data):
    result = {}
    runs = {r['id']:r for r in data['runs']}
    for cohort in (*sorted(data['config']['windows'], key=lambda n:data['config']['windows'][n][0]), 'supplementary'):
        rs = [r for r in data['runs'] if r['cohort']==cohort]
        attempts = [a for a in data['attempts'] if runs[a['run_id']]['cohort']==cohort]
        jobs = [(a,j) for a in attempts for j in a['jobs']]
        classes, runners, workflows = defaultdict(float),defaultdict(float),defaultdict(float)
        cancelled, retried, cancelled_jobs = 0,0,0
        missing = 0
        for a,j in jobs:
            value = j['runner_seconds']
            if value is None:
                missing += 1
                continue
            classes[j['cost_class']] += value
            runners[j['runner']] += value
            workflows[runs[a['run_id']]['workflow_path']] += value
            cancelled += value if a['conclusion']=='cancelled' else 0
            retried += value if a['attempt']>1 else 0
            cancelled_jobs += value if j['conclusion']=='cancelled' else 0
        downloads = [s['seconds'] for _,j in jobs for s in j['steps'] if s['executed'] and s['seconds'] is not None and 'download' in s['name'].lower() and any(t in s['name'].lower() for t in ('artifact','product'))]
        checkouts = [s['seconds'] for _,j in jobs for s in j['steps'] if s['executed'] and s['seconds'] is not None and 'checkout' in s['name'].lower()]
        latest = [a for a in attempts if a['attempt']==runs[a['run_id']]['run_attempt']]
        latency, compile_latency = [],[]
        for a in latest:
            r = runs[a['run_id']]
            if not r['workflow_path'].endswith('/ci.yml'):
                continue
            status_jobs = [j for j in a['jobs'] if j['name']=='ci-status' and j['conclusion'] in ('success','failure')]
            for j in status_jobs:
                v = seconds(r['created_at'],j['completed_at'])
                if v is not None: latency.append(v)
            for j in a['jobs']:
                if ('compile' in j['name'].lower() and 'admission' in j['name'].lower()) and j['runner_seconds'] and j['conclusion'] in ('success','failure'):
                    v = seconds(r['created_at'],j['completed_at'])
                    if v is not None: compile_latency.append(v)
        merge_tail = []
        for a in attempts:
            if runs[a['run_id']]['event'] != 'merge_group':continue
            failed = [j['completed_at'] for j in a['jobs'] if j['conclusion']=='failure' and j['completed_at']]
            if not failed:continue
            first = min(failed)
            tail = sum(seconds(max(first,j['execution_start']),j['completed_at']) or 0 for j in a['jobs'] if j['execution_start'] and j['completed_at'] and j['completed_at']>first)
            merge_tail.append({'run_id':a['run_id'],'attempt':a['attempt'],'first_failure_at':first,'runner_seconds_after_failure':tail})
        accepted = data['accepted'].get(cohort,{})
        denominator = len(accepted.get('numbers',[])) if accepted.get('complete') else None
        result[cohort] = {'runs':len(rs),'attempts':len(attempts),'jobs':len(jobs),'run_conclusions':dict(Counter(r['conclusion'] or 'in_progress' for r in rs)), 'runner_seconds':round(sum(classes.values()),3),'classes_seconds':dict(sorted(classes.items())),'runners_seconds':dict(sorted(runners.items())),'workflow_seconds':dict(sorted(workflows.items(),key=lambda p:-p[1])), 'incomplete_job_durations':missing,'cancelled_attempt_seconds':cancelled,'cancelled_job_seconds':cancelled_jobs,'retry_seconds':retried,'merged_prs':denominator,'seconds_per_merged_pr':sum(classes.values())/denominator if denominator else None,'ci_status_wait':summary(latency),'compile_result_wait':summary(compile_latency),'artifact_download_step':summary(downloads)|{'total_seconds':sum(downloads)},'checkout_seconds':sum(checkouts),'complexity_checkout_seconds':sum(s['seconds'] for a,j in jobs for s in j['steps'] if 'web-complexity' in runs[a['run_id']]['workflow_path'] and s['executed'] and s['seconds'] is not None and 'checkout' in s['name'].lower() and not s['name'].lower().startswith('post ')),'suite_shapes':dict(Counter(a['observed_suite'] for a in attempts if runs[a['run_id']]['workflow_path'].endswith('/ci.yml'))),'merge_failure_tail':merge_tail,'monetary_estimate':None}
    return result


def fmt_seconds(value):
    return 'unknown' if value is None else f'{value/60:,.2f}'


def render(data):
    m = metrics(data)
    lines = ['# CMUX CI consolidation: fixed-window receipts','',f'Assembly started {data["collected_at"]}; cached endpoint fetch times (including earlier requests) are retained in JSON. Cohorts select run creation, not execution timestamps.','', 'This is an observational comparison, not a causal savings percentage. Different changes, runners, rollout revisions, retries and workload mix remain confounders. Totals are lower bounds where step timing is absent. Each measured job execution is counted once; cancelled/retried/after-failure figures are overlapping subsets, never extra savings.','', '| Cohort (UTC, half-open) | Runs / attempts | Runner min | Merged PRs | Min / merged PR |','|---|---:|---:|---:|---:|']
    for name,window in sorted(data['config']['windows'].items(), key=lambda p:p[1][0]):
        v=m[name]
        lines.append(f'| {name}: {window[0]} – {window[1]} | {v["runs"]} / {v["attempts"]} | {fmt_seconds(v["runner_seconds"])} | {v["merged_prs"]} | {fmt_seconds(v["seconds_per_merged_pr"])} |')
    lines += ['', 'The denominator is every PR merged in that clock window, not changes whose runs form the numerator. This throughput ratio includes unmerged work and must not be read as the cost of a particular accepted change.', '', '| Disjoint workload class | Before runner min | After runner min |','|---|---:|---:|']
    for kind in ('pr_admission','merge_validation','nightly_release','seed','other'):
        lines.append(f'| {kind} | {fmt_seconds(m["before"]["classes_seconds"].get(kind,0))} | {fmt_seconds(m["after"]["classes_seconds"].get(kind,0))} |')
    lines += ['', '| Observed CI attempt shape (not inferred policy) | Before | After |','|---|---:|---:|']
    for shape in ('full_suite_steps_reached','compile_without_observed_unit_test_steps','unknown_or_routed_away'):
        lines.append(f'| {shape} | {m["before"]["suite_shapes"].get(shape,0)} | {m["after"]["suite_shapes"].get(shape,0)} |')
    lines += ['', ('No after-window CI attempt reached an app-host unit-test step. This removes the basis for claiming equivalent full-suite validation became cheaper. ' if not m['after']['suite_shapes'].get('full_suite_steps_reached',0) else '') + 'A compile-only execution shape may also reflect early failure; it is not independent proof of suite policy.', '']
    lines += ['', 'Runner time is first executed step start through job completion, excluding pre-step queue time; jobs without a closed interval are explicitly excluded. It is observed wall time, not billable minutes. Seed classification uses explicit refresh/seed/warmup job names before event classification; embedded caches in ordinary builds stay with their owner.', '', '| Overlapping subset / waiting metric | Before | After |','|---|---:|---:|']
    for label,key in [('Cancelled attempts, runner min','cancelled_attempt_seconds'),('Cancelled jobs, runner min','cancelled_job_seconds'),('Retry attempts, runner min','retry_seconds'),('Checkout steps, min','checkout_seconds')]:
        lines.append(f'| {label} | {fmt_seconds(m["before"][key])} | {fmt_seconds(m["after"][key])} |')
    for label,key in [('Latest CI status result, min','ci_status_wait'),('Latest compile result, min','compile_result_wait'),('Artifact download step, min','artifact_download_step')]:
        lines.append(f'| {label} (p50 / p95; n) | '+ ' | '.join(f'{fmt_seconds(m[n][key]["p50_seconds"])} / {fmt_seconds(m[n][key]["p95_seconds"])}; {m[n][key]["n"]}' for n in ('before','after'))+' |')
    lines += ['', 'Waiting is original run creation to the latest observed successful/failed result, including retry delay. Cancellations and runs without that result are censored, not zero. This is CI feedback wait, not PR-open-to-merge or queue residence. Artifact durations include setup/extraction/retry overhead; they are not wire throughput.', '', '## Current configuration and rollout', '', f'Current main snapshot: `{data["current_main"]["sha"]}` at {data["current_main"]["fetched_at"]}. Current settings are not applied retroactively:', '']
    for name,v in sorted(data['settings'].items()):lines.append(f'- `{name}`: `{v["value"]}` ({v["error"] or "read"}, {v["fetched_at"]}).')
    lines += ['', f'Ruleset evidence: `{json.dumps(data["ruleset"],sort_keys=True)}`.', '', '| PR | State / merged at | Base | Merge revision |','|---|---|---|---|']
    for pr in data['rollout']:
        lines.append(f'| [#{pr["number"]}]({pr["url"]}) | {pr["state"]} / {pr["merged_at"] or "not merged"} | {pr["base_ref"]} | `{pr["merge_commit_sha"] if pr["merged_at"] else "not landed"}` |')
    lines += ['', 'The 09:30 runbook in #13182 is historical: #13168 subsequently introduced R2 support. A setting, merged code, successful seeding, a consumer restore and a measured saving are separate facts. #13175 merged into its parent #13122, not directly into main. #13199 was replaced by #13204; the fail-fast follow-up is #13235. Source snapshots at each CI/nightly head SHA record whether the cache action supports R2; `workflow_execution_sha` remains unknown where not independently exposed.', '', '## Supplementary cold/warm and seed evidence', '', 'These runs are outside primary totals unless their creation falls inside a primary window. They are not an independent savings component to add to the cohort difference.', '', '| Role | Run | Source revision | Observed runner min (all attempts/jobs) |','|---|---|---|---:|']
    for name,rid in sorted(data['config']['supplementary_runs'].items()):
        run=next((r for r in data['runs'] if r['id']==rid),None)
        if run:
            total=sum(j['runner_seconds'] or 0 for a in data['attempts'] if a['run_id']==rid for j in a['jobs'])
            lines.append(f'| {name} | [{rid}]({run["url"]}) | `{run["head_sha"]}` | {fmt_seconds(total)} |')
    pair = {}
    for role in ('cold','warm'):
        rid=data['config']['supplementary_runs'][role]
        pair[role]=[j for a in data['attempts'] if a['run_id']==rid for j in a['jobs'] if j['name']=='build-nightly-app']
    if len(pair['cold'])==len(pair['warm'])==1:
        cold,warm=pair['cold'][0],pair['warm'][0]
        c,w=cold['runner_seconds'],warm['runner_seconds']
        if c and w is not None:
            lines += ['', f'For Release jobs {cold["id"]} → {warm["id"]}, the first-step-to-completion intervals are {c:,.0f} → {w:,.0f} seconds: ({c:,.0f} − {w:,.0f}) / {c:,.0f} = {(c-w)/c*100:.2f}% less observed job time. The source revisions are in the table above. This reconciles the [#13168 PR claim](https://github.com/manaflow-ai/cmux/pull/13168) of 1,992 → 448 seconds under a slightly different job boundary. The unchanged-app-input claim comes from that PR; different SHAs alone cannot verify it.']
    lines += ['', 'Seed costs above are additional producer work; no population-level seed amortization or additive savings is claimed. Restore/save step overhead and outcomes are retained per job. Bytes, actual archive provenance and backend remain unknown for the timed pair because its build-job logs were unavailable.', '', 'A separate retained [failed-job log](https://github.com/manaflow-ai/cmux/actions/runs/35509887189/job/106076170670) from the earlier audit proves R2 prefix consumption, despite the compiler failure. Its original digest, bounded timestamped excerpt and parsed facts are in `fixtures/observed-r2.json` and receipts.external_observations; this is outside the primary cohorts:', '']
    for observation in data.get('external_observations',[]):
        for event in observation['parsed']['cache_events']:
            lines.append(f'- `{event["backend"]}`: `{event["result"]}`; key `{event.get("key","unknown")}`.')
    lines += ['', '## Evidence completeness', '']
    for name,c in sorted(data['cohorts'].items()):
        lines.append(f'- {name}: run pagination complete={c["complete"]}; {m[name]["incomplete_job_durations"]} jobs without measured closed execution intervals.')
    jobs=[j for a in data['attempts'] for j in a['jobs']]
    logs=Counter(j['log_evidence']['status'] for j in jobs)
    lines += [f'- Job-page failures: {sum(not a["complete"] for a in data["attempts"])} attempts. Attempt-detail failures: {sum(bool(a["detail_evidence"]["error"]) for a in data["attempts"])}.', f'- Job log coverage: `{json.dumps(dict(logs),sort_keys=True)}`. Sampling: {data["config"]["log_sampling"]}', f'- Exact-head source snapshots: {dict(Counter(s["availability"] for s in data["sources"]))}. An absent action at a readable commit is historical implementation evidence, not a failed permission check.', '- Per-attempt JSON retains executed and skipped steps, runner labels, outcomes, cache restore/save step overhead and allowlisted log receipts. A successful step does not prove a hit, a test count, an accepted baseline, or complete coverage. Test summaries may be nested; unique test counts and accepted/new-failure classification remain unknown.', '- Artifact API inventories retain size, digest and expiry when exposed; archive contents were not downloaded. Producer provenance, seed age, archive/pointer integrity and fork write capability remain unverified without dedicated receipts. Raw logs, environments, URLs from logs and local paths are never published.', '- Discarded merge-group identity and cancellation cause are unknown: cancelled status alone cannot establish queue removal. All cancelled and still-running merge jobs stay in the accounting; audit/queue-exit events are required to attribute waste.', '- Monetary estimate: withheld. '+data['config']['pricing']['basis'], '', '## Largest workflows by observed exposure', '', '| Rank | Workflow | After runner min | Before runner min |','|---|---|---:|---:|']
    for i,(workflow,total) in enumerate(list(m['after']['workflow_seconds'].items())[:3],1):
        lines.append(f'| {i} | `{workflow}` | {fmt_seconds(total)} | {fmt_seconds(m["before"]["workflow_seconds"].get(workflow,0))} |')
    lines += ['', 'Exposure is an upper bound for investigation, not avoidable cost. The three ranked residual problems are complexity checkout (#13171), artifact delivery (#13172 / #13201), and cancellation/merge-validation lifecycle (#13235). Concrete evidence and next actions are in [findings.md](../findings.md); its claims must point to these receipts or the dated upstream discussion. The collector has no dispatch, cancellation, settings-write, credential-write or production path.', '']
    return '\n'.join(lines)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=Path,default=ROOT/'results/receipts.json.gz')
    p.add_argument('--sanitize',action='store_true')
    p.add_argument('--output',type=Path,default=ROOT/'results')
    args=p.parse_args()
    data=json.loads(gzip.decompress(args.input.read_bytes()) if args.input.suffix == '.gz' else args.input.read_bytes())
    if args.sanitize:data=normalize(data)
    args.output.mkdir(parents=True,exist_ok=True)
    (args.output/'receipts.json.gz').write_bytes(gzip.compress((json.dumps(data,sort_keys=True,separators=(',',':'))+'\n').encode(),mtime=0))
    (args.output/'metrics.json').write_text(json.dumps(metrics(data),indent=2,sort_keys=True)+'\n')
    (args.output/'report.md').write_text(render(data))
    print('report generated:',args.output/'report.md')


if __name__=='__main__':main()
