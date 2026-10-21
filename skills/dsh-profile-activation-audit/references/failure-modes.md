# Activation failure modes

Start from the strongest runtime evidence and move toward source interpretation.

| Observation | Classification | What to inspect next |
|---|---|---|
| Row appears in `--dump-config`; no runtime evidence | Composition only | Run the real launcher in an isolated home |
| Launcher says the row was disabled | Preflight refusal | Missing or blank `name`, manifest read failure, version rule |
| `(no name)` in a compatible report | Preflight refused a nameless row | Preserve stderr; inspect the original row |
| `Cannot find package '   '` | A whitespace name reached module resolution | Inspect validation and import boundary |
| `failed to import` and no fiber | Import failure | Package resolution, syntax, export, runtime compatibility |
| Plugin body throws but application continues | Third-party startup failure | Original stack, duplicate registrations, startup severity |
| Row is disabled without a launcher warning | Operator decision or missing denial evidence | Compare loader entry to source declaration |
| `insert` target is missing | Row never materialized | Patch warning and composed tree; entry diagnostics are inapplicable |
| Installed bundle never appears in declarations or started bundles | Selection gap | Profile bundle list and package manifest |

## Non-inferences

- Do not call a composed row "loaded".
- Do not call an absent report "healthy" unless the detector reached its sweep.
- Do not call a recoverable test failure a product defect.
- Do not call a detector's coverage gap a bypass unless the detector actually
  inspected the object and returned the wrong verdict.
- Do not call `read-only` a sandbox for plugins already loaded in the process.

## Minimal controls

Run these when relevant:

1. Healthy control with the same profile and no bad overlay.
2. Nameless row.
3. Whitespace-only name.
4. Missing insert target.
5. Existing target with a nameless child.

The last two separate "row formed and was denied" from "row never formed."
