# Checkout boundary

Checkout authenticates the user, reloads authoritative variant prices, acquires
inventory under a pessimistic row lock, reserves stock and creates an idempotent
`PAYMENT_PENDING` order in one transaction. Product names, SKU values, prices
and the delivery address are snapshotted into the order.

The server calculates the flat shipping fee and free-shipping threshold; client
amounts are never trusted. Reservations expire automatically (30 minutes by
default), and repeated draft creation is rate-limited.

The iyzico adapter is the next step. Verified callbacks must be idempotent by
provider reference and order state. Successful verification marks the order
paid and consumes reservations. Failure or expiry releases stock.
Any future `/checkout/success` page must remain display-only and must never mutate
payment state. The manual admin “mark paid” endpoint has intentionally been removed.
