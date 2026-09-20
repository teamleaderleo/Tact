import json
from pathlib import Path
import unittest

from collect import API
from report import parse_log, seconds, quantile, metrics, runner, cost_class

ROOT=Path(__file__).parent

class ParserTests(unittest.TestCase):
    def test_rollout_fixtures(self):
        for case in json.loads((ROOT/'fixtures/rollout.json').read_text()):
            with self.subTest(case=case['case']):
                parsed=parse_log(case['log'])
                self.assertEqual([e['result'] for e in parsed['cache_events']],case['results'])
                if 'backend' in case:
                    self.assertEqual(parsed['cache_events'][0]['backend'],case['backend'])
                if 'tests' in case:self.assertEqual(parsed['test_summaries'][0]['tests'],case['tests'])
                if 'routing' in case:self.assertEqual(parsed['routing_tokens'],case['routing'])
                self.assertIsNone(parsed['producer_provenance'])
                self.assertIsNone(parsed['seed_age_seconds'])

    def test_no_echo_or_secret_publication(self):
        text='''2026-09-20T13:01:00Z ##[group]Run r2-cache restore
2026-09-20T13:01:01Z echo "r2-cache: restored false-positive"
2026-09-20T13:01:02Z   backend: r2
2026-09-20T13:01:03Z AWS_SECRET_ACCESS_KEY: fake-secret
2026-09-20T13:01:04Z ##[endgroup]
2026-09-20T13:01:05Z r2-cache: restored spm-real for prefix spm-
https://storage.invalid/archive?signature=secret
/Users/private/home
'''
        parsed=parse_log(text)
        self.assertEqual(parsed['requested_cache_backends'],['r2'])
        self.assertEqual(len(parsed['cache_events']),1)
        self.assertEqual(parsed['cache_events'][0]['result'],'prefix')
        for forbidden in ['false-positive','fake-secret','signature','/Users']:
            self.assertNotIn(forbidden,json.dumps(parsed))

    def test_actions_restore_not_assumed_exact(self):
        self.assertEqual(parse_log('Cache restored from key: spm-abc')['cache_events'][0]['result'],'restored_match_unknown')
        self.assertEqual(parse_log('Cache restored from key: https://secret')['cache_events'],[])

    def test_duration_and_percentiles(self):
        self.assertIsNone(seconds(None,'2026-09-20T13:00:00Z'))
        self.assertIsNone(seconds('2026-09-20T13:01:00Z','2026-09-20T13:00:00Z'))
        self.assertEqual(quantile([10,20],.95),19.5)
        self.assertIsNone(quantile([],.95))

    def test_disjoint_categories(self):
        r={'workflow_path':'.github/workflows/nightly.yml','event':'schedule'}
        self.assertEqual(cost_class(r,{'name':'refresh-test-compilation-cache'}),'seed')
        self.assertEqual(cost_class(r,{'name':'build'}),'nightly_release')
        self.assertEqual(runner(['warp-macos-15-arm64-6x']),'warp/macos')
        self.assertEqual(runner(['blacksmith-4vcpu-ubuntu-2404']),'blacksmith/linux')

    def test_retries_cancelled_and_failure_tail_not_added_twice(self):
        run={'id':1,'cohort':'before','event':'merge_group','workflow_path':'.github/workflows/ci.yml','created_at':'2026-09-20T07:00:00Z','run_attempt':2,'conclusion':'cancelled'}
        job={'id':1,'name':'tests','runner':'warp/macos','runner_seconds':120,'execution_start':'2026-09-20T07:00:00Z','completed_at':'2026-09-20T07:02:00Z','conclusion':'cancelled','cost_class':'merge_validation','steps':[]}
        failed=job|{'id':2,'runner_seconds':60,'completed_at':'2026-09-20T07:01:00Z','conclusion':'failure'}
        attempts=[{'run_id':1,'attempt':1,'conclusion':'failure','jobs':[failed],'observed_suite':'unknown'}, {'run_id':1,'attempt':2,'conclusion':'cancelled','jobs':[job,failed],'observed_suite':'unknown'}]
        data={'config':{'windows':{'before':['2026-09-20T07:00:00Z','2026-09-20T08:00:00Z'],'after':['2026-09-20T13:00:00Z','2026-09-20T14:00:00Z']}},'runs':[run],'attempts':attempts,'accepted':{'before':{'complete':True,'numbers':[1]}}}
        v=metrics(data)['before']
        self.assertEqual(v['runner_seconds'],240)
        self.assertEqual(v['retry_seconds'],180)
        self.assertEqual(v['cancelled_attempt_seconds'],180)
        self.assertEqual(v['cancelled_job_seconds'],120)
        self.assertEqual(v['merge_failure_tail'][1]['runner_seconds_after_failure'],60)
        # No queue audit proof: cancelled does not mean discarded.
        self.assertNotIn('discarded_seconds',v)

class PaginationTests(unittest.TestCase):
    def test_full_job_pages_including_exact_multiple(self):
        api=object.__new__(API)
        calls=[]
        def get(endpoint):
            calls.append(endpoint)
            page=int(endpoint.split('page=')[-1])
            return {'endpoint':endpoint,'error':None,'data':{'jobs':[{'id':x+(page-1)*100} for x in range(100)] if page<=2 else []}}
        api.get=get
        items,receipts,complete=api.pages('jobs','jobs')
        self.assertEqual(len(items),200)
        self.assertEqual(len(calls),3)
        self.assertTrue(complete)

    def test_page_failure_is_incomplete_not_zero(self):
        api=object.__new__(API)
        api.get=lambda endpoint:{'endpoint':endpoint,'error':'http_403'}
        items,receipts,complete=api.pages('jobs','jobs')
        self.assertFalse(complete)
        self.assertEqual(receipts[0]['error'],'http_403')

    def test_run_search_splits_at_cap(self):
        api=object.__new__(API)
        calls=[]
        def get(endpoint):
            calls.append(endpoint)
            # Full two-second window has 1000+; each half has one run.
            whole='07%3A00%3A00Z..2026-09-20T07%3A00%3A01Z' in endpoint
            second='07%3A00%3A01Z..' in endpoint
            return {'endpoint':endpoint,'error':None,'data':{'total_count':1000 if whole else 1,'workflow_runs':[] if whole else [{'id':2 if second else 1,'created_at':'2026-09-20T07:00:01Z' if second else '2026-09-20T07:00:00Z'}]}}
        api.get=get
        records,receipts,complete=api.runs('a/b','2026-09-20T07:00:00Z','2026-09-20T07:00:02Z')
        self.assertEqual([r['id'] for r in records],[1,2])
        self.assertTrue(complete)

    def test_single_second_cap_is_explicit(self):
        api=object.__new__(API)
        api.get=lambda endpoint:{'error':None,'data':{'total_count':1000}}
        records,receipts,complete=api.runs('a/b','2026-09-20T07:00:00Z','2026-09-20T07:00:01Z')
        self.assertFalse(complete)
        self.assertEqual(receipts[0]['error'],'unpartitionable_1000_run_cap')


class SnapshotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import gzip
        cls.data=json.loads(gzip.decompress((ROOT/'results/receipts.json.gz').read_bytes()))

    def test_frozen_population_and_unique_attempt_jobs(self):
        data=self.data
        self.assertEqual(len(data['cohorts']['before']['run_ids']),668)
        self.assertEqual(len(data['cohorts']['after']['run_ids']),474)
        self.assertTrue(all(c['complete'] for c in data['cohorts'].values()))
        self.assertTrue(all(a['complete'] and not a['detail_evidence']['error'] for a in data['attempts']))
        jobs=[j for a in data['attempts'] for j in a['jobs']]
        self.assertEqual(len(jobs),len({j['id'] for j in jobs}))
        self.assertEqual(len(jobs),3192)
        self.assertTrue(all(j['run_attempt']==a['attempt'] for a in data['attempts'] for j in a['jobs']))

    def test_retained_real_prefix_log(self):
        fixture=json.loads((ROOT/'fixtures/observed-r2.json').read_text())
        events=parse_log(fixture['bounded_log_excerpt'])['cache_events']
        self.assertEqual(events,fixture['parsed']['cache_events'])
        self.assertEqual([e['result'] for e in events],['miss','prefix','prefix'])
        self.assertEqual(fixture['job_conclusion'],'failure')
        self.assertIsNone(fixture['source']['checkout_sha'])

    def test_replay_is_byte_identical(self):
        from report import render
        self.assertEqual(render(self.data),(ROOT/'results/report.md').read_text())

    def test_public_receipts_omit_sensitive_surfaces(self):
        text=json.dumps(self.data)
        for token in ('/Users/','/home/','X-Amz-Signature','AWS_SECRET_ACCESS_KEY','Authorization:','ghp_','github_pat_'):
            self.assertNotIn(token,text)
        self.assertIsNone(metrics(self.data)['before']['seconds_per_merged_pr'])
        self.assertIsNone(metrics(self.data)['after']['monetary_estimate'])

class RetryTests(unittest.TestCase):
    def test_transient_metadata_retry_once_with_preserved_error(self):
        import hashlib
        import subprocess
        import tempfile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as directory:
            endpoint='repos/example/repo/actions/runs/1'
            path=Path(directory)/(hashlib.sha256(endpoint.encode()).hexdigest()+'.json')
            path.write_text(json.dumps({'endpoint':endpoint,'fetched_at':'original','error':'request_failed'}))
            api=API(directory,retry_metadata=True)
            response=subprocess.CompletedProcess([],1,b'',b'opaque failure')
            with patch('collect.subprocess.run',return_value=response) as call:
                result=api.get(endpoint)
                again=api.get(endpoint)
                self.assertEqual(call.call_count,1)
                self.assertEqual(result,again)
                self.assertEqual(result['previous_request']['fetched_at'],'original')

if __name__=='__main__':unittest.main()
