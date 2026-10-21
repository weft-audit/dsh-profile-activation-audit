# Isolated DSH runbook

Use this after recording the plugin package source and reviewing its install/build
scripts. The goal is a real DSH boot with disposable state, not a service restart.

## Windows PowerShell

```powershell
$auditRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("dsh-activation-audit-" + [guid]::NewGuid().ToString('N'))
$env:DSH_HOME = Join-Path $auditRoot 'home'
$env:DSH_TELEMETRY_MODE = 'DISABLED'
$env:DSH_PERMISSION_MODE = 'read-only'

dsh --profile audit-e2e --from-default-profile headless --dump-config
dsh plugin --profile audit-e2e add <reviewed-tarball> --ignore-scripts
dsh --profile audit-e2e --dump-config *> (Join-Path $auditRoot 'composed.log')

dsh --profile audit-e2e --patch <overlay.yml> 'Reply with the single word OK.' `
  1> (Join-Path $auditRoot 'stdout.log') `
  2> (Join-Path $auditRoot 'stderr.log')
$exit = $LASTEXITCODE
```

Record:

- `$exit`;
- `stdout.log` and `stderr.log`;
- new files under `$env:DSH_HOME\logs`;
- SHA-256 for every new report;
- whether the default user `DSH_HOME` changed. Compare metadata only, not file
  contents.

Do not use `dsh ... --help` as the only run. App help may exit before the
loader settles and before activation diagnostics are emitted.

## POSIX shell

```sh
audit_root="$(mktemp -d)"
export DSH_HOME="$audit_root/home"
export DSH_TELEMETRY_MODE=DISABLED
export DSH_PERMISSION_MODE=read-only

dsh --profile audit-e2e --from-default-profile headless --dump-config
dsh plugin --profile audit-e2e add <reviewed-tarball> --ignore-scripts
dsh --profile audit-e2e --dump-config >"$audit_root/composed.log" 2>&1

dsh --profile audit-e2e --patch <overlay.yml> \
  'Reply with the single word OK.' \
  >"$audit_root/stdout.log" 2>"$audit_root/stderr.log"
status=$?
```

## Boundaries

- One-shot `headless` only; no long-lived server is required.
- No production profile edits.
- Prefer a reviewed package tarball and pass `--ignore-scripts` to installation.
  If a local build is unavoidable, audit it first and build only in a disposable
  clone without credentials.
- Path and home isolation are not a security sandbox.
- No secrets in prompts, paths, fixtures, or reports shared externally.
- Preserve raw evidence before cleanup.
- If provider credentials are unavailable, mark the run `NOT_RUN`; do not fake a
  model response.
