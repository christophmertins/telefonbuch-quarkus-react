export interface Contact {
  id: string
  displayName: string
  givenName?: string
  sn?: string
  mail?: string
  telephone?: string
  mobile?: string
  title?: string
  department?: string
  office?: string
}

export interface Stats {
  total: number
  withMail: number
  withPhone: number
  mode: string
}
