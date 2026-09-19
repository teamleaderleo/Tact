import re, sys
src = open(sys.argv[1], encoding='utf-8').read()
sec = re.search(r'/\* Begin PBXVariantGroup section \*/(.*?)/\* End PBXVariantGroup section \*/', src, re.S)
if not sec:
    print("NO PBXVariantGroup section"); sys.exit()
body = sec.group(1)
print(body.strip())
print("--- children resolved ---")
for k in re.findall(r'([0-9A-F]{24})', body):
    dm = re.search(r'^\t*' + k + r'[^\n]*?= \{isa = PBXFileReference;([^\n]*?)\};', src, re.M)
    if dm:
        print(f"  {k}: {dm.group(1).strip()}")
