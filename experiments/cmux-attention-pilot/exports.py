"""Optional public owner exports. Never turn an unjoined receipt into cohort evidence."""
import json
from pathlib import Path


def ci_report_export(metrics_path, cohort_path):
    """#82 fixed-window metrics are context, never this PR-cohort's audit denominator."""
    metrics = json.loads(Path(metrics_path).read_text())
    cohort = json.loads(Path(cohort_path).read_text())
    if cohort.get('repository') != 'manaflow-ai/cmux':
        raise ValueError('CI report must describe the public CMUX repository')
    summaries = []
    for name in ('before', 'after'):
        m = metrics[name]
        # Deliberate allowlist: no raw logs, requested settings, machines or private cache payload.
        summaries.append(dict(name=name, window=cohort['windows'][name],
            runs=m['runs'], attempts=m['attempts'], runner_seconds=m['runner_seconds'],
            cancelled_job_seconds=m['cancelled_job_seconds'],
            retry_seconds=m['retry_seconds'], incomplete_job_durations=m['incomplete_job_durations']))
    return dict(schema='tact-ci-window-context/v1', windows=summaries,
        join_status='different_cohort', completion='unknown', authority='evidence_only',
        qualification='Owner-reported fixed run-creation windows; not causal savings, not this '
                      'PR cohort, and never added to this audit denominator.')


def verification_export(path, facts):
    data = json.loads(Path(path).read_text())
    if data.get('schema_version') != 'cmux-verification/v1':
        raise ValueError('Unsupported verification export schema')
    source = data['source']
    ev = data['evidence']
    if source.get('repository') != facts['repository'] or not (ev.get('url') or '').startswith(
            'https://github.com/' + facts['repository'] + '/'):
        raise ValueError('Only public evidence for the cohort repository is accepted')
    matches = [p['number'] for p in facts['prs'] if p['head'] == source.get('head_sha') and
               any(j['id'] == ev.get('job_id') for j in p.get('jobs', []))]
    return dict(schema=data['schema_version'], evidence=ev, recipe=data['recipe'],
                source=source, tests=data['tests'], matches=matches,
                join_status='head_and_job_match' if matches else 'unjoined',
                qualification='Owner-reported scope only; a merge checkout is not the PR head. '
                              'Unjoined exports do not alter cohort obligations, counts or audit.',
                authority='evidence_only', completion='unknown')
