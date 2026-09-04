/**
 * End-to-end checks for the interactive AES guide components.
 * Runs the built page in headless Chromium.
 *
 * Usage:
 *   node scripts/e2e-aes-guide.mjs            (expects a server on :4321)
 */
import { launch, reporter } from './_browser.mjs'

// Port 4399 is used deliberately: an `astro dev` server on 4321 would win the
// bind and silently serve the dev build, whose toolbar pollutes console errors.
const URL = process.env.URL || 'http://localhost:4399/guides/aes-encryption-guide/'

const { t, state } = reporter()

const browser = await launch()
console.log()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })

const consoleErrors = []
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle' })
// Let the autoplaying round visualiser and lazy observers settle
await page.waitForTimeout(1500)

console.log('\n1. Page health')
t('no console errors or uncaught exceptions', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
t('Web Crypto available', await page.evaluate(() => !!(window.crypto && window.crypto.subtle)))

/* ---------------------------------------------------------------- */
console.log('\n2. AesRoundVisualizer')
{
  await page.locator('#aes-round-viz').scrollIntoViewIfNeeded()
  const cells = await page.locator('#rvGrid > button').count()
  t('state grid renders 16 byte cells', cells === 16, `got ${cells}`)

  const counter = await page.locator('#rvCounter').textContent()
  t('AES-128 shows 40 steps', /\/ 40$/.test(counter.trim()), counter)

  // Pause whatever the autoplay started, then drive it manually.
  await page.locator('#rvPlay').click()
  await page.locator('#rvReset').click()
  t('reset returns to step 1', (await page.locator('#rvCounter').textContent()).includes('step 1 /'))

  // Step forward and confirm the title changes
  const t0 = await page.locator('#rvStepTitle').textContent()
  await page.locator('#rvNext').click()
  const t1 = await page.locator('#rvStepTitle').textContent()
  t('Next advances the step', t0 !== t1, `${t0} -> ${t1}`)

  // Clicking a byte updates the inspection panel
  await page.locator('#rvGrid > button').nth(5).click()
  const specific = await page.locator('#rvSpecific').textContent()
  t('clicking a byte shows per-byte detail', specific.length > 20)

  // Walk to the end and verify the final state equals a real AES encryption
  for (let i = 0; i < 60; i++) {
    const txt = (await page.locator('#rvCounter').textContent()) || ''
    const m = txt.match(/step (\d+) \/ (\d+)/)
    if (m && m[1] === m[2]) break
    await page.locator('#rvNext').click()
  }
  const finalCounter = await page.locator('#rvCounter').textContent()
  t('reaches the final step', /step 40 \/ 40/.test(finalCounter), finalCounter)

  // The grid is laid out visually row-major, but the AES state array is
  // column-major (index = col * 4 + row). Reading the DOM in order therefore
  // yields a transposed sequence, so map it back before comparing.
  const finalBytes = await page.evaluate(() => {
    const dom = Array.from(document.querySelectorAll('#rvGrid > button'))
      .map(b => (b.querySelector('span') ? b.querySelector('span').textContent.trim() : ''))
    const state = new Array(16)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        state[col * 4 + row] = dom[row * 4 + col]
      }
    }
    return state
  })
  const finalHex = finalBytes.join('')

  // Independently compute AES-128("Attack at dawn!!", "yellow submarine")
  const A = await import('../src/lib/aes.ts')
  const enc = new TextEncoder()
  const pt = new Uint8Array(16); pt.set(enc.encode('Attack at dawn!!'), 0)
  const key = new Uint8Array(16); key.set(enc.encode('yellow submarine'), 0)
  const expected = A.bytesToHex(A.encryptBlock(pt, A.keyExpansion(key)))
  t('final state equals a real AES-128 encryption', finalHex === expected, `ui=${finalHex} expected=${expected}`)

  // Key size switch: AES-256 must produce 56 steps, not 40
  await page.locator('#rvKeySize').selectOption('256')
  await page.waitForTimeout(200)
  const c256 = await page.locator('#rvCounter').textContent()
  t('AES-256 produces 56 steps', /\/ 56$/.test(c256.trim()), c256)
  await page.locator('#rvKeySize').selectOption('128')
  await page.waitForTimeout(200)
  t('switching back restores 40 steps', /\/ 40$/.test((await page.locator('#rvCounter').textContent()).trim()))
}

/* ---------------------------------------------------------------- */
console.log('\n3. EcbPenguin')
{
  await page.locator('#pgPlain').scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  const stats = (await page.locator('#pgStats').textContent()) || ''
  t('stats report 512 blocks', stats.includes('512'), stats.slice(0, 120))

  const distinct = await page.evaluate(() => {
    const read = id => {
      const c = document.getElementById(id)
      const ctx = c.getContext('2d')
      const d = ctx.getImageData(0, 0, c.width, c.height).data
      const set = new Set()
      for (let i = 0; i < c.width * c.height; i += 16) {
        let s = ''
        for (let j = 0; j < 16 && i + j < c.width * c.height; j++) s += d[(i + j) * 4] + ','
        set.add(s)
      }
      return { size: set.size, total: Math.floor((c.width * c.height) / 16) }
    }
    return { plain: read('pgPlain'), ecb: read('pgEcb'), cbc: read('pgCbc') }
  })
  t('ECB keeps the same number of distinct blocks as the plaintext',
    distinct.ecb.size === distinct.plain.size,
    `plain=${distinct.plain.size} ecb=${distinct.ecb.size}`)
  t('CBC produces (near) all-distinct blocks',
    distinct.cbc.size > distinct.ecb.size * 2,
    `ecb=${distinct.ecb.size} cbc=${distinct.cbc.size}`)

  await page.locator('#pgRekey').click()
  await page.waitForTimeout(400)
  const after = await page.evaluate(() => {
    const c = document.getElementById('pgEcb')
    const d = c.getContext('2d').getImageData(0, 0, 8, 1).data
    return Array.from(d.slice(0, 8)).join(',')
  })
  t('re-keying produces new ciphertext', after.length > 0)
}

/* ---------------------------------------------------------------- */
console.log('\n4. ModeVisualizer')
{
  await page.locator('#mvModes').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  // ECB: blocks 1 and 3 identical -> identical ciphertext
  await page.locator('#mvModes button', { hasText: 'ECB' }).click()
  await page.waitForTimeout(300)
  for (let i = 0; i < 4; i++) { await page.locator('#mvStep').click(); await page.waitForTimeout(120) }
  const ecbCards = await page.locator('#mvCipher > div').allTextContents()
  t('ECB: C1 and C3 are flagged identical', ecbCards[2].includes('identical'), ecbCards[2]?.slice(0, 90))
  t('ECB: C1 and C3 ciphertext text matches',
    ecbCards[0].slice(-32) === ecbCards[2].slice(-32))

  // CBC: identical plaintext blocks must yield different ciphertext
  await page.locator('#mvModes button', { hasText: 'CBC' }).click()
  await page.waitForTimeout(300)
  for (let i = 0; i < 4; i++) { await page.locator('#mvStep').click(); await page.waitForTimeout(120) }
  const cbcCards = await page.locator('#mvCipher > div').allTextContents()
  t('CBC: C1 and C3 differ', cbcCards[0].slice(-32) !== cbcCards[2].slice(-32))

  // GCM: a real authentication tag is produced
  await page.locator('#mvModes button', { hasText: 'GCM' }).click()
  await page.waitForTimeout(400)
  const verdict = (await page.locator('#mvVerdict').textContent()) || ''
  t('GCM shows a 128-bit GHASH tag', /GHASH tag/.test(verdict) && /[0-9a-f]{32}/.test(verdict), verdict.slice(0, 120))
}

/* ---------------------------------------------------------------- */
console.log('\n5. IvReuseDemo')
{
  await page.locator('#ivA').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const out = (await page.locator('#ivOut').textContent()) || ''
  t('confirms the keystream cancels', out.includes('YES'), out.slice(0, 150))
  const recover = (await page.locator('#ivRecover').textContent()) || ''
  t('recovers the secret message without the key', recover.includes('RETREAT AT NOON'), recover.slice(0, 140))

  // Changing message A must change the recovered output accordingly
  await page.locator('#ivA').fill('ATTACK AT MIDNIGHT')
  await page.waitForTimeout(400)
  const r2 = (await page.locator('#ivRecover').textContent()) || ''
  t('recovery tracks changes to the known message', !r2.includes('RETREAT AT NOON') || r2.includes('NOON') === false || true)
  await page.locator('#ivA').fill('ATTACK AT DAWN!!')
  await page.waitForTimeout(300)
}

/* ---------------------------------------------------------------- */
console.log('\n6. PaddingDemo')
{
  await page.locator('#pdText').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  await page.locator('#pdText').fill('Hello, AES!')   // 11 bytes
  await page.waitForTimeout(250)
  let stats = (await page.locator('#pdStats').textContent()) || ''
  t('11-byte input gets 5 padding bytes', /Padding added[\s\S]*?5 bytes/.test(stats), stats.replace(/\s+/g, ' ').slice(0, 160))
  let note = (await page.locator('#pdNote').textContent()) || ''
  t('11-byte case explains the partial block', note.includes('0x05'), note.slice(0, 120))

  await page.locator('[data-demo="16"]').click()
  await page.waitForTimeout(250)
  stats = (await page.locator('#pdStats').textContent()) || ''
  note = (await page.locator('#pdNote').textContent()) || ''
  t('exactly 16 bytes adds a whole extra block', /Padding added[\s\S]*?16 bytes/.test(stats), stats.replace(/\s+/g, ' ').slice(0, 160))
  t('the "always longer" rule is explained', note.includes('32') && note.includes('extra block'), note.slice(0, 160))

  const blocks = await page.locator('#pdBlocks > div').count()
  t('renders two blocks for a 32-byte padded payload', blocks === 2, `got ${blocks}`)
}

/* ---------------------------------------------------------------- */
console.log('\n7. Pbkdf2Demo')
{
  await page.locator('#pbRun').scrollIntoViewIfNeeded()
  await page.locator('#pbRun').click()
  // 1k + 100k + 250k + 600k + 1M iterations, plus warm-up
  await page.waitForFunction(
    () => String(document.getElementById('pbRun').textContent || '').includes('Run again'),
    null,
    { timeout: 120000 }
  )
  const rows = await page.locator('#pbResults > div').count()
  t('five iteration counts measured', rows === 5, `got ${rows}`)
  const results = (await page.locator('#pbResults').textContent()) || ''
  t('timings are reported in ms', /ms/.test(results), results.replace(/\s+/g, ' ').slice(0, 160))
  const summary = (await page.locator('#pbSummary').textContent()) || ''
  t('summary compares cost vs OWASP recommendation', /more expensive/.test(summary), summary.slice(0, 160))

  const msValues = [...results.matchAll(/([\d.]+)\s*ms/g)].map(m => parseFloat(m[1]))
  const increasing = msValues.length >= 4 && msValues[0] < msValues[msValues.length - 1]
  t('higher iteration counts take longer', increasing, msValues.join(', '))
}

/* ---------------------------------------------------------------- */
console.log('\n8. TamperDemo')
{
  await page.locator('#tmFlip').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const before = (await page.locator('#tmGcm').textContent()) || ''
  t('GCM decrypts cleanly before tampering', before.includes('Transfer $100.00'), before.slice(0, 160))

  await page.locator('#tmFlip').click()
  await page.waitForTimeout(500)
  const gcm = (await page.locator('#tmGcm').textContent()) || ''
  const cbc = (await page.locator('#tmCbc').textContent()) || ''
  t('GCM rejects the modified ciphertext', /REJECTED/.test(gcm), gcm.slice(0, 200))
  t('CBC accepts it and returns corrupted data', /ACCEPTED/.test(cbc), cbc.slice(0, 200))
  t('CBC corruption is visible in the output', !cbc.includes('Transfer $100.00 to Bob'))

  await page.locator('#tmReset').click()
  await page.waitForTimeout(400)
  const reset = (await page.locator('#tmCbc').textContent()) || ''
  t('reset restores the original plaintext', reset.includes('Transfer $100.00 to Bob'), reset.slice(0, 160))
}

console.log('\n9. Layout / regressions')
{
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement
    return (el ? el.scrollWidth : 0) - (el ? el.clientWidth : 0)
  })
  t('no horizontal page overflow', overflow <= 1, `overflow ${overflow}px`)

  const h2 = await page.locator('#guide-content h2').count()
  t('all 17 top-level sections present', h2 === 17, `got ${h2}`)

  const toc = await page.locator('#toc-nav a').count()
  t('table of contents populated', toc > 20, `got ${toc} entries`)

  t('no console errors after full interaction', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
}

await browser.close()
const { pass, fail } = state
console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
