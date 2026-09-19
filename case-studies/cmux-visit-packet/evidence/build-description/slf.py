import gzip, struct, sys, collections
HEX=set(b'0123456789abcdefABCDEF')

def tokenize(path):
    d = gzip.open(path,'rb').read()
    assert d[:4]==b'SLF0'
    i=4; n=len(d); toks=[]; types=collections.Counter()
    while i<n:
        j=i
        while j<n and d[j] in HEX: j+=1
        num=d[i:j]; t=d[j:j+1]; i=j+1
        types[t]+=1
        try:
            if t==b'"':
                ln=int(num or b'0',10); s=d[i:i+ln]; i+=ln
                toks.append(('s', s.decode('utf-8','replace')))
            elif t==b'#':
                toks.append(('i', int(num or b'0',10)))
            elif t==b'^':
                v=int(num or b'0',16)
                toks.append(('d', struct.unpack('<d', struct.pack('<Q', v))[0]))
            elif t==b'(':
                toks.append(('arr', int(num or b'0',10)))
            elif t==b'%':
                ln=int(num or b'0',10); s=d[i:i+ln]; i+=ln
                toks.append(('cls', s.decode('utf-8','replace')))
            elif t==b'@':
                toks.append(('ref', int(num or b'0',10)))
            elif t==b'*':
                ln=int(num or b'0',10); s2=d[i:i+ln]; i+=ln
                toks.append(('blob', s2.decode('utf-8','replace')))
            elif t==b'-':
                toks.append(('nil', None))
            else:
                toks.append(('?'+t.decode('latin1'), num.decode('latin1')))
        except Exception as e:
            print('FAIL at byte',i,'num',num[:20],'type',t, 'ctx', d[max(0,i-60):i+60], file=sys.stderr)
            raise
    return toks, types

if __name__=='__main__':
    toks,types = tokenize(sys.argv[1])
    print('ntok',len(toks),'types',{k.decode('latin1'):v for k,v in types.items()})
