import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import { fetchContacts, fetchContact, fetchStats } from './api'
import type { Contact, Stats } from './types'
import { buildVcard, downloadVcard } from './vcard'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const PALETTES: [string, string][] = [
  ['#475569', '#64748b'],
  ['#57534e', '#78716c'],
  ['#525252', '#737373'],
  ['#3f4a5a', '#556072'],
]

function paletteFor(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return PALETTES[h % PALETTES.length]
}

function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const [a, b] = paletteFor(name)
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      {initials(name)}
    </div>
  )
}

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function MailIcon({ size }: { size?: number }) {
  return <Icon size={size}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></Icon>
}

function PhoneIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Icon>
  )
}

function MobileIcon({ size }: { size?: number }) {
  return <Icon size={size}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Icon>
}

function OfficeIcon({ size }: { size?: number }) {
  return <Icon size={size}><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4" /><path d="M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2" /></Icon>
}

function CloseIcon({ size }: { size?: number }) {
  return <Icon size={size}><path d="M18 6 6 18M6 6l12 12" /></Icon>
}

function QrIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM21 14v2M14 21h2M21 18v3h-3v-3h3z" />
    </Icon>
  )
}

export default function App() {
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') ?? '')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const onSelect = useCallback((c: Contact) => {
    location.hash = '#/contact/' + encodeURIComponent(c.id)
    setSelected(c)
  }, [])

  const onClose = useCallback(() => {
    location.hash = ''
    setSelected(null)
    setQr(null)
  }, [])

  useEffect(() => {
    const m = location.hash.match(/^#\/contact\/(.+)$/)
    if (m) {
      fetchContact(decodeURIComponent(m[1])).then(setSelected).catch(() => {})
    }
  }, [])

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      fetchContacts(query)
        .then(setContacts)
        .catch((e) => setError(e instanceof Error ? e.message : 'Fehler'))
        .finally(() => setLoading(false))
    }, 180)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!selected) {
      setQr(null)
      return
    }
    let cancelled = false
    setQr(null)
    QRCode.toDataURL(buildVcard(selected), { margin: 1, width: 196 })
      .then((url) => { if (!cancelled) setQr(url) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selected])

  const groups = useMemo(() => {
    const map = new Map<string, Contact[]>()
    for (const c of contacts) {
      const key = c.department?.trim() || 'Sonstige'
      const list = map.get(key)
      if (list) list.push(c)
      else map.set(key, [c])
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'de'))
  }, [contacts])

  const downloadQr = useCallback(() => {
    if (!qr || !selected) return
    const a = document.createElement('a')
    a.href = qr
    a.download = `${selected.displayName.trim().replace(/\s+/g, '_')}-qr.png`
    a.click()
  }, [qr, selected])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-tile">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <h1>Telefonbuch</h1>
            <p>Kontaktverzeichnis</p>
          </div>
        </div>
        {stats && (
          <div className="mode-badge" title="Aktive Datenquelle">
            <span className={`mode-dot ${stats.mode === 'ldap' ? 'ok' : 'demo'}`} />
            {stats.mode === 'ldap' ? 'Verzeichnis' : 'Demo'}
          </div>
        )}
      </header>

      <div className="search-wrap">
        <div className="search-box">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, E-Mail, Telefon, Abteilung …"
            autoFocus
          />
          <kbd>/</kbd>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="row skeleton-row">
                  <td colSpan={4}><div className="skeleton" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : contacts.length === 0 ? (
        <div className="empty">
          <svg className="empty-icon" viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h2>Keine Kontakte gefunden</h2>
          <p>Versuche es mit einem anderen Begriff.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="cell-contact">Kontakt</th>
                <th className="cell-phone">Telefon</th>
                <th className="cell-mobile">Mobil</th>
                <th className="cell-mail">E-Mail</th>
              </tr>
            </thead>
            {groups.map(([dept, list]) => (
              <tbody key={dept}>
                <tr className="group-header">
                  <td colSpan={4}>
                    <span>{dept}</span>
                    <span className="group-count">{list.length}</span>
                  </td>
                </tr>
                {list.map((c) => (
                  <tr key={c.id} className="row" onClick={() => onSelect(c)}>
                    <td className="cell-contact">
                      <Avatar name={c.displayName} size={28} />
                      <div className="cell-contact-body">
                        <div className="cell-name">{c.displayName}</div>
                        {c.title && <div className="cell-title">{c.title}</div>}
                      </div>
                    </td>
                    <td className="cell-phone">
                      {c.telephone && <a className="cell-link" href={`tel:${c.telephone}`} onClick={(e) => e.stopPropagation()}>{c.telephone}</a>}
                    </td>
                    <td className="cell-mobile">
                      {c.mobile && <a className="cell-link" href={`tel:${c.mobile}`} onClick={(e) => e.stopPropagation()}>{c.mobile}</a>}
                    </td>
                    <td className="cell-mail">
                      {c.mail && <a className="cell-link" href={`mailto:${c.mail}`} onClick={(e) => e.stopPropagation()}>{c.mail}</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}

      {selected && (
        <div className="overlay" onClick={onClose}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={onClose} aria-label="Schließen"><CloseIcon size={18} /></button>
            <Avatar name={selected.displayName} size={72} />
            <h2>{selected.displayName}</h2>
            {selected.title && <p className="drawer-title">{selected.title}</p>}
            {selected.department && <p className="drawer-dept">{selected.department}</p>}
            <div className="drawer-rows">
              {selected.telephone && (
                <a className="row-link" href={`tel:${selected.telephone}`}>
                  <span className="row-icon"><PhoneIcon size={18} /></span>
                  <span className="row-label">Telefon</span>
                  <span className="row-value">{selected.telephone}</span>
                </a>
              )}
              {selected.mobile && (
                <a className="row-link" href={`tel:${selected.mobile}`}>
                  <span className="row-icon"><MobileIcon size={18} /></span>
                  <span className="row-label">Mobil</span>
                  <span className="row-value">{selected.mobile}</span>
                </a>
              )}
              {selected.mail && (
                <a className="row-link" href={`mailto:${selected.mail}`}>
                  <span className="row-icon"><MailIcon size={18} /></span>
                  <span className="row-label">E-Mail</span>
                  <span className="row-value">{selected.mail}</span>
                </a>
              )}
              {selected.office && (
                <div className="row-link static">
                  <span className="row-icon"><OfficeIcon size={18} /></span>
                  <span className="row-label">Büro</span>
                  <span className="row-value">{selected.office}</span>
                </div>
              )}
            </div>
            {qr && (
              <div className="drawer-qr">
                <img src={qr} alt="QR-Code vCard" width={148} height={148} />
                <div className="drawer-qr-side">
                  <span className="drawer-qr-label"><QrIcon size={14} /> vCard</span>
                  <button className="btn btn-ghost btn-small" onClick={downloadQr}>QR-Code speichern</button>
                  <button className="btn btn-ghost btn-small" onClick={() => downloadVcard(selected)}>.vcf exportieren</button>
                </div>
              </div>
            )}
            <div className="drawer-actions">
              {selected.mail && <a className="btn btn-primary" href={`mailto:${selected.mail}`}>E-Mail schreiben</a>}
              {selected.telephone && <a className="btn btn-ghost" href={`tel:${selected.telephone}`}>Anrufen</a>}
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>Telefonbuch</span>
        <span>{stats ? `${stats.total} Kontakte` : ''}</span>
      </footer>
    </div>
  )
}
