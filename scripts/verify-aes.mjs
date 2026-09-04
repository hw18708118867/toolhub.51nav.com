/**
 * Verification for src/lib/aes.ts.
 *
 *  1. FIPS-197 Appendix B / C known-answer vectors for AES-128/192/256.
 *  2. Cross-check against the Web Crypto API (AES-CTR with a zero counter
 *     block makes keystream block 0 equal to AES(0^16)).
 *  3. S-box spot checks against the published table.
 *  4. Structural checks on the step trace used by the animation.
 *
 * Run: node scripts/verify-aes.mjs
 */
import { webcrypto } from 'node:crypto'

const A = await import('../src/lib/aes.ts')

let pass = 0
let fail = 0
const t = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`) }
}

const h = A.bytesToHex

console.log('\n1. FIPS-197 known-answer vectors')

const vectors = [
  {
    name: 'AES-128 (FIPS-197 Appendix B)',
    key: '2b7e151628aed2a6abf7158809cf4f3c',
    pt: '3243f6a8885a308d313198a2e0370734',
    ct: '3925841d02dc09fbdc118597196a0b32',
  },
  {
    name: 'AES-192 (FIPS-197 Appendix C.2)',
    key: '000102030405060708090a0b0c0d0e0f1011121314151617',
    pt: '00112233445566778899aabbccddeeff',
    ct: 'dda97ca4864cdfe06eaf70a0ec0d7191',
  },
  {
    name: 'AES-256 (FIPS-197 Appendix C.3)',
    key: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    pt: '00112233445566778899aabbccddeeff',
    ct: '8ea2b7ca516745bfeafc49904b496089',
  },
]

for (const v of vectors) {
  const rk = A.keyExpansion(A.hexToBytes(v.key))
  const got = h(A.encryptBlock(A.hexToBytes(v.pt), rk))
  t(v.name, got === v.ct, `expected ${v.ct}, got ${got}`)
  t(`${v.name} — round key count`, rk.length === A.roundsForKeySize(v.key.length * 4) + 1)
}

console.log('\n2. Cross-check against Web Crypto (AES-CTR keystream trick)')
// AES-CTR with nonce=0 and counter=0 XORs the plaintext with AES(0^16).
// Encrypting a block of zeros therefore yields AES(0^16) directly.
for (const bits of [128, 192, 256]) {
  const key = webcrypto.getRandomValues(new Uint8Array(bits / 8))
  const zeroBlock = new Uint8Array(16)
  const counterBlock = new Uint8Array(16) // nonce 0 || counter 0

  const ck = await webcrypto.subtle.importKey('raw', key, { name: 'AES-CTR' }, false, ['encrypt'])
  const wcOut = new Uint8Array(
    await webcrypto.subtle.encrypt({ name: 'AES-CTR', counter: counterBlock, length: 64 }, ck, zeroBlock)
  )
  const ours = A.encryptBlock(zeroBlock, A.keyExpansion(key))
  t(`AES-${bits} block encrypt matches Web Crypto`, h(wcOut) === h(ours), `webcrypto=${h(wcOut)} ours=${h(ours)}`)
}

console.log('\n3. S-box spot checks')
const sboxChecks = [
  [0x00, 0x63], [0x01, 0x7c], [0x02, 0x77], [0x10, 0xca],
  [0x53, 0xed], [0x7f, 0xd2], [0xff, 0x16],
]
for (const [input, expected] of sboxChecks) {
  t(`SBOX[${input.toString(16).padStart(2, '0')}] = ${expected.toString(16).padStart(2, '0')}`, A.SBOX[input] === expected)
}
let bijective = true
const seen = new Set()
for (let i = 0; i < 256; i++) { if (seen.has(A.SBOX[i])) bijective = false; seen.add(A.SBOX[i]) }
t('S-box is a bijection over 0..255', bijective)
let invOk = true
for (let i = 0; i < 256; i++) if (A.INV_SBOX[A.SBOX[i]] !== i) invOk = false
t('INV_SBOX inverts SBOX', invOk)
for (let i = 0; i < 256; i++) {
  const st = A.sboxSteps(i)
  if (st.output !== A.SBOX[i]) { t('sboxSteps agrees with SBOX', false, `at ${i}`); break }
  if (i === 255) t('sboxSteps agrees with SBOX for all 256 inputs', true)
}

console.log('\n4. GF(2^8) arithmetic')
t('gmul(0x57, 0x83) = 0xc1 (FIPS-197 sec 4.1)', A.gmul(0x57, 0x83) === 0xc1)
t('gmul(0x57, 0x13) = 0xfe (FIPS-197 sec 4.1)', A.gmul(0x57, 0x13) === 0xfe)
t('gmul(0x57, 0x01) = 0x57', A.gmul(0x57, 0x01) === 0x57)
t('xtime(0x80) = 0x1b', A.xtime(0x80) === 0x1b)
t('mixColumn([0xdb,0x13,0x53,0x45]) = 8e4da1bc (FIPS-197 sec 5.1.3)',
  h(A.mixColumn([0xdb, 0x13, 0x53, 0x45])) === '8e4da1bc')

console.log('\n5. Step trace structure (drives the animation)')
for (const bits of [128, 192, 256]) {
  const Nr = A.roundsForKeySize(bits)
  const key = new Uint8Array(bits / 8).fill(0x11)
  const pt = new Uint8Array(16).fill(0x22)
  const rk = A.keyExpansion(key)
  const steps = A.traceEncryption(pt, rk)

  // initial AddRoundKey + (Nr-1) full rounds * 4 + final round * 3
  const expected = 1 + (Nr - 1) * 4 + 3
  t(`AES-${bits}: step count = ${expected}`, steps.length === expected, `got ${steps.length}`)

  const finalCipher = steps[steps.length - 1].after
  t(`AES-${bits}: trace ends at the real ciphertext`, h(finalCipher) === h(A.encryptBlock(pt, rk)))

  const mixSteps = steps.filter(s => s.kind === 'mixcolumns').length
  t(`AES-${bits}: MixColumns runs ${Nr - 1} times (omitted in the final round)`, mixSteps === Nr - 1)

  // Every step's "after" must equal the next step's "before"
  let chained = true
  for (let i = 1; i < steps.length; i++) {
    if (h(steps[i].before) !== h(steps[i - 1].after)) chained = false
  }
  t(`AES-${bits}: steps chain continuously`, chained)
}

console.log('\n6. Modes of operation')
{
  const key = A.hexToBytes('2b7e151628aed2a6abf7158809cf4f3c')
  const rk = A.keyExpansion(key)
  const iv = new Uint8Array(16).fill(0)

  // ECB determinism: identical blocks -> identical ciphertext
  const twoBlocks = new Uint8Array(32)
  twoBlocks.set(A.hexToBytes('6bc1bee22e409f96e93d7e117393172a'), 0)
  twoBlocks.set(A.hexToBytes('6bc1bee22e409f96e93d7e117393172a'), 16)
  const ecb = A.ecbEncrypt(twoBlocks, rk)
  t('ECB: identical plaintext blocks produce identical ciphertext', h(ecb.subarray(0, 16)) === h(ecb.subarray(16, 32)))

  // NIST SP 800-38A CBC-AES128 first two blocks
  const nistPt = A.hexToBytes('6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e51')
  const nistIv = A.hexToBytes('000102030405060708090a0b0c0d0e0f')
  const cbc = A.cbcEncrypt(nistPt, rk, nistIv)
  t('CBC matches NIST SP 800-38A (block 1)',
    h(cbc.subarray(0, 16)) === '7649abac8119b246cee98e9b12e9197d')
  t('CBC matches NIST SP 800-38A (block 2)',
    h(cbc.subarray(16, 32)) === '5086cb9b507219ee95db113a917678b2')

  // CTR is an involution: applying it twice returns the plaintext
  const nonce = new Uint8Array(16).fill(0)
  const ct = A.ctrCrypt(nistPt, rk, nonce)
  const back = A.ctrCrypt(ct, rk, nonce)
  t('CTR round-trips (encrypt == decrypt)', h(back) === h(nistPt))

  // CTR keystream property: C1 ^ C2 == P1 ^ P2 when the nonce is reused
  const p1 = new TextEncoder().encode('ATTACK AT DAWN!!!')
  const p2 = new TextEncoder().encode('RETREAT AT NOON!!')
  const c1 = A.ctrCrypt(p1, rk, nonce)
  const c2 = A.ctrCrypt(p2, rk, nonce)
  const xorC = new Uint8Array(16); const xorP = new Uint8Array(16)
  for (let i = 0; i < 16; i++) { xorC[i] = c1[i] ^ c2[i]; xorP[i] = p1[i] ^ p2[i] }
  t('CTR nonce reuse: C1^C2 == P1^P2 (the vulnerability the diagram shows)', h(xorC) === h(xorP))
}

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
