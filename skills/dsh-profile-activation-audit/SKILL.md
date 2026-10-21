---
name: dsh-profile-activation-audit
description: "Audit whether a DeepSeek Harness profile row actually reached the runtime loader when --dump-config disagrees with runtime behavior, a plugin is silently disabled, import-failed, waiting for a service, or absent from the entry tree. Use for evidence-producing diagnosis; do not use as a general DSH plugin development guide."
metadata:
  short-description: "Diagnose DSH profile activation with runtime evidence"
---

# DSH Profile Activation Audit

Determine what the loader actually did. Do not infer activation from a composed
configuration alone, and do not turn a detector report into a repair claim.

## Evidence status

This workflow was validated on 2026-10-21 on Windows with
`@deepseek-ai/dsh@0.2.1-rc.2` and a one-shot `headless` profile. It covers real
preflight-denial, whitespace-name, missing-target, and reverse-control cases.

It is not a supported DeepSeek product. It has not been validated on Linux or
macOS, against other DSH versions, with every detector format, or through the
published `$skill-installer` path. Treat rules that depend on report wording as
portable only after checking the current report format.

## Hard boundaries

- Treat `--dump-config` as composition evidence only. It does not run the
  compatibility preflight and does not prove that the loader started the row.
- Run the real `dsh` launcher in an isolated `DSH_HOME` and a disposable profile.
  Do not test first in the production profile.
- Do not start, restart, or stop a long-lived service unless the owner explicitly
  authorizes it. Prefer the one-shot `headless` app.
- Do not print credentials. Do not inspect credential stores.
- `DSH_PERMISSION_MODE=read-only` limits tool actions; it does not make an
  already-loaded plugin incapable of writing files.
- If a detector report is unavailable, say which evidence is missing. An absent
  report is not proof that no failure occurred.

## Workflow

1. Record the installed `dsh` version, the profile name, the plugin row id/name,
   and the exact command being tested.
2. Capture `dsh --profile <name> --dump-config`. Identify groups, include rows,
   disabled rows, and the target row.
3. Inspect the profile's plugin manifest and lifecycle scripts before executing
   third-party code. Record whether installation or build executes scripts.
4. Create a disposable `DSH_HOME` and profile. Follow
   [references/isolated-runbook.md](references/isolated-runbook.md).
5. Run a bounded real one-shot task. Do not use `--help` as the only runtime test:
   it can exit before the activation sweep. Preserve exit code, stdout, stderr,
   and the timestamps of new reports.
6. Classify the failure using
   [references/failure-modes.md](references/failure-modes.md). Keep these cases
   distinct:
   - operator-disabled;
   - preflight refusal;
   - import failure with no fiber;
   - failed after the plugin body starts;
   - waiting for a missing service;
   - a patch row that never materialized.
7. When a compatible activation report exists, summarize it read-only:

   ```text
   node scripts/summarize-activation-reports.mjs --dir <isolated-home>/logs
   ```

8. Report only what the evidence supports:
   - exact synthetic input or overlay;
   - exit code and stdout/stderr;
   - report path and SHA-256;
   - current production configuration versus future latent path;
   - what was not tested.

## Interpretation rules

- A row can be present in `--dump-config` and still never reach the loader.
- A missing `name` may be rewritten into a compatibility-looking error before the
  loader sees the row.
- A whitespace-only `name` can pass a string check and fail later during module
  resolution.
- A missing insert target can produce a warning and no entry. Entry-tree
  diagnostics then have no object to inspect.
- A healthy entry tree does not prove that an installed bundle was selected.
- A report without a cryptographic seal is evidence, not an immutable ledger.

## Deliverable

Return a compact evidence report with:

```text
[Environment]
[Composed configuration]
[Runtime observation]
[Classification]
[Reproduction]
[Limitations]
[Next verification]
```

Include exact commands, exit codes, report hashes, and untested platforms. Do not
suggest production installation from a disposable-profile result alone.
