#!/usr/bin/env python3
"""Run each independent lane's tests without import-name collisions or app effects."""
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent

if __name__ == "__main__":
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
    failures = []
    for lane in ("identity", "current", "templates", "obligations", "execution", "packs"):
        result = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", str(ROOT / lane),
                                 "-p", "test_*.py", "-v"], env=env)
        if result.returncode:
            failures.append(lane)
    print("Failed lanes: " + ", ".join(failures) if failures else "All six lane suites passed.")
    sys.exit(bool(failures))
