#!/usr/bin/env python3
"""One command: test then replay frozen receipts; --collect refreshes read-only evidence."""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parent
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--collect',action='store_true',help='read GitHub via authenticated gh; resumable private cache')
p.add_argument('--retry-metadata-errors',action='store_true')
p.add_argument('--cache',type=Path,default=ROOT/'.private')
p.add_argument('--output',type=Path,default=ROOT/'results')
a=p.parse_args()
subprocess.run([sys.executable,'-m','unittest','discover','-s',str(ROOT),'-p','test_*.py'],check=True)
command=[sys.executable,str(ROOT/'report.py'),'--output',str(a.output)]
if a.collect:
    subprocess.run([sys.executable,str(ROOT/'collect.py'),'--cache',str(a.cache)] + (['--retry-metadata-errors'] if a.retry_metadata_errors else []),check=True)
    command+=['--sanitize','--input',str(a.cache/'collection.json')]
subprocess.run(command,check=True)
