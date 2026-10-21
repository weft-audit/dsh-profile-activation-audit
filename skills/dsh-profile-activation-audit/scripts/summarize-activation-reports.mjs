#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const numberAfter = (text, pattern) => {
  const match = text.match(pattern)
  return match ? Number(match[1]) : null
}

const unique = values => [...new Set(values)]

export function parseActivationReport(name, text) {
  const noNameRows = unique(
    [...text.matchAll(/^([^:\n]+?) \(\(no name\)\)/gm)].map(match => match[1].trim()),
  )
  const importFailures = unique(
    [...text.matchAll(/^\s{2}(.+?): failed to import:/gm)].map(match => match[1].trim()),
  )
  const failedRows = unique(
    [...text.matchAll(/^\s{2}(.+?) \(.+?\): failed after the plugin body started/gm)]
      .map(match => match[1].trim()),
  )
  const waitingRows = unique(
    [...text.matchAll(/^\s{2}(.+?) \(.+?\): pending \(waiting for service: ([^)]+)\)/gm)]
      .map(match => ({ row: match[1].trim(), service: match[2].trim() })),
  )

  return {
    file: name,
    sha256: createHash('sha256').update(text).digest('hex'),
    phase: text.match(/^phase: (.+)$/m)?.[1] ?? null,
    settled: text.match(/^settled: (.+)$/m)?.[1] ?? null,
    platform: text.match(/^platform: (.+)$/m)?.[1] ?? null,
    profile: text.match(/^profile: (.+)$/m)?.[1] ?? null,
    inactive: numberAfter(text, /^entries did not activate: (\d+) of \d+$/m),
    totalEntries: numberAfter(text, /^entries did not activate: \d+ of (\d+)$/m),
    switchedOff: numberAfter(text, /^switchedOff: (\d+) entries/m),
    refused: numberAfter(text, /^switchedOff: \d+ entries, (\d+) refused by the launcher's preflight/m),
    profileBundlesDeclared: numberAfter(text, /^profileBundles: (\d+) declared, \d+ started$/m),
    profileBundlesStarted: numberAfter(text, /^profileBundles: \d+ declared, (\d+) started$/m),
    noNameRows,
    importFailures,
    failedRows,
    waitingRows,
  }
}

function parseArgs(argv) {
  const result = { dir: null, json: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--dir') result.dir = argv[++index]
    else if (arg === '--json') result.json = true
    else if (arg === '--help' || arg === '-h') result.help = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return result
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log('Usage: node summarize-activation-reports.mjs --dir <logs-dir> [--json]')
    return 0
  }
  if (!args.dir) throw new Error('Missing --dir <logs-dir>')

  const directory = resolve(args.dir)
  const names = (await readdir(directory))
    .filter(name => /^activation-.*\.log$/u.test(name))
    .sort()

  if (names.length === 0) {
    console.error(JSON.stringify({ directory, reports: [], error: 'NO_ACTIVATION_REPORTS' }))
    return 2
  }

  const reports = []
  for (const name of names) {
    const text = await readFile(join(directory, name), 'utf8')
    reports.push(parseActivationReport(name, text))
  }

  const summary = {
    directory,
    reportCount: reports.length,
    reportsWithRefusals: reports.filter(report => (report.refused ?? 0) > 0).length,
    reportsWithImportFailures: reports.filter(report => report.importFailures.length > 0).length,
    reports,
  }

  if (args.json) console.log(JSON.stringify(summary, null, 2))
  else {
    console.log(`reports=${summary.reportCount}`)
    for (const report of reports) {
      console.log(
        `${report.file} inactive=${report.inactive ?? '?'} refused=${report.refused ?? '?'} `
        + `noName=${report.noNameRows.length} importFailures=${report.importFailures.length} `
        + `sha256=${report.sha256}`,
      )
    }
  }
  return 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().then(code => {
    process.exitCode = code
  }).catch(error => {
    console.error(`activation-report-summary: ${error.message}`)
    process.exitCode = 1
  })
}
