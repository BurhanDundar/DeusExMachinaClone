# Database

PostgreSQL is the source of truth. Flyway owns schema changes and Hibernate uses
`ddl-auto=validate` outside tests.

## Current schema

```mermaid
erDiagram
  USERS ||--o{ REFRESH_TOKENS : owns
  USERS ||--o{ PASSWORD_RESET_TOKENS : owns
  USERS ||--o{ USER_ADDRESSES : owns
  CATEGORIES ||--o{ PRODUCTS : groups
  PRODUCTS ||--o{ PRODUCT_IMAGES : displays
  PRODUCTS ||--o{ PRODUCT_VARIANTS : offers
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
  PASSWORD_RESET_TOKENS {
    uuid id PK
    uuid user_id FK
    varchar token_hash UK
    timestamptz expires_at
    timestamptz used_at
  }
  USER_ADDRESSES {
    uuid id PK
    uuid user_id FK
    varchar label
    varchar city
    boolean is_default
  }
  CATEGORIES {
    uuid id PK
    varchar slug UK
    boolean active
  }
  PRODUCTS {
    uuid id PK
    uuid category_id FK
    varchar slug UK
    varchar status
  }
  PRODUCT_IMAGES {
    uuid id PK
    uuid product_id FK
    varchar url
    int sort_order
  }
  PRODUCT_VARIANTS {
    uuid id PK
    uuid product_id FK
    varchar sku UK
    int stock_quantity
    int reserved_quantity
  }
  NEWSLETTER_SUBSCRIBERS {
    uuid id PK
    varchar email UK
    boolean active
    timestamptz consent_at
  }
  ORDERS {
    uuid id PK
    uuid user_id FK
    varchar order_number UK
    varchar status
    varchar payment_status
    numeric total
  }
  ORDER_ITEMS {
    uuid id PK
    uuid order_id FK
    uuid variant_id FK
    varchar sku
    int quantity
    numeric unit_price
  }
```

`users.email` is normalized to lowercase and uniquely indexed. Refresh-token
digests are uniquely indexed for constant-time lookup. Expiry and revocation are
stored separately to support rotation and auditability. Application-generated
UUIDs avoid sequential public identifiers and database-extension requirements.

Order and item snapshots are introduced in V7. Variant `reserved_quantity`
separates temporarily held inventory from sold stock. A future migration can
add persisted payment events and server carts without changing order history.
