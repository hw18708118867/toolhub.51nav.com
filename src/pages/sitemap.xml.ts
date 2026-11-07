import { tools } from '../data/tools'

const siteUrl = 'https://toolhub.51nav.com'

// No <lastmod>: a single build date applied to every URL tells Google the
// whole site changed on every deploy, which makes the field untrustworthy and
// gets it ignored (and can waste crawl budget). Reintroduce it only if it is
// derived from each page's real modification time.

// Auto-discover every guide page so a new guide is never left out of the
// sitemap. Excludes the guides index (index.astro).
const guideModules = import.meta.glob('../pages/guides/*.astro', { eager: true })
const guideSlugs = Object.keys(guideModules)
  .filter((p) => !p.endsWith('index.astro'))
  .map((p) => p.split('/').pop()!.replace(/\.astro$/, ''))
  .sort()

function urlEntry(path: string, priority = '0.6') {
  return `  <url><loc>${siteUrl}${path}</loc><priority>${priority}</priority></url>`
}

const staticPages = [
  { path: '/', priority: '1.0' },
  { path: '/tools/', priority: '0.9' },
  { path: '/guides/', priority: '0.9' },
  { path: '/about/', priority: '0.5' },
  { path: '/contact/', priority: '0.5' },
  { path: '/privacy/', priority: '0.3' },
  { path: '/terms/', priority: '0.3' },
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => urlEntry(p.path, p.priority)).join('\n')}
  <!-- Tool pages (priority 0.7) -->
${tools.map(t => urlEntry(`/tools/${t.id}/`, '0.7')).join('\n')}
  <!-- Guide pages (priority 0.8 — deeper content) -->
${guideSlugs.map(s => urlEntry(`/guides/${s}/`, '0.8')).join('\n')}
</urlset>
`

export async function GET() {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
