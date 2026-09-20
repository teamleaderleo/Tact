"""Read a bounded surface.catalog from one explicitly selected CMUX Unix socket."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import socket
import time
import uuid

from current import derive, render

MAX_BYTES = 2_000_000
SIDECAR_FIELDS = {"sidebar_observed_at", "sidebar_workspaces", "facts"}


def read_json(path):
    with Path(path).open("rb") as handle:
        data = handle.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("input exceeds 2 MB; collect a narrower owner snapshot")
    return json.loads(data)


def collect(socket_path, timeout=10.0, max_bytes=MAX_BYTES, sidecar=None):
    """Capture one framed v2 result without retries, refresh, or owner discovery.

    Optional sidecar metadata is explicitly supplied from public owners. Its
    original observation times are preserved; the collector cannot refresh it.
    The socket and sidecar are separate observations, never an atomic snapshot.
    """
    if not 0 < timeout <= 60:
        raise ValueError("timeout must be greater than 0 and at most 60 seconds")
    if not 1 <= max_bytes <= MAX_BYTES:
        raise ValueError("max_bytes must be 1..2000000")
    if sidecar is not None:
        if not isinstance(sidecar, dict) or set(sidecar) - SIDECAR_FIELDS:
            raise ValueError("sidecar permits only sidebar_observed_at, sidebar_workspaces, and facts")
        if sidecar.get("sidebar_workspaces") is not None and not isinstance(sidecar["sidebar_workspaces"], list):
            raise ValueError("sidebar_workspaces must be a list")
        if sidecar.get("facts") is not None and not isinstance(sidecar["facts"], list):
            raise ValueError("facts must be a list")
    request_id = str(uuid.uuid4())
    request = {"id": request_id, "method": "surface.catalog", "params": {"refresh": False}}
    started = datetime.now(timezone.utc).isoformat()
    deadline = time.monotonic() + timeout

    def remaining():
        value = deadline - time.monotonic()
        if value <= 0:
            raise TimeoutError("catalog collection exceeded total deadline")
        return value

    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
        connection.settimeout(remaining())
        connection.connect(str(socket_path))
        connection.settimeout(remaining())
        connection.sendall(json.dumps(request).encode("utf-8") + b"\n")
        data = bytearray()
        while b"\n" not in data:
            connection.settimeout(remaining())
            chunk = connection.recv(min(65536, max_bytes + 1 - len(data)))
            if not chunk:
                raise ValueError("catalog response ended before newline frame")
            data.extend(chunk)
            if len(data) > max_bytes:
                raise ValueError("catalog response exceeds byte limit")
        line, remainder = bytes(data).split(b"\n", 1)
        if remainder.strip():
            raise ValueError("unexpected data after catalog response frame")
    try:
        response = json.loads(line)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError("catalog response is not v2 JSON") from error
    if not isinstance(response, dict) or response.get("id") != request_id:
        raise ValueError("catalog response request id mismatch")
    if response.get("ok") is not True:
        code = response.get("error", {}).get("code", "unknown") if isinstance(response.get("error"), dict) else "unknown"
        raise ValueError(f"catalog request rejected ({code})")
    catalog = response.get("result")
    if not isinstance(catalog, dict) or not isinstance(catalog.get("resources"), list) or not isinstance(catalog.get("machines"), list):
        raise ValueError("catalog result requires resource and machine arrays")
    envelope = {"observed_at": datetime.now(timezone.utc).isoformat(), "catalog": catalog,
                "collection": {"method": "surface.catalog", "request_id": request_id,
                               "started_at": started, "refresh": False,
                               "sidecar_is_separate_observation": sidecar is not None}}
    envelope.update(sidecar or {})
    return envelope


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--socket", required=True, type=Path, help="Exact socket; no environment/default discovery")
    parser.add_argument("--sidecar", type=Path, help="Explicit public-owner metadata envelope")
    parser.add_argument("--timeout", type=float, default=10.0)
    parser.add_argument("--max-bytes", type=int, default=MAX_BYTES)
    parser.add_argument("--limit", type=int, default=100)
    output = parser.add_mutually_exclusive_group()
    output.add_argument("--json", action="store_true", help="Emit current-work projection")
    output.add_argument("--envelope", action="store_true", help="Emit capture for explicit replay/storage")
    args = parser.parse_args()
    try:
        if not 1 <= args.limit <= 200:
            raise ValueError("limit must be 1..200")
        envelope = collect(args.socket, args.timeout, args.max_bytes,
                           read_json(args.sidecar) if args.sidecar else None)
        payload = derive(envelope, datetime.now(timezone.utc), args.limit)
        print(json.dumps(envelope if args.envelope else payload, indent=2) if args.json or args.envelope else render(payload))
    except (OSError, ValueError) as error:
        parser.exit(1, f"current collector: {error}\n")
