import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  site: 'https://toolhub.51nav.com',
  // One canonical URL form: /tools/foo/ instead of /tools/foo. Keeps the
  // sitemap, canonical tags and internal links from splitting link equity.
  trailingSlash: 'always',
})