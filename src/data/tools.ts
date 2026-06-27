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

  // ===== GENERATORS =====
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUID v4', icon: 'uuid', category: 'generator' },
  { id: 'qr-code', name: 'QR Code Generator', description: 'Generate QR codes', icon: 'qr', category: 'generator' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum', description: 'Generate placeholder text', icon: 'lorem', category: 'generator' },
  { id: 'password-generator', name: 'Password Generator', description: 'Create secure passwords', icon: 'password', category: 'generator' },
  { id: 'nano-id', name: 'Nano ID Generator', description: 'Generate compact unique IDs', icon: 'hash', category: 'generator' },
  { id: 'slug-generator', name: 'Slug Generator', description: 'Create URL-friendly slugs', icon: 'case', category: 'generator' },

  // ===== COLORS =====
  { id: 'color-picker', name: 'Color Picker', description: 'HEX/RGB/HSL converter', icon: 'color', category: 'color' },
  { id: 'css-gradient', name: 'CSS Gradient', description: 'Create gradient CSS', icon: 'gradient', category: 'color' },
  { id: 'color-contrast', name: 'Color Contrast Checker', description: 'Check WCAG contrast ratios', icon: 'count', category: 'color' },
  { id: 'color-palette', name: 'Color Palette Generator', description: 'Generate harmonious color palettes', icon: 'lorem', category: 'color' },

  // ===== DATA =====
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, minify JSON', icon: 'json', category: 'data' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Unix timestamp converter', icon: 'time', category: 'data' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'MD5, SHA-1, SHA-256', icon: 'hash', category: 'data' },
  { id: 'number-base', name: 'Number Base', description: 'Dec/Hex/Bin/Oct converter', icon: 'number', category: 'data' },
  { id: 'json-yaml', name: 'JSON ↔ YAML', description: 'Convert JSON/YAML', icon: 'yaml', category: 'data' },
  { id: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV data to JSON', icon: 'qr', category: 'data' },

  // ===== DEV =====
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode JSON Web Tokens', icon: 'jwt', category: 'dev' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions', icon: 'regex', category: 'dev' },
  { id: 'diff-checker', name: 'Diff Checker', description: 'Compare text differences', icon: 'diff', category: 'dev' },
  { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries', icon: 'sql', category: 'dev' },
  { id: 'url-parser', name: 'URL Parser', description: 'Parse URL components', icon: 'url', category: 'dev' },
  { id: 'http-status', name: 'HTTP Status Codes', description: 'HTTP status code reference', icon: 'diff', category: 'dev' },
  { id: 'cron-parser', name: 'Cron Expression Parser', description: 'Parse cron schedule expressions', icon: 'time', category: 'dev' },

  // ===== TEXT =====
  { id: 'string-escaper', name: 'String Escaper', description: 'Escape/unescape strings', icon: 'escape', category: 'text' },
  { id: 'text-case', name: 'Text Case', description: 'UPPER/lower/CamelCase', icon: 'case', category: 'text' },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, chars, lines', icon: 'count', category: 'text' },
  { id: 'dedupe-lines', name: 'Dedupe Lines', description: 'Remove duplicate lines', icon: 'dedupe', category: 'text' },
  { id: 'markdown-preview', name: 'Markdown Previewer', description: 'Preview Markdown in real-time', icon: 'html', category: 'text' },

  // ===== NETWORK =====
  { id: 'ip-lookup', name: 'IP Address Lookup', description: 'Lookup IP geolocation & ISP', icon: 'dedupe', category: 'network' },
  { id: 'my-ip', name: 'My IP Address', description: 'Show your public IP address', icon: 'number', category: 'network' },
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Query DNS records', icon: 'yaml', category: 'network' },
  { id: 'user-agent', name: 'User Agent Parser', description: 'Parse browser user agent', icon: 'escape', category: 'network' },

  // ===== IMAGE =====
  { id: 'image-to-base64', name: 'Image to Base64', description: 'Convert image to Base64 data URI', icon: 'base64', category: 'image' },

  // ===== SECURITY =====
  { id: 'ssl-checker', name: 'SSL Certificate Checker', description: 'Check SSL certificate details', icon: 'jwt', category: 'security' },
  { id: 'password-strength', name: 'Password Strength Meter', description: 'Evaluate password strength', icon: 'password', category: 'security' },

  // ===== FORMATTERS =====
  { id: 'css-formatter', name: 'CSS Formatter', description: 'Format & beautify CSS', icon: 'gradient', category: 'formatters' },
  { id: 'html-formatter', name: 'HTML Formatter', description: 'Format & beautify HTML', icon: 'html', category: 'formatters' },
  { id: 'js-formatter', name: 'JavaScript Formatter', description: 'Format & beautify JavaScript', icon: 'regex', category: 'formatters' },

  // ===== CALCULATORS =====
  { id: 'px-to-rem', name: 'PX to REM Converter', description: 'Convert PX to REM/EM units', icon: 'number', category: 'calculators' },
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