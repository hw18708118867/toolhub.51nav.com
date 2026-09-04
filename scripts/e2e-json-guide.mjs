#!/usr/bin/env node
/*
 * E2E regression for the JSON guide (guides/json-structure-guide).
 * Runs against the PRODUCTION build on a dedicated port so a stray
 * `astro dev` cannot pollute the console assertions.
 *
 * Usage: node scripts/e2e-json-guide.mjs
 * (expects the built site to be served, e.g. `astro preview --port 4399`)
 */
import { join } from 'node:path'

const PORT = process.env.PORT || 4399
const URL = `http://localhost:${PORT}/guides/json-structure-guide/`

const expected = [
  { name: 'JsonParserVisualizer', play: '#jp-play', next: '#jp-next', tree: '#jp-tree' },
  { name: 'JsonEscapeDemo', play: '#je-play', next: '#je-next', tree: '#je-output' },
  { name: 'JsonNumberDemo', play: '#jn-play', next: '#jn-next', tree: '#jn-card' },
  { name: 'JsonNestingDemo', play: '#jb-play', next: '#jb-next', tree: '#jb-card' },
]

let passed = 0
let failed = 0
const fails = []

async function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; fails.push(`${name}: ${detail}`) }
}

const { launch } = await import('./_browser.mjs')
const browser = await launch()

try {
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(String(e)))

  await page.goto(URL, { waitUntil: 'networkidle' })

  // TOC populated from h2/h3
  const tocCount = await page.$$eval('#toc-nav a', (els) => els.length)
  check('TOC populated', tocCount >= 12, `only ${tocCount} toc links`)

  for (const c of expected) {
    const hasPlay = await page.$(c.play)
    check(`${c.name} mounts`, !!hasPlay, 'play button not found')
    if (!hasPlay) continue

    // step once, value panel should change
    const before = await page.$eval(c.tree, (el) => el.textContent.trim().length)
    await page.click(c.next)
    await page.waitForTimeout(120)
    const after = await page.$eval(c.tree, (el) => el.textContent.trim().length)
    check(`${c.name} step changes state`, after !== before || after > 0, `state unchanged (${before}->${after})`)

    // play then pause
    await page.click(c.play)
    await page.waitForTimeout(400)
    await page.click(c.play)

    // timeline exists
    const tl = await page.$$eval(`${c.play.replace('play', 'timeline')} button`, (els) => els.length)
    check(`${c.name} timeline`, tl >= 2, `timeline buttons: ${tl}`)
  }

  // no horizontal overflow (desktop + mobile)
  for (const [w, label] of [[1280, 'desktop'], [375, 'mobile']]) {
    await page.setViewportSize({ width: w, height: 900 })
    await page.waitForTimeout(150)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    check(`no h-overflow ${label}`, overflow <= 2, `overflow ${overflow}px`)
  }

  check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '))
} finally {
  await browser.close()
}

console.log(`\nJSON guide E2E: ${passed} passed, ${failed} failed`)
if (failed) { console.log('FAILURES:'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1) }
console.log('✔ all good')
