#!/usr/bin/env node
/*
 * scan-ai-flavor.mjs — score a prose file for AI-flavored writing.
 *
 * Usage:
 *   node scan-ai-flavor.mjs <file> [file ...]
 *   cat prose.md | node scan-ai-flavor.mjs
 *
 * Prints a per-marker count and sample line numbers so you can track a
 * before/after rewrite. Zero stock phrases and a defensible em-dash count is
 * the goal. Does not judge correctness — only tell.
 */
import { readFileSync } from 'node:fs'

const STOCK_PHRASES = [
  /it'?s\s+worth\s+noting/i,
  /worth\s+highlighting/i,
  /it\s+is\s+important\s+to\s+note/i,
  /in\s+practice/i,
  /note\s+carefully/i,
  /be\s+aware\s+that/i,
  /crucially/i,
  /at\s+its\s+core/i,
  /in\s+essence/i,
  /the\s+key\s+takeaway/i,
  /fundamentally/i,
  /moreover/i,
  /furthermore/i,
  /delve/i,
  /leverages/i,
  /navigate\s+the\s+landscape/i,
  /a\s+testament\s+to/i,
  /plays?\s+a\s+pivotal\s+role/i,
  /in\s+today'?s\s+\w+\s+world/i,
  /unlock\s+(the\s+)?(power|potential|secrets|magic|value|benefits)/i,
  /let'?s\s+dive\s+in/i,
  /in\s+conclusion/i,
  /to\s+sum\s+up/i,
  /when\s+it\s+comes\s+to/i,
  /the\s+single\s+most\s+important/i,
  /the\s+most\s+critical\s+thing/i,
]

function scan(text) {
  const lines = text.split('\n')
  const counts = { emDash: 0, stock: {} }
  const samples = { emDash: [], stock: {} }

  lines.forEach((line, i) => {
    const em = (line.match(/—/g) || []).length
    if (em) {
      counts.emDash += em
      if (samples.emDash.length < 8) samples.emDash.push(`${i + 1}: ${line.trim().slice(0, 80)}`)
    }
    for (const re of STOCK_PHRASES) {
      if (re.test(line)) {
        const key = re.source
        counts.stock[key] = (counts.stock[key] || 0) + 1
        if (!samples.stock[key]) samples.stock[key] = i + 1
      }
    }
  })

  return { counts, samples }
}

function report(name, { counts, samples }) {
  console.log(`\n=== ${name} ===`)
  console.log(`em dash — : ${counts.emDash}`)
  if (counts.emDash && samples.emDash.length) {
    console.log('  samples:')
    for (const s of samples.emDash) console.log('   ' + s)
  }
  const stockEntries = Object.entries(counts.stock)
  if (stockEntries.length === 0) {
    console.log('stock phrases: none ✔')
  } else {
    console.log('stock phrases:')
    for (const [re, n] of stockEntries) {
      console.log(`  ${n}×  /${re}/   (first at line ${samples.stock[re]})`)
    }
  }
}

const files = process.argv.slice(2)
let texts = []
if (files.length) {
  for (const f of files) {
    const t = readFileSync(f, 'utf8')
    texts.push([f, t])
  }
} else {
  // stdin
  let buf = ''
  for await (const chunk of process.stdin) buf += chunk
  texts.push(['<stdin>', buf])
}

let totalStock = 0
let totalEm = 0
for (const [name, t] of texts) {
  const r = scan(t)
  report(name, r)
  totalStock += Object.values(r.counts.stock).reduce((a, b) => a + b, 0)
  totalEm += r.counts.emDash
}
console.log(`\n--- totals: ${totalEm} em-dashes, ${totalStock} stock-phrase hits across ${texts.length} file(s) ---`)
process.exit(0)
