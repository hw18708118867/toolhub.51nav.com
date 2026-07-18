import { tools } from '../data/tools'

const guideSlugs = [
  'base64-image-guide', 'character-counting-guide', 'character-encoding-guide',
  'ciphers-encoding-guide', 'cron-expressions-guide', 'cron-generator-guide',
  'css-color-gradient-guide', 'csv-json-conversion-guide', 'dns-log-monitoring-guide',
  'dns-records-guide', 'http-headers-guide', 'ip-addresses-guide',
  'json-comparison-guide', 'json-conversion-guide', 'json-debugging-guide',
  'json-escaping-guide', 'json-structure-guide', 'jwt-deep-dive-guide',
  'line-counting-guide', 'line-deduplication-guide', 'lorem-ipsum-guide',
  'naming-conventions-guide', 'number-bases-guide', 'password-hash-guide',
  'ping-tool-guide', 'port-checking-guide', 'qr-codes-guide',
  'query-string-parsing-guide', 'random-string-guide', 'regex-generator-guide',
  'regex-reference-guide', 'remove-empty-lines-guide', 'reverse-text-guide',
  'robots-txt-guide', 'shuffle-lines-guide', 'sitemap-guide',
  'sort-lines-guide', 'sql-tools-guide', 'sql-formatting-guide',
  'ssl-certificates-guide', 'string-escaping-guide', 'text-diffing-guide',
  'text-processing-guide', 'timezone-converter-guide', 'unix-timestamps-guide',
  'url-slugs-guide', 'url-structure-guide', 'user-agent-guide',
  'web-encoding-guide', 'whois-lookup-guide', 'dev-tools-guide',
  'shell-tools-guide', 'crypto-tools-guide', 'color-tools-guide',
  'image-tools-guide', 'html-minification-guide', 'css-minification-guide',
  'flexbox-guide', 'css-grid-guide', 'box-shadow-guide',
  'border-radius-guide', 'svg-workflow-guide', 'word-count-seo-guide',
  'how-to-generate-uuid', 'how-to-format-json', 'how-to-decode-base64',
  'how-to-test-regex', 'how-to-generate-secure-password', 'how-to-convert-unix-timestamp',
  'how-to-decode-jwt', 'how-to-generate-sha256-hash', 'how-to-pick-css-colors',
  'how-to-preview-markdown',
]

const siteUrl = 'https://toolhub.51nav.com'

// Build date for lastmod — regenerates on every deploy
const today = new Date().toISOString().split('T')[0]

function urlEntry(path: string, priority = '0.6', lastmod?: string) {
  const lm = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url><loc>${siteUrl}${path}</loc>${lm}<priority>${priority}</priority></url>`
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
${staticPages.map(p => urlEntry(p.path, p.priority, today)).join('\n')}
  <!-- Tool pages (priority 0.7) -->
${tools.map(t => urlEntry(`/tools/${t.id}/`, '0.7', today)).join('\n')}
  <!-- Guide pages (priority 0.8 — deeper content) -->
${guideSlugs.map(s => urlEntry(`/guides/${s}/`, '0.8', today)).join('\n')}
</urlset>
`

export async function GET() {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
