import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { signIn, signInRedirectCallback, signOut, userManager } from "./auth";
import {
  ApiError,
  apiAllowsAnonymous,
  createContact,
  deleteContact,
  fetchContacts,
  updateContact,
  type Contact,
  type ContactInput,
} from "./api";

interface ContactForm {
  name: string;
  phone: string;
  email: string;
}

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ContactForm | null>(null);
  const [saving, setSaving] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    userManager.getUser().then((user) => {
      if (!cancelled) {
        setToken(user?.access_token);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userManager]);

  // Demo-/Vorschau-Modus: Die API antwortet ohne Token, dann wird kein Login benoetigt.
  const [anonymousMode, setAnonymousMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContacts(await fetchContacts(token, query));
      setAnonymousMode(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setContacts([]);
      } else {
        setError(err instanceof Error ? err.message : "Kontakte konnten nicht geladen werden");
      }
    } finally {
      setLoading(false);
    }
  }, [token, query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        const allowed = await apiAllowsAnonymous();
        if (!cancelled) {
          setAnonymousMode(allowed);
        }
      }
      if (!cancelled) {
        await load();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (!token && !anonymousMode) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (!params.get("code") && !params.get("state")) {
      return;
    }
    signInRedirectCallback()
      .then(() => {
        window.history.replaceState({}, "", "/");
      })
      .catch(() => setError("Anmeldung fehlgeschlagen"))
      .finally(() => {
        setAnonymousMode(false);
      });
  }, [token, anonymousMode]);

  const canEdit = token !== undefined || anonymousMode;

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch {
      setError("Anmeldung fehlgeschlagen");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      setContacts([]);
      setEditingId(null);
      setDraft(null);
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) {
      return;
    }
    const input: ContactInput = {
      name: (formRef.current?.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
      phone: (formRef.current?.elements.namedItem("phone") as HTMLInputElement)?.value ?? "",
      email: (formRef.current?.elements.namedItem("email") as HTMLInputElement)?.value ?? "",
    };
    if (!input.name.trim() || !input.phone.trim()) {
      setError("Name und Telefonnummer sind erforderlich");
      return;
    }
    setSaving(true);
    try {
      const created = await createContact(input, token);
      setContacts((current) => [created, ...current]);
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kontakt konnte nicht angelegt werden");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId === null || draft === null) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateContact(editingId, draft, token);
      setContacts((current) => current.map((contact) => (contact.id === updated.id ? updated : contact)));
      setEditingId(null);
      setDraft(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kontakt konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canEdit || !window.confirm("Kontakt wirklich löschen?")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteContact(id, token);
      setContacts((current) => current.filter((contact) => contact.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kontakt konnte nicht gelöscht werden");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setDraft({ name: contact.name, phone: contact.phone, email: contact.email ?? "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const empty = contacts.length === 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-logo">☎</span>
          <div>
            <h1>Telefonbuch</h1>
            <p className="app-subtitle">
              {anonymousMode ? "Vorschau-Modus (ohne Anmeldung)" : "Kontakte mit Entra ID"}
            </p>
          </div>
        </div>
        <div className="app-actions">
          {token ? (
            <button type="button" className="btn btn-ghost" onClick={handleSignOut} disabled={saving}>
              Abmelden
            </button>
          ) : canEdit ? (
            <span className="btn btn-ghost" title="Vorschau-Modus">
              <span className="dot" /> Demo
            </span>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleSignIn} disabled={saving}>
              Anmelden
            </button>
          )}
        </div>
      </header>

      {error ? <div className="alert" role="alert">{error}</div> : null}

      <section className="panel">
        <form
          ref={formRef}
          className="contact-form"
          onSubmit={handleAdd}
          aria-label="Neuen Kontakt anlegen"
        >
          <div className="field">
            <label htmlFor="new-name">Name</label>
            <input id="new-name" name="name" type="text" placeholder="Max Mustermann" autoComplete="off" disabled={!canEdit} />
          </div>
          <div className="field">
            <label htmlFor="new-phone">Telefonnummer</label>
            <input
              id="new-phone"
              name="phone"
              type="tel"
              placeholder="030-1234567"
              autoComplete="off"
              disabled={!canEdit}
            />
          </div>
          <div className="field">
            <label htmlFor="new-email">E-Mail</label>
            <input id="new-email" name="email" type="email" placeholder="max@example.com" autoComplete="off" disabled={!canEdit} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!canEdit || saving}>
            {saving ? "Speichern…" : "Kontakt hinzufügen"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Kontakte</h2>
          <div className="search">
            <span className="search-icon">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nach Name, Telefon oder E-Mail suchen"
              aria-label="Kontakte suchen"
            />
          </div>
        </div>

        {loading ? (
          <div className="state">
            <span className="spinner" aria-hidden="true" />
            Kontakte werden geladen…
          </div>
        ) : empty ? (
          <div className="state state-empty">
            <p>Es sind noch keine Kontakte vorhanden.</p>
            <p className="muted">Fügen Sie oben einen Kontakt hinzu.</p>
          </div>
        ) : (
          <ul className="contact-list">
            {contacts.map((contact) => {
              const isEditing = editingId === contact.id;
              return (
                <li key={contact.id} className={isEditing ? "contact editing" : "contact"}>
                  <div className="contact-main">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-detail">{contact.phone}</div>
                    {contact.email ? <div className="contact-detail muted">{contact.email}</div> : null}
                  </div>
                  <div className="contact-actions">
                    {!isEditing && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(contact)}
                        disabled={!canEdit}
                      >
                        Bearbeiten
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(contact.id)}
                      disabled={!canEdit}
                    >
                      Löschen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editingId !== null && draft !== null ? (
        <section className="panel panel-edit">
          <form className="contact-form" onSubmit={handleSave} aria-label="Kontakt bearbeiten">
            <input type="hidden" name="id" value={String(editingId)} />
            <div className="field">
              <label htmlFor="edit-name">Name</label>
              <input id="edit-name" name="name" type="text" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="edit-phone">Telefonnummer</label>
              <input id="edit-phone" name="phone" type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="edit-email">E-Mail</label>
              <input id="edit-email" name="email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            </div>
            <div className="edit-actions">
              <button type="button" className="btn btn-ghost" onClick={cancelEdit} disabled={saving}>
                Abbrechen
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}