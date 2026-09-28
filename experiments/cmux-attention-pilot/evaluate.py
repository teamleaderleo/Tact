#!/usr/bin/env python3
"""Score explicit reference decisions, not card count or human usefulness."""
import gzip
import argparse
import hashlib
import json
from pathlib import Path
from model import project
from replay import load

HERE = Path(__file__).resolve().parent


def evaluate(view, reference):
    expected = {e['id']: e for e in reference['expected']}
    actual = {c['id']: c for c in view['obligations']}
    omitted = sorted(expected.keys() - actual.keys())
    false = sorted(actual.keys() - expected.keys())
    # Stale = an explicitly excluded work item resurfaced as a current obligation.
    excluded = {e['work'] for e in reference['excluded']}
    stale = sorted(c['id'] for c in actual.values() if c['work'] in excluded)
    return dict(reference_reviewer=reference['reviewer'],
        expected=len(expected), actual=len(actual), consequential_omissions=omitted,
        weighted_omission_cost=sum(expected[i]['weight'] for i in omitted),
        total_reference_weight=sum(e['weight'] for e in expected.values()),
        false_obligations=false, stale_obligations=stale,
        duplicate_ids=len(view['obligations'])-len(actual),
        human_trials=0, human_usability='deferred by user; not measured',
        scope='Same frozen observation only; self-reviewed technical reference, not independent human validation')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reference', type=Path, default=HERE / 'reference.json')
    ref = json.loads(parser.parse_args().reference.read_text())
    source = HERE / ref['source_file']
    if hashlib.sha256(gzip.decompress(source.read_bytes())).hexdigest() != ref['source_uncompressed_sha256']:
        raise SystemExit('Reference/source hash mismatch: re-adjudicate, do not reuse stale labels')
    print(json.dumps(evaluate(project(load(source)), ref), indent=2))
