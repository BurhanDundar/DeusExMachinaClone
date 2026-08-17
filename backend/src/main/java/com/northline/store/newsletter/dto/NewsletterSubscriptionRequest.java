package com.northline.store.newsletter.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NewsletterSubscriptionRequest(
  @NotBlank @Email @Size(max = 320) String email,
  @AssertTrue(message = "pazarlama izni zorunludur") boolean consent
) {}
