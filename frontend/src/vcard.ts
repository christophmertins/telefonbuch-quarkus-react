import type { Contact } from './types'

function escape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function fold(line: string): string {
  const out: string[] = []
  let rest = line
  while (rest.length > 74) {
    out.push(rest.slice(0, 74))
    rest = ' ' + rest.slice(74)
  }
  out.push(rest)
  return out.join('\r\n')
}

export function buildVcard(c: Contact): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escape(c.displayName)}`,
    `N:${escape(c.sn ?? '')};${escape(c.givenName ?? '')};;;`,
  ]
  if (c.title) lines.push(`TITLE:${escape(c.title)}`)
  if (c.department) lines.push(`ORG:${escape(c.department)}`)
  if (c.mail) lines.push(`EMAIL:${escape(c.mail)}`)
  if (c.telephone) lines.push(`TEL;TYPE=WORK,VOICE:${escape(c.telephone)}`)
  if (c.mobile) lines.push(`TEL;TYPE=CELL:${escape(c.mobile)}`)
  if (c.office) lines.push(`NOTE:${escape(c.office)}`)
  lines.push('END:VCARD')
  return lines.map(fold).join('\r\n')
}

export function downloadVcard(c: Contact): void {
  const blob = new Blob([buildVcard(c)], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${c.displayName.trim().replace(/\s+/g, '_')}.vcf`
  a.click()
  URL.revokeObjectURL(url)
}
