#!/usr/bin/env python3
"""Offline replay and loopback-only, GET-only UI. No execution or GitHub writes."""
import argparse
import gzip
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlparse

from audit import audit
from exports import ci_report_export, verification_export
from model import digest, event_index, project

HERE = Path(__file__).resolve().parent


def load(path):
    raw = gzip.decompress(path.read_bytes()) if path.suffix == '.gz' else path.read_bytes()
    result = json.loads(raw)
    if result.get('schema') != 'tact-attention-facts/v1' or result.get('public') is not True:
        raise ValueError('Expected public tact-attention-facts/v1 observations')
    return result


def frame(facts, exports=()):
    return dict(view=project(facts), audit=audit(facts), events=event_index(facts),
                digest=digest(facts), coverage=facts.get('coverage', {}),
                rules=facts.get('rules'), source_count=len(facts['prs']),
                owner_exports=[verification_export(p, facts) for p in exports])


def sidebar(payload):
    """Static snapshot; regenerating the file uses CMUX's existing hot reload."""
    cards = payload['view']['obligations']
    rows = [f'Text({json.dumps("CMUX attention · frozen replay")}).font("headline")',
            f'Text({json.dumps(payload["view"]["observed_at"])}).secondary().font(10)',
            f'Text({json.dumps(str(len(cards)) + " decisions · completion unknown")}).font(12)',
            f'Text({json.dumps(str(len(payload["audit"]["alerts"])) + " independent audit concerns")}).font(12)',
            'Divider()']
    for c in cards:
        url = c['evidence'][0]['url']
        if not safe_url(url):
            raise ValueError('Sidebar evidence must point to public GitHub HTTPS')
        rows.append('VStack({spacing:4}, [Text(%s).font(12),Text(%s).secondary().font(10),'
                    'Button("Open evidence",()=>openURL(%s))]).padding(8)' %
                    (json.dumps(f'#{c["work"]} · {c["action"]}'),
                     json.dumps(c['why_now'] + ' Waits: ' + '; '.join(c['waits_on'])), json.dumps(url)))
    return '// Generated public frozen observation. No process/network/dispatch actions.\nsidebar(()=>VStack({spacing:8},[\n' + ',\n'.join(rows) + '\n]));\n'


def safe_url(url):
    parsed = urlparse(url or '')
    return parsed.scheme == 'https' and parsed.hostname == 'github.com' and parsed.username is None


def serve(payload, port):
    html = (HERE / 'index.html').read_bytes()
    data = json.dumps(payload).encode()

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            route = urlparse(self.path).path
            if route == '/':
                body, mime = html, 'text/html; charset=utf-8'
            elif route == '/data.json':
                body, mime = data, 'application/json'
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    print(f'Read-only pilot: http://127.0.0.1:{server.server_port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('snapshots', nargs='*', type=Path,
                        default=[HERE / 'evidence/cohort.json.gz'])
    parser.add_argument('--serve', action='store_true')
    parser.add_argument('--port', type=int, default=8766)
    parser.add_argument('--sidebar', type=Path)
    parser.add_argument('--verification-export', action='append', type=Path,
                        default=[HERE / 'evidence/verification-83.json'])
    parser.add_argument('--ci-metrics', type=Path, default=HERE / 'evidence/ci-metrics-82.json')
    parser.add_argument('--ci-cohort', type=Path, default=HERE / 'evidence/ci-cohort-82.json')
    args = parser.parse_args()
    observations = [load(p) for p in args.snapshots]
    observations.sort(key=lambda f: f['observed_at'])
    if len({tuple(f['cohort']) for f in observations}) != 1:
        parser.error('Replay snapshots must use the same frozen cohort')
    payload = dict(frames=[frame(f, args.verification_export) for f in observations])
    if bool(args.ci_metrics) != bool(args.ci_cohort):
        parser.error('--ci-metrics and --ci-cohort must be supplied together')
    if args.ci_metrics:
        context = ci_report_export(args.ci_metrics, args.ci_cohort)
        for item in payload['frames']:
            item['owner_exports'].append(context)
    if args.sidebar:
        args.sidebar.write_text(sidebar(payload['frames'][-1]))
    if args.serve:
        serve(payload, args.port)
    else:
        print(json.dumps(payload, indent=2))
