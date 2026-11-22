import type { Contact, Stats } from './types'

export async function fetchContacts(q: string): Promise<Contact[]> {
  const res = await fetch(`/api/contacts?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error(`Suche fehlgeschlagen (${res.status})`)
  return res.json()
}

export async function fetchContact(id: string): Promise<Contact> {
  const res = await fetch(`/api/contacts/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`Kontakt nicht gefunden (${res.status})`)
  return res.json()
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/stats')
  if (!res.ok) throw new Error(`Statistik fehlgeschlagen (${res.status})`)
  return res.json()
}
