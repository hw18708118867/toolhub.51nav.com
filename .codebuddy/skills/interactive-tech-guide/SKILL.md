---
name: interactive-tech-guide
description: >-
  Use this skill when writing a comprehensive technical guide/article for this
  Astro site (tool.51nav) that must cover a topic end-to-end, link to related
  tools, embed "playable" interactive diagrams that visualise each concept step
  by step, and read naturally without AI-flavoured prose. Trigger it whenever
  the user asks to "write an article", "add a guide", "explain X for the site",
  or "create a post with interactive demos".
---

# Writing a Comprehensive Interactive Tech Guide

This skill captures the end-to-end workflow used to produce the AES guide
(`src/pages/guides/aes-encryption-guide.astro`): a long-form article that is
technically complete, cross-linked with the site's tools, illustrated with
browser-native **playable** diagrams, and written in plain, grounded prose.

Follow the phases in order. Each phase links to a detailed reference file.

## When to use

- The user wants a new article/guide for this site.
- The topic benefits from step-by-step visualisation (crypto, compression,
  encoding, networking, data structures, etc.).
- The output must not read like generic AI-generated filler.

Do **not** use this for short tool page copy or a one-paragraph FAQ.

## Workflow

### Phase 0 — Plan the article

Decide the scope and the hook the reader already has. For AES the reader was
"someone who has used the tool but wants to actually understand it". Pick 8–17
`h2` sections, each with 1–4 `h3` subsections. Identify which sections need a
diagram (see Phase 3) and which tools/articles it should link to.

See `references/article-structure.md` for the section taxonomy and the
`GuideLayout` contract.

### Phase 1 — Write the content

Write the body as **template-literal constants** (`const part1 = \`...\``) in the
`.astro` frontmatter, then render them with `<Fragment set:html={partN} />`
interleaved with components. This lets you splice diagrams between prose blocks
without fighting Astro's JSX-like syntax.

Hard rules:
- Every `h2`/`h3` gets a real `id` so the auto-generated TOC anchors work.
- Inside `<pre><code>` blocks (injected via `set:html`), escape `<`/`>` as
  `&lt;`/`&gt;` — raw angle brackets would be parsed as HTML.
- Keep all technical facts and numbers accurate on the first pass; the de-AI
  phase (Phase 4) only rewrites wording, never the facts.

### Phase 2 — Link tools and cross-reference

Add `relatedTools` to `GuideLayout` and a "Recommended / Related" block at the
end. Then **edit the linked pages** to point back: the tool page gets a
"Learn more" link, and the guides index (`src/pages/guides/index.astro`) and
any sibling guide get cross-references. Links must be bidirectional.

### Phase 3 — Build playable interactive diagrams

For each concept that benefits from it, create a self-contained component under
`src/components/interactive/`. A "playable" diagram has: play / pause / step
controls, a timeline, and a render loop that shows the *state before and after*
each step. Prefer real computation (Web Crypto, or `src/lib/aes.ts`) over
mock-ups — truthfulness is part of the value.

See `references/interactive-diagrams.md` for the component skeleton, the 7
existing components you can copy, and the non-obvious gotchas (grid-cols-16,
dark-mode variants, column-major state ordering, chunked base64).

Use `assets/interactive-skeleton.astro` as the starting component.

### Phase 4 — De-AI the prose

After the first full draft, run `scripts/scan-ai-flavor.mjs` on the prose to get
a marker count, then rewrite until the score is clean. Target: em-dash count
reasonable, zero stock phrases, varied paragraph rhythm. Facts stay identical.

See `references/de-ai-flavor.md` for the exact marker list and rewrite rules.

### Phase 5 — Verify build, diagrams, and indexing

1. `npm run build` — must complete with no errors.
2. If the diagram uses `src/lib/aes.ts`, run `npm run verify:aes` (FIPS-197
   vectors) so you didn't break the teaching lib.
3. Run a Playwright E2E regression against the **production build** (not a
   leftover `astro dev` server) covering: every interactive component mounts,
   play/step works, no console errors, no horizontal overflow, TOC populates.
4. **Google indexing** (see `references/seo-indexing.md`): confirm the new guide
   is in `dist/sitemap.xml`, `public/robots.txt` points at the sitemap, the
   `Article` JSON-LD includes `datePublished`/`dateModified` (you passed them),
   and there is exactly one `<h1>`. A guide Google cannot find is wasted work.

See `references/verification.md` for the E2E pattern and a checklist, and
`references/seo-indexing.md` for the indexing rules.

## Conventions you must respect

- Components go in `src/components/interactive/<Name>.astro`.
- Teaching crypto lives in `src/lib/aes.ts` (NOT constant-time — never ship it;
  production paths use Web Crypto).
- Every interactive component needs `dark:` variants for every color.
- Tailwind has no `grid-cols-16`; use
  `sm:grid-cols-[repeat(16,minmax(0,1fr))]`.
