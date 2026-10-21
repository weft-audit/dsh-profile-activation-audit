# dsh-profile-activation-audit

A Codex skill for diagnosing whether a DeepSeek Harness profile row actually
reached the runtime loader.

## Status and evidence

This is an early-stage, evidence-derived diagnostic workflow, not a supported
product or a guarantee of complete DSH observability.

It was distilled from a real Windows investigation and validated on 2026-10-21
against:

- `@deepseek-ai/dsh@0.2.1-rc.2`;
- a one-shot `headless` profile;
- `dsh-activation-doctor@0.4.0` at public commit
  `518237062e95ebe463323a5e096dc6d2236e8660`;
- real preflight-denial, whitespace-name, missing-target, and reverse-control
  cases;
- three produced activation reports parsed by the included script.

Not yet verified:

- Linux or macOS execution;
- DSH versions other than `0.2.1-rc.2`;
- third-party report formats other than the tested doctor 0.4.0 format;
- the published repository through `$skill-installer` itself;
- every activation failure mode or malicious-plugin scenario.

The bundled script has two passing parser tests. The repository has no CI,
release, cryptographic report seal, or production deployment claim.

It focuses on evidence that `--dump-config` cannot provide:

- composition versus runtime activation;
- preflight refusal versus import failure;
- operator-disabled rows;
- whitespace-only plugin names;
- insert targets that never produce an entry;
- reverse controls that distinguish "denied after entry creation" from "entry
  never formed."

The skill is production-read-only by design. It writes only to a disposable
`DSH_HOME` through a one-shot headless launch; it does not restart services or
install changes into production. Path isolation is not a security sandbox.

## Repository layout

```text
skills/dsh-profile-activation-audit/
|-- SKILL.md
|-- agents/openai.yaml
|-- references/
`-- scripts/
```

## Test

```powershell
node --test tests\summarize-activation-reports.test.mjs
```

## Install

Use the Codex `$skill-installer` with this repository's skill path:

```text
weft-audit/dsh-profile-activation-audit/skills/dsh-profile-activation-audit
```

## Scope

This repository is not affiliated with or endorsed by DeepSeek. It does not
bundle `dsh-activation-doctor` or any DeepSeek source code. Review any
third-party plugin before executing it; path and home isolation are not a
security sandbox.

License: MIT.
