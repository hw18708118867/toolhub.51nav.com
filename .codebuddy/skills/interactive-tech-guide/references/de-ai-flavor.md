# Removing AI Flavor from the Prose

Generated technical prose has tells. A guide meant to teach real practitioners
should read like it was written by one. This phase runs *after* the content is
technically correct; it only rewrites wording, never facts or numbers.

## How to scan

Run the bundled scanner on the prose fragment(s):

```bash
node .codebuddy/skills/interactive-tech-guide/scripts/scan-ai-flavor.mjs src/pages/guides/aes-encryption-guide.astro
```

It prints a per-marker count and sample line numbers. Use the counts as a
before/after scoreboard. For a fresh article, paste the prose into a temp file
and scan that.

## Markers to eliminate

**Em dash `—` overuse.** Em dashes are fine for genuine appositives and breaks,
but AI prose leans on "not X — Y" pivots. Target a low count relative to length
(≈40 per 8k words is already a lot). Every remaining em dash must be a real
break, not a rhetorical pivot.

**Stock phrases (delete on sight):**
- "It's worth noting", "Worth highlighting", "It is important to note"
- "In practice", "Note carefully", "Be aware that"
- "Crucially", "At its core", "In essence", "The key takeaway"
- "fundamentally", "moreover", "furthertheless", "furthermore", "delve"
- "leverages", "navigate the landscape", "a testament to"
- "plays a pivotal role", "in today's [X] world", "unlock [the power of]"
- "Let's dive in", "In conclusion", "To sum up"

**Importance self-declaration.** Cut sentences like "This is the single most
important idea", "the most critical thing to understand". Show the importance by
placement and example instead of announcing it.

**Negation-then-elevation parallelism.** "It is not X — it is Y." Rewrite as a
direct statement of what it is.

**Rhythm tells.** Flag paragraphs that are mechanically 2 sentences, or many
consecutive sentences starting with "But". Vary length; allow 1-sentence and
3-sentence paragraphs. Mix short punchy sentences with longer explanatory ones.

**Throat-clearing openers.** "When it comes to…", "In the world of…",
"Understanding X is essential because…". Start with the substance.

## Rewrite rules

1. Replace "not X — Y" with a direct claim.
2. Cut the opener; lead with the actual point.
3. Vary sentence length deliberately within each section.
4. Prefer a concrete example over an abstract frame ("imagine a locked box").
5. Don't over-explain or hand-hold; trust the reader's intelligence.
6. Keep every technical fact, figure, and standard name unchanged.
7. After rewriting, re-scan; repeat until stock phrases are zero and the em-dash
   count is defensible.

## What "grounded" looks like

- Concrete over abstract: "AES-256 needs a 32-byte key" beats "AES utilizes a
  sufficiently large key".
- Short verbs: "encrypt", "pad", "reject" beat "perform encryption",
  "apply padding", "raise a rejection".
- Examples carry the load; the reader infers the rule.
