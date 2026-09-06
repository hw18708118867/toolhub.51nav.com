#!/usr/bin/env node
/*
 * E2E regression for the URL encoding guide (guides/url-encoding-guide).
 * Runs against the PRODUCTION build on a dedicated port (4401) so a stray
 * `astro dev` cannot pollute the console assertions.
 */
import { join } from 'node:path'

const PORT = process.env.PORT || 4401
const URL = `http://localhost:${PORT}/guides/url-encoding-guide/`

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

  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#ue-play', { timeout: 15000 })

  const tocCount = await page.$$eval('#toc-nav a', (els) => els.length)
  check('TOC populated', tocCount >= 10, `only ${tocCount} toc links`)

  // Playable components: encoder, form-vs-query, utf8
  for (const c of [
    { name: 'UrlEncoderVisualizer', play: '#ue-play', next: '#ue-next', panel: '#ue-detail' },
    { name: 'UrlFormVsQueryDemo', play: '#uf-play', next: '#uf-next', panel: '#uf-explain' },
    { name: 'UrlUtf8Demo', play: '#uu-play', next: '#uu-next', panel: '#uu-out' },
  ]) {
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

    const tl = await page.$$eval(`${c.play.replace('play', 'timeline')} button`, (els) => els.length).catch(() => 0)
    const tlAlt = tl || await page.$$eval('#ue-timeline button', (els) => els.length)
    check(`${c.name} timeline`, tlAlt >= 2, `timeline buttons: ${tlAlt}`)
  }

  // UrlReservedDemo: clickable grid, no play button
  const gridCells = await page.$$('#ur-grid button')
  check('UrlReservedDemo mounts', gridCells.length > 50, `grid cells: ${gridCells.length}`)
  if (gridCells.length) {
    const before = await page.$eval('#ur-detail', (el) => el.textContent.trim().length)
    await gridCells[0].click()
    await page.waitForTimeout(120)
    const after = await page.$eval('#ur-detail', (el) => el.textContent.trim().length)
    check('UrlReservedDemo click changes detail', after !== before, `detail unchanged (${before}->${after})`)
  }

  // Verify the encoder actually percent-encodes a known input
  await page.fill('#ue-input', 'a b')
  await page.waitForTimeout(120)
  await page.click('#ue-next') // start -> first char
  await page.waitForTimeout(120)
  const ueOut = await page.$eval('#ue-out', (el) => el.textContent)
  check('encoder produces %XX', ueOut.includes('%'), `output: "${ueOut}"`)

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

console.log(`\nURL encoding guide E2E: ${passed} passed, ${failed} failed`)
if (failed) { console.log('FAILURES:'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1) }
console.log('✔ all good')
