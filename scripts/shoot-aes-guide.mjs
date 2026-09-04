/** Capture screenshots of each interactive component for visual review. */
import { launch } from './_browser.mjs'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL || 'http://localhost:4399/guides/aes-encryption-guide/'
const OUT = process.env.OUT || '/tmp/aes-shots'

mkdirSync(OUT, { recursive: true })

const browser = await launch()

const shots = [
  ['round-visualizer', '#aes-round-viz'],
  ['modes', '#mvModes'],
  ['penguin', '#pgPlain'],
  ['iv-reuse', '#ivA'],
  ['padding', '#pdText'],
  ['pbkdf2', '#pbRun'],
  ['tamper', '#tmFlip'],
]

for (const [name, width, height] of [['desktop', 1400, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  for (const [label, sel] of shots) {
    await page.locator(sel).first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    const box = await page.evaluate((s) => {
      // The dashed wrapper is the component root; walk up to it.
      let node = document.querySelector(s)
      while (node && !(node.className || '').toString().includes('my-10')) node = node.parentElement
      if (!node) node = document.querySelector(s)
      const r = node.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height }
    }, sel)
    await page.screenshot({
      path: `${OUT}/${name}-${label}.png`,
      clip: {
        x: Math.max(0, box.x - 8),
        y: Math.max(0, box.y - 8),
        width: Math.min(box.width + 16, width),
        height: Math.min(box.height + 16, 4000),
      },
    })
    console.log(`saved ${name}-${label}.png`)
  }
  await page.close()
}

await browser.close()
console.log(`done -> ${OUT}`)
