#!/usr/bin/env python3
"""Where did an Xcode build's wall clock go?

usage: buildprofile.py <build.xcactivitylog> [--wall SECONDS] [--window SECONDS] [--cores N]

Reads the per-task metrics Xcode already writes into every build log
(~/Library/Developer/Xcode/DerivedData/<name>/Logs/Build/*.xcactivitylog, or the
-derivedDataPath you passed) and prints what -showBuildTimingSummary cannot: a
parallelism timeline, the serial stretches, the slowest single tasks, and how much
of the machine sat idle. No rebuild and no extra build flags are needed.

A task's log timestamps mark when it FINISHED, so its interval is taken as
[end - duration, end]. Reading them as [start, end] makes every compile look
instantaneous and hides the serial tails completely.
"""
import argparse, collections, importlib.util, os, re, sys
from pathlib import Path

spec = importlib.util.spec_from_file_location("timings", str(Path(__file__).with_name("timings.py")))
timings = importlib.util.module_from_spec(spec); spec.loader.exec_module(timings)


def label(task):
    m = re.search(r"in target '([^']+)'", task["sig"])
    tool = task["sig"].split(" ", 1)[0]
    if tool == "PhaseScriptExecution":
        return task["title"].replace("Run custom shell script ", "script ")
    return f"{m.group(1) if m else '-'}:{tool}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("log")
    ap.add_argument("--wall", type=float, help="measured wall clock; default: span of the task intervals")
    ap.add_argument("--window", type=float, default=0, help="timeline bucket in seconds; default: wall/14")
    ap.add_argument("--cores", type=int, default=os.cpu_count())
    ap.add_argument("--serial-below", type=float, default=2.0, help="parallelism under this counts as serial")
    a = ap.parse_args()

    tasks = [t for t in timings.sections(a.log) if t["wc"] is not None and t["t1"] and t["dur"] > 0]
    if not tasks:
        sys.exit("no tasks with metrics in this log")
    end = max(t["t1"] for t in tasks)
    first = min(t["t1"] - t["dur"] for t in tasks)
    wall = a.wall or (end - first)
    start = end - wall
    iv = [(t["t1"] - t["dur"] - start, t["t1"] - start, t) for t in tasks]
    busy = sum(t["dur"] for t in tasks)
    print(f"wall {wall:.1f} s, {len(tasks)} tasks, {busy:.0f} task-seconds, "
          f"average parallelism {busy / wall:.1f} of {a.cores} cores "
          f"({100 * busy / (wall * a.cores):.0f}% of the machine)")
    if not a.wall:
        print("  (no --wall given: time before the first task, e.g. package resolution, is not counted)")

    win = a.window or max(5.0, round(wall / 14 / 5) * 5)
    print(f"\nTIMELINE ({win:.0f} s buckets): average parallel tasks, then what filled the bucket")
    serial = []
    x = 0.0
    while x < wall:
        c = collections.Counter()
        for s, e, t in iv:
            o = min(e, x + win) - max(s, x)
            if o > 0:
                c[t["title"].replace("Compile ", "")[:34] if t["dur"] >= 0.04 * wall else label(t)] += o
        span = min(win, wall - x)
        par = sum(c.values()) / span
        if par < a.serial_below:
            serial.append((x, span, c))
        bar = "#" * int(round(min(par, a.cores) / a.cores * 20))
        print(f"  {x:5.0f}-{x + span:5.0f} s  {par:5.1f}  {bar:<20}  " + ", ".join(f"{k} {v:.0f}" for k, v in c.most_common(3)))
        x += win

    idle = sum(span for _, span, _ in serial)
    print(f"\nSERIAL STRETCHES (parallelism < {a.serial_below:g}): {idle:.0f} s = {100 * idle / wall:.0f}% of the wall clock")
    merged = collections.Counter()
    for _, _, c in serial:
        merged.update(c)
    for k, v in merged.most_common(6):
        print(f"  {v:6.0f} s  {k}")

    print("\nSLOWEST SINGLE TASKS (each is a floor on the build, however many cores there are)")
    for s, e, t in sorted(iv, key=lambda z: -z[2]["dur"])[:12]:
        print(f"  {t['dur']:6.1f} s  ran {s:5.0f} -> {e:5.0f} s  {t['title'][:80]}")

    by_target = collections.Counter()
    for t in tasks:
        m = re.search(r"in target '([^']+)'", t["sig"])
        by_target[m.group(1) if m else "(no target)"] += t["dur"]
    print("\nTASK-SECONDS BY TARGET")
    for k, v in by_target.most_common(8):
        print(f"  {v:7.0f} s  {100 * v / busy:4.0f}%  {k}")


if __name__ == "__main__":
    main()
