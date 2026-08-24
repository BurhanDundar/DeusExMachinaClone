ALTER TABLE orders
    ADD COLUMN reservation_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN shipping_carrier VARCHAR(120);

UPDATE orders
SET reservation_expires_at = created_at + INTERVAL '30 minutes'
WHERE payment_status = 'PENDING';

CREATE INDEX idx_orders_expiring_reservations
    ON orders (reservation_expires_at)
    WHERE payment_status = 'PENDING';

ALTER TABLE newsletter_subscribers
    ADD COLUMN unsubscribe_token VARCHAR(64);

UPDATE newsletter_subscribers
SET unsubscribe_token = REPLACE(gen_random_uuid()::text, '-', '')
WHERE unsubscribe_token IS NULL;

ALTER TABLE newsletter_subscribers
    ALTER COLUMN unsubscribe_token SET NOT NULL,
    ADD CONSTRAINT uk_newsletter_unsubscribe_token UNIQUE (unsubscribe_token);
