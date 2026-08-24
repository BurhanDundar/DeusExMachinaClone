package com.northline.store.order.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderReservationScheduler {

  private static final Logger log = LoggerFactory.getLogger(OrderReservationScheduler.class);
  private final OrderService orders;

  public OrderReservationScheduler(OrderService orders) {
    this.orders = orders;
  }

  @Scheduled(fixedDelayString = "${app.orders.expiration-check-ms:60000}")
  public void releaseExpiredReservations() {
    var released = orders.expirePendingReservations();
    if (released > 0) log.info("Released {} expired order reservations", released);
  }
}
