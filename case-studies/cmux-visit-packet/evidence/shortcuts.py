#!/usr/bin/env python3
"""Extract cmux's default shortcut table and report collisions and modifier depth.

Read-only. Parses Swift source text; executes nothing.

Usage:
    python3 shortcuts.py [path-to-cmux-checkout]

Produces the numbers quoted in ../shortcut-namespace.md.
"""
import collections
import re
import sys
from pathlib import Path

DEFAULTS = (
    "Packages/macOS/CmuxSettings/Sources/CmuxSettings/Values/ShortcutAction+Defaults.swift"
)
MODIFIERS = [("command", "cmd"), ("control", "ctrl"), ("option", "opt"), ("shift", "shift")]


def chords(root: Path):
    src = (root / DEFAULTS).read_text(encoding="utf-8")
    out = []
    for action, args in re.findall(r"case \.(\w+):\s*return ShortcutStroke\(([^)]*)\)", src):
        key = re.search(r'key:\s*"([^"]+)"', args)
        if not key:
            continue
        mods = [label for swift, label in MODIFIERS if re.search(rf"{swift}:\s*true", args)]
        out.append((action, key.group(1), tuple(mods)))
    return out


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/Users/leoli/Projects/cmux")
    table = chords(root)
    if not table:
        sys.exit(f"no chords parsed; is {root} a cmux checkout?")

    by_chord = collections.defaultdict(list)
    by_key = collections.defaultdict(list)
    for action, key, mods in table:
        by_chord["+".join(list(mods) + [key])].append(action)
        by_key[key].append((action, mods))

    collisions = {c: a for c, a in by_chord.items() if len(a) > 1}
    print(f"default chords declared : {len(table)}")
    print(f"distinct keys used      : {len(by_key)}")
    print(f"distinct chords         : {len(by_chord)}")
    print(f"chords with >1 action   : {len(collisions)} "
          f"(covering {sum(len(a) for a in collisions.values())} actions)")

    print("\n## chords bound to more than one action")
    for chord, actions in sorted(collisions.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        print(f"  {chord:18} {', '.join(sorted(actions))}")

    print("\n## modifier depth across distinct chords")
    depth = collections.Counter(c.count("+") for c in by_chord)
    for d in sorted(depth):
        print(f"  {d} modifier(s): {depth[d]:3d}")

    print("\n## keys carrying the most actions")
    for key, uses in sorted(by_key.items(), key=lambda kv: -len(kv[1]))[:5]:
        print(f"  {key!r} — {len(uses)} actions")
        for action, mods in sorted(uses, key=lambda x: len(x[1])):
            print(f"      {'+'.join(mods) or '(none)':22} {action}")


if __name__ == "__main__":
    main()
