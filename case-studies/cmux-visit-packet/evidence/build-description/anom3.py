import re, sys
lines = open(sys.argv[1], encoding='utf-8').read().split('\n')

# index every object definition (single-line or block-opening) by id
ID = re.compile(r'^\t*([0-9A-F]{24}) (?:/\* (.*?) \*/ )?= \{')
defs = {}
for i, ln in enumerate(lines):
    m = ID.match(ln)
    if m:
        defs.setdefault(m.group(1), []).append(i)

dups = {k: v for k, v in defs.items() if len(v) > 1}
print("A1 duplicate object ids:", "NONE" if not dups
      else {k: [lines[i].strip()[:90] for i in v] for k, v in dups.items()})

src = '\n'.join(lines)
children = set()
for m in re.finditer(r'children = \(', src):
    seg = src[m.end(): src.find(');', m.end())]
    children.update(re.findall(r'[0-9A-F]{24}', seg))
roots = set(re.findall(r'(?:mainGroup|productRefGroup) = ([0-9A-F]{24})', src))

def isa_of(i):
    m = re.search(r'isa = (\w+);', lines[i]) or re.search(r'isa = (\w+);', lines[i+1] if i+1 < len(lines) else '')
    return m.group(1) if m else '?'

orphans = [(k, isa_of(v[0]), lines[v[0]].strip()[:70]) for k, v in defs.items()
           if isa_of(v[0]) in ('PBXFileReference','PBXGroup','PBXVariantGroup','XCVersionGroup')
           and k not in children and k not in roots]
print("A2 orphaned refs:", "NONE" if not orphans else sorted(orphans))

print("A3 variant groups:")
found = False
for i, ln in enumerate(lines):
    if 'isa = PBXVariantGroup;' not in ln:
        continue
    found = True
    # walk back to the def line, forward to closing };
    start = i if ID.match(ln) else i - 1
    gid = ID.match(lines[start]).group(1)
    j, body = start, []
    while j < len(lines):
        body.append(lines[j])
        if lines[j].rstrip().endswith('};'):
            break
        j += 1
    blob = '\n'.join(body)
    kids = re.findall(r'[0-9A-F]{24}', re.search(r'children = \((.*?)\);', blob, re.S).group(1))
    print(f"  {gid} {lines[start].strip()[:60]}")
    for k in kids:
        kl = lines[defs[k][0]]
        nm = re.search(r'\bname = "?([^;"]+)"?;', kl)
        pt = re.search(r'\bpath = "?([^;"]+)"?;', kl)
        nm, pt = nm and nm.group(1), pt and pt.group(1)
        print(f"    {k} name={nm!r} path={pt!r} lproj_ok={bool(pt and nm and pt.startswith(nm + '.lproj/'))}")
if not found:
    print("  none")
