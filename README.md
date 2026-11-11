# Telefonbuch

Quarkus-Backend + React-Frontend mit Entra-ID-Authentifizierung (OIDC).

## Struktur

- `backend/` — Quarkus 3 (Maven, Java 25), REST-API für Kontakte (`/api/contacts`) und OIDC-Client für Entra ID (`quarkus-oidc`).
- `frontend/` — React 18 (Vite, TypeScript), OIDC-Login via `oidc-client-ts` (Entra ID), ruft die Backend-API mit Bearer Token auf.

Die gebaute React-SPA wird in `backend/src/main/resources/META-INF/resources/` kopiert und
zusammen mit dem Quarkus-Uber-JAR (`target/telefonbuch-backend-1.0.0-runner.jar`) ausgeliefert.

## Vorschau (Demo-Modus)

```bash
./build.sh
DEMO_MODE=true TELEFONBUCH_AUTH_PATHS= java -jar backend/target/telefonbuch-backend-1.0.0-runner.jar
```

- Port: 8080 — die SPA und die API laufen an einem Origin (`http://localhost:8080/`).
- `DEMO_MODE=true` füllt eine leere H2-Datenbank mit drei Beispiel-Kontakten.
- `TELEFONBUCH_AUTH_PATHS=` (leerer Wert) schaltet den Zugriffsschutz für `/api/*` aus,
  damit die Vorschau ohne Entra-ID-Kontext läuft. Die SPA erkennt den Modus automatisch
  und zeigt statt des Login-Buttons einen "Demo"-Badge.

## Lokale Entwicklung

```bash
# Backend (Port 8080)
cd backend
./mvnw quarkus:dev

# Frontend (Port 5173, Proxy /api -> http://localhost:8080)
cd frontend
npm install
npm run dev
```

- DB: H2 in-memory (`jdbc:h2:mem:telefonbuch`)
- Auth: Entra ID – Konfiguration via `ENTRA_ID_TENANT` (Default `common`) und `ENTRA_ID_CLIENT_ID` (Default: `REPLACE_WITH_ENTRA_ID_CLIENT_ID`).

## Entra ID Konfiguration

- App Registration im Entra ID Tenant anlegen (z. B. `Telefonbuch`).
- Redirect URI (SPA): `http://localhost:5173/callback`
- Backend: Redirect URI / Token-Audience entsprechend Konfiguration der Quarkus-OIDC-Integration.
- Scopes: `openid`, `profile`, `email`.

## API

- `GET /api/contacts?q=<search>` — Liste (Suche in Name/Telefonnummer/E-Mail)
- `GET /api/contacts/{id}`
- `POST /api/contacts`
- `PUT /api/contacts/{id}`
- `DELETE /api/contacts/{id}`

Alle Endpoints erfordern standardmäßig eine authentifizierte Entra-ID-Sitzung (JWT).
Fehler werden als JSON zurückgegeben (400 bei Validierungsfehlern, 404 bei unbekannten IDs).

## Deploy (Mac mini)

```bash
./deploy-local.sh
```

Baut die App, kopiert den JAR auf `cmertins@192.168.165.7:/opt/telefonbuch/` und startet ihn
mit OpenJDK 27 (`/opt/homebrew/opt/openjdk/bin/java`) auf Port 8080. Die Mac mini hat Docker-CLI,
aber keinen laufenden Docker-Daemon, deshalb läuft der Quarkus-Uber-JAR direkt.

Danach: <http://192.168.165.7:8080/>