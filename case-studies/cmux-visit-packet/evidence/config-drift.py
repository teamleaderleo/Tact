#!/usr/bin/env python3
"""Compare a live cmux.json against the defaults declared in cmux's JSON schema.

Reports which settings a user actually overrode, which they pinned to a value
identical to the default, and which the schema declares no default for.

Read-only.

Usage:
    python3 config-drift.py [cmux-checkout] [cmux.json]

Produces the numbers quoted in ../default-config.md.
"""
import json
import sys
from pathlib import Path

SCHEMA = "web/data/cmux.schema.json"
NO_DEFAULT = object()


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/Users/leoli/Projects/cmux")
    live_path = Path(
        sys.argv[2] if len(sys.argv) > 2 else Path.home() / ".config/cmux/cmux.json"
    )
    schema = json.loads((root / SCHEMA).read_text(encoding="utf-8"))
    live = json.loads(live_path.read_text(encoding="utf-8"))
    defs = schema.get("$defs") or schema.get("definitions") or {}

    def resolve(node, depth=0):
        if depth > 6 or not isinstance(node, dict):
            return node if isinstance(node, dict) else {}
        if "$ref" in node:
            return resolve(defs.get(node["$ref"].split("/")[-1], {}), depth + 1)
        return node

    rows = []

    def walk(node, values, path=""):
        node = resolve(node)
        props = node.get("properties", {})
        for key, value in (values or {}).items():
            if key.startswith("$"):
                continue
            sub = resolve(props.get(key, {}))
            here = f"{path}.{key}" if path else key
            if isinstance(value, dict) and sub.get("properties"):
                walk(sub, value, here)
            else:
                rows.append((here, sub.get("default", NO_DEFAULT), value))

    walk(schema, live)

    scalar = [r for r in rows if not isinstance(r[2], (dict, list))]
    overridden = [r for r in scalar if r[1] is not NO_DEFAULT and r[1] != r[2]]
    pinned = [r for r in scalar if r[1] is not NO_DEFAULT and r[1] == r[2]]
    undeclared = [r for r in scalar if r[1] is NO_DEFAULT]

    print(f"scalar settings present in {live_path}: {len(scalar)}")
    print(f"  overridden (differ from schema default): {len(overridden)}")
    print(f"  pinned     (equal to schema default)   : {len(pinned)}")
    print(f"  no default declared in schema          : {len(undeclared)}")

    print(f"\n{'setting':46} {'cmux default':>18}  {'this config':>22}")
    print("-" * 90)
    for path, default, value in sorted(overridden):
        print(f"{path:46} {str(default):>18}  {str(value):>22}")

    if pinned:
        print("\n## pinned to a value identical to the default")
        for path, _, value in sorted(pinned):
            print(f"  {path:46} = {value}")

    if undeclared:
        print("\n## set here, no default declared in schema")
        for path, _, value in sorted(undeclared):
            print(f"  {path:46} = {value}")


if __name__ == "__main__":
    main()
