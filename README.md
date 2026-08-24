# Binks Machina — e-ticaret monoreposu

Müşteri mağazası ve ticaret API’si için üretim odaklı çalışma alanı.

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

Production also requires `NEXT_PUBLIC_SITE_URL` and the public company/contact
fields in `apps/storefront/.env.local`. Password reset and order e-mails require
`RESEND_API_KEY`, `EMAIL_FROM` and `STOREFRONT_URL` in the backend environment.

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

## Implemented scope

The repository includes registration, login throttling, logout, refresh-token rotation,
single-use password reset, customer profiles and delivery addresses. The
catalog API and admin panel manage categories, products, variants, stock
values, ordered Blob galleries, newsletter subscribers, customer orders and
admin order fulfillment and shipment tracking. Checkout creates idempotent pending orders,
calculates shipping on the server and reserves stock by variant. Reservations expire
automatically; verified payment completion consumes a reservation exactly once. Access tokens are
held in frontend memory; opaque refresh and password-reset tokens are persisted
only as SHA-256 hashes.

The remaining commerce milestone is the external iyzico Checkout Form adapter,
verified callback/retrieve flow and provider-backed refunds. Configure `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`,
`IYZICO_BASE_URL` and `IYZICO_CALLBACK_URL` only in backend environments.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system boundary and
[docs/AUTH.md](docs/AUTH.md) for the complete session design.
Before launch, complete [docs/PRODUCTION.md](docs/PRODUCTION.md).
