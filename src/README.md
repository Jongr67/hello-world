## Overview

This project is a simple Security Dashboard that tracks FARM findings and the applications they affect. It provides a React-based UI backed by a Spring Boot API with H2 as the data store.

- **Frontend**: React 18 + Vite (dev server at `http://localhost:5173` with proxy to the backend)
- **Backend**: Spring Boot 3 (Java 17), Spring Data JPA, H2 database
- **Database**: H2 file on disk (data persisted under `./data/hello.*`)

The dashboard shows a pie chart of findings by APG, a list of current findings, and tabs for Applications, Certificates, and Resolver Tickets. Findings are linked to applications via a shared unique key: `Application.sealId` ↔ `FarmFinding.applicationSealId`.

## Architecture

- **Backend** (`src/main/java/com/example/hello`)
  - `HelloApplication` — Spring Boot entry point
  - `controllers` — REST controllers (findings, applications, certificates, resolver tickets, hello/count)
  - `service` — business logic for findings, resolver tickets, applications, certificates, hit counter
  - `model` — JPA entities: `FarmFinding`, `ResolverTicket` (with `jiraUrl`, `status`), `Application`, `Certificate`, `HitCounter`
  - `repository` — Spring Data repositories
  - `DataInitializer` — seeds demo data for Applications, FARM findings, and Certificates
- **Frontend** (`frontend/`)
  - `src/pages/App.tsx` — single-page UI with tabs (Findings, Applications, Certificates, Resolver Tickets)
  - Vite dev proxy forwards `/api`, `/hello`, `/h2-console` to the backend (`vite.config.ts`)
- **Database**
  - Configured in `src/main/resources/application.properties`
  - URL: `jdbc:h2:file:./data/hello;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE`
  - H2 console available at `http://localhost:8080/h2-console` (JDBC URL as above, user `sa`, empty password)

## Features

- **Findings dashboard**
  - Pie chart of findings by APG
  - Current findings table: ID, Description, Application Seal ID, Severity/Criticality, Assigned APG, Resolver Ticket(s)
  - Resolver ticket column shows Jira keys if present; otherwise a warning icon
  - “Manage Tickets” flyout per finding to add/delete Jira resolver tickets
- **Applications management**
  - Tab at the top to switch to the Applications view
  - CRUD table with columns: App Name, Platform, Owning APG, Code Repository, Certificates, Farm Findings, and Seal ID (link key)
  - Create/Edit/Delete applications from the UI
  - Findings count per application computed by matching `applicationSealId` to the application `sealId`
- **Certificates**
  - Tab to view certificates table (CN, Serial, Expiration Date, Application)
  - Certificates are stored in H2 and associated 1:N to Applications
  - REST API supports create/update/delete and listing by application
- **Resolver Tickets**
  - Global tab listing all resolver tickets (Jira Key/URL, APG, Status, Finding ID, Application)
  - Tickets update immediately across tabs when added/removed
- **Utilities**
  - Simple `GET /hello` endpoint that increments and returns a hit counter
  - OpenAPI UI (Swagger) at `http://localhost:8080/swagger-ui/index.html`

## Quick start

- **Prerequisites**
  - Java 17+
  - Node.js 18+ (Node 20 recommended)
  - Maven (or run from IDE)

- **Start backend (dev)**
  - Using IDE: run `com.example.hello.HelloApplication`
  - Using Maven: `mvn spring-boot:run`

- **Start frontend (dev)**
  - `cd frontend`
  - `npm install`
  - `npm run dev`
  - Open `http://localhost:5173` (requests to `/api` proxy to `http://localhost:8080`)

- **Build full app (backend + frontend)**
  - `mvn clean package`
  - This builds frontend assets and copies them to backend `static/`, producing an executable JAR
  - Run the app: `java -jar target/hello-0.0.1-SNAPSHOT.jar`

## Configuration

`src/main/resources/application.properties`:

```properties
spring.application.name=hello
spring.h2.console.enabled=true
spring.datasource.url=jdbc:h2:file:./data/hello;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.web.resources.add-mappings=true
```

## Data model

### Application

```json
{
  "id": 1,
  "sealId": "APP-00001",      // unique link key
  "name": "Customer Portal",
  "platform": "Web",
  "owningApg": "Relationships",
  "codeRepository": "https://git.example.com/customer-portal",
  "certificates": "customer.example.com; portal.example.com"
}
```

### FarmFinding

```json
{
  "id": 42,
  "description": "Sample finding #42 for Identity",
  "applicationSealId": "APP-00002",   // links to Application.sealId
  "severity": "High",
  "criticality": "Medium",
  "targetDate": "2025-03-01",
  "assignedApg": "Identity",
  "resolverTickets": [
    {
      "id": 10,
      "jiraKey": "SEC-123",
      "jiraUrl": "https://jira.example.com/browse/SEC-123",
      "apg": "Identity",
      "status": "In Progress"
    }
  ]
}
```

### ResolverTicket

```json
{
  "id": 10,
  "jiraKey": "SEC-123",
  "jiraUrl": "https://jira.example.com/browse/SEC-123",
  "apg": "Identity",
  "status": "In Progress"
}
```

### Certificate

```json
{
  "id": 7,
  "cn": "customer.example.com",
  "serial": "01A3-FFFF-1111",
  "expirationDate": "2026-01-01",
  "application": { "id": 1 }
}
```

## ER Diagram

![ER Diagram](docs/er.svg)

To regenerate the diagram locally:

1) Ensure Node is installed and install the Mermaid CLI and Puppeteer dependencies.
- From `frontend/` directory:
  - `npm install` (installs dev deps including `@mermaid-js/mermaid-cli` and `puppeteer`)

2) Generate the SVG from the Mermaid source:
- `npm run diagram`

Notes:
- The CLI requires a Chromium binary. Installing `puppeteer` downloads a compatible build automatically. If you prefer to use your system Chrome, set `PUPPETEER_EXECUTABLE_PATH` to your Chrome path before running the command.
- Mermaid source: `docs/er.mmd`
- Output image: `docs/er.svg` (embedded above)

## REST APIs

Base URL: `http://localhost:8080`

### Applications

- `GET /api/applications` — list all
- `GET /api/applications/{id}` — get by ID
- `POST /api/applications` — create
- `PUT /api/applications/{id}` — update
- `DELETE /api/applications/{id}` — delete

Example create:

```bash
curl -X POST "http://localhost:8080/api/applications" \
  -H "Content-Type: application/json" \
  -d '{
    "sealId": "APP-00005",
    "name": "Payments API",
    "platform": "Service",
    "owningApg": "Servicing",
    "codeRepository": "https://git.example.com/payments-api",
    "certificates": "payments.example.com"
  }'
```

### FARM findings

- `GET /api/findings` — list findings
- `GET /api/findings/summary/apg` — summary counts of findings by APG
- `POST /api/findings` — create finding
- `PUT /api/findings/{id}` — update finding
- `DELETE /api/findings/{id}` — delete finding

Example create:

```bash
curl -X POST "http://localhost:8080/api/findings" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New issue",
    "applicationSealId": "APP-00001",
    "severity": "Low",
    "criticality": "Low",
    "targetDate": "2025-06-01",
    "assignedApg": "Relationships"
  }'
```

### Resolver tickets (nested under a finding)

- `GET /api/findings/{findingId}/tickets` — list tickets for a finding
- `POST /api/findings/{findingId}/tickets` — add a ticket
- `PUT /api/findings/{findingId}/tickets/{ticketId}` — update a ticket
- `DELETE /api/findings/{findingId}/tickets/{ticketId}` — delete a ticket

Example add ticket:

```bash
curl -X POST "http://localhost:8080/api/findings/42/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "jiraKey": "SEC-456",
    "jiraUrl": "https://jira.example.com/browse/SEC-456",
    "apg": "Identity",
    "status": "To Do"
  }'
```

### Resolver tickets (global)

- `GET /api/tickets` — list all resolver tickets with summary fields:
  - `id`, `jiraKey`, `jiraUrl`, `apg`, `status`, `findingId`, `applicationSealId`

### Certificates

- `GET /api/certificates` — list all certificates
- `GET /api/certificates/application/{applicationId}` — list certificates for an application
- `POST /api/certificates/application/{applicationId}` — create and associate a certificate to an application
- `PUT /api/certificates/{id}` — update a certificate
- `DELETE /api/certificates/{id}` — delete a certificate

### Utility

- `GET /hello` — returns greeting and increments a hit counter
- `GET /api/count` — returns current hit count

### OpenAPI / Swagger

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI docs JSON: `http://localhost:8080/v3/api-docs`

## CORS

Controllers enable CORS for the Vite dev server origin:

- Allowed origin: `http://localhost:5173`

## Seeding

`DataInitializer` seeds:

- 3 Applications (if none exist): `APP-00001`, `APP-00002`, `APP-00003`
- FARM findings up to 50 total, distributed across APGs, with randomized severity/criticality/target dates
- Example Certificates for seeded applications

## Development notes

- The Vite dev server proxies `/api`, `/hello`, and `/h2-console` to `http://localhost:8080` (see `frontend/vite.config.ts`).
- On `mvn package`, the frontend is built and copied into the backend `static/` so the Spring Boot JAR serves the UI directly.


