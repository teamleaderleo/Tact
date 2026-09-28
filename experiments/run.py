#!/usr/bin/env python3
"""Small launcher for Tact experiments."""

from __future__ import annotations

import argparse
import subprocess
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SEARCH_ROOTS = (ROOT / "experiments", ROOT / "prototypes")
WORKBENCH_PRIORITY = {
    "warm-field": 2,
    "adversarial-attention-compiler": 3,
    "causal-debugger": 4,
    "capture-retrieve-handoff-delete": 5,
    "microphone-clutch": 6,
    "microcraft": 9,
}
CUSTOM_RUNNERS = {
    "causal-debugger": ["npm", "start"],
    "capture-retrieve-handoff-delete": [sys.executable, "app.py", "--seed-demo"],
}
SERVER_MARKERS = ("app.py", "server.mjs")


def discover_experiments() -> dict[str, Path]:
    found: dict[str, Path] = {}
    for parent in SEARCH_ROOTS:
        if not parent.is_dir():
            continue
        for candidate in sorted(parent.iterdir()):
            if not candidate.is_dir():
                continue
            slug = candidate.name
            is_static = (candidate / "index.html").is_file()
            is_custom = slug in CUSTOM_RUNNERS
            if not is_static and not is_custom:
                continue
            if slug in found:
                first = found[slug].relative_to(ROOT)
                second = candidate.relative_to(ROOT)
                raise SystemExit(f"duplicate experiment slug {slug!r}: {first} and {second}")
            owns_server = any((candidate / marker).is_file() for marker in SERVER_MARKERS)
            if owns_server and not is_custom:
                raise SystemExit(
                    f"{slug}: owns a local server; declare its runner in experiments/run.py "
                    "before exposing it through the workshop launcher"
                )
            found[slug] = candidate
    return dict(
        sorted(
            found.items(),
            key=lambda item: (WORKBENCH_PRIORITY.get(item[0], 999), item[0]),
        )
    )


def list_experiments(experiments: dict[str, Path]) -> None:
    if not experiments:
        print("no executable experiments found")
        return
    for slug, directory in experiments.items():
        priority = WORKBENCH_PRIORITY.get(slug)
        workbench = f"WB {priority}" if priority is not None else "WB ?"
        runtime = "app" if slug in CUSTOM_RUNNERS else "static"
        print(f"{workbench:<5} {slug:<33} {runtime:<6} {directory.relative_to(ROOT)}")


def serve_static(slug: str, directory: Path, port: int | None) -> None:
    # Port 0 asks the OS for a free port, so static experiments can run side by side.
    chosen_port = 0 if port is None else port
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", chosen_port), handler)
    print(f"{slug}: http://127.0.0.1:{server.server_port}")
    print(f"serving {directory.relative_to(ROOT)} — Ctrl-C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        server.server_close()


def run_experiment(slug: str, directory: Path, port: int | None) -> None:
    command = CUSTOM_RUNNERS.get(slug)
    if command is None:
        serve_static(slug, directory, port)
        return
    if port is not None:
        raise SystemExit(f"{slug}: --port applies only to static experiments; see its README")
    print(f"{slug}: {' '.join(command)}")
    try:
        completed = subprocess.run(command, cwd=directory, check=False)
    except FileNotFoundError as exc:
        raise SystemExit(f"{slug}: runtime command unavailable: {exc.filename}") from exc
    except KeyboardInterrupt:
        return
    if completed.returncode:
        raise SystemExit(completed.returncode)


def main() -> None:
    experiments = discover_experiments()

    parser = argparse.ArgumentParser(description="List or run Tact experiments.")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("list", help="list discovered executable experiments")

    run_parser = subparsers.add_parser("run", help="run one experiment")
    run_parser.add_argument("experiment", choices=experiments)
    run_parser.add_argument("--port", type=int, help="bind an explicit localhost port for static experiments")

    args = parser.parse_args()
    if args.command == "list":
        list_experiments(experiments)
    else:
        run_experiment(args.experiment, experiments[args.experiment], args.port)


if __name__ == "__main__":
    main()
