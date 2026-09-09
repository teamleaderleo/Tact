import json,os,sys,tempfile,types,unittest
from datetime import datetime,timedelta,timezone
import journal
from journal import Journal

def ts(d):return (datetime(2026,1,1,tzinfo=timezone.utc)+timedelta(days=d)).isoformat(timespec="seconds").replace("+00:00","Z")
class T(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.db=os.path.join(self.tmp.name,"j.db");self.j=Journal(self.db)
 def tearDown(self):self.tmp.cleanup()
 def test_literal_temporal_context(self):
  a=self.j.capture("alpha exact-token 9f2a7c","work",created_at=ts(0));b=self.j.capture("middle thought","work",created_at=ts(1));c=self.j.capture("later thought","work",created_at=ts(2))
  self.assertEqual(self.j.retrieve("9f2a7c","literal")["results"][0]["uid"],a["uid"]);self.assertEqual([x["uid"] for x in self.j.retrieve("thought","lexical",after="2026-01-03")["results"]],[c["uid"]]);self.assertEqual([x["uid"] for x in self.j.neighborhood(b["uid"],1)],[a["uid"],b["uid"],c["uid"]])
 def test_complete(self):
  self.j.capture("decision queue","work");self.j.capture("decision storage","work");self.j.capture("decision paint","cars");r=self.j.complete("decision","work");self.assertTrue(r["complete"]);self.assertFalse(r["ranked"]);self.assertEqual(r["count"],2)
 def test_current_provenance(self):
  a=self.j.capture("queue := Redis","work",created_at=ts(0));b=self.j.capture("queue := Postgres","work",created_at=ts(1));c=self.j.capture("queue := SQS","work",created_at=ts(2));r=self.j.current("queue")[0];self.assertEqual(r["value"],"SQS");self.assertEqual([x["uid"] for x in r["provenance"]],[a["uid"],b["uid"],c["uid"]])
 def test_correction_effective_time(self):
  a=self.j.capture("queue := Redis","work",created_at=ts(0));b=self.j.capture("queue := SQS","work",created_at=ts(2));c=self.j.correct(a["uid"],"queue := RabbitMQ");self.assertEqual(c["effective_at"],a["effective_at"]);self.assertEqual(self.j.current("queue")[0]["current_uid"],b["uid"])
 def test_correction_cannot_rename_fact_lineage(self):
  a=self.j.capture("queue := Redis","work")
  with self.assertRaises(ValueError):self.j.correct(a["uid"],"storage := Postgres")
 def test_correct_current(self):
  a=self.j.capture("capital := Lyon","facts",created_at=ts(0));c=self.j.correct(a["uid"],"capital := Paris");r=self.j.current("capital")[0];self.assertEqual(r["value"],"Paris");self.assertEqual(r["provenance"][-1]["supersedes_uid"],a["uid"]);self.assertEqual(r["current_uid"],c["uid"])
 def test_redact_purge(self):
  s="ULTRA_SECRET_4519";a=self.j.capture(f"credential := {s}","private");self.j.redact(a["uid"]);self.assertFalse(self.j.retrieve(s,"literal")["results"]);self.assertEqual(self.j.current("credential"),[]);self.assertNotIn(s,json.dumps(self.j.export()))
  with open(self.db,"rb") as f:self.assertNotIn(s.encode(),f.read())
 def test_delete_no_revival(self):
  self.j.capture("queue := Redis","work",created_at=ts(0));b=self.j.capture("queue := SECRET_QUEUE","work",created_at=ts(1));self.j.delete(b["uid"]);self.assertEqual(self.j.current("queue"),[]);self.assertNotIn("SECRET_QUEUE",json.dumps(self.j.export()))
 def test_handoff(self):
  self.j.capture("queue := Redis","work",created_at=ts(0));self.j.capture("queue := SQS","work",created_at=ts(1));p=os.path.join(self.tmp.name,"x.json")
  with open(p,"w") as f:f.write(json.dumps(self.j.export()))
  o=Journal(os.path.join(self.tmp.name,"o.db"));o.import_file(p);self.assertEqual(o.current("queue")[0]["value"],"SQS");self.assertEqual(o.complete(channel="work")["count"],2)
 def test_local_semantic(self):
  a=self.j.capture("car battery winter charging","cars");self.j.capture("automobile battery winter maintenance","cars");self.j.capture("vehicle winter charging checklist","cars");self.assertIn(a["uid"],[x["uid"] for x in self.j.retrieve("automobile charging","semantic","cars")["results"]])
 def test_pretrained_contract(self):
  class F:
   def __init__(self,model_name=None):pass
   def query_embed(self,q):yield [1,0]
   def passage_embed(self,xs):
    for x in xs:yield [1,0] if "EV" in x else [0,1]
  old=sys.modules.get("fastembed");oldm=journal.FASTEMBED_MODEL;sys.modules["fastembed"]=types.SimpleNamespace(TextEmbedding=F);journal.FASTEMBED_MODEL=None
  try:
   a=self.j.capture("EV winter charging","cars");self.j.capture("grocery list","home");r=self.j.retrieve("electric car","semantic");self.assertEqual(r["semantic_backend"],"fastembed:BAAI/bge-small-en-v1.5");self.assertEqual(r["results"][0]["uid"],a["uid"])
  finally:
   journal.FASTEMBED_MODEL=oldm;sys.modules.pop("fastembed",None) if old is None else sys.modules.__setitem__("fastembed",old)
if __name__=="__main__":unittest.main()
