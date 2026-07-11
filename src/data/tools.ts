export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: 'encoding' | 'generator' | 'color' | 'data' | 'dev' | 'text' | 'network' | 'image' | 'security' | 'formatters' | 'calculators' | 'seo'
}

export const tools: Tool[] = [
  // ===== ENCODING =====
  { id: 'base64-converter', name: 'Base64 Converter', description: 'Encode/decode Base64', icon: 'base64', category: 'encoding' },
  { id: 'url-encode', name: 'URL Encode/Decode', description: 'URL encode/decode text', icon: 'url', category: 'encoding' },
  { id: 'html-entities', name: 'HTML Entities', description: 'HTML entity encode/decode', icon: 'html', category: 'encoding' },
  { id: 'unicode-converter', name: 'Unicode Converter', description: 'Encode/decode Unicode escape sequences', icon: 'escape', category: 'encoding' },
  { id: 'hex-converter', name: 'Hex Converter', description: 'Encode/decode text to/from hex', icon: 'hash', category: 'encoding' },
  { id: 'binary-converter', name: 'Binary Converter', description: 'Convert text to/from binary', icon: 'number', category: 'encoding' },
  { id: 'ascii-converter', name: 'ASCII Converter', description: 'Convert text to/from ASCII codes', icon: 'number', category: 'encoding' },
  { id: 'utf8-converter', name: 'UTF-8 Converter', description: 'Encode/decode UTF-8 byte sequences', icon: 'escape', category: 'encoding' },
  { id: 'rot13', name: 'ROT13 Cipher', description: 'Encode/decode with ROT13 cipher', icon: 'case', category: 'encoding' },
  { id: 'morse-code', name: 'Morse Code', description: 'Convert text to/from Morse code', icon: 'escape', category: 'encoding' },

  // ===== GENERATORS =====
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUID v4', icon: 'uuid', category: 'generator' },
  { id: 'qr-code', name: 'QR Code Generator', description: 'Generate QR codes', icon: 'qr', category: 'generator' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum', description: 'Generate placeholder text', icon: 'lorem', category: 'generator' },
  { id: 'password-generator', name: 'Password Generator', description: 'Create secure passwords', icon: 'password', category: 'generator' },
  { id: 'nano-id', name: 'Nano ID Generator', description: 'Generate compact unique IDs', icon: 'hash', category: 'generator' },
  { id: 'slug-generator', name: 'Slug Generator', description: 'Create URL-friendly slugs', icon: 'case', category: 'generator' },
  { id: 'random-string', name: 'Random String Generator', description: 'Generate random alphanumeric strings', icon: 'random', category: 'generator' },

  // ===== COLORS =====
  { id: 'color-picker', name: 'Color Picker', description: 'HEX/RGB/HSL converter', icon: 'color', category: 'color' },
  { id: 'css-gradient', name: 'CSS Gradient', description: 'Create gradient CSS', icon: 'gradient', category: 'color' },
  { id: 'color-contrast', name: 'Color Contrast Checker', description: 'Check WCAG contrast ratios', icon: 'count', category: 'color' },
  { id: 'color-palette', name: 'Color Palette Generator', description: 'Generate harmonious color palettes', icon: 'lorem', category: 'color' },
  { id: 'flexbox-generator', name: 'Flexbox Generator', description: 'Visual CSS flexbox layout generator', icon: 'layout', category: 'color' },
  { id: 'grid-generator', name: 'CSS Grid Generator', description: 'Visual CSS grid layout generator', icon: 'layout', category: 'color' },
  { id: 'box-shadow-generator', name: 'Box Shadow Generator', description: 'Generate CSS box-shadow styles visually', icon: 'shadow', category: 'color' },
  { id: 'border-radius-generator', name: 'Border Radius Generator', description: 'Generate CSS border-radius styles visually', icon: 'color', category: 'color' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert colors between HEX, RGB, HSL and CMYK', icon: 'color', category: 'color' },
  { id: 'tailwind-color-generator', name: 'Tailwind Color Generator', description: 'Generate Tailwind CSS color palette configs', icon: 'color', category: 'color' },

  // ===== DATA =====
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, minify JSON', icon: 'json', category: 'data' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Unix timestamp converter', icon: 'time', category: 'data' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'MD5, SHA-1, SHA-256', icon: 'hash', category: 'data' },
  { id: 'number-base', name: 'Number Base', description: 'Dec/Hex/Bin/Oct converter', icon: 'number', category: 'data' },
  { id: 'timezone-converter', name: 'Timezone Converter', description: 'Convert time between different timezones', icon: 'time', category: 'data' },
  { id: 'json-yaml', name: 'JSON ↔ YAML', description: 'Convert JSON/YAML', icon: 'yaml', category: 'data' },
  { id: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV data to JSON', icon: 'qr', category: 'data' },
  { id: 'json-compare', name: 'JSON Compare', description: 'Compare and diff two JSON objects', icon: 'diff', category: 'data' },
  { id: 'json-escape', name: 'JSON Escape', description: 'Escape/unescape JSON strings', icon: 'escape', category: 'data' },
  { id: 'json-sort', name: 'JSON Sort', description: 'Sort JSON object keys alphabetically', icon: 'json', category: 'data' },
  { id: 'json-to-csv', name: 'JSON to CSV', description: 'Convert JSON array to CSV format', icon: 'json', category: 'data' },
  { id: 'json-flatten', name: 'JSON Flatten', description: 'Flatten nested JSON to dot-notation keys', icon: 'json', category: 'data' },
  { id: 'json-xml', name: 'JSON ↔ XML', description: 'Convert between JSON and XML formats', icon: 'html', category: 'data' },
  { id: 'json-to-toml', name: 'JSON to TOML', description: 'Convert JSON to TOML config format', icon: 'yaml', category: 'data' },
  { id: 'json-tree-viewer', name: 'JSON Tree Viewer', description: 'Visualize JSON structure as a tree', icon: 'json', category: 'data' },

  // ===== DEV =====
  { id: 'html-preview', name: 'HTML Preview', description: 'Preview HTML code in real-time', icon: 'html', category: 'dev' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode JSON Web Tokens', icon: 'jwt', category: 'dev' },
  { id: 'jwt-encoder', name: 'JWT Encoder', description: 'Create and sign JSON Web Tokens', icon: 'jwt', category: 'dev' },
  { id: 'jwt-inspector', name: 'JWT Inspector', description: 'Inspect JWT claims, expiry, and structure', icon: 'jwt', category: 'dev' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions', icon: 'regex', category: 'dev' },
  { id: 'diff-checker', name: 'Diff Checker', description: 'Compare text differences', icon: 'diff', category: 'dev' },
  { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries', icon: 'sql', category: 'dev' },
  { id: 'sql-minifier', name: 'SQL Minifier', description: 'Minify and compress SQL queries', icon: 'sql', category: 'formatters' },
  { id: 'sql-validator', name: 'SQL Validator', description: 'Validate SQL syntax and find errors', icon: 'sql', category: 'dev' },
  { id: 'url-parser', name: 'URL Parser', description: 'Parse URL components', icon: 'url', category: 'dev' },
  { id: 'http-status', name: 'HTTP Status Codes', description: 'HTTP status code reference', icon: 'diff', category: 'dev' },
  { id: 'cron-parser', name: 'Cron Expression Parser', description: 'Parse cron schedule expressions', icon: 'time', category: 'dev' },
  { id: 'cron-generator', name: 'Cron Expression Generator', description: 'Build cron schedule expressions visually', icon: 'time', category: 'dev' },
  { id: 'regex-cheat-sheet', name: 'Regex Cheat Sheet', description: 'Quick reference for regex syntax and patterns', icon: 'regex', category: 'dev' },
  { id: 'regex-generator', name: 'Regex Generator', description: 'Generate regex patterns from plain text descriptions', icon: 'regex', category: 'dev' },

  // ===== TEXT =====
  { id: 'string-escaper', name: 'String Escaper', description: 'Escape/unescape strings', icon: 'escape', category: 'text' },
  { id: 'text-case', name: 'Text Case', description: 'UPPER/lower/CamelCase', icon: 'case', category: 'text' },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, chars, lines', icon: 'count', category: 'text' },
  { id: 'dedupe-lines', name: 'Dedupe Lines', description: 'Remove duplicate lines', icon: 'dedupe', category: 'text' },
  { id: 'character-counter', name: 'Character Counter', description: 'Count characters, letters, digits and spaces', icon: 'count', category: 'text' },
  { id: 'line-counter', name: 'Line Counter', description: 'Count total, empty and non-empty lines', icon: 'count', category: 'text' },
  { id: 'remove-empty-lines', name: 'Remove Empty Lines', description: 'Remove blank and whitespace-only lines', icon: 'remove', category: 'text' },
  { id: 'sort-lines', name: 'Sort Lines', description: 'Sort text lines alphabetically A-Z or Z-A', icon: 'sort-asc', category: 'text' },
  { id: 'shuffle-lines', name: 'Shuffle Lines', description: 'Randomly shuffle and reorder text lines', icon: 'shuffle', category: 'text' },
  { id: 'reverse-text', name: 'Reverse Text', description: 'Reverse characters, words or line order', icon: 'reverse', category: 'text' },
  { id: 'markdown-preview', name: 'Markdown Previewer', description: 'Preview Markdown in real-time', icon: 'html', category: 'text' },

  // ===== NETWORK =====
  { id: 'ip-lookup', name: 'IP Address Lookup', description: 'Lookup IP geolocation & ISP', icon: 'dedupe', category: 'network' },
  { id: 'my-ip', name: 'My IP Address', description: 'Show your public IP address', icon: 'number', category: 'network' },
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Query DNS records', icon: 'yaml', category: 'network' },
  { id: 'dns-log-monitor', name: 'DNS Log Monitor', description: 'Real-time DNS query logging via dig.pm', icon: 'time', category: 'network' },
  { id: 'user-agent', name: 'User Agent Parser', description: 'Parse browser user agent', icon: 'escape', category: 'network' },
  { id: 'query-string-parser', name: 'Query String Parser', description: 'Parse and decode URL query parameters', icon: 'url', category: 'network' },
  { id: 'http-header-viewer', name: 'HTTP Header Viewer', description: 'View and analyze HTTP request/response headers', icon: 'yaml', category: 'network' },
  { id: 'whois-lookup', name: 'WHOIS Lookup', description: 'Lookup domain registration and ownership info', icon: 'whois', category: 'network' },
  { id: 'ping-tool', name: 'Ping Tool', description: 'Test network latency and packet loss', icon: 'ping', category: 'network' },
  { id: 'port-checker', name: 'Port Checker', description: 'Check if TCP ports are open or closed', icon: 'port', category: 'network' },

  // ===== IMAGE =====
  { id: 'image-to-base64', name: 'Image to Base64', description: 'Convert image to Base64 data URI', icon: 'base64', category: 'image' },
  { id: 'base64-image-viewer', name: 'Base64 Image Viewer', description: 'Decode and view Base64-encoded images', icon: 'base64', category: 'image' },
  { id: 'svg-viewer', name: 'SVG Viewer', description: 'View and preview SVG code in real-time', icon: 'base64', category: 'image' },
  { id: 'svg-optimizer', name: 'SVG Optimizer', description: 'Optimize and clean up SVG markup', icon: 'base64', category: 'image' },
  { id: 'svg-minifier', name: 'SVG Minifier', description: 'Minify and compress SVG code', icon: 'base64', category: 'image' },
  { id: 'image-compressor', name: 'Image Compressor', description: 'Compress JPEG, PNG and WebP images', icon: 'base64', category: 'image' },
  { id: 'image-crop', name: 'Image Crop', description: 'Crop and trim images in the browser', icon: 'base64', category: 'image' },
  { id: 'image-resize', name: 'Image Resize', description: 'Resize images to exact dimensions', icon: 'base64', category: 'image' },
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Generate favicon.ico from any image', icon: 'base64', category: 'image' },
  { id: 'image-format-converter', name: 'Image Format Converter', description: 'Convert images between PNG, JPEG, WebP, SVG', icon: 'base64', category: 'image' },
  { id: 'exif-viewer', name: 'EXIF Viewer', description: 'View EXIF metadata from JPEG photos', icon: 'base64', category: 'image' },

  // ===== SECURITY =====
  { id: 'ssl-checker', name: 'SSL Certificate Checker', description: 'Check SSL certificate details', icon: 'jwt', category: 'security' },
  { id: 'password-strength', name: 'Password Strength Meter', description: 'Evaluate password strength', icon: 'password', category: 'security' },

  // ===== FORMATTERS =====
  { id: 'css-formatter', name: 'CSS Formatter', description: 'Format & beautify CSS', icon: 'gradient', category: 'formatters' },
  { id: 'css-minifier', name: 'CSS Minifier', description: 'Minify and compress CSS code', icon: 'gradient', category: 'formatters' },
  { id: 'html-formatter', name: 'HTML Formatter', description: 'Format & beautify HTML', icon: 'html', category: 'formatters' },
  { id: 'html-minifier', name: 'HTML Minifier', description: 'Minify and compress HTML code', icon: 'html', category: 'formatters' },
  { id: 'js-formatter', name: 'JavaScript Formatter', description: 'Format & beautify JavaScript', icon: 'regex', category: 'formatters' },

  // ===== CALCULATORS =====
  { id: 'px-to-rem', name: 'PX to REM Converter', description: 'Convert PX to REM/EM units', icon: 'number', category: 'calculators' },

  // ===== SEO =====
  { id: 'robots-txt-validator', name: 'Robots.txt Validator', description: 'Validate and test robots.txt rules for URLs', icon: 'seo', category: 'seo' },
  { id: 'sitemap-validator', name: 'Sitemap Validator', description: 'Validate XML sitemap structure and format', icon: 'seo', category: 'seo' },
]

export const popularTools = [
  tools.find(t => t.id === 'json-formatter')!,
  tools.find(t => t.id === 'uuid-generator')!,
  tools.find(t => t.id === 'regex-tester')!,
  tools.find(t => t.id === 'color-picker')!,
  tools.find(t => t.id === 'password-generator')!,
  tools.find(t => t.id === 'timestamp')!,
  tools.find(t => t.id === 'base64-converter')!,
  tools.find(t => t.id === 'jwt-decoder')!,
  tools.find(t => t.id === 'hash-generator')!,
]

export const categories = {
  'encoding': { name: 'Encoding', order: 1 },
  'generator': { name: 'Generators', order: 2 },
  'color': { name: 'Colors & Design', order: 3 },
  'data': { name: 'Data Converters', order: 4 },
  'dev': { name: 'Development', order: 5 },
  'text': { name: 'Text Tools', order: 6 },
  'network': { name: 'Network', order: 7 },
  'image': { name: 'Image Tools', order: 8 },
  'security': { name: 'Security', order: 9 },
  'formatters': { name: 'Formatters', order: 10 },
  'calculators': { name: 'Calculators', order: 11 },
  'seo': { name: 'SEO Tools', order: 12 },
}