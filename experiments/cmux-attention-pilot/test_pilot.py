import ast
from copy import deepcopy
import json
import subprocess
import sys
import tempfile
from pathlib import Path
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import patch

from audit import audit
from evaluate import evaluate
from exports import ci_report_export, verification_export
from model import event_index, project
from replay import frame, load, safe_url, sidebar

HERE = Path(__file__).resolve().parent
AT = '2026-09-20T16:00:00Z'
URL = 'https://github.com/manaflow-ai/cmux/pull/1'


def fixture():
    return dict(schema='tact-attention-facts/v1', public=True, cohort=[1], observed_at=AT,
        prs=[dict(number=1, html_url=URL, title='Synthetic source', body='', state='open',
            head='new', head_after='new', head_stable=True, metadata_stable=True, base='base',
            created_at=AT, updated_at=AT, observed_at=AT, comments=[], timeline=[], reviews=[],
            checks=[], statuses=[], threads=[], jobs=[], missing=[])])


def thread(identifier='thread-1'):
    return dict(id=identifier, isResolved=False, isOutdated=False,
        comments=dict(pageInfo=dict(hasNextPage=False), nodes=[dict(id='comment-1',
            url=URL+'#discussion_r1', body='**Specific concern**\nWhy it matters', createdAt=AT,
            author=dict(login='reviewer'), commit=dict(oid='new'))]))


def check(identifier=1, conclusion='failure', head='new'):
    return dict(id=identifier, name='tests', app=dict(id=1), started_at=AT,
        completed_at=AT, conclusion=conclusion, head_sha=head, html_url=URL,
        output=dict(summary='', text=''))


class PilotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = load(HERE / 'evidence/cohort.json.gz')

    def test_frozen_reference_and_consequence_weight(self):
        ref = json.loads((HERE / 'reference.json').read_text())
        view = project(self.raw)
        result = evaluate(view, ref)
        self.assertEqual(result['consequential_omissions'], [])
        self.assertEqual(result['false_obligations'], [])
        self.assertEqual(result['stale_obligations'], [])
        view['obligations'] = [c for c in view['obligations'] if c['id'] != '13210:review:PRRT_kwDORDHQWM6kI59-']
        self.assertEqual(evaluate(view, ref)['weighted_omission_cost'], 5)

    def test_false_stale_obligation_is_penalized(self):
        ref=json.loads((HERE/'reference.json').read_text()); view=project(self.raw)
        view['obligations'].append(dict(id='13042:checks',work=13042))
        result=evaluate(view,ref)
        self.assertEqual(result['false_obligations'],['13042:checks'])
        self.assertEqual(result['stale_obligations'],['13042:checks'])

    def test_live_provider_recovery_clears_uncertainty_without_human_chore(self):
        before={c['id'] for c in project(self.raw)['obligations']}
        live=load(HERE/'evidence/live.json.gz'); after={c['id'] for c in project(live)['obligations']}
        self.assertEqual(before,after)
        needle='#13216: jobs:35509906359:1 unavailable'
        self.assertIn(needle,audit(self.raw)['unknown'])
        self.assertNotIn(needle,audit(live)['unknown'])
        ref=json.loads((HERE/'reference-live.json').read_text())
        self.assertEqual(evaluate(project(live),ref)['consequential_omissions'],[])

    def test_transient_missing_job_is_not_a_human_obligation(self):
        f=fixture(); f['prs'][0]['missing']=['jobs:123:1']
        self.assertEqual(project(f)['obligations'],[])
        self.assertEqual(project(f)['lines'][0]['missing'],['jobs:123:1'])
        self.assertIn('#1: jobs:123:1 unavailable',audit(f)['unknown'])

    def test_replacement_preserves_both_histories(self):
        view = project(self.raw)
        self.assertEqual(len(view['lines']), 10)
        self.assertEqual(next(l['history'] for l in view['lines'] if l['id']==13210), [13042,13210])
        self.assertTrue(all(c['work'] not in {13042,12981,13053,12994} for c in view['obligations']))

    def test_head_change_invalidates_review_freshness_not_decision(self):
        f=fixture(); f['prs'][0]['threads']=[thread()]
        before=project(f)['obligations'][0]
        f['prs'][0]['head']='newer'
        after=project(f)['obligations'][0]
        self.assertEqual(before['id'], after['id'])
        self.assertEqual(after['certainty'], 'needs revalidation')
        self.assertNotEqual(before['head'], after['head'])

    def test_resolution_and_merge_are_not_completion(self):
        f=fixture(); f['prs'][0]['threads']=[thread()]
        f['prs'][0]['threads'][0]['isResolved']=True
        f['prs'][0]['merged_at']=AT; f['prs'][0]['state']='closed'
        view=project(f)
        self.assertEqual(view['obligations'], [])
        self.assertEqual(view['lines'][0]['completion'], 'unknown')

    def test_two_decisions_never_collapse(self):
        f=fixture(); f['prs'][0]['threads']=[thread('a'),thread('b')]
        self.assertEqual(len(project(f)['obligations']),2)

    def test_current_success_supersedes_failure_same_app_only(self):
        f=fixture(); old=check(); new=check(2,'success')
        f['prs'][0]['checks']=[old,new]
        self.assertEqual(project(f)['obligations'],[])
        new['app']['id']=2
        self.assertEqual(len(project(f)['obligations']),1)

    def test_queued_replacement_invalidates_older_failure(self):
        f=fixture(); new=check(2,None);new['started_at']=None;new['completed_at']=None
        f['prs'][0]['checks']=[check(),new]
        self.assertEqual(project(f)['obligations'],[])

    def test_commented_review_does_not_rescind_approval_or_requested_changes(self):
        f=fixture();p=f['prs'][0]
        r=dict(id=1,user=dict(login='reviewer'),state='APPROVED',commit_id='old',submitted_at=AT,html_url=URL)
        p['reviews']=[r,dict(r,id=2,state='COMMENTED',commit_id='new')]
        self.assertIn('stale_review_head',{a['kind'] for a in audit(f)['alerts']})
        r['state']='CHANGES_REQUESTED'
        self.assertEqual(project(f)['obligations'][0]['kind'],'requested_changes')

    def test_capture_drift_quarantines_decisions(self):
        f=fixture(); f['prs'][0].update(head_stable=False, checks=[check()],threads=[thread()])
        self.assertEqual([c['kind'] for c in project(f)['obligations']], ['recapture'])

    def test_missing_thread_pages_keep_uncertainty(self):
        f=fixture(); t=thread(); t['comments']['pageInfo']['hasNextPage']=True
        f['prs'][0]['threads']=[t]
        self.assertEqual(project(f)['obligations'][0]['certainty'],'needs revalidation')

    def test_audit_exposes_quiet_reducer_stale_approval_and_zero_tests(self):
        f=fixture(); p=f['prs'][0]; c=check(1,'success');c['output']['text']='Executed 0 tests, with 0 failures'
        p['checks']=[c];p['reviews']=[dict(id=1,user=dict(login='reviewer'),state='APPROVED',
            commit_id='old',submitted_at=AT,html_url=URL)]
        self.assertEqual(project(f)['obligations'],[])
        self.assertEqual({a['kind'] for a in audit(f)['alerts']},{'stale_review_head','zero_tests'})
        p['reviews'].append(dict(p['reviews'][0], id=2,commit_id='new'))
        c['output']['text']='Executed 3 tests, with 0 failures'
        self.assertEqual(audit(f)['alerts'],[])

    def test_prose_is_not_a_zero_test_result(self):
        f=fixture();f['prs'][0]['body']='Executed 0 tests'
        self.assertNotIn('zero_tests',{a['kind'] for a in audit(f)['alerts']})
        self.assertTrue(any('counts unavailable' in x for x in audit(f)['unknown']))

    def test_clustered_jobs_and_cancelled_time_are_independent(self):
        f=fixture(); p=f['prs'][0]
        for i in range(3):
            p['jobs'].append(dict(id=i, run_attempt=1, run_event='merge_group',html_url=URL,
                conclusion='cancelled',started_at='2026-09-20T15:00:00Z',completed_at='2026-09-20T15:04:00Z',
                steps=[dict(name='Compile',conclusion='failure')]))
        self.assertEqual(project(f)['obligations'],[])
        alerts={a['kind']:a for a in audit(f)['alerts']}
        self.assertEqual(alerts['clustered_failures']['measured']['jobs'],3)
        self.assertEqual(alerts['queue_waste_candidate']['measured']['cancelled_runner_wall_seconds'],720)
        # Duplicate job pages must not double the denominator or canceled time.
        p['jobs']+=deepcopy(p['jobs'])
        self.assertEqual(audit(f)['alerts'],list(alerts.values()))

    def test_queue_events_preserved_without_inventing_membership(self):
        f=fixture(); f['prs'][0]['timeline']=[dict(id=1,event='enqueued',created_at=AT),
            dict(id=2,event='dequeued',created_at=AT),dict(id=3,event='unknown')]
        self.assertEqual([e['kind'] for e in event_index(f)],['enqueued','dequeued','unknown'])
        self.assertEqual(project(f)['completion'],'unknown')
        self.assertEqual([c['kind'] for c in project(f)['obligations']], ['queue'])
        f['prs'][0]['timeline'].append(dict(id=4,event='enqueued',created_at=AT))
        self.assertEqual(project(f)['obligations'], [])

    def test_checks_from_prior_head_cannot_create_current_failure(self):
        f=fixture(); f['prs'][0]['checks']=[check(head='old')]
        self.assertEqual(project(f)['obligations'], [])

    def test_optional_export_requires_head_and_job_join(self):
        e=verification_export(HERE/'evidence/verification-83.json',self.raw)
        self.assertEqual(e['join_status'],'unjoined')
        self.assertEqual(e['tests']['executed'],3)
        self.assertEqual(e['completion'],'unknown')

    def test_ci_windows_cannot_become_pr_cohort_cost_or_export_private_fields(self):
        m=dict(runs=1,attempts=1,runner_seconds=42,cancelled_job_seconds=2,
               retry_seconds=0,incomplete_job_durations=0,private_cache='do not export')
        with tempfile.TemporaryDirectory() as tmp:
            metrics=Path(tmp)/'metrics.json';cohort=Path(tmp)/'cohort.json'
            metrics.write_text(json.dumps(dict(before=m,after=m)))
            cohort.write_text(json.dumps(dict(repository='manaflow-ai/cmux',windows=dict(
                before=['2026-09-20T07:00:00Z','2026-09-20T08:00:00Z'],
                after=['2026-09-20T13:00:00Z','2026-09-20T14:00:00Z']))))
            context=ci_report_export(metrics,cohort)
            self.assertEqual(context['join_status'],'different_cohort')
            self.assertNotIn('private_cache',json.dumps(context))

    def test_audit_has_no_reducer_import_or_summary_dependency(self):
        tree=ast.parse((HERE/'audit.py').read_text())
        self.assertFalse(any(isinstance(n,ast.ImportFrom) and n.module=='model' for n in ast.walk(tree)))
        expected=audit(self.raw)
        poisoned=deepcopy(self.raw); poisoned['obligations']=[{'complete':True}];poisoned['lines']=[]
        self.assertEqual(audit(poisoned),expected)

    def test_generated_sidebar_only_opens_public_evidence(self):
        result=sidebar(frame(self.raw))
        self.assertNotIn('cmux(',result)
        self.assertNotIn('fetch(',result)
        self.assertIn('openURL(',result)
        self.assertFalse(safe_url('javascript:alert(1)'))
        self.assertFalse(safe_url('https://github.com.evil.test/x'))

    def test_replay_is_deterministic_and_side_effect_free(self):
        original=deepcopy(self.raw)
        self.assertEqual(frame(self.raw),frame(self.raw))
        self.assertEqual(original,self.raw)

    def test_http_surface_is_loopback_get_only(self):
        process=subprocess.Popen([sys.executable,str(HERE/'replay.py'),'--serve','--port','0'],
                                 stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        try:
            url=process.stdout.readline().strip().split()[-1]
            self.assertTrue(url.startswith('http://127.0.0.1:'))
            with urlopen(url+'/data.json', timeout=5) as response:
                self.assertEqual(json.load(response)['frames'][0]['source_count'],14)
            for route,method,status in [('/', 'POST',501),('/../../reference.json','GET',404)]:
                with self.assertRaises(HTTPError) as error:
                    urlopen(Request(url+route,method=method),timeout=5)
                self.assertEqual(error.exception.code,status)
                error.exception.close()
        finally:
            process.terminate(); process.communicate(timeout=5)


if __name__ == '__main__':
    unittest.main()
