package com.northline.store.newsletter.controller;

import com.northline.store.newsletter.dto.NewsletterSubscriptionRequest;
import com.northline.store.newsletter.service.NewsletterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter/subscriptions")
public class NewsletterController {

  private final NewsletterService newsletter;

  public NewsletterController(NewsletterService newsletter) {
    this.newsletter = newsletter;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void subscribe(@Valid @RequestBody NewsletterSubscriptionRequest request) {
    newsletter.subscribe(request);
  }

  @DeleteMapping("/{token}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void unsubscribe(@PathVariable String token) {
    newsletter.unsubscribe(token);
  }
}
