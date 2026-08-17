package com.northline.store.newsletter.controller;

import com.northline.store.newsletter.dto.NewsletterSubscriberResponse;
import com.northline.store.newsletter.service.NewsletterService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/newsletter/subscribers")
public class AdminNewsletterController {

  private final NewsletterService newsletter;

  public AdminNewsletterController(NewsletterService newsletter) {
    this.newsletter = newsletter;
  }

  @GetMapping
  List<NewsletterSubscriberResponse> subscribers() {
    return newsletter.list();
  }
}
