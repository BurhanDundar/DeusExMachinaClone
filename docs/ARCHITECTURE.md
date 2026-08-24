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
`PasswordResetToken`, `Category`, `Product`, `ProductImage`, `ProductVariant`,
`StoreOrder`, `OrderItem` and `NewsletterSubscriber`. Purchasable lines reference
`ProductVariant`; order rows also keep immutable product, SKU and price snapshots.

## Authentication lifecycle

1. Register or login verifies credentials and returns a short-lived JWT access
   token in JSON.
2. A longer-lived, opaque refresh token is stored in a Secure/HttpOnly cookie.
   Only its SHA-256 digest is persisted in PostgreSQL.
3. The frontend keeps the access token in memory, never localStorage.
4. On a browser refresh, the auth provider calls `/api/auth/refresh`; successful
   rotation restores the in-memory session.
5. Logout revokes the persisted refresh token and expires the cookie.

## Cart lifecycle

The Zustand cart is browser-local and stores variant IDs. Checkout validates every
line against the current server catalog and stock. A cart never reserves inventory;
only a pending order does. The cart remains intact while payment is pending.

## Checkout and stock lifecycle

Checkout reloads authoritative variants and prices, locks inventory rows,
reserves stock transactionally and creates a `PAYMENT_PENDING` order.
Reservations become sold stock only after a verified, idempotent provider
callback. Failure or expiration releases them. Pending orders expire after the
configured reservation window and creation is rate-limited per account.

## Payment and order lifecycle

`OrderService` owns provider-neutral order and reservation state; iyzico will be
the first payment adapter. Redirects are display-only. Callback verification
is authoritative and idempotent. Email dispatch occurs after the paid
transaction and cannot roll back a successful order.

Administrators can move paid orders only through valid forward fulfillment states.
Shipping requires a carrier and tracking number. Paid cancellation is blocked until
a provider-backed refund flow exists.
