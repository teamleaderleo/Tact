# Find the existing build before paying for another

Observed 2026-09-20. Related: [#44](https://github.com/teamleaderleo/Tact/issues/44), [#75](https://github.com/teamleaderleo/Tact/issues/75), [#80](https://github.com/teamleaderleo/Tact/issues/80), [#83](https://github.com/teamleaderleo/Tact/issues/83), [#87](https://github.com/teamleaderleo/Tact/issues/87).

## Interaction and diagnosis

A contributor wants to exercise an exact CMUX Browser revision. The source checkout is small; Chromium is built elsewhere. Without a discoverable artifact path, “no local app” becomes “need the office or another build,” even when per-commit packaging already exists.

That was the wrong inference in the Elatura trial. Browser already has protected-main macOS candidate builds, private R2 package transport, an integrity-checking hydrator, and a separate public distribution repository. The missing ergonomic step was translating **source + platform → available package or precise failure**.

Source owner: [Browser release pipeline at `6696b66`](https://github.com/manaflow-ai/cmux-browser/blob/6696b66ec83925c616f869a2d4f89454046b4eb9/docs/releases.md). Native macOS cmux uses a different host; a local native test is useful evidence for that host, not Chromium integration proof.

## Implemented correction

[Browser PR #478](https://github.com/manaflow-ai/cmux-browser/pull/478) adds the owner-side command, offline fixtures, host-suite wiring, and contributor documentation:

```sh
python3 scripts/resolve-build.py \
  --source 6696b66ec83925c616f869a2d4f89454046b4eb9 \
  --platform macos-arm64 --nearby 2
```

The command distinguishes indexed, expired, missing, or ambiguous receipts from workflow failures and incomplete searches. A nearby build is explicitly a different source, never a substitute for exact-source evidence. An optional receipt-only download checks the existing owner's schema, source, platform, run, and attempt before printing the existing hydrator command. Indexed receipt, verified payload, and exercised runtime remain separate claims.

The implementation lives in Browser. Tact owns this observation and the integration experiment; it does not fork the release tooling.

## Evidence and limits

| Class | Result |
| --- | --- |
| Synthetic / contract | 14 resolver tests pass; the complete Browser host suite reports 70 test programs passed, 0 failed. Includes superseded runs, rerun identity, expiry, ambiguity, partial searches, receipt validation, and bounded archive handling. |
| Live, read-only GitHub discovery | Exact-source [run 35494545022](https://github.com/manaflow-ai/cmux-browser/actions/runs/35494545022), attempt 1, failed in the artifact-budget admission job before compilation. Its log reports `organization plan endpoint is unavailable (HTTP 401)`. This is not evidence of budget exhaustion, compilation failure, or unavailable office hardware. |
| Live, read-only alternative discovery | Successful [run 33615900382](https://github.com/manaflow-ai/cmux-browser/actions/runs/33615900382), source `ea8e137644dc77ffdb810f19b821d9318ad9b5f5`, has expired arm64/x64 Actions receipts. Receipt expiry does not establish whether the R2 package bytes still exist. |
| Untested | Authenticated R2 hydration, installed-package identity, isolated launch, Chromium adapter integration, and runtime resource/fidelity measurements. No browser speedup or resource reduction has been measured. |

No admission bypass, new credentials, retention changes, browser launch, or private-page capture was required for this slice. Read-only discovery is usable from a contributor checkout; browser execution still needs an appropriate machine and an approved isolated test profile.

## What transfers from Chrome

[Chrome for Testing](https://github.com/GoogleChromeLabs/chrome-for-testing#json-api-endpoints) exposes version/platform availability and download metadata, including known-good versions useful for bisection. [Chromium snapshots](https://www.chromium.org/getting-involved/download-chromium/) offer another revision-oriented path, with best-effort availability. Neither implies every commit has a usable binary.

The transferable mechanism is an explicit availability answer with immutable provenance. Stock Chrome artifacts are useful for the trial's baseline; they cannot supply CMUX's downstream overlay. For edits, warm incremental compilation and focused production-code tests still matter.

## Next experiments, in owner order

| Experiment | Existing owner / reuse | Concrete acceptance test |
| --- | --- | --- |
| Preserve a small authenticated candidate index separately from short-lived Actions receipts | Browser release/R2 transport; preserve its source/platform/run/attempt/digest identity | After receipt expiry, distinguish discoverable package, expired package, and unknown state without rebuilding. Measure source-to-verified-package time and rebuilds avoided. Retention policy remains an owner decision. |
| Carry one exact artifact into isolated UI replay | Browser tagged deployment/self-test hooks; native cmux's [#83 work](https://github.com/teamleaderleo/Tact/issues/83) remains with its native verification owner | Source, package digest, tag/profile, replay result, and inspected app refer to the same instance. Measure edit-to-useful-feedback and switch/recovery latency; reject a stale artifact. |
| Make the cheapest useful loop run production code | Existing Browser host tests, object-only compile rung, and real runtime hooks | A representative model edit is caught by the model test; a focus/rendering edit requires the real host. Measure both loops. Reject cloned models or synthetic proof presented as runtime proof. |
| Preserve causal context across tool boundaries | Existing selection/identity and verification owners, including [#81](https://github.com/teamleaderleo/Tact/issues/81) | From a failure, reach the exact source, changed artifact, and replay without re-finding the page or guessing a URL. Reject stale generations and report the failing admission/compile/test/runtime stage. |

These are proposed follow-ups, not completed capabilities. The first next change should extend the existing release owner with recoverable metadata, after confirming authenticated index access and package-retention semantics. Do not add a competing scheduler or use persistent discovery as evidence that old binaries remain executable.

For [#87](https://github.com/teamleaderleo/Tact/issues/87), obtaining an app and exposing the adapter's host contract are separate gates. The existing narrow adapter remains read-only, with explicit guarded jump. Live binding/activation, daemon recovery, and the stock/CMUX/identical-CMUX-plus-adapter comparison still require their own evidence.
