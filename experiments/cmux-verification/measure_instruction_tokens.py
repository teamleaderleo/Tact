#!/usr/bin/env python3
"""Count versioned instruction text, including optional references, with o200k_base.

Requires tiktoken. Git objects must exist locally; this command does not fetch.
"""
import argparse
import importlib.metadata
import json
from pathlib import Path
import platform
import subprocess
import tempfile

import tiktoken

BASE = "9e7d3be6915e416ed538a04782864547f94fe8d8"
VERIFICATION = "a1ca66f79139f92aa4df7c4d487c41c835ad5aca"
CLOUD = "0c0454ef4de0d7162ff4e572b81ceadbd0e6afb3"
MANUAL_SELECTION_HELP = "5564d9ceffd1922a5e8966806a9f4c760293fe47"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True, help="CMUX Git repository containing the recorded commits")
    parser.add_argument("--out", type=Path, required=True, help="Directory for token-counts.json and token-counts.md")
    args = parser.parse_args()
    encoder = tiktoken.get_encoding("o200k_base")

    def git(*argv):
        return subprocess.check_output(["git", "-C", str(args.repo), *argv])

    for ref in (BASE, VERIFICATION, CLOUD, MANUAL_SELECTION_HELP):
        git("cat-file", "-e", ref + "^{commit}")

    def content(ref, path):
        # Missing new files are zero, but a missing commit or Git failure is not.
        if not git("ls-tree", "--name-only", ref, "--", path):
            return ""
        return git("show", f"{ref}:{path}").decode()

    def tokens(text):
        return len(encoder.encode(text, disallowed_special=()))

    rows = []
    def row(group, path, before_ref, after_ref, before_text=None, after_text=None):
        before = tokens(content(before_ref, path) if before_text is None else before_text)
        after = tokens(content(after_ref, path) if after_text is None else after_text)
        value = {"group": group, "path": path, "before_ref": before_ref, "after_ref": after_ref,
                 "before": before, "after": after, "saved": before - after,
                 "reduction_percent": round(100 * (before - after) / before, 1) if before else None}
        rows.append(value)
        return value

    for path in ["CLAUDE.md", "skills/cmux-testing/SKILL.md", "skills/cmux-dev-workflow/SKILL.md"]:
        row("entry_points", path, BASE, VERIFICATION)
    row("entry_points", "skills/cmux-cloud-vm/SKILL.md", BASE, CLOUD)
    for filename in ["agent-workflows.md", "commands.md", "guest.md", "sidebar-parity.md"]:
        row("cloud_references", "skills/cmux-cloud-vm/references/" + filename, BASE, CLOUD)
    for path in ["skills/cmux-testing/references/local-vs-ci-validation.md", "CONTRIBUTING.md",
                 "docs/contributor-verification.md", "docs/verification-receipts.md", "skills/README.md", "README.md"]:
        row("other_documentation", path, BASE, VERIFICATION)

    def help_output(ref, parent):
        root = parent / ref
        root.mkdir()
        for name in ("verify-local.py", "verification_receipt.py"):
            (root / name).write_text(content(ref, "scripts/" + name))
        return subprocess.check_output(["python3", str(root / "verify-local.py"), "--help"], text=True)

    args.out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="help-token-inputs-", dir=args.out) as tmp:
        parent = Path(tmp)
        row("help_output", "verify-local.py --help", MANUAL_SELECTION_HELP, VERIFICATION,
            help_output(MANUAL_SELECTION_HELP, parent), help_output(VERIFICATION, parent))

    def total(selected):
        before = sum(r["before"] for r in selected)
        after = sum(r["after"] for r in selected)
        return {"before": before, "after": after, "saved": before - after,
                "reduction_percent": round(100 * (before - after) / before, 1)}

    report = {"encoding": "o200k_base", "tiktoken_version": importlib.metadata.version("tiktoken"),
              "python_version": platform.python_version(), "baseline": BASE,
              "verification_head": VERIFICATION, "cloud_head": CLOUD,
              "scope": "Full UTF-8 file contents including frontmatter; no prompt wrappers. Help is counted separately. Counts are not billable usage or a promise that every reference is loaded.",
              "rows": rows,
              "entry_point_total": total([r for r in rows if r["group"] == "entry_points"]),
              "cloud_corpus_total": total([r for r in rows if r["path"].startswith("skills/cmux-cloud-vm/")]),
              "all_instruction_files_total": total([r for r in rows if r["group"] != "help_output"])}
    (args.out / "token-counts.json").write_text(json.dumps(report, indent=2) + "\n")
    lines = ["# Instruction token comparison", "",
             f"Measured with `o200k_base` (tiktoken {report['tiktoken_version']}). Counts include the entire file and frontmatter, without prompt wrappers. These are text-token counts, not billed usage.", "",
             f"Baseline: `{BASE}`. Verification head: `{VERIFICATION}`. Cloud skill head: `{CLOUD}`. All comparisons use immutable Git blobs; the baseline is the main revision incorporated by both branches.", ""]
    for group, title in [("entry_points", "Entry points"), ("cloud_references", "Cloud references"),
                         ("other_documentation", "Other documentation"), ("help_output", "CLI help")]:
        lines += ["## " + title, "", "| File / output | Before | After | Saved | Reduction |",
                  "| --- | ---: | ---: | ---: | ---: |"]
        for r in rows:
            if r["group"] != group:
                continue
            percent = "new" if r["reduction_percent"] is None else f"{r['reduction_percent']:.1f}%"
            lines.append(f"| `{r['path']}` | {r['before']:,} | {r['after']:,} | {r['saved']:+,} | {percent} |")
        lines.append("")
    for key, label in [("entry_point_total", "All four entry points"),
                       ("cloud_corpus_total", "Whole Cloud Markdown corpus, including the new guest reference and unchanged sidebar reference"),
                       ("all_instruction_files_total", "All measured instruction files")]:
        t = report[key]
        lines.append(f"- {label}: **{t['before']:,} → {t['after']:,}**, saving **{t['saved']:,} ({t['reduction_percent']}%)**.")
    lines += ["", "Negative savings are increases. The new guest reference is included in Cloud totals, so moving material cannot masquerade as deletion. The app's separate bundled single-file Cloud prompt is unchanged and excluded. Help compares the earlier manual-file-selection command (`5564d9c`) with the final command, under the same Python version; it is not included in file totals.", "",
              "Reproduce with the recorded commits fetched into a CMUX repository and tiktoken installed:", "",
              "```sh", "python3 experiments/cmux-verification/measure_instruction_tokens.py --repo /path/to/cmux --out /tmp/cmux-token-counts", "```", ""]
    (args.out / "token-counts.md").write_text("\n".join(lines))
    print(json.dumps({k: report[k] for k in ("entry_point_total", "cloud_corpus_total", "all_instruction_files_total")}, indent=2))


if __name__ == "__main__":
    main()
