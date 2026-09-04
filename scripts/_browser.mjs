/**
 * Shared Playwright bootstrap for the browser checks in this directory.
 *
 * Playwright pins one browser revision per version, and the binary that
 * happens to be in the cache may not match the installed Playwright. Rather
 * than force a download, we locate whatever Chromium is already installed.
 *
 * Playwright itself is resolved from the npx cache, so it never has to become
 * a project dependency:
 *   NODE_PATH=$(npm root -g) ... or pass NODE_PATH explicitly
 */
import { createRequire } from 'node:module'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * Playwright is installed via `npx playwright` and lives in the npx cache
 * rather than a project dependency. Locate it across the likely roots instead
 * of relying on a shell-supplied NODE_PATH (which silently points elsewhere).
 */
function loadPlaywright() {
  const roots = [import.meta.url]
  if (process.env.NODE_PATH) roots.push(join(process.env.NODE_PATH, 'resolve.js'))

  const npxBase = join(homedir(), '.npm/_npx')
  if (existsSync(npxBase)) {
    for (const d of readdirSync(npxBase)) {
      roots.push(join(npxBase, d, 'node_modules', 'resolve.js'))
    }
  }
  roots.push(join(homedir(), 'node_modules', 'resolve.js'))
  roots.push('/opt/homebrew/lib/node_modules/resolve.js')

  let lastErr
  for (const r of roots) {
    try { return createRequire(r)('playwright') }
    catch (e) { lastErr = e }
  }
  throw new Error('Could not resolve "playwright". Run: npx playwright install chromium — ' + lastErr?.message)
}

export function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH

  if (process.platform === 'darwin') {
    const stable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    if (existsSync(stable)) return stable
  }

  const root = join(homedir(), 'Library/Caches/ms-playwright')
  if (!existsSync(root)) return undefined

  const dirs = readdirSync(root)
    .filter(d => d.startsWith('chromium'))
    .sort()
    .reverse()

  const candidates = [
    'chrome-headless-shell-mac-arm64/chrome-headless-shell',
    'chrome-headless-shell-linux/chrome-headless-shell',
    'chrome-mac-arm64/Chromium',
    'chrome-linux/chrome',
  ]

  for (const d of dirs) {
    const hit = candidates.map(c => join(root, d, c)).find(p => existsSync(p))
    if (hit) return hit
  }
  return undefined
}

export async function launch() {
  const executablePath = findBrowser()
  if (!executablePath) {
    throw new Error('No Chromium found. Run: npx playwright install chromium')
  }
  console.log(`Using browser: ${executablePath}`)
  const { chromium } = loadPlaywright()
  return chromium.launch({ executablePath })
}

/**
 * Thrown together reporter used by the verification scripts.
 */
export function reporter() {
  const state = { pass: 0, fail: 0 }
  const t = (name, cond, extra = '') => {
    if (cond) { state.pass++; console.log(`  ok   ${name}`) }
    else { state.fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`) }
  }
  return { t, state }
}
