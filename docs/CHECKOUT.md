# Checkout boundary (future milestone)

Checkout is deliberately not implemented in Milestone 1. Its service boundary
will authenticate the user, load the server cart, recalculate prices, acquire
inventory under a pessimistic row lock, create reservations and a
`PENDING_PAYMENT` order in one transaction, then invoke `PaymentProvider`.

Verified callbacks will be idempotent by provider event/reference and order
state. Successful verification marks the order paid, consumes reservations,
clears the purchased cart and schedules email. Failure or expiry releases stock.
Visiting `/checkout/success` will never mutate payment state.
