#!/usr/bin/env python3
"""Execute pinned owners, without checking out, changing, or launching them."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parent


def command(args, cwd=None):
    result = subprocess.run(args, cwd=cwd, text=True, capture_output=True, timeout=120)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed ({result.returncode}):\n"
                           f"{result.stdout[-4000:]}{result.stderr[-4000:]}")
    return result.stdout


def materialize(root, destination):
    """Read immutable Git objects; dirty files and checked-out branches are irrelevant."""
    manifest = json.loads((HERE / "sources.json").read_text())
    for name, source in manifest["repositories"].items():
        for path, digest in source["files"].items():
            result = subprocess.run(
                ["git", "-C", str(root / name), "show", f'{source["revision"]}:{path}'],
                capture_output=True, timeout=30)
            if result.returncode:
                raise RuntimeError(f"Missing {name} {source['revision']}:{path}; "
                                   "fetch the pinned commit into that repository first.")
            if hashlib.sha256(result.stdout).hexdigest() != digest:
                raise RuntimeError(f"Source digest mismatch: {name}/{path}")
            target = destination / name / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(result.stdout)


def between(text, start, end):
    if text.count(start) != 1 or text.count(end) != 1:
        raise ValueError("Production extraction anchors changed")
    return text.split(start, 1)[1].split(end, 1)[0]


def main():
    sys.dont_write_bytecode = True
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources-root", type=Path, required=True,
                        help="directory containing cmux, cmux-browser, and elatura Git repositories")
    parser.add_argument("--typescript", type=Path,
                        help="tsc executable; defaults to elatura/node_modules/.bin/tsc")
    args = parser.parse_args()
    # Keep build trees in this project, and remove them even on test failure.
    scratch = HERE.parents[1] / ".local"
    scratch.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="identity-81-", dir=scratch) as temporary:
        build = Path(temporary)
        materialize(args.sources_root.resolve(), build)
        import test_conformance
        test_conformance.BUILD = build
        test_conformance.TYPESCRIPT = (args.typescript or
            args.sources_root / "elatura/node_modules/.bin/tsc").absolute()
        suite = unittest.defaultTestLoader.loadTestsFromModule(test_conformance)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
