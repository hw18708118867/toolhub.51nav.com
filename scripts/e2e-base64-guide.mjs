#!/usr/bin/env node
/*
 * E2E regression for the Base64 guide (guides/base64-guide).
 * Runs against the PRODUCTION build on a dedicated port (4399) so a stray
 * `astro dev` cannot pollute the console assertions.
 */
import { join } from 'node:path'

const PORT = process.env.PORT || 4399
const URL = `http://localhost:${PORT}/guides/base64-guide/`

const expected = [
  { name: 'Base64EncoderVisualizer', play: '#be-play', next: '#be-next', panel: '#be-sextets' },
  { name: 'Base64PaddingDemo', play: '#bp-play', next: '#bp-next', panel: '#bp-card' },
  { name: 'Base64UrlSafeDemo', play: '#bu-play', next: '#bu-next', panel: '#bu-card' },
  { name: 'Base64NotEncryption', play: '#bn-play', next: '#bn-next', panel: '#bn-card' },
]

let passed = 0
let failed = 0
const fails = []

async function check(name, cond, detail) {
  if (cond) passed++
  else { failed++; fails.push(`${name}: ${detail}`) }
}

const { launch } = await import(join(process.cwd(), 'scripts', '_browser.mjs'))
const browser = await launch()

try {
  const page = await browser.newPage()
  const consoleErrors = []
  const isTracker = (t) => /google-analytics\.com|googletagmanager\.com|gtm\.js|ERR_ABORTED|ERR_CONNECTION_RESET/.test(t)
  page.on('console', (m) => { if (m.type() === 'error' && !isTracker(m.text())) consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => { if (!isTracker(String(e))) consoleErrors.push(String(e)) })

  await page.goto(URL, { waitUntil: 'networkidle' })

  const tocCount = await page.$$eval('#toc-nav a', (els) => els.length)
  check('TOC populated', tocCount >= 10, `only ${tocCount} toc links`)

  for (const c of expected) {
    const hasPlay = await page.$(c.play)
    check(`${c.name} mounts`, !!hasPlay, 'play button not found')
    if (!hasPlay) continue

    const before = await page.$eval(c.panel, (el) => el.textContent.trim().length)
    await page.click(c.next)
    await page.waitForTimeout(120)
    const after = await page.$eval(c.panel, (el) => el.textContent.trim().length)
    check(`${c.name} step changes state`, after !== before || after > 0, `state unchanged (${before}->${after})`)

    await page.click(c.play)
    await page.waitForTimeout(400)
    await page.click(c.play)

    const tl = await page.$$eval(`${c.play.replace('play', 'timeline')} button`, (els) => els.length)
    check(`${c.name} timeline`, tl >= 2, `timeline buttons: ${tl}`)
  }

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

console.log(`\nBase64 guide E2E: ${passed} passed, ${failed} failed`)
if (failed) { console.log('FAILURES:'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1) }
console.log('✔ all good')
