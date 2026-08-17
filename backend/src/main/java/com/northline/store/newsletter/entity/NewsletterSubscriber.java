package com.northline.store.newsletter.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "newsletter_subscribers")
public class NewsletterSubscriber {

  @Id
  @UuidGenerator
  private UUID id;

  @Column(nullable = false, unique = true, length = 320)
  private String email;

  @Column(nullable = false)
  private boolean active = true;

  @Column(name = "consent_at", nullable = false)
  private Instant consentAt;

  @Column(name = "subscribed_at", nullable = false)
  private Instant subscribedAt;

  @Column(name = "unsubscribed_at")
  private Instant unsubscribedAt;

  @PrePersist
  void onCreate() {
    var now = Instant.now();
    subscribedAt = now;
    consentAt = now;
    email = normalize(email);
  }

  public static String normalize(String email) {
    return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
  }

  public void subscribe(String email) {
    this.email = normalize(email);
    active = true;
    consentAt = Instant.now();
    unsubscribedAt = null;
  }

  public UUID getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public boolean isActive() {
    return active;
  }

  public Instant getConsentAt() {
    return consentAt;
  }

  public Instant getSubscribedAt() {
    return subscribedAt;
  }
}
