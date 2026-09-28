"""Read-only identity specification helpers; these never authorize effects."""
from dataclasses import dataclass

@dataclass(frozen=True)
class Cursor:
    generation: str
    revision: int

    @classmethod
    def parse(cls, value):
        generation, revision = value['generation'], value['revision']
        if not isinstance(generation, str) or not generation.strip():
            raise ValueError('empty generation')
        if isinstance(revision, bool) or not isinstance(revision, (str, int)):
            raise ValueError('revision must be an unsigned integer or decimal string')
        if isinstance(revision, str) and not revision.isascii():
            raise ValueError('non-ASCII revision')
        if isinstance(revision, str) and not revision.isdecimal():
            raise ValueError('non-decimal revision')
        revision = int(revision)
        if not 0 <= revision <= 2**64 - 1:
            raise ValueError('out-of-range revision')
        return cls(generation, revision)

    def covers(self, receipt):
        return self.generation == receipt.generation and self.revision >= receipt.revision


def parse_resource(value):
    machine, kind, key = value.split('/', 2)
    if not machine or kind not in ('terminal', 'browser', 'display', 'screen') or not key:
        raise ValueError('invalid resource')
    return machine, ('display' if kind == 'screen' else kind), key


def select_by_identity(rows, identity):
    """Exact resource lookup only; labels are not selectors."""
    matches = [row for row in rows if row['resource'] == identity]
    if len(matches) != 1:
        raise ValueError('missing or ambiguous identity')
    return matches[0]


def join_restored_surface(before, after):
    """Demonstrates the missing public join; requires owner-provided stable ID."""
    stable = before.get('stable_surface_id')
    matches = [row for row in after if stable and row.get('stable_surface_id') == stable]
    if len(matches) != 1:
        raise ValueError('no unambiguous durable join')
    return matches[0]
