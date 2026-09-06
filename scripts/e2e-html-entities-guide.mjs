#!/usr/bin/env node
/*
 * E2E regression for the HTML entities guide (guides/html-entities-guide).
 * Runs against the PRODUCTION build on a dedicated port (4402) so a stray
 * `astro dev` cannot pollute the console assertions.
 */
import { join } from 'node:path'

const PORT = process.env.PORT || 4402
const URL = `http://localhost:${PORT}/guides/html-entities-guide/`

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
  await page.waitForSelector('#he-play', { timeout: 15000 })

  const tocCount = await page.$$eval('#toc-nav a', (els) => els.length)
  check('TOC populated', tocCount >= 10, `only ${tocCount} toc links`)

  // Playable encoder
  const hasPlay = await page.$('#he-play')
  check('HtmlEntityEncoder mounts', !!hasPlay, 'play button not found')
  if (hasPlay) {
    // Bring the component into view first so its IntersectionObserver fires
    // and disconnects before we interact (avoids a late reset racing the click).
    await page.$eval('#he-chars', (el) => el.scrollIntoView())
    await page.waitForTimeout(250)

    const before = await page.$eval('#he-detail', (el) => el.textContent.trim())
    await page.click('#he-next')
    await page.waitForTimeout(150)
    const after = await page.$eval('#he-detail', (el) => el.textContent.trim())
    check('encoder step changes state', after !== before, `state unchanged (${before}->${after})`)
    await page.click('#he-play'); await page.waitForTimeout(400); await page.click('#he-play')
    const tl = await page.$$eval('#he-timeline button', (els) => els.length)
    check('encoder timeline', tl >= 2, `timeline buttons: ${tl}`)

    await page.fill('#he-input', 'a & b')
    await page.waitForTimeout(150)
    await page.click('#he-reset')
    await page.waitForTimeout(120)
    await page.click('#he-next'); await page.click('#he-next'); await page.click('#he-next')
    await page.waitForTimeout(150)
    const out = await page.$eval('#he-out', (el) => el.textContent)
    check('encoder produces &amp;', out.includes('&amp;'), `output: "${out}"`)
  }

  // Named/decimal/hex grid (no play)
  const cells = await page.$$('#hf-grid button')
  check('HtmlEntityForms mounts', cells.length > 10, `grid cells: ${cells.length}`)
  if (cells.length) {
    const before = await page.$eval('#hf-detail', (el) => el.textContent.trim().length)
    await cells[0].click(); await page.waitForTimeout(120)
    const after = await page.$eval('#hf-detail', (el) => el.textContent.trim().length)
    check('forms click changes detail', after !== before, `detail unchanged (${before}->${after})`)
  }

  // Ampersand ambiguity (presets)
  await page.click('.ha-preset[data-v="AT&T"]')
  await page.waitForTimeout(120)
  const dec = await page.$eval('#ha-dec', (el) => el.textContent)
  check('ampersand preset decodes literally', dec === 'AT&T', `decoded: "${dec}"`)

  // Non-breaking space toggle
  const nbBefore = await page.$eval('#hn-explain', (el) => el.textContent.trim())
  await page.click('#hn-toggle')
  await page.waitForTimeout(120)
  const nbAfter = await page.$eval('#hn-explain', (el) => el.textContent.trim())
  check('nbsp toggle changes explainer', nbAfter !== nbBefore, `explainer unchanged`)

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

console.log(`\nHTML entities guide E2E: ${passed} passed, ${failed} failed`)
if (failed) { console.log('FAILURES:'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1) }
console.log('✔ all good')
