# Instruction token comparison

Measured with `o200k_base` (tiktoken 0.14.0). Counts include the entire file and frontmatter, without prompt wrappers. These are text-token counts, not billed usage.

Baseline: `9e7d3be6915e416ed538a04782864547f94fe8d8`. Verification head: `a1ca66f79139f92aa4df7c4d487c41c835ad5aca`. Cloud skill head: `0c0454ef4de0d7162ff4e572b81ceadbd0e6afb3`. All comparisons use immutable Git blobs; the baseline is the main revision incorporated by both branches.

## Entry points

| File / output | Before | After | Saved | Reduction |
| --- | ---: | ---: | ---: | ---: |
| `CLAUDE.md` | 5,689 | 5,619 | +70 | 1.2% |
| `skills/cmux-testing/SKILL.md` | 1,088 | 724 | +364 | 33.5% |
| `skills/cmux-dev-workflow/SKILL.md` | 956 | 540 | +416 | 43.5% |
| `skills/cmux-cloud-vm/SKILL.md` | 13,514 | 798 | +12,716 | 94.1% |

## Cloud references

| File / output | Before | After | Saved | Reduction |
| --- | ---: | ---: | ---: | ---: |
| `skills/cmux-cloud-vm/references/agent-workflows.md` | 6,250 | 3,871 | +2,379 | 38.1% |
| `skills/cmux-cloud-vm/references/commands.md` | 20,969 | 15,559 | +5,410 | 25.8% |
| `skills/cmux-cloud-vm/references/guest.md` | 0 | 2,431 | -2,431 | new |
| `skills/cmux-cloud-vm/references/sidebar-parity.md` | 3,639 | 3,639 | +0 | 0.0% |

## Other documentation

| File / output | Before | After | Saved | Reduction |
| --- | ---: | ---: | ---: | ---: |
| `skills/cmux-testing/references/local-vs-ci-validation.md` | 399 | 648 | -249 | -62.4% |
| `CONTRIBUTING.md` | 1,484 | 1,815 | -331 | -22.3% |
| `docs/contributor-verification.md` | 1,936 | 2,002 | -66 | -3.4% |
| `docs/verification-receipts.md` | 0 | 2,196 | -2,196 | new |
| `skills/README.md` | 0 | 772 | -772 | new |
| `README.md` | 6,342 | 6,382 | -40 | -0.6% |

## CLI help

| File / output | Before | After | Saved | Reduction |
| --- | ---: | ---: | ---: | ---: |
| `verify-local.py --help` | 232 | 399 | -167 | -72.0% |

- All four entry points: **21,247 → 7,681**, saving **13,566 (63.8%)**.
- Whole Cloud Markdown corpus, including the new guest reference and unchanged sidebar reference: **44,372 → 26,298**, saving **18,074 (40.7%)**.
- All measured instruction files: **62,266 → 46,996**, saving **15,270 (24.5%)**.

Negative savings are increases. The new guest reference is included in Cloud totals, so moving material cannot masquerade as deletion. The app's separate bundled single-file Cloud prompt is unchanged and excluded. Help compares the earlier manual-file-selection command (`5564d9c`) with the final command, under the same Python version; it is not included in file totals.

Reproduce with the recorded commits fetched into a CMUX repository and tiktoken installed:

```sh
python3 experiments/cmux-verification/measure_instruction_tokens.py --repo /path/to/cmux --out /tmp/cmux-token-counts
```
