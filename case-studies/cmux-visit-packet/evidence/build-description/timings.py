import sys, json, struct, importlib.util, collections
spec=importlib.util.spec_from_file_location("slf", str(__import__("pathlib").Path(__file__).with_name("slf.py")))
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

MARK='com.apple.dt.IDE.BuildLogSection'
def sections(path):
    toks,_=m.tokenize(path)
    idx=[i for i,(k,v) in enumerate(toks) if k=='s' and v==MARK]
    out=[]
    for n,i in enumerate(idx):
        end=idx[n+1] if n+1<len(idx) else len(toks)
        title = toks[i+1][1] if i+1<len(toks) and toks[i+1][0]=='s' else ''
        sig   = toks[i+2][1] if i+2<len(toks) and toks[i+2][0]=='s' else ''
        # start/stop doubles stored big-endian
        def dbl(j):
            if j<len(toks) and toks[j][0]=='d':
                raw=struct.pack('<d', toks[j][1])
                return struct.unpack('>d', raw)[0]
            return None
        t0,t1=dbl(i+3),dbl(i+4)
        wc=None
        for j in range(i,end):
            if toks[j][0]=='blob':
                try:
                    o=json.loads(toks[j][1])
                    if 'wcDuration' in o: wc=o['wcDuration']/1e6; break
                except Exception: pass
        dur = wc
        if dur is None and t0 and t1 and t1>t0: dur=t1-t0
        out.append({'title':title,'sig':sig,'wc':wc,'t0':t0,'t1':t1,'dur':dur or 0.0})
    return out

if __name__=='__main__':
    secs=sections(sys.argv[1])
    print(f"sections: {len(secs)}  with TaskMetrics: {sum(1 for s in secs if s['wc'] is not None)}")
    ts=[s['t0'] for s in secs if s['t0'] and 1e9<s['t0']<2e10]
    if ts: print(f"wallclock span from section timestamps: {max(s['t1'] for s in secs if s['t1'] and 1e9<s['t1']<2e10)-min(ts):.1f}s")
    tot=sum(s['dur'] for s in secs)
    print(f"sum of section durations (may overlap / parallel): {tot:.1f}s\n")
    # group by tool (first word of signature)
    g=collections.Counter(); c=collections.Counter()
    for s in secs:
        tool=s['sig'].split(' ',1)[0] or '(none)'
        g[tool]+=s['dur']; c[tool]+=1
    print(f"{'TOOL':38s} {'COUNT':>6s} {'SUM_SEC':>9s}")
    for k,v in g.most_common(30): print(f"{k[:38]:38s} {c[k]:6d} {v:9.2f}")
    print(f"\n=== TOP 35 INDIVIDUAL STEPS ===")
    print(f"{'SEC':>8s}  TITLE")
    for s in sorted(secs,key=lambda x:-x['dur'])[:35]:
        print(f"{s['dur']:8.2f}  {s['title'][:120]}")
