#!/usr/bin/env python3
"""Experimental local settings-pack transaction; never selects the user's profile."""
from __future__ import annotations

import argparse
import base64
import contextlib
import copy
import difflib
import fcntl
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile

BASE = "ad34966d0641efcacc436ecd264fda9105285c49"
HELPER = "skills/cmux-settings/scripts/cmux-settings"


class Conflict(ValueError):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest() if raw is not None else None


def read(path):
    if path.is_symlink():
        raise Conflict("symlink targets are outside this prototype")
    return path.read_bytes() if path.exists() else None


def write(path, raw):
    """Atomic receipt/byte-exact undo; config application uses the upstream helper."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as f:
        tmp = Path(f.name)
        f.write(raw)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


class Owner:
    def __init__(self, repo):
        def source(path):
            return subprocess.check_output(["git", "-C", str(repo), "show", f"{BASE}:{path}"]).decode()
        # This is the trusted, pinned public CMUX helper, not pack-supplied code.
        self.ns = {"__name__": "cmux_pack_settings_owner", "__file__": str(Path(repo) / HELPER)}
        exec(compile(source(HELPER), HELPER, "exec"), self.ns)
        self.schema = json.loads(source("web/data/cmux.schema.json"))
        paths = source("skills/cmux-settings/references/all-keys.md")
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "references/all-keys.md"
            p.parent.mkdir()
            p.write_text(paths)
            supported = self.ns["supported_paths_from_reference"](Path(td))
        if not supported:
            raise ValueError("pinned owner has no supported settings paths")
        self.ns["supported_paths"] = lambda: supported

    def load(self, raw):
        if raw is None:
            return {"$schema": self.ns["SCHEMA_URL"], "schemaVersion": 1}
        value = json.loads(self.ns["strip_jsonc"](raw.decode()))
        if not isinstance(value, dict):
            raise ValueError("config must be an object")
        return value

    def validate(self, data):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "cmux.json"
            self.ns["atomic_write"](p, data)
            with contextlib.redirect_stdout(io.StringIO()):
                if self.ns["cmd_validate"](argparse.Namespace(file=str(p))) != 0:
                    raise ValueError("upstream settings validator rejected the config")

    def proposed(self, raw, manifest):
        if set(manifest) != {"schema", "id", "version", "description", "settings"} or manifest["schema"] != 1:
            raise ValueError("unsupported pack manifest")
        for name in ("id", "version", "description"):
            if not isinstance(manifest[name], str) or not manifest[name]:
                raise ValueError(f"missing pack {name}")
        changes = manifest["settings"]
        if not isinstance(changes, dict) or not 1 <= len(changes) <= 12:
            raise ValueError("pack must contain 1..12 settings")
        data = copy.deepcopy(self.load(raw))
        for key, value in sorted(changes.items()):
            parts = key.split(".")
            # Deliberately one proven owner/scope, no execution or security knobs.
            if len(parts) != 2 or parts[0] != "sidebar":
                raise ValueError("v1 only supports boolean sidebar settings")
            leaf = self.schema["properties"]["sidebar"]["properties"].get(parts[1], {})
            if leaf.get("type") != "boolean" or type(value) is not bool:
                raise ValueError(f"unsupported setting/value: {key}")
            self.ns["set_at"](data, parts, value)
        self.validate(data)
        return data


def encoded(data):
    return (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode()


def preview(owner, target, manifest):
    target = Path(os.path.abspath(target))
    before = read(target)
    proposed = owner.proposed(before, manifest)
    after = encoded(proposed)
    return {
        "schema": 1, "source_sha": BASE, "target": str(target), "pack": manifest,
        "before": base64.b64encode(before).decode() if before is not None else None,
        "before_sha256": digest(before), "after_sha256": digest(after),
        "diff": "".join(difflib.unified_diff((before or b"").decode().splitlines(True),
                                           after.decode().splitlines(True),
                                           fromfile="cmux.json (before)", tofile="cmux.json (proposed)")),
        "verification_scope": "config owner readback; native UI reload unverified",
    }


def lock(target):
    # Serializes cooperating installers; cannot lock out editors/native writers.
    target.parent.mkdir(parents=True, exist_ok=True)
    return open(target.parent / ".cmux-pack.lock", "a+")


def apply(owner, plan, receipt):
    target = Path(plan["target"])
    receipt = Path(receipt)
    if receipt.resolve() in {target.resolve(), (target.parent / ".cmux-pack.lock").resolve()} or receipt.exists():
        raise Conflict("receipt must be a new path distinct from config")
    with lock(target) as guard:
        fcntl.flock(guard, fcntl.LOCK_EX)
        # Re-derive exact preview from current bytes; stale/tampered plans fail closed.
        actual = preview(owner, target, plan["pack"])
        if actual != plan:
            raise Conflict("preview changed; inspect and preview again")
        record = {"plan": plan, "state": "prepared"}
        write(receipt, encoded(record))
        owner.ns["atomic_write"](target, owner.proposed(read(target), plan["pack"]))
        if digest(read(target)) != plan["after_sha256"]:
            raise Conflict("verification failed; prepared receipt retained for recovery")
        owner.validate(owner.load(read(target)))
        record["state"] = "verified"
        write(receipt, encoded(record))
        return record


def rollback(receipt):
    receipt = Path(receipt)
    record = json.loads(receipt.read_text())
    plan = record["plan"]
    target = Path(plan["target"])
    if record["state"] == "rolled_back":
        raise Conflict("receipt already rolled back")
    before = base64.b64decode(plan["before"], validate=True) if plan["before"] is not None else None
    if digest(before) != plan["before_sha256"]:
        raise Conflict("receipt prior bytes are corrupt")
    with lock(target) as guard:
        fcntl.flock(guard, fcntl.LOCK_EX)
        current = digest(read(target))
        if current not in (plan["after_sha256"], plan["before_sha256"]):
            raise Conflict("config changed after install; refusing destructive rollback")
        if before is None:
            target.unlink(missing_ok=True)
        else:
            write(target, before)
        if read(target) != before:
            raise Conflict("rollback verification failed")
        record["state"] = "rolled_back"
        write(receipt, encoded(record))
        return record


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--cmux-repo", type=Path, required=True)
    sub = p.add_subparsers(dest="op", required=True)
    inspect = sub.add_parser("inspect")
    inspect.add_argument("manifest", type=Path)
    pre = sub.add_parser("preview")
    pre.add_argument("manifest", type=Path)
    pre.add_argument("--profile", type=Path, required=True)
    pre.add_argument("--plan", type=Path, required=True)
    app = sub.add_parser("apply")
    app.add_argument("plan", type=Path)
    app.add_argument("--receipt", type=Path, required=True)
    undo = sub.add_parser("rollback", aliases=["uninstall"])
    undo.add_argument("receipt", type=Path)
    args = p.parse_args()
    owner = Owner(args.cmux_repo)
    if args.op == "inspect":
        manifest = json.loads(args.manifest.read_text())
        owner.proposed(None, manifest)
        print(json.dumps({"manifest": manifest, "owner": HELPER, "scope": "global profile sidebar preferences"}, indent=2))
    elif args.op == "preview":
        target = args.profile / "cmux.json"
        if args.plan.resolve() in {target.resolve(), (target.parent / ".cmux-pack.lock").resolve()} or args.plan.exists():
            raise Conflict("plan must be a new path distinct from config")
        plan = preview(owner, target, json.loads(args.manifest.read_text()))
        write(args.plan, encoded(plan))
        print(plan["diff"], end="")
    elif args.op == "apply":
        print(json.dumps(apply(owner, json.loads(args.plan.read_text()), args.receipt), indent=2))
    else:
        print(json.dumps(rollback(args.receipt), indent=2))


if __name__ == "__main__":
    main()
