#!/usr/bin/env python3
"""Ownership map for cmux Sources/AppDelegate.swift.

Separates production code from `#if DEBUG` regions, sizes every top-level
member, and reports the largest production members and the shape of the
shortcut dispatcher.

Read-only. Parses Swift source text; executes nothing.

Usage:
    python3 appdelegate.py [path-to-cmux-checkout]

Produces the numbers quoted in ../appdelegate-ownership.md.
"""
import collections
import re
import sys
from pathlib import Path

TARGET = "Sources/AppDelegate.swift"

DECL = re.compile(
    r"^(?P<indent>\s{4})(?:(?:@\w+(?:\([^)]*\))?\s+)*)"
    r"(?:(?:private|fileprivate|internal|public|open|final|static|class|override|weak|"
    r"unowned|lazy|nonisolated|convenience|required|dynamic)\s+)*"
    r"(?P<kind>func|var|let|init|deinit|subscript|enum|struct|typealias)\b"
    r"\s*(?P<name>[A-Za-z_][A-Za-z0-9_]*)?"
)

# "Testing" alone matches production names like cmuxEventAllowsFirstResponderHitTesting,
# so match the test-seam suffixes cmux actually uses instead.
TEST_NAME = re.compile(r"UITest|UiTest|uiTest|TestIfNeeded|ForTesting|GuardTesting|testOnly", re.I)


def debug_lines(lines):
    """Line numbers (1-based) that sit inside an `#if DEBUG` region."""
    inside, stack = set(), []
    for number, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("#if"):
            stack.append("debug" if re.match(r"#if\s+DEBUG\b", stripped) else "other")
        elif stripped.startswith("#else"):
            if stack and stack[-1] == "debug":
                stack[-1] = "other"
        elif stripped.startswith("#endif"):
            if stack:
                stack.pop()
        if "debug" in stack:
            inside.add(number)
    return inside


def members(lines):
    found, current = [], None
    for number, line in enumerate(lines, 1):
        match = DECL.match(line)
        if match and match.group("kind"):
            if current:
                current["end"] = number - 1
                found.append(current)
            current = {
                "name": match.group("name") or match.group("kind"),
                "kind": match.group("kind"),
                "start": number,
            }
    if current:
        current["end"] = len(lines)
        found.append(current)
    for member in found:
        member["lines"] = member["end"] - member["start"] + 1
    return found


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/Users/leoli/Projects/cmux")
    lines = (root / TARGET).read_text(encoding="utf-8", errors="replace").splitlines()
    debug = debug_lines(lines)
    found = members(lines)

    for member in found:
        # Gating is decided by the DECLARATION line. A span-overlap fraction
        # misclassifies members whose enclosing `#if DEBUG` starts above them.
        member["gated"] = member["start"] in debug
        span = set(range(member["start"], member["end"] + 1))
        member["debug"] = len(span & debug) / len(span)

    production = [m for m in found if not m["gated"]]
    debugside = [m for m in found if m["gated"]]

    print(f"{TARGET}: {len(lines)} lines, {len(found)} top-level members")
    print(f"  inside #if DEBUG : {len(debug):6d} lines ({100 * len(debug) / len(lines):.1f}%)")
    print(f"  production-side  : {len(production):4d} members, "
          f"{sum(m['lines'] for m in production):6d} lines")
    print(f"  debug-side       : {len(debugside):4d} members, "
          f"{sum(m['lines'] for m in debugside):6d} lines")

    harness = [m for m in found if TEST_NAME.search(m["name"])]
    gated = [m for m in harness if m["gated"]]
    ungated = [m for m in harness if not m["gated"]]
    print("\n## test-harness members (by name)")
    print(f"  total          : {len(harness):4d} members, "
          f"{sum(m['lines'] for m in harness):6d} lines")
    print(f"  DEBUG-gated    : {len(gated):4d} members, "
          f"{sum(m['lines'] for m in gated):6d} lines")
    print(f"  NOT DEBUG-gated: {len(ungated):4d} members, "
          f"{sum(m['lines'] for m in ungated):6d} lines")
    for member in sorted(ungated, key=lambda m: -m["lines"]):
        print(f"      {member['lines']:5d}  L{member['start']:<6} {member['name']}")

    print("\n## largest production-side members")
    for member in sorted(production, key=lambda m: -m["lines"])[:12]:
        print(f"  {member['lines']:5d}  L{member['start']:<6} {member['name']}")

    dispatcher = next((m for m in found if m["name"] == "handleCustomShortcut"), None)
    if dispatcher:
        body = lines[dispatcher["start"] - 1 : dispatcher["end"]]
        text = "\n".join(body)
        branches = [l for l in body if re.match(r"\s*(\} )?else if |\s*if ", l)]
        cases = [l for l in body if re.match(r"\s*case\s", l)]
        actions = re.findall(
            r"matchConfiguredShortcut\(event: event, action: \.(\w+)\)", text
        )
        offset = next((i for i, l in enumerate(body) if "action: .quit)" in l), None)
        print(f"\n## handleCustomShortcut  L{dispatcher['start']}-{dispatcher['end']}")
        print(f"  {dispatcher['lines']} lines, {len(branches)} if/else-if branches, "
              f"{len(cases)} case labels")
        print(f"  {len(actions)} action matches, {len(set(actions))} distinct actions")
        if offset is not None:
            print(f"  ordered-precedence prologue: {offset} lines "
                  f"({100 * offset / len(body):.0f}%)")
            print(f"  action dispatch tail       : {len(body) - offset} lines "
                  f"({100 * (len(body) - offset) / len(body):.0f}%)")


if __name__ == "__main__":
    main()
