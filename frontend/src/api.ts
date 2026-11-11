export interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
}

/**
 * Die SPA wird vom selben Quarkus-Server ausgeliefert; standardmaessig also
 * relativ gegen dieselbe Origin. Ueber VITE_API_URL laesst sich eine andere
 * API-URL fuer den Entwicklungs-Modus (Vite-Proxy) setzen.
 */
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string>;
  error?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    let details: ApiErrorResponse | undefined;
    try {
      details = (await response.json()) as ApiErrorResponse;
    } catch {
      /* kein JSON (z. B. HTML-Fallback) */
    }
    const message =
      details?.errors
        ? Object.values(details.errors).join("; ")
        : details?.error ?? details?.message ?? `Anfrage fehlgeschlagen (${response.status})`;
    throw new ApiError(response.status, message, details);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export interface RequestOptions {
  token?: string;
}

function authHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchContacts(token?: string, query?: string): Promise<Contact[]> {
  const params = new URLSearchParams();
  if (query?.trim()) {
    params.set("q", query.trim());
  }
  const url = params.toString() ? `/api/contacts?${params}` : "/api/contacts";
  return request<Contact[]>(url, { headers: authHeaders(token) });
}

export async function fetchContact(id: number, token?: string): Promise<Contact> {
  return request<Contact>(`/api/contacts/${id}`, { headers: authHeaders(token) });
}

export async function createContact(input: ContactInput, token?: string): Promise<Contact> {
  return request<Contact>("/api/contacts", {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateContact(id: number, input: ContactInput, token?: string): Promise<Contact> {
  return request<Contact>(`/api/contacts/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteContact(id: number, token?: string): Promise<void> {
  await request<void>(`/api/contacts/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

/**
 * Prueft, ob die API ohne Token erreichbar ist (Demo-/Vorschau-Modus).
 */
export async function apiAllowsAnonymous(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/contacts`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}