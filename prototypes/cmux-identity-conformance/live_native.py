#!/usr/bin/env python3
"""Exercise an existing tagged native CMUX using only owned disposable workspaces.

With --wait-for-reopen, invoke History > Reopen Last Closed once when prompted.
The runner never restarts the app, touches other workspaces, or starts an agent.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import socket
import time
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--socket", required=True)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--wait-for-reopen", action="store_true")
    args = parser.parse_args()
    if not Path(args.socket).name.startswith("cmux-debug-"):
        parser.error("Use an explicitly selected tagged debug socket")
    owned = []
    checks = []
    run_id = uuid.uuid4().hex[:10]
    recovery_path = args.receipt.with_suffix(".recovery.json")
    receipt = {"version": 1, "observed_at": datetime.now(timezone.utc).isoformat(),
               "kind": "live-native-socket", "checks": checks,
               "scope": "disposable terminals and about:blank native browser; no app/daemon restart"}

    def rpc(method, params=None, fail=True):
        request_id = uuid.uuid4().hex
        with socket.socket(socket.AF_UNIX) as client:
            client.settimeout(10)
            client.connect(args.socket)
            client.sendall(json.dumps({"id": request_id, "method": method,
                                       "params": params or {}}).encode() + b"\n")
            data = b""
            while b"\n" not in data:
                chunk = client.recv(65536)
                if not chunk:
                    raise RuntimeError(f"{method}: connection ended without response")
                data += chunk
                if len(data) > 8 * 1024 * 1024:
                    raise RuntimeError("response exceeds bounded read limit")
        response = json.loads(data.split(b"\n", 1)[0])
        assert response.get("id") == request_id
        if fail and not response.get("ok"):
            raise RuntimeError(f"{method}: {response.get('error', {}).get('code', 'failed')}")
        return response.get("result", {}) if fail else response

    def check(name, condition):
        checks.append({"case": name, "passed": bool(condition)})
        if not condition:
            raise AssertionError(name)
        print(f"PASS {name}", flush=True)

    def rows(workspace):
        return rpc("surface.list", {"workspace_id": workspace})["surfaces"]

    def catalog_row(surface):
        # Only owned IDs are returned or retained; unrelated catalog data is discarded.
        catalog = rpc("surface.catalog", {"machine": "local", "refresh": False})
        resources = [r for r in catalog["resources"] if r["key"] == surface]
        projections = [p for p in catalog["projections"] if p["panel_id"] == surface]
        return resources, projections

    try:
        check("tagged socket responds", rpc("system.ping")["pong"])
        for suffix in ("source", "destination"):
            created = rpc("workspace.create", {"title": f"identity81-{run_id}-{suffix}",
                                                "working_directory": "/tmp", "focus": False})
            owned.append(created["workspace_id"])
            args.receipt.parent.mkdir(parents=True, exist_ok=True)
            # Local recovery only; never commit this file or unrelated app state.
            recovery_path.write_text(json.dumps({"socket": args.socket, "owned_workspaces": owned}) + "\n")
        source, destination = owned
        terminal = rows(source)[0]["id"]
        sibling = rpc("surface.create", {"workspace_id": source, "type": "terminal", "focus": False})["surface_id"]
        for surface in (terminal, sibling):
            rpc("surface.action", {"workspace_id": source, "surface_id": surface,
                                   "action": "rename", "title": "identity81 duplicate"})
        duplicate_rows = [r for r in rows(source) if r["title"] == "identity81 duplicate"]
        check("duplicate titles retain distinct surface IDs", len(duplicate_rows) == 2 and
              len({r["id"] for r in duplicate_rows}) == 2)
        before, _ = catalog_row(terminal)
        check("local catalog resource joins current panel", len(before) == 1 and
              before[0]["id"] == f"local/terminal/{terminal}")
        rpc("surface.move", {"surface_id": terminal, "workspace_id": destination, "focus": False})
        moved, projections = catalog_row(terminal)
        check("movement preserves resource and changes projection", moved[0]["id"] == before[0]["id"] and
              len(projections) == 1 and projections[0]["workspace_id"] == destination and
              all(r["id"] != terminal for r in rows(source)))
        browser = rpc("surface.create", {"workspace_id": source, "type": "browser",
                                         "url": "about:blank", "focus": False})["surface_id"]
        browser_before, _ = catalog_row(browser)
        rpc("surface.move", {"surface_id": browser, "workspace_id": destination, "focus": False})
        browser_after, browser_projection = catalog_row(browser)
        check("native browser movement preserves resource", browser_before[0]["id"] == browser_after[0]["id"] and
              browser_projection[0]["workspace_id"] == destination)
        rpc("surface.close", {"workspace_id": destination, "surface_id": browser})
        check("native browser close removes local resource", catalog_row(browser) == ([], []))

        restore_title = f"identity81-restore-{run_id}"
        rpc("surface.action", {"workspace_id": destination, "surface_id": terminal,
                               "action": "rename", "title": restore_title})
        rpc("surface.close", {"workspace_id": destination, "surface_id": terminal})
        check("terminal close removes local resource", catalog_row(terminal) == ([], []))
        stale = rpc("surface.project", {"resource": before[0]["id"],
                                         "workspace_id": destination, "focus": False}, fail=False)
        check("closed resource reference is rejected", not stale.get("ok"))
        receipt["stale_reference_error"] = stale.get("error", {}).get("code")
        if args.wait_for_reopen:
            recovery_path.write_text(json.dumps({"socket": args.socket,
                "owned_workspaces": owned, "restore_title": restore_title,
                "restore_workspace": destination}) + "\n")
            print(f"REOPEN_READY {restore_title}: invoke History > Reopen Last Closed once", flush=True)
            deadline = time.monotonic() + 180
            restored = []
            while time.monotonic() < deadline:
                restored = [r for r in rows(destination) if r["title"] == restore_title]
                if restored:
                    break
                time.sleep(10)
            check("native close-history restores exact test terminal", len(restored) == 1)
            current = restored[0]["id"]
            # The owner may reuse the old panel UUID when it is available. A new
            # process does not require a new panel ID; observe rather than invent
            # that lifetime guarantee.
            receipt["restore_reused_panel_id"] = current == terminal
            current_rows, _ = catalog_row(current)
            check("restored terminal reacquires a catalog binding", len(current_rows) == 1)
            receipt["catalog_exposes_stable_identity"] = any(
                "stable" in key.lower() for key in current_rows[0])
        receipt["result"] = "passed"
    except Exception as error:
        receipt["result"] = "failed"
        receipt["failure_type"] = type(error).__name__
        raise
    finally:
        cleanup = []
        for workspace in reversed(owned):
            try:
                cleanup.append(bool(rpc("workspace.close", {"workspace_id": workspace}, fail=False).get("ok")))
            except Exception:
                cleanup.append(False)
        receipt["owned_workspaces_removed"] = all(cleanup) and len(cleanup) == len(owned)
        args.receipt.parent.mkdir(parents=True, exist_ok=True)
        args.receipt.write_text(json.dumps(receipt, indent=2) + "\n")
        print(f"Receipt: {args.receipt}", flush=True)
        if not receipt["owned_workspaces_removed"]:
            raise RuntimeError(f"Owned workspace cleanup incomplete; exact IDs in {recovery_path}")
        recovery_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
