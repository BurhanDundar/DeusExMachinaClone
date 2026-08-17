CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    consent_at TIMESTAMPTZ NOT NULL,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMPTZ,
    CONSTRAINT uk_newsletter_subscribers_email UNIQUE (email)
);

CREATE UNIQUE INDEX idx_newsletter_subscribers_email_lower ON newsletter_subscribers (LOWER(email));
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers (active, subscribed_at);
