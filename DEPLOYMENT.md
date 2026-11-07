# Deployment Guide

DevTools Hub is a static Astro site. `npm run build` writes the production site
to `dist/`; GitHub Actions deploys that folder to GitHub Pages.

## Local development

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve the built dist/ locally
```

The build is static (`output: 'static'` in `astro.config.mjs`). `site` is
`https://toolhub.51nav.com`, which is also what canonical tags, OG tags,
`sitemap.xml` and `public/robots.txt` use. Keep them in sync if the domain
changes. `trailingSlash: 'always'` keeps one canonical URL form.

## Automatic deployment

`.github/workflows/deploy.yml` runs on every push to `main` (and via
`workflow_dispatch`). It installs dependencies, runs `npm run build`, uploads
`dist/` as a Pages artifact and deploys it. There is no Jekyll step and no
`_config.yml`; do not follow Jekyll or branch-deploy instructions.

### Custom domain

`public/CNAME` contains `toolhub.51nav.com` and is copied into `dist/` on every
build. Point DNS at GitHub Pages:

- `CNAME toolhub -> <username>.github.io`
- In repo Settings → Pages, set the custom domain to `toolhub.51nav.com` and
  enable **Enforce HTTPS**.

### Analytics and Search Console variables

`src/layouts/BaseLayout.astro` reads `PUBLIC_GA4_ID` and `PUBLIC_GSC_CODE`.
Set them under repo **Settings → Secrets and variables → Actions → Variables**
(the workflow passes them as `vars.*` at build time). `.env.example` lists the
names for local development. Without real values, the built pages contain
placeholder IDs.

## Google Search Console

1. Add the `https://toolhub.51nav.com` property. DNS TXT verification is the
   most robust option; HTML-tag verification also works when
   `PUBLIC_GSC_CODE` is a real code.
2. Submit `https://toolhub.51nav.com/sitemap.xml` under **Sitemaps**.
3. Use **URL Inspection → Request Indexing** for the homepage and new guides.
4. Read **Indexing → Pages** to tell "Crawled – currently not indexed" (a
   content/authority problem) from "Discovered – currently not crawled" (a
   crawl-budget problem). They need different fixes.

## Sitemap and robots

- `src/pages/sitemap.xml.ts` is a custom endpoint that owns `/sitemap.xml`.
  It auto-discovers every `src/pages/guides/*.astro` via `import.meta.glob`,
  so a new guide is picked up with no edit. **Never install `@astrojs/sitemap`**
  — it conflicts with this endpoint.
- The sitemap deliberately has **no `<lastmod>`**. A build date applied to all
  URLs makes the field untrustworthy, so Google ignores it, and it can waste
  crawl budget. Only add it back if it reflects each page's real modification
  time.
- The deployed robots file is `public/robots.txt`. The root-level `robots.txt`
  is **not** copied by Astro; it exists only as a reference copy. Never put
  `{{ site.url }}` in a robots file — Astro does not expand it.

## Adding a guide

Follow the `interactive-tech-guide` skill. In short: pass
`datePublished`/`dateModified` to `GuideLayout` (both required), list the guide
in `src/pages/guides/index.astro` (otherwise it is an orphan reachable only via
the sitemap), and link it to and from the related tool pages.

## Troubleshooting

| Symptom | Check |
|---|---|
| Site not updating | Actions run log; confirm `npm run build` succeeded and the deploy job ran |
| Guide missing from sitemap | It must be a flat `src/pages/guides/*.astro` file; rebuild and grep `dist/sitemap.xml` |
| Canonical / OG URL wrong | `site` in `astro.config.mjs` |
| 404 on deep links | GitHub Pages needs `public/CNAME` and the custom domain configured |
| Local build exits 1 | Some local VSCode extensions intercept Astro's cleanup of `dist/pages/**/*.astro.mjs`; the pages are still generated. CI is unaffected. |
