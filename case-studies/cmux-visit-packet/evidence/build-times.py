#!/usr/bin/env python3
"""Summarise cmux native build durations from Glaeda's on-disk run receipts.

Reads `.glaeda/apple-build/run-*.log` in a cmux checkout and reports the
distribution of wall-clock build times. Read-only.

Usage:
    python3 build-times.py [path-to-cmux-checkout]

Produces the numbers quoted in ../build-loop.md.
"""
import glob
import os
import re
import statistics
import sys
from pathlib import Path

DURATION = re.compile(r"reload succeeded in (\d+)s")


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/Users/leoli/Projects/cmux")
    receipts = root / ".glaeda/apple-build"
    if not receipts.is_dir():
        sys.exit(f"no Glaeda receipts at {receipts}")

    runs = []
    for path in glob.glob(str(receipts / "run-*.log")):
        match = DURATION.search(Path(path).read_text(errors="replace"))
        if match:
            runs.append((os.path.getmtime(path), int(match.group(1)), Path(path).name))
    runs.sort()
    if not runs:
        sys.exit("no runs with a recorded duration")

    values = [seconds for _, seconds, _ in runs]
    cold = [v for v in values if v > 600]
    warm = [v for v in values if v <= 120]
    middle = [v for v in values if 120 < v <= 600]

    print(f"builds with a recorded duration : {len(values)}")
    print(f"  min {min(values)}s   median {statistics.median(values):.0f}s   max {max(values)}s")
    print()
    print(f"  cold / new cache generation (>600s) : n={len(cold):2d}  {sorted(cold)}")
    if warm:
        print(f"  warm incremental (<=120s)           : n={len(warm):2d}  "
              f"min {min(warm)}s  median {statistics.median(warm):.0f}s  max {max(warm)}s")
    if middle:
        print(f"  dependency / broad change (120-600s): n={len(middle):2d}  "
              f"median {statistics.median(middle):.0f}s")
    if cold and warm:
        print()
        print(f"  cold median : warm median = "
              f"{statistics.median(cold) / statistics.median(warm):.0f}x")
        print(f"  worst cold  : best warm   = {max(cold) / min(warm):.0f}x")


if __name__ == "__main__":
    main()
