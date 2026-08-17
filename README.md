# Northline Supply — commerce monorepo

Production-oriented workspace for the customer storefront and the commerce API.

```text
apps/storefront  Next.js customer experience
backend          Spring Boot API, authentication and database migrations
packages/*       Future shared UI, contracts and configuration
docs             Architecture, API, database, auth and checkout decisions
docker-compose.yml  Local PostgreSQL and backend services
```

## Requirements

- Node.js 20+ (Node.js 22 LTS recommended)
- npm 10+
- Docker Desktop for the recommended backend setup
- Java 17 and Maven 3.9+ only when running the backend outside Docker

## First setup

```bash
npm install
cp .env.example .env
cp apps/storefront/.env.example apps/storefront/.env.local
cp backend/.env.example backend/.env
```

The example values are suitable for local development only. Replace the JWT
secret and database credentials in every deployed environment.

## Run locally

All commands below start from the repository root.

Start PostgreSQL and the Spring Boot backend:

```bash
docker compose up --build postgres backend
```

In a second terminal, start the Next.js storefront:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API runs on
[http://localhost:8080](http://localhost:8080), and its health endpoint is
`/actuator/health`.

## Product image uploads

The admin panel uploads product images directly from a phone or computer to Vercel Blob.
In the Vercel project, create a **public** Blob store and add its generated
`BLOB_READ_WRITE_TOKEN` to the storefront environment. For local development,
put the same value in `apps/storefront/.env.local`. The token is server-only;
do not expose it with a `NEXT_PUBLIC_` prefix.

To run only PostgreSQL in Docker and the API directly on the host:

```bash
docker compose up -d postgres
cd backend
mvn spring-boot:run
```

## Verification

From the repository root:

```bash
npm run typecheck
npm run build
cd backend && mvn test
```

For a production-mode frontend check, run `npm run build && npm start`. Do not
run `next build` while the development server is active because both commands
use the same `.next` directory.

## Authentication scope

Milestone 1 includes registration, login, logout, refresh-token rotation and
the authenticated `/api/users/me` profile endpoint. Access tokens are held in
frontend memory; the opaque refresh token is stored in an HttpOnly cookie and
only its SHA-256 hash is persisted. Product, cart, inventory, order and payment
backend flows are intentionally reserved for later milestones.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system boundary and
[docs/AUTH.md](docs/AUTH.md) for the complete session design.
