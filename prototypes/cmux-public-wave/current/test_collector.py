from contextlib import contextmanager
import json
from pathlib import Path
import socket
import tempfile
import threading
import time
import unittest

from collector import collect
from current import derive, instant


@contextmanager
def fake_socket(respond):
    # A short path fits Darwin's sockaddr_un limit even in long test workspaces.
    with tempfile.TemporaryDirectory(prefix="cw-", dir="/tmp") as directory:
        path = Path(directory) / "s"
        server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        server.bind(str(path))
        server.listen(1)
        server.settimeout(1)
        requests, failures = [], []

        def serve():
            try:
                connection, _ = server.accept()
                with connection:
                    connection.settimeout(1)
                    frame = bytearray()
                    while b"\n" not in frame:
                        chunk = connection.recv(4096)
                        if not chunk:
                            raise AssertionError("collector omitted newline request framing")
                        frame.extend(chunk)
                    request = json.loads(frame.split(b"\n", 1)[0])
                    requests.append(request)
                    respond(connection, request)
            except (BrokenPipeError, ConnectionResetError):
                pass  # Expected when the bounded collector rejects a response.
            except Exception as error:
                failures.append(error)

        thread = threading.Thread(target=serve)
        thread.start()
        try:
            yield path, requests
        finally:
            thread.join(timeout=2)
            server.close()
            if thread.is_alive():
                raise AssertionError("fake socket did not terminate")
            if failures:
                raise failures[0]


def reply(connection, request, **overrides):
    response = {"id": request["id"], "ok": True, "result": {"machines": [], "resources": [], "projections": []}}
    response.update(overrides)
    connection.sendall(json.dumps(response).encode() + b"\n")


class CollectorTests(unittest.TestCase):
    def test_exact_framed_read_without_refresh(self):
        with fake_socket(reply) as (path, requests):
            envelope = collect(path)
        self.assertEqual(len(requests), 1)
        self.assertEqual(requests[0]["method"], "surface.catalog")
        self.assertEqual(requests[0]["params"], {"refresh": False})
        self.assertEqual(envelope["collection"]["request_id"], requests[0]["id"])
        self.assertEqual(derive(envelope, instant(envelope["observed_at"]))["items"], [])

    def test_fragmented_frame(self):
        def fragmented(connection, request):
            response = json.dumps({"id": request["id"], "ok": True, "result": {"machines": [], "resources": []}}).encode() + b"\n"
            for byte in response:
                connection.sendall(bytes([byte]))
        with fake_socket(fragmented) as (path, _):
            self.assertEqual(collect(path)["catalog"]["resources"], [])

    def test_wrong_id_and_error_and_missing_result_rejected(self):
        for overrides, message in [({"id": "wrong"}, "id mismatch"),
                                   ({"ok": False, "error": {"code": "rate_limited"}}, "rate_limited"),
                                   ({"result": {}}, "requires resource")]:
            with self.subTest(overrides=overrides):
                with fake_socket(lambda c, r: reply(c, r, **overrides)) as (path, requests):
                    with self.assertRaisesRegex(ValueError, message):
                        collect(path)
                self.assertEqual(len(requests), 1)

    def test_plain_text_and_unterminated_response_rejected(self):
        for data, message in [(b"ERROR: Access denied\n", "not v2 JSON"), (b"{}", "before newline")]:
            with fake_socket(lambda c, r: c.sendall(data)) as (path, _):
                with self.assertRaisesRegex(ValueError, message):
                    collect(path)

    def test_byte_bound(self):
        with fake_socket(lambda c, r: c.sendall(b"x" * 65)) as (path, _):
            with self.assertRaisesRegex(ValueError, "byte limit"):
                collect(path, max_bytes=64)

    def test_one_total_deadline_even_when_bytes_keep_arriving(self):
        def trickle(connection, request):
            for _ in range(20):
                connection.sendall(b" ")
                threading.Event().wait(0.02)
        with fake_socket(trickle) as (path, _):
            start = time.monotonic()
            with self.assertRaises(TimeoutError):
                collect(path, timeout=0.08)
            self.assertLess(time.monotonic() - start, 0.3)

    def test_explicit_sidecar_preserves_separate_observation(self):
        sidecar = {"sidebar_observed_at": "2020-01-01T00:00:00Z", "sidebar_workspaces": [], "facts": []}
        with fake_socket(reply) as (path, _):
            envelope = collect(path, sidecar=sidecar)
        self.assertEqual(envelope["sidebar_observed_at"], sidecar["sidebar_observed_at"])
        self.assertTrue(envelope["collection"]["sidecar_is_separate_observation"])
        self.assertNotEqual(envelope["observed_at"], sidecar["sidebar_observed_at"])

    def test_sidecar_cannot_replace_catalog_or_observation(self):
        for sidecar in [{"catalog": {}}, {"observed_at": "2027-01-01T00:00:00Z"}, {"transcripts": []}]:
            with self.assertRaisesRegex(ValueError, "sidecar permits only"):
                collect("/never-connect", sidecar=sidecar)


if __name__ == "__main__":
    unittest.main()
