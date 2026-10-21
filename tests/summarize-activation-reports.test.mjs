import assert from 'node:assert/strict'
import test from 'node:test'

import { parseActivationReport } from '../skills/dsh-profile-activation-audit/scripts/summarize-activation-reports.mjs'

test('parses a preflight refusal without treating it as an import failure', () => {
  const report = parseActivationReport('activation-a.log', `
phase: startup
settled: yes
profile: headless
platform: win32 x64
profileBundles: 3 declared, 3 started
switchedOff: 8 entries, 1 refused by the launcher's preflight
entries did not activate: 0 of 101

bad-nameless ((no name))
  this row declares no \`name\`
`)

  assert.equal(report.refused, 1)
  assert.equal(report.inactive, 0)
  assert.deepEqual(report.noNameRows, ['bad-nameless'])
  assert.deepEqual(report.importFailures, [])
})

test('parses import failure and preserves the row id', () => {
  const report = parseActivationReport('activation-b.log', `
phase: startup
settled: yes
switchedOff: 7 entries, 0 refused by the launcher's preflight
entries did not activate: 1 of 101

bad-whitespace (   )
  bad-whitespace (   ): failed to import: the module could not be loaded, so no fiber exists
`)

  assert.equal(report.refused, 0)
  assert.equal(report.inactive, 1)
  assert.deepEqual(report.importFailures, ['bad-whitespace (   )'])
})
