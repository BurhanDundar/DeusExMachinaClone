package com.northline.store.newsletter.repository;

import com.northline.store.newsletter.entity.NewsletterSubscriber;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, UUID> {
  Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);
  List<NewsletterSubscriber> findAllByOrderBySubscribedAtDesc();
  Optional<NewsletterSubscriber> findByUnsubscribeToken(String unsubscribeToken);
}
