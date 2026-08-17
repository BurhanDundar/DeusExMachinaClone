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
  }
  NEWSLETTER_SUBSCRIBERS {
    uuid id PK
    varchar email UK
    boolean active
    timestamptz consent_at
  }
```

`users.email` is normalized to lowercase and uniquely indexed. Refresh-token
digests are uniquely indexed for constant-time lookup. Expiry and revocation are
stored separately to support rotation and auditability. Application-generated
UUIDs avoid sequential public identifiers and database-extension requirements.

Future migrations add Cart/CartItem, Order/OrderItem, StockReservation and
Payment without changing the existing authentication or catalog tables.
