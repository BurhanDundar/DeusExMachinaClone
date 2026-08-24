package com.northline.store.order.service;

import com.northline.store.auth.service.TransactionalEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class OrderNotificationListener {

  private static final Logger log = LoggerFactory.getLogger(OrderNotificationListener.class);
  private final TransactionalEmailService email;

  public OrderNotificationListener(TransactionalEmailService email) {
    this.email = email;
  }

  @Async
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void send(OrderNotificationEvent event) {
    if (!email.isConfigured()) return;
    try {
      switch (event.type()) {
        case CONFIRMED -> email.sendOrderConfirmed(event.order());
        case SHIPPED -> email.sendOrderShipped(event.order());
        case CANCELLED -> email.sendOrderCancelled(event.order());
      }
    } catch (RuntimeException exception) {
      log.error("Order email delivery failed for {}", event.order().orderNumber(), exception);
    }
  }
}
