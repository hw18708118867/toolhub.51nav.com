# Article Structure & the `GuideLayout` Contract

This site renders guides through `src/layouts/GuideLayout.astro`, which provides
a 3-column layout: a sticky table of contents (left), the article body (center),
and related tools (right). The TOC is generated automatically from `h2`/`h3`
headings — you only need to give headings stable `id`s.

## `GuideLayout` props

```ts
interface Props {
  title: string
  description: string
  breadcrumb?: string          // shown in the breadcrumb + breadcrumb LD-JSON
  relatedTools?: RelatedLink[] // { href, title, desc, type?: 'tool' | 'guide' }
  datePublished: string        // REQUIRED, ISO YYYY-MM-DD, real publish date
  dateModified: string         // REQUIRED, ISO YYYY-MM-DD, last edit date
}
```

`datePublished` and `dateModified` are **required** — there is no fallback. They
feed the `Article` JSON-LD, `og:type=article`, and the article timestamps. Use
real dates: `git log --diff-filter=A --format=%cs -- <file>` for the publish
date and `git log -1 --format=%cs -- <file>` for the last edit. Do not reuse a
single date across guides; a site full of identical timestamps is a low-trust
signal.

The layout exposes two named slots: `title` and `intro` (the header), and the
default slot is the article body.

## The "partN + Fragment" pattern

Never put thousands of words of HTML inside the Astro JSX body — it fights the
syntax and is unreadable. Instead:

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro'
import AesRoundVisualizer from '../../components/interactive/AesRoundVisualizer.astro'

const part1 = `
  <h2 id="what-is-aes">What AES Actually Is</h2>
  <p>...</p>
  <blockquote><p>...</p></blockquote>
`
const part2 = `
  <h2 id="how-it-works">How the Rounds Work</h2>
  <p>...</p>
  <pre><code class="language-js">const x = 1 &lt; 2  // &lt; must be escaped!</code></pre>
`
---
<GuideLayout title="..." description="..." breadcrumb="AES" relatedTools={[...]}
  datePublished="2026-09-03" dateModified="2026-09-05">
  <Fragment slot="title">AES Encryption Explained</Fragment>
  <Fragment slot="intro">A plain-language tour...</Fragment>

  <Fragment set:html={part1} />
  <AesRoundVisualizer />
  <Fragment set:html={part2} />
  {/* more parts interleaved with components */}
</GuideLayout>
```

Why template literals + `set:html`:
- You write raw HTML (tables, blockquotes, code blocks) with no JSX escaping
  pain.
- You can splice `<Component />` between prose fragments at arbitrary points.
- Each `partN` is a manageable chunk to edit and de-AI separately.

## Section taxonomy (from the AES guide)

- 17 `h2` major sections, 19 `h3` subsections.
- Mix of: definition, why-it-matters, how-it-works (with diagram), comparison
  table, code example, "what can go wrong", best-practices, FAQ.
- Use comparison **tables** for mode/option trade-offs (`<table>` — styled by
  the layout's global CSS). Keep them `<thead>/<tbody>` structured.
- Use **blockquotes** sparingly for a single memorable rule (e.g. "never reuse
  a nonce with the same key").
- Use **code blocks** with a `language-*` class; Prism highlighting is applied.

## Linking

- Internal links are root-relative: `/tools/aes-encrypt/`,
  `/guides/crypto-tools-guide/`, `/guides/`.
- The guide must be added to `src/pages/guides/index.astro` (the guides hub) and
  to any sibling guide's "related" section so links are bidirectional.
- Reciprocal links: the tool page shows a "Learn more in our guide" card; the
  guide's `relatedTools` shows the tool.

## Facts vs. wording

Write accurate numbers on the first pass (key sizes, attack complexities,
NIST/recommendation names). The de-AI phase only changes wording, not facts.
Never soften a precise number into a vague "very large" during rewriting.
