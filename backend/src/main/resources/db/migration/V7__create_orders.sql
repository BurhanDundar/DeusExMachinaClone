ALTER TABLE product_variants
    ADD COLUMN reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    client_reference VARCHAR(80) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL,
    payment_status VARCHAR(32) NOT NULL,
    payment_reference VARCHAR(160) UNIQUE,
    currency VARCHAR(3) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    shipping_total NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    customer_email VARCHAR(320) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    address_line1 VARCHAR(240) NOT NULL,
    address_line2 VARCHAR(240),
    district VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(80) NOT NULL,
    tracking_number VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,
    product_slug VARCHAR(220) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    option_title VARCHAR(160) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items (order_id);
