import { tools } from '../data/tools'

// Guide slugs — add new guides here when created
const guideSlugs = [
  'base64-image-guide',
  'character-counting-guide',
  'character-encoding-guide',
  'ciphers-encoding-guide',
  'cron-expressions-guide',
  'cron-generator-guide',
  'css-color-gradient-guide',
  'csv-json-conversion-guide',
  'dns-log-monitoring-guide',
  'dns-records-guide',
  'http-headers-guide',
  'ip-addresses-guide',
  'json-comparison-guide',
  'json-conversion-guide',
  'json-debugging-guide',
  'json-escaping-guide',
  'json-structure-guide',
  'jwt-deep-dive-guide',
  'line-counting-guide',
  'line-deduplication-guide',
  'lorem-ipsum-guide',
  'naming-conventions-guide',
  'number-bases-guide',
  'password-hash-guide',
  'ping-tool-guide',
  'port-checking-guide',
  'qr-codes-guide',
  'query-string-parsing-guide',
  'random-string-guide',
  'regex-generator-guide',
  'regex-reference-guide',
  'remove-empty-lines-guide',
  'reverse-text-guide',
  'robots-txt-guide',
  'shuffle-lines-guide',
  'sitemap-guide',
  'sort-lines-guide',
  'sql-tools-guide',
  'sql-formatting-guide',
  'ssl-certificates-guide',
  'string-escaping-guide',
  'text-diffing-guide',
  'text-processing-guide',
  'timezone-converter-guide',
  'unix-timestamps-guide',
  'url-slugs-guide',
  'url-structure-guide',
  'user-agent-guide',
  'web-encoding-guide',
  'whois-lookup-guide',
  'color-tools-guide',
  'image-tools-guide',
  'html-minification-guide',
  'css-minification-guide',
  'flexbox-guide',
  'css-grid-guide',
  'box-shadow-guide',
  'border-radius-guide',
  'svg-workflow-guide',
  'word-count-seo-guide',
]

const siteUrl = 'https://toolhub.51nav.com'

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
  <!-- Tool pages -->
${tools.map(t => urlEntry(`/tools/${t.id}/`)).join('\n')}
  <!-- Guide pages -->
${guideSlugs.map(s => urlEntry(`/guides/${s}/`)).join('\n')}
</urlset>
`

export async function GET() {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
