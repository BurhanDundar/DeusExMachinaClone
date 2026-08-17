package com.northline.store.newsletter.dto;

import com.northline.store.newsletter.entity.NewsletterSubscriber;
import java.time.Instant;
import java.util.UUID;

public record NewsletterSubscriberResponse(
  UUID id,
  String email,
  boolean active,
  Instant consentAt,
  Instant subscribedAt
) {
  public static NewsletterSubscriberResponse from(NewsletterSubscriber subscriber) {
    return new NewsletterSubscriberResponse(
      subscriber.getId(),
      subscriber.getEmail(),
      subscriber.isActive(),
      subscriber.getConsentAt(),
      subscriber.getSubscribedAt()
    );
  }
}
