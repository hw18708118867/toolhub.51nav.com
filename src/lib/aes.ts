/**
 * A compact, dependency-free AES implementation used by the interactive
 * visualisations on the AES guide. It exists so the diagrams can show *real*
 * intermediate round values rather than hardcoded illustrations.
 *
 * Verified against the FIPS-197 Appendix B / C test vectors and against the
 * browser Web Crypto API (see scripts/verify-aes.mjs).
 *
 * State layout convention: a block is a Uint8Array(16) where index = col * 4 + row,
 * i.e. state[row][col] === bytes[col * 4 + row]. This matches the FIPS-197
 * column-major fill order.
 */

/* ------------------------------------------------------------------ *
 * GF(2^8) arithmetic
 * ------------------------------------------------------------------ */

/** Multiply by x (0x02) in GF(2^8) modulo the AES polynomial x^8+x^4+x^3+x+1. */
export function xtime(a: number): number {
  let r = a << 1
  if (r & 0x100) r = (r ^ 0x1b) & 0xff
  return r & 0xff
}

const GMUL_TABLE = (() => {
  const t = new Uint8Array(256 * 256)
  for (let a = 0; a < 256; a++) {
    for (let b = 0; b < 256; b++) {
      let p = 0
      let x = a
      let y = b
      for (let i = 0; i < 8; i++) {
        if (y & 1) p ^= x
        const hi = x & 0x80
        x = (x << 1) & 0xff
        if (hi) x ^= 0x1b
        y >>= 1
      }
      t[a * 256 + b] = p & 0xff
    }
  }
  return t
})()

/** Multiply two bytes in GF(2^8), the operation MixColumns is built from. */
export function gmul(a: number, b: number): number {
  return GMUL_TABLE[(a & 0xff) * 256 + (b & 0xff)]
}

/* ------------------------------------------------------------------ *
 * S-box: multiplicative inverse in GF(2^8) followed by an affine map
 * ------------------------------------------------------------------ */

function buildSbox(): { sbox: Uint8Array; inverse: Uint8Array } {
  const inv = new Uint8Array(256) // inv[0] = 0 by definition
  for (let i = 1; i < 256; i++) {
    for (let j = 1; j < 256; j++) {
      if (gmul(i, j) === 1) {
        inv[i] = j
        break
      }
    }
  }
  const sbox = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    const b = inv[i]
    let x = b
    let r = b
    for (let k = 1; k <= 4; k++) {
      x = ((x << 1) | (x >> 7)) & 0xff
      r ^= x
    }
    sbox[i] = r ^ 0x63
  }
  const inverse = new Uint8Array(256)
  for (let i = 0; i < 256; i++) inverse[sbox[i]] = i
  return { sbox, inverse }
}

const { sbox: SBOX, inverse: INV_SBOX } = buildSbox()

export { SBOX, INV_SBOX }

export function sboxLookup(b: number): number {
  return SBOX[b & 0xff]
}

/** The S-box derivation, exposed so the diagram can show each stage. */
export function sboxSteps(b: number) {
  const inverse = b === 0 ? 0 : findInverse(b)
  let x = inverse
  let r = inverse
  const rotations: number[] = []
  for (let k = 1; k <= 4; k++) {
    x = ((x << 1) | (x >> 7)) & 0xff
    rotations.push(x)
    r ^= x
  }
  return { input: b, inverse, rotations, xored: r, output: r ^ 0x63 }
}

function findInverse(b: number): number {
  for (let j = 1; j < 256; j++) if (gmul(b, j) === 1) return j
  return 0
}

/* ------------------------------------------------------------------ *
 * Key expansion
 * ------------------------------------------------------------------ */

const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d]

export const roundsForKeySize = (bits: number): number => (bits / 32) + 6

/**
 * Expand a 16/24/32-byte key into Nr + 1 round keys, each 16 bytes.
 * Returns an array indexed by round: roundKeys[0] is the initial AddRoundKey.
 */
export function keyExpansion(key: Uint8Array): Uint8Array[] {
  const Nk = key.length / 4
  const Nr = roundsForKeySize(key.length * 8)
  const totalWords = 4 * (Nr + 1)
  const w: number[][] = []

  for (let i = 0; i < Nk; i++) w.push([key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]])

  for (let i = Nk; i < totalWords; i++) {
    let temp = w[i - 1].slice()
    if (i % Nk === 0) {
      // RotWord then SubWord then XOR with the round constant
      temp = [temp[1], temp[2], temp[3], temp[0]]
      temp = temp.map(b => SBOX[b])
      temp[0] ^= RCON[Math.floor(i / Nk) - 1]
    } else if (Nk > 6 && i % Nk === 4) {
      // Extra SubWord for 256-bit keys
      temp = temp.map(b => SBOX[b])
    }
    const prev = w[i - Nk]
    w.push([prev[0] ^ temp[0], prev[1] ^ temp[1], prev[2] ^ temp[2], prev[3] ^ temp[3]])
  }

  const roundKeys: Uint8Array[] = []
  for (let r = 0; r <= Nr; r++) {
    const rk = new Uint8Array(16)
    for (let c = 0; c < 4; c++) for (let row = 0; row < 4; row++) rk[c * 4 + row] = w[r * 4 + c][row]
    roundKeys.push(rk)
  }
  return roundKeys
}

/* ------------------------------------------------------------------ *
 * The four round transformations
 * ------------------------------------------------------------------ */

export function subBytes(s: Uint8Array): Uint8Array {
  const out = new Uint8Array(16)
  for (let i = 0; i < 16; i++) out[i] = SBOX[s[i]]
  return out
}

export function shiftRows(s: Uint8Array): Uint8Array {
  const out = new Uint8Array(16)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      out[col * 4 + row] = s[((col + row) % 4) * 4 + row]
    }
  }
  return out
}

/** Per-column GF(2^8) matrix multiply, exposed for the MixColumns diagram. */
export function mixColumn(c: Uint8Array | number[]): Uint8Array {
  const [a0, a1, a2, a3] = Array.from(c)
  return new Uint8Array([
    gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3,
    a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3,
    a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3),
    gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2),
  ])
}

export function mixColumns(s: Uint8Array): Uint8Array {
  const out = new Uint8Array(16)
  for (let col = 0; col < 4; col++) {
    const res = mixColumn([s[col * 4], s[col * 4 + 1], s[col * 4 + 2], s[col * 4 + 3]])
    out[col * 4] = res[0]
    out[col * 4 + 1] = res[1]
    out[col * 4 + 2] = res[2]
    out[col * 4 + 3] = res[3]
  }
  return out
}

export function addRoundKey(s: Uint8Array, rk: Uint8Array): Uint8Array {
  const out = new Uint8Array(16)
  for (let i = 0; i < 16; i++) out[i] = s[i] ^ rk[i]
  return out
}

/* ------------------------------------------------------------------ *
 * Block encryption
 * ------------------------------------------------------------------ */

export function encryptBlock(block: Uint8Array, roundKeys: Uint8Array[]): Uint8Array {
  const Nr = roundKeys.length - 1
  let s = addRoundKey(block, roundKeys[0])
  for (let r = 1; r < Nr; r++) {
    s = subBytes(s)
    s = shiftRows(s)
    s = mixColumns(s)
    s = addRoundKey(s, roundKeys[r])
  }
  s = subBytes(s)
  s = shiftRows(s)
  s = addRoundKey(s, roundKeys[Nr])
  return s
}

/* ------------------------------------------------------------------ *
 * Step trace — drives the round-by-round animation
 * ------------------------------------------------------------------ */

export type StepKind = 'initial' | 'addroundkey' | 'subbytes' | 'shiftrows' | 'mixcolumns'

export interface TraceStep {
  kind: StepKind
  /** 0 = the initial AddRoundKey before round 1; 1..Nr are real rounds. */
  round: number
  label: string
  title: string
  detail: string
  /** State before this step was applied. */
  before: Uint8Array
  /** State after this step was applied. */
  after: Uint8Array
  /** Round key used, for AddRoundKey steps. */
  roundKey?: Uint8Array
  /** True for the final round, which omits MixColumns. */
  final: boolean
}

export function traceEncryption(plaintext: Uint8Array, roundKeys: Uint8Array[]): TraceStep[] {
  const Nr = roundKeys.length - 1
  const steps: TraceStep[] = []
  let s = Uint8Array.from(plaintext)

  steps.push({
    kind: 'initial',
    round: 0,
    label: `AddRoundKey (RK0)`,
    title: 'Initial AddRoundKey',
    detail:
      'The 16 plaintext bytes are loaded into the 4×4 state column by column, then XORed with round key 0 — the original key itself. This is the only place the secret directly enters the cipher.',
    before: Uint8Array.from(s),
    after: Uint8Array.from(s),
    roundKey: roundKeys[0],
    final: false,
  })
  s = addRoundKey(s, roundKeys[0])
  steps[steps.length - 1].after = Uint8Array.from(s)

  for (let r = 1; r <= Nr; r++) {
    const final = r === Nr

    let before = Uint8Array.from(s)
    s = subBytes(s)
    steps.push({
      kind: 'subbytes',
      round: r,
      label: 'SubBytes',
      title: `Round ${r} · SubBytes`,
      detail:
        'Every byte is replaced using the S-box — the multiplicative inverse in GF(2⁸) followed by an affine transform. This is AES’s only non-linear step, and the reason linear and differential cryptanalysis fail against it.',
      before,
      after: Uint8Array.from(s),
      final,
    })

    before = Uint8Array.from(s)
    s = shiftRows(s)
    steps.push({
      kind: 'shiftrows',
      round: r,
      label: 'ShiftRows',
      title: `Round ${r} · ShiftRows`,
      detail:
        'Row r is rotated left by r positions (0, 1, 2, 3). Bytes move between columns, so the next step diffuses each column across the whole state.',
      before,
      after: Uint8Array.from(s),
      final,
    })

    if (!final) {
      before = Uint8Array.from(s)
      s = mixColumns(s)
      steps.push({
        kind: 'mixcolumns',
        round: r,
        label: 'MixColumns',
        title: `Round ${r} · MixColumns`,
        detail:
          'Each column is multiplied by a fixed matrix over GF(2⁸). Combined with ShiftRows this gives diffusion: after a couple of rounds every output byte depends on every input byte.',
        before,
        after: Uint8Array.from(s),
        final,
      })
    }

    before = Uint8Array.from(s)
    s = addRoundKey(s, roundKeys[r])
    steps.push({
      kind: 'addroundkey',
      round: r,
      label: `AddRoundKey (RK${r})`,
      title: `Round ${r} · AddRoundKey`,
      detail: `The state is XORed with round key ${r}, derived from the original key by the key schedule.`,
      before,
      after: Uint8Array.from(s),
      roundKey: roundKeys[r],
      final,
    })
  }

  return steps
}

/* ------------------------------------------------------------------ *
 * Modes of operation (needed by the ECB / CBC / CTR diagrams)
 * ------------------------------------------------------------------ */

export function ecbEncrypt(data: Uint8Array, roundKeys: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i += 16) {
    out.set(encryptBlock(data.subarray(i, i + 16), roundKeys), i)
  }
  return out
}

export function cbcEncrypt(data: Uint8Array, roundKeys: Uint8Array[], iv: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length)
  let prev = Uint8Array.from(iv)
  for (let i = 0; i < data.length; i += 16) {
    const block = new Uint8Array(16)
    const src = data.subarray(i, i + 16)
    for (let j = 0; j < 16; j++) block[j] = src[j] ^ prev[j]
    const ct = encryptBlock(block, roundKeys)
    out.set(ct, i)
    prev = ct
  }
  return out
}

export function ctrCrypt(data: Uint8Array, roundKeys: Uint8Array[], nonce: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length)
  const counter = new Uint8Array(16)
  counter.set(nonce.subarray(0, 8), 0)
  let c = 0
  for (let i = 0; i < data.length; i += 16) {
    // Big-endian 64-bit counter in the low half
    for (let k = 0; k < 8; k++) counter[15 - k] = (c >>> (k * 8)) & 0xff
    const ks = encryptBlock(counter, roundKeys)
    const src = data.subarray(i, i + 16)
    for (let j = 0; j < src.length; j++) out[i + j] = src[j] ^ ks[j]
    c++
  }
  return out
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16)
  return out
}

export function bytesToHex(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0')
  return s
}
