# Building Playable Interactive Diagrams

A "playable" diagram lets the reader press play and watch a transformation
happen step by step, or scrub back and forth, or single-step to inspect exactly
what each operation does. This is the differentiator of the guide; build one
wherever a concept is sequential or visual.

## Component skeleton

Every diagram is a self-contained `.astro` component in
`src/components/interactive/`. Use `assets/interactive-skeleton.astro` as the
starting point. The constant shape:

```
frontmatter comment  → states it is driven by REAL data, not a mock-up
markup               → container + controls + progress + canvas/grid + explain + timeline
<script>             → imports domain logic, builds a `steps[]` trace, render(idx),
                       play()/pause()/tick(), buildTimeline(), IntersectionObserver autoplay-once
```

The `steps[]` array is the heart of it: each element holds the state *before*
and *after* one logical operation, plus a one-line explanation. Rendering the
step shows the diff (what changed, highlighted) and the explanation text. This
is what makes "stop and observe each step" actually work.

## The 7 components shipped with the AES guide (copy as starting points)

| Component | What it shows | Real data source |
| --- | --- | --- |
| `AesRoundVisualizer.astro` | 4×4 state through SubBytes/ShiftRows/MixColumns/AddRoundKey, per round, 128/192/256 | `src/lib/aes.ts` (`traceEncryption`, `keyExpansion`, `SBOX`, `gmul`) |
| `ModeVisualizer.astro` | ECB/CBC/CTR/GCM block-by-block chaining | `src/lib/aes.ts` |
| `EcbPenguin.astro` | Live AES-ECB vs AES-CBC of a penguin image on `<canvas>` | `src/lib/aes.ts` (`ecbEncrypt`, `cbcEncrypt`) |
| `IvReuseDemo.astro` | CTR nonce-reuse: C1⊕C2 == P1⊕P2 (keystream cancels) | computed in-component |
| `PaddingDemo.astro` | PKCS#7 padding, incl. the full extra block when input is exactly a multiple | computed in-component |
| `Pbkdf2Demo.astro` | Real PBKDF2 iteration timings measured with `crypto.subtle` | Web Crypto |
| `TamperDemo.astro` | GCM rejects tampering; CBC silently returns garbage | Web Crypto (AES-GCM / AES-CBC) |

## Gotchas (learned the hard way)

- **Tailwind has no `grid-cols-16`.** Use
  `sm:grid-cols-[repeat(16,minmax(0,1fr))]` or an inline `style`. Plain
  `grid-cols-16` silently emits no CSS.
- **Dark mode needs every color doubled.** Every `text-*`, `bg-*`, `border-*`
  needs a `dark:` variant or it breaks in dark mode.
- **AES state is column-major (FIPS-197), the DOM is row-major.** When reading
  a 4×4 grid back from the DOM, map
  `state[col*4 + row] = dom[row*4 + col]`. Getting this wrong shows wrong bytes.
- **Key length vs. round count.** Use `roundsForKeySize(bits)` (10/12/14). Don't
  truncate a short key with `subarray(0, bits/8)` before expansion — cycle-fill
  to the target length instead, or 192/256 will silently run only 10 rounds.
- **S-box inverse.** When generating `sboxSteps`, the affine inverse of `0` is
  `0`, not `INV_SBOX.length`. Guard with `b === 0 ? 0 : findInverse(b)`.
- **Large-data base64.** `btoa(String.fromCharCode(...hugeArray))` throws
  `RangeError` above ~64 KB. Encode in chunks.
- **Web Crypto has no padding for CBC** in the raw API — pad to a multiple of 16
  yourself (PKCS#7) or it errors. GCM/CTR don't need padding.
- **Canvas `image-rendering: pixelated`** keeps the penguin crisp when scaled.

## Truthfulness rule

The value of these diagrams is that they are *real*. `EcbPenguin` really does
encrypt the image with AES; `Pbkdf2Demo` really does time the derivation;
`IvReuseDemo` really does XOR the ciphertexts. Prefer Web Crypto or
`src/lib/aes.ts` over hard-coded "expected" outputs. Note in the frontmatter
comment that `src/lib/aes.ts` is a teaching implementation (not constant-time)
and must never be on a production path — production always uses Web Crypto.

## Autoplay-once

Use an `IntersectionObserver` so the diagram plays once when scrolled into view,
then stops, leaving the reader in control. Don't loop forever.
