export function generateUUID(): string {
  if (crypto?.getRandomValues) {
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    buf[6] = (buf[6] & 0x0f) | 0x40
    buf[8] = (buf[8] & 0x3f) | 0x80
    const hx: string[] = []
    for (let i = 0; i < 16; i++) hx.push(buf[i].toString(16).padStart(2, '0'))
    return `${hx[0]}${hx[1]}${hx[2]}${hx[3]}-${hx[4]}${hx[5]}-${hx[6]}${hx[7]}-${hx[8]}${hx[9]}-${hx[10]}${hx[11]}${hx[12]}${hx[13]}${hx[14]}${hx[15]}`
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}