package com.northline.store.newsletter.service;

import com.northline.store.newsletter.dto.NewsletterSubscriberResponse;
import com.northline.store.newsletter.dto.NewsletterSubscriptionRequest;
import com.northline.store.newsletter.entity.NewsletterSubscriber;
import com.northline.store.newsletter.repository.NewsletterSubscriberRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NewsletterService {

  private final NewsletterSubscriberRepository subscribers;

  public NewsletterService(NewsletterSubscriberRepository subscribers) {
    this.subscribers = subscribers;
  }

  @Transactional
  public void subscribe(NewsletterSubscriptionRequest request) {
    var email = NewsletterSubscriber.normalize(request.email());
    var subscriber = subscribers.findByEmailIgnoreCase(email).orElseGet(NewsletterSubscriber::new);
    subscriber.subscribe(email);
    subscribers.save(subscriber);
  }

  @Transactional(readOnly = true)
  public List<NewsletterSubscriberResponse> list() {
    return subscribers
      .findAllByOrderBySubscribedAtDesc()
      .stream()
      .map(NewsletterSubscriberResponse::from)
      .toList();
  }
}
