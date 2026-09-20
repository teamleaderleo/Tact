import copy
import json
from pathlib import Path
import unittest
from roundtrip import portable, birth_records, surfaces

class PortableTemplateTests(unittest.TestCase):
    def setUp(self): self.fixture=json.loads(Path(__file__).with_name('layout.fixture.json').read_text())
    def row(self): return self.fixture['workspace']['layout']['children'][0]['pane']['surfaces'][0]
    def test_shape_is_existing_layout_grammar(self):
        result=portable(self.fixture)
        self.assertEqual(result,portable(result))
        self.assertEqual(len(surfaces(result['workspace']['layout'])),3)
        self.assertEqual(result['workspace']['cwd'],'.')
        self.assertEqual(result['workspace']['layout']['split'],.4)
    def test_birth_has_intent_not_identity_copy(self):
        births=birth_records(portable(self.fixture))
        self.assertEqual([x['intent']['kind'] for x in births],['shell','navigate','shell'])
        self.assertTrue(all('resource_id' not in x and 'pid' not in x for x in births))
    def test_runtime_metadata_does_not_export(self):
        self.row().update(pid=123,socket='/tmp/ephemeral.sock',daemon_generation='g',stableSurfaceId='old-instance')
        exported=json.dumps(portable(self.fixture))
        for forbidden in ('123','ephemeral','daemon_generation','old-instance'): self.assertNotIn(forbidden,exported)
    def test_execution_environment_and_resume_refused(self):
        for key,value in [('command','codex --token secret'),('env',{'TOKEN':'secret'}),('resume',{'session':'known'})]:
            with self.subTest(key=key):
                row=self.row(); row[key]=value
                with self.assertRaises(ValueError): portable(self.fixture)
                del row[key]
    def test_workspace_environment_refused(self):
        self.fixture['workspace']['env']={'KEY':'secret'}
        with self.assertRaises(ValueError): portable(self.fixture)
    def test_paths_outside_root_refused(self):
        for cwd in ('/tmp/other','../other','a/../../other','~/other'):
            self.row()['cwd']=cwd
            with self.subTest(cwd=cwd), self.assertRaises(ValueError): portable(self.fixture)
    def test_credential_or_runtime_urls_refused(self):
        row=self.fixture['workspace']['layout']['children'][1]['children'][0]['pane']['surfaces'][0]
        for url in ('https://user:secret@example.org','https://example.org/?token=secret','http://localhost:4200','cmux://token','file:///tmp/a','https://example.org/#secret'):
            row['url']=url
            with self.subTest(url=url), self.assertRaises(ValueError): portable(self.fixture)
    def test_unsupported_native_agent_not_silently_shell(self):
        self.row()['type']='agentSession'
        with self.assertRaises(ValueError): portable(self.fixture)

if __name__=='__main__': unittest.main()
