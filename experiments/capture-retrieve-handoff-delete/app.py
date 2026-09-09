#!/usr/bin/env python3
import argparse,json,re
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs,urlparse
from journal import Journal

class H(BaseHTTPRequestHandler):
    journal=None
    def log_message(self,*a):pass
    def send_json(self,x,status=200):
        b=json.dumps(x,ensure_ascii=False).encode();self.send_response(status);self.send_header("Content-Type","application/json");self.send_header("Content-Length",str(len(b)));self.end_headers();self.wfile.write(b)
    def body(self):return json.loads(self.rfile.read(int(self.headers.get("Content-Length",0))) or b"{}")
    def fail(self,e):self.send_json({"error":str(e)},404 if isinstance(e,KeyError) else 400)
    def do_GET(self):
        u=urlparse(self.path);q={k:v[-1] for k,v in parse_qs(u.query).items()}
        try:
            if u.path=="/":
                b=Path(__file__).with_name("index.html").read_bytes();self.send_response(200);self.send_header("Content-Type","text/html; charset=utf-8");self.send_header("Content-Length",str(len(b)));self.end_headers();self.wfile.write(b);return
            if u.path=="/api/state":return self.send_json({"entries":self.journal.entries(q.get("channel")),"channels":self.journal.channels()})
            if u.path=="/api/retrieve":return self.send_json(self.journal.retrieve(q.get("q",""),q.get("mode","hybrid"),q.get("channel"),q.get("after"),q.get("before"),int(q.get("limit",20))))
            if u.path=="/api/complete":return self.send_json(self.journal.complete(q.get("literal",""),q.get("channel"),q.get("after"),q.get("before"),q.get("kind")))
            if u.path=="/api/current":return self.send_json({"results":self.journal.current(q.get("topic"))})
            if u.path=="/api/export":return self.send_json(self.journal.export())
            self.send_json({"error":"not found"},404)
        except Exception as e:self.fail(e)
    def do_POST(self):
        u=urlparse(self.path)
        try:
            d=self.body()
            if u.path=="/api/entries":return self.send_json(self.journal.capture(d.get("body",""),d.get("channel","inbox")),201)
            m=re.fullmatch(r"/api/entries/([0-9a-f]+)/(pin|correct|redact)",u.path)
            if m:
                uid,action=m.groups();x=self.journal.pin(uid,bool(d.get("pinned",True))) if action=="pin" else self.journal.correct(uid,d.get("replacement","")) if action=="correct" else self.journal.redact(uid,d.get("replacement","[redacted]"));return self.send_json(x)
            self.send_json({"error":"not found"},404)
        except Exception as e:self.fail(e)
    def do_DELETE(self):
        try:
            m=re.fullmatch(r"/api/entries/([0-9a-f]+)",urlparse(self.path).path)
            if not m:return self.send_json({"error":"not found"},404)
            self.send_json(self.journal.delete(m.group(1)))
        except Exception as e:self.fail(e)

def main():
    p=argparse.ArgumentParser();p.add_argument("--db",default="tact-journal.sqlite3");p.add_argument("--port",type=int,default=8787);p.add_argument("--host",default="127.0.0.1");p.add_argument("--seed-demo",action="store_true");p.add_argument("--export");p.add_argument("--import",dest="imp");p.add_argument("--no-serve",action="store_true");a=p.parse_args();j=Journal(a.db)
    if a.imp:print("imported",j.import_file(a.imp))
    if a.seed_demo:j.seed();print("seeded",a.db)
    if a.export:Path(a.export).write_text(json.dumps(j.export(),indent=2));print("exported",a.export)
    if not a.no_serve:
        cls=type("Bound",(H,),{"journal":j});print(f"Tact Journal → http://{a.host}:{a.port}");ThreadingHTTPServer((a.host,a.port),cls).serve_forever()
if __name__=="__main__":main()
