# dsh-profile-activation-audit

A Codex skill for diagnosing whether a DeepSeek Harness profile row actually
reached the runtime loader.

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
bundle `dsh-activation-doctor` or any DeepSeek source code.

License: MIT.
