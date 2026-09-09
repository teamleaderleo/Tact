from __future__ import annotations

import json, math, re, sqlite3, threading, uuid
from collections import Counter, defaultdict
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator

TOKEN_RE=re.compile(r"[A-Za-z0-9][A-Za-z0-9_./:+-]*")
FACT_RE=re.compile(r"^\s*([^\n:=]{1,80}?)\s*:=\s*(.+?)\s*$",re.S)
FASTEMBED_MODEL=None
FASTEMBED_LOCK=threading.Lock()


def now(): return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z")
def topic_key(s): return " ".join(s.strip().lower().split())
def fact(body):
    m=FACT_RE.match(body)
    return (topic_key(m.group(1)),m.group(2).strip()) if m and m.group(2).strip() else None

def stem(t):
    t=t.lower()
    if len(t)>5 and t.endswith("ies"): return t[:-3]+"y"
    for x in ("ing","ed","es","s"):
        if len(t)>len(x)+3 and t.endswith(x): return t[:-len(x)]
    return t

def toks(s): return [stem(x) for x in TOKEN_RE.findall(s.lower())]
def bound(s,end=False):
    if not s:return None
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}",s):
        d=datetime.fromisoformat(s).replace(tzinfo=timezone.utc)+(timedelta(days=1) if end else timedelta())
    else:
        d=datetime.fromisoformat(s.replace("Z","+00:00")); d=d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z")

SCHEMA="""
CREATE TABLE IF NOT EXISTS entries(
 id INTEGER PRIMARY KEY,uid TEXT UNIQUE NOT NULL,created_at TEXT NOT NULL,effective_at TEXT NOT NULL,
 channel TEXT NOT NULL,body TEXT,kind TEXT NOT NULL,topic_id TEXT,topic_key TEXT,value TEXT,
 supersedes_uid TEXT,pinned INTEGER NOT NULL DEFAULT 0,context_json TEXT NOT NULL DEFAULT '{}',
 redacted_at TEXT,deleted_at TEXT);
CREATE INDEX IF NOT EXISTS ix_created ON entries(created_at);
CREATE INDEX IF NOT EXISTS ix_channel ON entries(channel,created_at);
CREATE INDEX IF NOT EXISTS ix_topic ON entries(topic_id,effective_at,created_at);
"""

class Journal:
    def __init__(self,path): self.path=str(path); self.init()
    def connect(self):
        c=sqlite3.connect(self.path); c.row_factory=sqlite3.Row
        c.execute("PRAGMA secure_delete=ON"); c.execute("PRAGMA journal_mode=DELETE")
        return c
    @contextmanager
    def db(self)->Iterator[sqlite3.Connection]:
        c=self.connect()
        try:
            with c: yield c
        finally:c.close()
    def init(self):
        Path(self.path).parent.mkdir(parents=True,exist_ok=True)
        with self.db() as c:c.executescript(SCHEMA)
    @staticmethod
    def public(r):
        d=dict(r);d.pop("id",None);d["pinned"]=bool(d["pinned"])
        d["context"]=json.loads(d.pop("context_json") or "{}")
        if d["kind"]=="deleted":d.update(body=None,topic_key=None,value=None)
        return d
    def capture(self,body,channel="inbox",*,created_at=None,effective_at=None,kind=None,supersedes_uid=None,topic_id=None,topic=None,uid=None,context=None):
        body=body.strip(); channel=(channel or "inbox").strip()[:80] or "inbox"
        if not body:raise ValueError("body is required")
        if len(body)>20000:raise ValueError("body too long")
        created_at=created_at or now();effective_at=effective_at or created_at;uid=uid or uuid.uuid4().hex;f=fact(body)
        with self.db() as c:
            prev=c.execute("SELECT uid FROM entries WHERE channel=? ORDER BY created_at DESC,id DESC LIMIT 1",(channel,)).fetchone()
            ctx={"capture":"message","previous_uid":prev["uid"] if prev else None};ctx.update(context or {})
            value=None;resolved=kind or "note"
            if f:
                topic,value=f
                if not topic_id:
                    r=c.execute("SELECT topic_id FROM entries WHERE topic_key=? AND topic_id IS NOT NULL ORDER BY created_at DESC LIMIT 1",(topic,)).fetchone()
                    topic_id=r["topic_id"] if r else uuid.uuid4().hex
                resolved=kind or "fact"
                if supersedes_uid is None:
                    r=c.execute("SELECT uid FROM entries WHERE topic_id=? ORDER BY effective_at DESC,created_at DESC,id DESC LIMIT 1",(topic_id,)).fetchone()
                    supersedes_uid=r["uid"] if r else None
            elif topic_id:value=body
            c.execute("""INSERT INTO entries(uid,created_at,effective_at,channel,body,kind,topic_id,topic_key,value,supersedes_uid,context_json)
                         VALUES(?,?,?,?,?,?,?,?,?,?,?)""",(uid,created_at,effective_at,channel,body,resolved,topic_id,topic,value,supersedes_uid,json.dumps(ctx,separators=(",",":"))))
            return self.public(c.execute("SELECT * FROM entries WHERE uid=?",(uid,)).fetchone())
    def entries(self,channel=None,limit=200):
        with self.db() as c:
            q="SELECT * FROM entries";a=[]
            if channel:q+=" WHERE channel=?";a=[channel]
            q+=" ORDER BY created_at DESC,id DESC LIMIT ?";a.append(min(max(limit,1),1000))
            return [self.public(r) for r in c.execute(q,a)]
    def channels(self):
        with self.db() as c:return [dict(r) for r in c.execute("SELECT channel,COUNT(*) n,MAX(created_at) latest FROM entries WHERE kind!='deleted' GROUP BY channel ORDER BY latest DESC")]
    def rows(self,channel=None,after=None,before=None,kind=None):
        q=["kind!='deleted'","body IS NOT NULL"];a=[]
        for clause,val in (("channel=?",channel),("created_at>=?",bound(after)),("created_at<?",bound(before,True)),("kind=?",kind)):
            if val:q.append(clause);a.append(val)
        with self.db() as c:return c.execute("SELECT * FROM entries WHERE "+" AND ".join(q)+" ORDER BY created_at,id",a).fetchall()
    @staticmethod
    def bm25(qt,docs):
        if not qt:return [0.0]*len(docs)
        n=len(docs);avg=sum(map(len,docs))/max(n,1);df=Counter()
        for d in docs:df.update(set(d))
        out=[]
        for d in docs:
            tf=Counter(d);score=0
            for t in qt:
                if not tf[t]:continue
                idf=math.log(1+(n-df[t]+.5)/(df[t]+.5));den=tf[t]+1.5*(.25+.75*len(d)/max(avg,1e-9));score+=idf*(tf[t]*2.5)/den
            out.append(score)
        return out
    @staticmethod
    def local_semantic(qt,docs):
        if not qt:return [0.0]*len(docs)
        n=len(docs);df=Counter();[df.update(set(d)) for d in docs];idf={t:math.log((n+1)/(v+1))+1 for t,v in df.items()};ctx=defaultdict(Counter)
        for d in docs:
            c=Counter(d)
            for t in c:
                for x in c:
                    if x!=t:ctx[t][x]+=c[x]*idf.get(x,1)
        def vec(ts):
            v=Counter()
            for t in ts:
                v[t]+=.2*idf.get(t,1);v.update(ctx.get(t,{}))
            return v
        q=vec(qt)
        def cos(a,b):
            den=math.sqrt(sum(x*x for x in a.values())*sum(x*x for x in b.values()))
            return sum(x*b.get(k,0) for k,x in a.items())/den if den else 0
        return [cos(q,vec(d)) for d in docs]
    @staticmethod
    def pretrained(query,texts):
        global FASTEMBED_MODEL
        try:from fastembed import TextEmbedding
        except ImportError:return None,"local-cooccurrence","Install requirements-semantic.txt for pretrained semantic retrieval."
        try:
            with FASTEMBED_LOCK:
                if FASTEMBED_MODEL is None:FASTEMBED_MODEL=TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                m=FASTEMBED_MODEL
            q=list(m.query_embed(query))[0];ds=list(m.passage_embed(texts))
            def cos(a,b):
                dot=sum(float(x)*float(y) for x,y in zip(a,b));den=math.sqrt(sum(float(x)**2 for x in a)*sum(float(x)**2 for x in b));return dot/den if den else 0
            return [cos(q,d) for d in ds],"fastembed:BAAI/bge-small-en-v1.5",None
        except Exception as e:return None,"local-cooccurrence",f"Pretrained semantic backend failed ({type(e).__name__}); using local fallback."
    def neighborhood(self,uid,radius=2):
        with self.db() as c:
            t=c.execute("SELECT * FROM entries WHERE uid=?",(uid,)).fetchone()
            if not t:return []
            rs=c.execute("SELECT * FROM entries WHERE channel=? ORDER BY created_at,id",(t["channel"],)).fetchall();i=next(i for i,r in enumerate(rs) if r["uid"]==uid)
        out=[]
        for r in rs[max(0,i-radius):i+radius+1]:
            x=self.public(r);x["match"]=x["uid"]==uid;out.append(x)
        return out
    def retrieve(self,query,mode="hybrid",channel=None,after=None,before=None,limit=20):
        rs=self.rows(channel,after,before);texts=[r["body"] or "" for r in rs];docs=[toks(x) for x in texts];qt=toks(query);lex=self.bm25(qt,docs)
        if mode in {"semantic","hybrid"}:
            sem,backend,warn=self.pretrained(query,texts)
            if sem is None:sem=self.local_semantic(qt,docs)
        else:sem,backend,warn=[0.0]*len(rs),"unused",None
        lit=[x.lower().count(query.lower()) if query else 1 for x in texts];ml=max(lex or [0]) or 1;mi=max(lit or [0]) or 1;sc=[]
        for i,r in enumerate(rs):
            score={"literal":lit[i]/mi if lit[i] else 0,"lexical":lex[i]/ml,"semantic":sem[i]}.get(mode,.60*lex[i]/ml+.36*sem[i]+(.04 if r["pinned"] else 0))
            if not query or score>0:sc.append((score,i))
        sc.sort(key=lambda x:(x[0],rs[x[1]]["created_at"]),reverse=True);out=[]
        for score,i in sc[:min(max(limit,1),100)]:
            x=self.public(rs[i]);x["score"]=round(float(score),6);x["neighborhood"]=self.neighborhood(x["uid"]);out.append(x)
        return {"ranked":True,"complete":False,"mode":mode,"query":query,"semantic_backend":backend,"semantic_warning":warn,"results":out}
    def complete(self,literal="",channel=None,after=None,before=None,kind=None):
        rs=self.rows(channel,after,before,kind)
        if literal:rs=[r for r in rs if literal.lower() in (r["body"] or "").lower()]
        out=[self.public(r) for r in rs]
        return {"ranked":False,"complete":True,"count":len(out),"complete_for":{"literal_substring":literal or None,"channel":channel,"after":after,"before":before,"kind":kind},"warning":"Completeness applies only to these deterministic stored-field predicates; conceptual completeness requires an explicit field or collection.","results":out}
    def current(self,topic=None):
        with self.db() as c:rs=c.execute("SELECT * FROM entries WHERE topic_id IS NOT NULL ORDER BY effective_at,created_at,id").fetchall()
        groups=defaultdict(list)
        for r in rs:groups[r["topic_id"]].append(r)
        wanted=topic_key(topic) if topic else None;out=[]
        for events in groups.values():
            latest=events[-1]
            if latest["kind"] in {"deleted","redacted"} or latest["body"] is None:continue
            key=latest["topic_key"] or next((r["topic_key"] for r in reversed(events) if r["topic_key"]),None)
            if wanted and key!=wanted:continue
            prov=[{k:self.public(r)[k] for k in ("uid","created_at","effective_at","kind","body","supersedes_uid")} for r in events]
            out.append({"topic":key,"value":latest["value"],"current_uid":latest["uid"],"changed_at":latest["effective_at"],"recorded_at":latest["created_at"],"provenance":prov})
        return sorted(out,key=lambda x:x["topic"] or "")
    def correct(self,uid,replacement):
        with self.db() as c:r=c.execute("SELECT * FROM entries WHERE uid=?",(uid,)).fetchone()
        if not r or r["kind"]=="deleted":raise KeyError(uid)
        parsed=fact(replacement)
        if r["topic_id"] and parsed and r["topic_key"] and parsed[0]!=r["topic_key"]:raise ValueError("correction must keep the same topic; append a new fact for another topic")
        if r["topic_id"] and not parsed and r["topic_key"]:replacement=f'{r["topic_key"]} := {replacement}'
        return self.capture(replacement,r["channel"],effective_at=r["effective_at"],kind="correction",supersedes_uid=uid,topic_id=r["topic_id"],topic=r["topic_key"],context={"correction_of":uid})
    def pin(self,uid,value=True):
        with self.db() as c:
            if not c.execute("UPDATE entries SET pinned=? WHERE uid=?",(1 if value else 0,uid)).rowcount:raise KeyError(uid)
            return self.public(c.execute("SELECT * FROM entries WHERE uid=?",(uid,)).fetchone())
    def redact(self,uid,replacement="[redacted]"):
        with self.db() as c:
            if not c.execute("SELECT 1 FROM entries WHERE uid=?",(uid,)).fetchone():raise KeyError(uid)
            c.execute("UPDATE entries SET body=?,kind='redacted',topic_key=NULL,value=NULL,pinned=0,context_json='{}',redacted_at=? WHERE uid=?",(replacement or "[redacted]",now(),uid))
        self.vacuum();return self.get(uid)
    def delete(self,uid):
        with self.db() as c:
            if not c.execute("SELECT 1 FROM entries WHERE uid=?",(uid,)).fetchone():raise KeyError(uid)
            c.execute("UPDATE entries SET body=NULL,kind='deleted',topic_key=NULL,value=NULL,channel='[deleted]',pinned=0,context_json='{}',deleted_at=? WHERE uid=?",(now(),uid))
        self.vacuum();return self.get(uid)
    def vacuum(self):
        c=self.connect();c.execute("VACUUM");c.close()
    def get(self,uid):
        with self.db() as c:r=c.execute("SELECT * FROM entries WHERE uid=?",(uid,)).fetchone();return self.public(r) if r else None
    def export(self):
        with self.db() as c:rs=c.execute("SELECT * FROM entries ORDER BY created_at,id").fetchall()
        return {"format":"tact-journal/v1","exported_at":now(),"derived_state_included":False,"entries":[self.public(r) for r in rs]}
    def import_file(self,path):
        p=json.loads(Path(path).read_text());
        if p.get("format")!="tact-journal/v1":raise ValueError("unsupported corpus")
        with self.db() as c:
            if c.execute("SELECT COUNT(*) FROM entries").fetchone()[0]:raise ValueError("import target must be empty")
            for x in p["entries"]:
                c.execute("""INSERT INTO entries(uid,created_at,effective_at,channel,body,kind,topic_id,topic_key,value,supersedes_uid,pinned,context_json,redacted_at,deleted_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(x["uid"],x["created_at"],x.get("effective_at",x["created_at"]),x.get("channel") or "inbox",x.get("body"),x.get("kind") or "note",x.get("topic_id"),x.get("topic_key"),x.get("value"),x.get("supersedes_uid"),1 if x.get("pinned") else 0,json.dumps(x.get("context") or {},separators=(",",":")),x.get("redacted_at"),x.get("deleted_at")))
        return len(p["entries"])
    def seed(self):
        if self.entries(limit=1):raise ValueError("seed target must be empty")
        base=datetime(2026,1,10,15,tzinfo=timezone.utc)
        for ch,body,days in [("work","queue := Redis",0),("work","Redis deployment is getting annoying; maybe Postgres",10),("work","queue := Postgres",20),("ideas","Discord-like capture: incomplete thoughts welcome",30),("work","throughput tests point toward managed queues",40),("work","queue := SQS",50),("cars","EV winter charging notes — battery preconditioning helps",60),("cars","automobile cold-weather battery checklist",70)]:
            t=(base+timedelta(days=days)).isoformat(timespec="seconds").replace("+00:00","Z");self.capture(body,ch,created_at=t,effective_at=t)
