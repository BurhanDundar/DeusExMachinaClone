# Database

PostgreSQL is the source of truth. Flyway owns schema changes and Hibernate uses
`ddl-auto=validate` outside tests.

## Milestone 1 schema

```mermaid
erDiagram
  USERS ||--o{ REFRESH_TOKENS : owns
  USERS {
    uuid id PK
    varchar email UK
    varchar password_hash
    varchar first_name
    varchar last_name
    varchar phone
    boolean enabled
    varchar role
    timestamptz created_at
    timestamptz updated_at
  }
  REFRESH_TOKENS {
    uuid id PK
    uuid user_id FK
    varchar token_hash UK
    timestamptz expires_at
    timestamptz revoked_at
    timestamptz created_at
  }
```

`users.email` is normalized to lowercase and uniquely indexed. Refresh-token
digests are uniquely indexed for constant-time lookup. Expiry and revocation are
stored separately to support rotation and auditability. Application-generated
UUIDs avoid sequential public identifiers and database-extension requirements.

Future migrations add Product/ProductVariant/Inventory, Cart/CartItem,
Order/OrderItem, StockReservation, and Payment without changing the auth tables.
