# Northline Supply — commerce monorepo

Production-oriented workspace for a responsive lifestyle storefront.

```text
apps/storefront  Next.js customer experience
apps/api         Reserved backend boundary (see README)
packages/*       Future shared UI, contracts and configuration
docs             Product and design decisions
```

Node.js 18.18+ is required (Node.js 22 LTS is recommended).

Using npm:

```bash
npm install
npm run dev
```

For a production-mode check, run `npm run build && npm start`. Do not run
`next build` while the development server is active because both commands use
the same `.next` directory.
