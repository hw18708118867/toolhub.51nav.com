# Verification: Build, FIPS vectors, and E2E regression

Never ship a guide on a green local dev server alone. The AES guide broke in
subtle ways that only showed up under a real build + headless browser. Verify
in this order.

## 1. Production build

```bash
npm run build
```

Must complete with no errors. If your interactive component has a bad Tailwind
arbitrary class or an unescaped `<` in `set:html`, this catches it.

## 2. Algorithm correctness (if you touch `src/lib/aes.ts`)

```bash
npm run verify:aes
```

Runs FIPS-197 known-answer vectors (41 cases). If a diagram change touched the
teaching lib, this proves you didn't regress it. Add a case here when you add a
new primitive.

## 3. E2E regression against the PRODUCTION build

Run Playwright against the built site, **not** a leftover `astro dev` server
(which can pollute `console` assertions and give false passes). Use a dedicated
port (the AES guide uses `4399`) so a stray `astro dev` on `4321` can't
interfere.

```bash
npm run preview -- --port 4399 &   # or: npx astro preview --port 4399
node scripts/e2e-aes-guide.mjs
```

The E2E script (see `scripts/e2e-aes-guide.mjs` as a template) should assert:

- Every interactive component container exists and its control buttons mount.
- Clicking play advances the step index; clicking step changes the rendered
  state; pause halts the timer.
- The TOC `#toc-nav` is populated from `h2`/`h3`.
- `page.on('console', msg => ...)` fails the run on any `error` level message.
- No horizontal overflow: `document.documentElement.scrollWidth <=
  window.innerWidth + 2` on desktop **and** a mobile viewport (e.g. 375px).
- The related-tools links and any internal cross-links resolve (HTTP 200) — or
  at least that the anchors exist.

### Playwright module resolution gotcha

Playwright is usually installed via `npx playwright` and lives in the npx cache,
**not** `node_modules`. Don't rely on `NODE_PATH=$(npm root -g)` — on many
machines that points at a global dir without playwright and `require` fails.
Instead locate it programmatically (see `scripts/_browser.mjs`, which walks
`~/.npm/_npx/*/node_modules`). `npm run e2e:aes-guide` already does this.

## 4. Manual screenshot check (optional but recommended)

Use a screenshot script (see `scripts/shoot-aes-guide.mjs`) at desktop and
mobile widths to eyeball the diagrams and dark mode. The scanner and E2E catch
errors; they don't catch "looks ugly".
