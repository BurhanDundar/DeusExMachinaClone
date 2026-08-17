# Commerce architecture

## Repository boundaries

The existing Next.js application remains in `apps/storefront`. The Spring Boot
application lives independently in `backend`. They share HTTP contracts, not
runtime code or database entities.

```text
browser -> Next.js storefront (:3000) -> Spring Boot API (:8080) -> PostgreSQL (:5432)
```

The implemented backend owns authentication, customer addresses, the product
catalog, product variants, admin management and newsletter subscriptions.
Vercel Blob stores public product media; PostgreSQL stores its ordered URLs.

## Communication

- JSON APIs are exposed below `/api`.
- The frontend API origin is configured with `NEXT_PUBLIC_API_URL`.
- Browser requests include credentials so the refresh-token cookie can be sent.
- Validation and authorization are authoritative in the backend.
- API errors use a stable `{ code, message, fieldErrors, timestamp }` envelope.

## Domain model

Current domains include `User`, `UserAddress`, `RefreshToken`,
`PasswordResetToken`, `Category`, `Product`, `ProductImage`, `ProductVariant`
and `NewsletterSubscriber`. A future purchasable line will reference
`ProductVariant`, not a frontend-only product/size pair.

## Authentication lifecycle

1. Register or login verifies credentials and returns a short-lived JWT access
   token in JSON.
2. A longer-lived, opaque refresh token is stored in a Secure/HttpOnly cookie.
   Only its SHA-256 digest is persisted in PostgreSQL.
3. The frontend keeps the access token in memory, never localStorage.
4. On a browser refresh, the auth provider calls `/api/auth/refresh`; successful
   rotation restores the in-memory session.
5. Logout revokes the persisted refresh token and expires the cookie.

## Future cart lifecycle

The current Zustand cart remains the guest cart. After login, the order milestone
will merge lines by variant ID into the server cart, cap quantities
to available stock, then clear successfully merged guest lines. A cart never
reserves inventory.

## Future checkout and stock lifecycle

Checkout will reload authoritative variants and prices, lock inventory rows,
reserve stock transactionally, create a `PENDING_PAYMENT` order, then initialize
payment through `PaymentProvider`. Reservations become sold stock only after a
verified, idempotent provider callback. Failure or expiration releases them.

## Future payment and order lifecycle

`OrderService` will depend on a provider-neutral `PaymentProvider`; iyzico will
be the first adapter. Redirects are display-only. Webhook/callback verification
is authoritative and idempotent. Email dispatch occurs after the paid
transaction and cannot roll back a successful order.
