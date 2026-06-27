const fs = require("fs");
const path = require("path");

const extras = {
  "naming-conventions-guide": `
<h2>Case Conversion in Full-Stack Projects</h2>
<p>When your Python backend sends snake_case JSON to your JavaScript frontend expecting camelCase, every key needs conversion. Most teams handle this with a transformation layer rather than manual conversion. On the backend, Django REST Framework has a camelCase renderer; FastAPI can configure response serialization. On the frontend, libraries like camelcase-keys and humps recursively transform object keys. The transformation should happen at exactly one boundary — either the backend serializes in the clients format, or the frontend normalizes after receiving. Doing both creates double-conversion bugs where snake_case becomes camelCase becomes something unrecognizable.</p>
<p>For database integrations, most ORMs handle naming convention mapping. SQLAlchemy can auto-map snake_case PostgreSQL columns to camelCase Python properties. Sequelize and TypeORM offer underscored options for Node.js. If your ORM lacks this, write a single utility function rather than sprinkling ad-hoc conversions through your codebase. A function named <code>snakeToCamel(str)</code> called in one place is maintainable and testable. Fifty inline regex replacements are neither.</p>`,

  "css-color-gradient-guide": `
<h2>Building a Color System That Scales</h2>
<p>A well-designed color system uses HSL for its palette definitions and HEX for its design tokens. Define your base colors in HSL so you can derive lighter and darker variants by adjusting only the lightness value. Export the computed values as HEX for use in CSS custom properties. This gives you the flexibility of HSL (easy to create variants) with the compatibility of HEX (universally supported, easy to copy-paste from design tools). Tailwind CSS uses exactly this approach — its color palette is defined in HSL but exported as HEX and RGB.</p>
<p>When building gradients, test them on multiple displays. A gradient that transitions smoothly on a calibrated design monitor may show visible banding on a consumer laptop screen. Banding happens when the color steps between two stops are large enough to be perceptible. Adding an intermediate color stop usually fixes it. Dark-to-light gradients are more prone to banding than gradients between similar colors. For production, render gradients with <code>background-color</code> as a fallback for browsers or contexts where gradients fail to load.</p>`,

  "unix-timestamps-guide": `
<h2>Timestamps in Distributed Systems</h2>
<p>In distributed systems, clock skew between servers makes timestamps unreliable for ordering events. Two servers can disagree about what time it is by seconds or even minutes. Network Time Protocol (NTP) keeps clocks synchronized to within tens of milliseconds on well-configured networks, but not all networks are well-configured. Cloud providers typically run NTP on their infrastructure, but container clocks can drift. For strict event ordering, use logical clocks (Lamport timestamps) or a distributed consensus system instead of relying on wall-clock timestamps.</p>
<p>When designing APIs that accept or return timestamps, document the unit clearly. "timestamp" alone is ambiguous. Specify "Unix timestamp in seconds" or "Unix timestamp in milliseconds." Include the integer width if relevant. A timestamp field documented as "64-bit Unix timestamp in milliseconds" leaves no room for misinterpretation. If you are consuming a third-party API, check the actual values returned — documentation is sometimes wrong, and the magnitude of the number (10 digits vs 13 digits) tells you the unit.</p>`,

  "line-deduplication-guide": `
<h2>Deduplication in Data Pipelines</h2>
<p>In ETL (Extract, Transform, Load) pipelines, deduplication is typically one step in a multi-stage cleaning process. The order matters: normalize first (lowercase, trim whitespace, standardize formats), then deduplicate, then validate. If you validate before deduplicating, you waste cycles validating duplicate records. If you deduplicate before normalizing, you miss duplicates that differ only in formatting. A well-ordered pipeline reduces compute cost and improves data quality.</p>
<p>For databases, deduplication is best handled at the schema level with UNIQUE constraints or primary keys. Application-level deduplication is a safety net, not the primary defense. If your database allows duplicate records, your application code will eventually introduce them. A UNIQUE constraint on the natural key (email address for a users table, domain name for a domains table) prevents duplicates at the storage layer, which is more reliable than any application-level check.</p>`,

  "word-count-seo-guide": `
<h2>Content-Length and User Intent</h2>
<p>Not every query needs a 2,000-word answer. Someone searching "weather Tokyo" wants a number and a forecast, not an essay. Someone searching "how to file 2024 taxes" needs comprehensive, step-by-step guidance. Google understands this — its algorithms evaluate content length relative to user intent. A 300-word page that perfectly answers a simple query can outrank a 2,000-word page that buries the answer in fluff. Match your content length to the searchers need, not to an arbitrary word count goal.</p>
<p>That said, longer content consistently attracts more backlinks, and backlinks are a top-three ranking factor. The mechanism: comprehensive content is more likely to be cited as a reference. If your article is the definitive resource on a topic, other sites link to it instead of writing their own. Word count correlates with rankings because it correlates with comprehensiveness, which correlates with backlinks. Write the most useful, complete answer to the query you are targeting. The word count will take care of itself.</p>`,

  "csv-json-conversion-guide": `
<h2>Building Robust CSV Import Pipelines</h2>
<p>A production CSV import pipeline needs more than a converter. It needs validation (are required columns present? are values in expected formats?), error handling (what happens when row 5,000 is malformed — reject the whole file or skip the bad row?), and logging (which rows were imported successfully, which failed, and why?). Most import failures in production are not conversion errors — they are data quality errors in the source CSV. A phone number field containing "N/A", a date field with inconsistent formatting, a required email field left blank. Build validation into your pipeline from the start.</p>
<p>For large CSV files, streaming parsers avoid loading the entire file into memory. Node.js has csv-parse with a streaming API. Python has csv.reader which yields rows one at a time. Streaming is essential for files over ~100MB — parsing a 500MB CSV into memory can crash your process. If your users are uploading CSVs of unknown size, always use a streaming parser with a configurable maximum file size.</p>`,

  "text-processing-guide": `
<h2>Text Processing as a Daily Developer Habit</h2>
<p>The developers who are fastest at debugging, data analysis, and code review share a common skill: they reach for text processing tools without thinking. A log file has 50,000 lines and you need to find unique error messages? Deduplicate and filter. An API response has inconsistent key casing across endpoints? Convert and normalize. A CSV export has duplicate rows from a JOIN bug? Deduplicate and count. Each individual operation takes seconds. The time savings come from doing them dozens of times per week instead of manually scrolling, copying, and comparing.</p>
<p>Build a mental toolkit: regex for pattern matching, case conversion for normalization, deduplication for cleaning, diff for comparison, word count for measurement. When you encounter a repetitive text task, ask "which of my tools solves this in one operation?" rather than reaching for manual editing. The habit compounds.</p>`,

  "web-encoding-guide": `
<h2>Encoding and API Design</h2>
<p>When designing an API that accepts or returns encoded data, document the expected encoding explicitly. An endpoint that accepts a Base64-encoded file upload should state "Request body: Base64-encoded binary data" in its documentation, not just "file." An endpoint that returns HTML-escaped text should specify whether clients need to unescape before displaying. Ambiguity about encoding is a common source of integration bugs where both sides assume the other handles the conversion.</p>
<p>For authentication headers, Base64 encoding is used in HTTP Basic Auth (Authorization: Basic base64(username:password)). This is encoding, not encryption. Anyone who intercepts the request can decode the credentials. Basic Auth should always be used over HTTPS, never over plain HTTP. For token-based auth, JWTs use Base64URL encoding (a variant that replaces + and / with - and _ to be URL-safe without percent-encoding).</p>`,

  "password-hash-guide": `
<h2>Password Policies That Actually Improve Security</h2>
<p>Forcing users to include uppercase, lowercase, numbers, and symbols produces passwords like "Password1!" — technically compliant, trivially crackable. NISTs current guidelines (SP 800-63B) recommend: minimum 8 characters (not 12, not 16 — 8), no composition rules (no required character types), check against known compromised passwords, and encourage longer passphrases over complex characters. The XKCD "correct horse battery staple" approach — four random words — produces more entropy than "P@ssw0rd!" and is easier to remember.</p>
<p>Rate limiting login attempts is at least as important as password strength requirements. A weak password that can only be tried 5 times before the account is locked for 15 minutes is more secure in practice than a strong password that an attacker can attempt 10,000 times per second. Hash your passwords with bcrypt or Argon2 (which are intentionally slow), and rate-limit your login endpoint (which limits attempts regardless of password strength). Both layers together provide defense in depth.</p>`,

  "lorem-ipsum-guide": `
<h2>Placeholder Text in Design Systems</h2>
<p>Component libraries and design systems often ship with Lorem Ipsum in their example content. This is convenient for developers who drop a component into a page and see what it looks like with text. But it creates a risk: a developer who forgets to replace the placeholder before merging to production ships Lorem Ipsum to real users. Design systems should make placeholder content visually obvious — use a distinct background color, a "PLACEHOLDER" label, or a console warning in development mode — so it is impossible to miss during review.</p>
<p>Some teams solve this by using realistic but obviously fake sample content instead of Lorem Ipsum. Names like "Jane Sample" and "Acme Corporation," addresses like "123 Main Street, Anytown," email addresses at example.com. This content looks real enough to test layouts but is clearly not production data. It also avoids the problem of Lorem Ipsum looking unprofessional when stakeholders review designs.</p>`,

  "json-debugging-guide": `
<h2>JSON Performance at Scale</h2>
<p>JSON.parse is fast for typical payloads — a few milliseconds for a 100KB response. But deserializing a 50MB JSON file in a single parse call can block the event loop for seconds. For large JSON payloads, use streaming parsers: Node.js has JSONStream and clarinet; browsers have the Streams API with a JSON parser like oboe.js. Streaming allows you to process records as they arrive rather than waiting for the entire payload to load and parse. This is essential for real-time dashboards, log viewers, and any application dealing with large JSON datasets.</p>
<p>JSON serialization can also be a bottleneck. JSON.stringify on a deeply nested object with circular references throws an error. Large arrays serialized to JSON for API responses should be paginated — sending 10,000 records in a single response is slow to generate, slow to transmit, and slow to parse on the client. Use cursor-based or offset-based pagination. Pagination also makes your API resilient to data growth: an endpoint that returns 50 records per page works the same whether the total dataset is 500 records or 5 million.</p>`,

  "dns-records-guide": `
<h2>DNS Migration: Moving Domains Without Downtime</h2>
<p>When migrating a domain between DNS providers, the key is lowering TTLs before the migration, not after. A day or two before the cutover, reduce TTLs on all records to 60-300 seconds. Then make the change at the new provider and update your domains nameservers at the registrar. The old records with low TTLs expire quickly, and resolvers pick up the new records. After verifying the migration is successful and stable, raise TTLs back to normal values (1800-86400 seconds) to reduce query load. The entire process takes 24-48 hours, not the "up to 72 hours" often quoted — that number assumes default TTLs of 86400 seconds, which you should already have lowered.</p>
<p>Always export your DNS records before beginning a migration. Most providers have an export function, but if not, use dig to query each record type. Save the export as both a file (for record-keeping) and as input for the new providers import tool. Verify the import by spot-checking critical records — your A record, MX records, and any TXT records for email authentication. A missed SPF or DKIM record can break email delivery, which users notice much faster than a slightly slower website.</p>`,

  "cron-expressions-guide": `
<h2>Cron in Modern Infrastructure</h2>
<p>While traditional cron runs on a single server, modern infrastructure distributes scheduled jobs across clusters. Kubernetes CronJobs create Jobs on a schedule, with configurable concurrency policies (Forbid prevents overlap, Replace kills the old job, Allow runs them concurrently). Vercel Cron Jobs run serverless functions on a schedule, with a maximum duration of 10-900 seconds depending on your plan. GitHub Actions scheduled workflows use cron syntax in the on.schedule field, but they run with a 5-minute granularity minimum and may be delayed during high-load periods. Each platform has its own quirks — test your schedule on the actual platform before relying on it.</p>
<p>Monitoring scheduled jobs requires different thinking than monitoring always-on services. A cron job that silently fails leaves no symptom except the work that did not get done — emails that were not sent, backups that were not created, reports that were not generated. Set up heartbeat monitoring: each successful job execution pings a monitoring endpoint. If the heartbeat stops, alert. This catches both "the job ran and failed" and "the job never ran at all" — two failure modes that cron exit codes do not distinguish.</p>`,

  "ip-addresses-guide": `
<h2>IP Addressing in Cloud Infrastructure</h2>
<p>Cloud providers add layers of indirection between IP addresses and your actual servers. AWS Elastic IPs are static public IPv4 addresses that you can remap between instances — useful for failover and whitelisting. Load balancers (ALB, NLB) have their own IPs that may change; you access them via DNS name, not IP. Cloudflare and other CDNs sit in front of your origin, so visitors see Cloudflares IP, not yours. Understanding this chain — user → CDN → load balancer → instance → application — is essential for debugging connectivity issues. The IP the user connects to is rarely the IP of your actual server.</p>
<p>Private IP ranges in cloud VPCs (Virtual Private Clouds) are even more important than public IPs for security. Your database should have a private IP only, accessible from your application servers within the VPC but not from the public internet. Security groups and network ACLs filter traffic by IP and port. A common misconfiguration: opening a database port to 0.0.0.0/0 (all IPs) instead of restricting it to the VPCs CIDR block. Always apply the principle of least privilege to IP-based access rules.</p>`,

  "password-hash-guide": `
<p class="hidden">placeholder for next section</p>`,

  "qr-codes-guide": `
<h2>QR Codes in Marketing and Product Design</h2>
<p>QR codes on printed materials bridge physical and digital experiences. A restaurant menu with a QR code linking to an online ordering page. A conference badge with a QR code encoding the attendees contact info. A product package with a QR code linking to setup instructions. The key design decision: does the QR code stand alone or integrate into the visual design? Standalone codes (black on white, prominent, obvious) scan the most reliably. Integrated codes (styled with brand colors, overlaid with logos, embedded in images) look better but require higher error correction levels and more testing.</p>
<p>Always test QR codes in their final context. A code that scans perfectly on your design monitor may fail when printed on a curved coffee cup, displayed on a TV screen at a trade show booth, or viewed through a scratched phone camera lens. Test with multiple phone models (iOS and Android, old and new) under the actual lighting conditions where the code will be scanned. One unreadable QR code at a conference or on a product package undermines the entire purpose of including it.</p>`,

  "sql-formatting-guide": `
<h2>Formatting SQL in Code Reviews</h2>
<p>During code review, formatted SQL reveals anti-patterns that unformatted SQL hides. A missing JOIN condition is obvious because the ON clause is empty or overly simple next to other JOINs with detailed conditions. A SELECT * becomes visible because the wildcard is the only token on its line. A WHERE clause using OR when AND was intended stands out because the indentation pattern changes. If your team formats SQL consistently, a reviewer can scan a query in seconds and spot structural problems without reading every line — the same way a proofreader catches misspelled words by the shape of the text, not by reading letter by letter.</p>
<p>For ORMs that generate SQL, formatting helps you understand what queries the ORM is actually producing. Many ORMs have a logging mode that outputs the generated SQL. Format that output before reviewing it. An ORM that generates a five-table JOIN with a subquery in the WHERE clause might be doing something you did not intend — but you will not notice unless the formatted SQL makes the structure visible. ORMs are productivity tools, not magic. Verify their output.</p>`,

  "ssl-certificates-guide": `
<h2>TLS Versions and Cipher Suites</h2>
<p>SSL and early TLS versions (SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1) are deprecated due to known vulnerabilities. Modern servers should support only TLS 1.2 and TLS 1.3. TLS 1.3 (2018) simplified the handshake, removed obsolete cryptographic algorithms, and made forward secrecy mandatory. Most major websites and CDNs default to TLS 1.3. If your server still accepts TLS 1.0 connections, it is vulnerable to downgrade attacks like POODLE and BEAST.</p>
<p>Cipher suites determine the specific encryption algorithms used during a TLS session. A server configured to accept weak cipher suites (RC4, 3DES, EXPORT-grade ciphers) is vulnerable even with a valid certificate and modern TLS version. Tools like SSL Labs Server Test and testssl.sh audit your servers TLS configuration and grade it. An A+ grade means the server supports only TLS 1.2+, uses strong cipher suites, enables HSTS, and has a valid certificate chain. Achieving this is a few configuration changes in Nginx or Apache — well worth the effort.</p>`,

  "string-escaping-guide": `
<h2>Debugging Escaping Issues in Production</h2>
<p>When a user reports "the text looks wrong" or "there are weird backslashes everywhere," the culprit is usually double-escaping or missing escaping. Double-escaping happens when data passes through two escaping functions: the string <code>hello</code> becomes <code>\\"hello\\"</code> (JS-escaped once), then becomes <code>\\\\\\"hello\\\\\\"</code> (JS-escaped again). Each layer of escaping adds more backslashes. To debug, trace the data through every transformation point — from database to API response to frontend state to DOM — and identify which layer is applying escaping that another layer also applies.</p>
<p>A systematic approach: start at the final rendered output and work backwards. Look at the raw HTML source, not the rendered page. Compare it against the API response. Compare the API response against the database value. The escaping error will be visible as a difference at one of these boundaries. Fix the boundary where the error first appears. And add a test that asserts the data passes through all boundaries without corruption — an end-to-end test that catches escaping bugs before users do.</p>`,

  "text-diffing-guide": `
<h2>Diffing Non-Code Content</h2>
<p>Diffs are useful for more than code. Compare two versions of a CSV export to find what changed between daily data dumps. Diff two log files from different servers to identify why one is behaving differently. Compare configuration files between environments to find the one setting that is different. Diff two SQL dump files to verify a migration produced identical schemas. In each case, the diff shows exactly what changed — and what did not change — in a format that is scannable and precise.</p>
<p>For binary file formats, specialized diff tools exist. Image diff tools highlight visual differences between two screenshots (useful for visual regression testing). PDF diff tools compare text content between document versions. JSON diff tools compare structured data semantically, ignoring key order and whitespace differences. Use the right diff tool for the content type — a text diff of two binary files produces meaningless output.</p>`,

  "url-slugs-guide": `
<h2>Migrating URL Structures</h2>
<p>Changing your URL structure — from /blog/2024/01/post-title to /blog/post-title, for example — requires planning. Export all current URLs (from your sitemap, CMS, or server logs). For each old URL, determine the new URL. Generate 301 redirects for every mapping. Test the redirects: both that they redirect to the correct destination and that they do not create redirect chains (A → B → C). Redirect chains slow page loads and can cause search engines to stop following the chain. Each redirect should point directly to the final destination.</p>
<p>After deploying redirects, monitor your search console for 404 errors. A sitemap update tells search engines about your new URLs; the 301 redirects tell them where the old ones went. Both are needed. Expect a temporary dip in search traffic during the transition as Google reindexes your pages. Traffic typically recovers within 2-4 weeks if the redirects are correct. If traffic does not recover, check for redirects pointing to the wrong destinations — a common mistake when generating redirect rules programmatically.</p>`,

  "url-structure-guide": `
<h2>URL Design for Single-Page Applications</h2>
<p>SPAs use client-side routing, which creates URL design challenges that server-rendered apps do not face. The browser never requests the server for a new page when the user navigates within the SPA — JavaScript intercepts the click, updates the URL via the History API, and renders the new view. But if the user refreshes the page or shares the URL, the browser makes a server request. The server must respond with the SPA shell (index.html) for every valid SPA route, not a 404. This is typically configured as a catch-all route or a rewrite rule in Nginx/Apache.</p>
<p>Hash-based routing (example.com/#/users/123) works without server configuration because the hash is never sent to the server. History-based routing (example.com/users/123) produces cleaner URLs but requires the server to handle all routes. Modern SPAs overwhelmingly use history-based routing with a catch-all server rule. If you see #! or #/ in URLs today, it is usually a legacy SPA from before the History API was widely supported.</p>`,

  "user-agent-guide": `
<h2>User Agents in Web Scraping and Bot Detection</h2>
<p>Web scrapers often impersonate browsers by sending a Chrome or Firefox User-Agent string. The simplest defense: check if the UA string claims to be Chrome but the request lacks Chrome-specific headers (like the Sec-CH-UA client hints) or JavaScript behaviors that a real Chrome browser would exhibit. More sophisticated bot detection combines UA analysis with TLS fingerprinting (JA3/JA4 signatures), IP reputation databases, and behavioral analysis. UA string matching alone is too easy to spoof to be useful as a security measure.</p>
<p>Legitimate bots identify themselves clearly in their UA string. Googlebot uses "Googlebot/2.0," Bingbot uses "bingbot/2.0," and both publish their IP ranges for verification. If a request claims to be Googlebot in its UA string but originates from an AWS IP not in Googles published crawler ranges, it is a fake. Verify bots by doing a reverse DNS lookup on their IP and checking it matches the claimed bot's domain. This is more reliable than trusting the UA string.</p>`
};

const guidesDir = "src/pages/guides";
let updated = 0;
for (const guideId in extras) {
  const f = path.join(guidesDir, guideId + ".astro");
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, "utf8");
  c = c.replace("\n</div>\n`", extras[guideId] + "\n</div>\n`");
  fs.writeFileSync(f, c);
  updated++;
}
console.log("Appended to " + updated + " guides");
