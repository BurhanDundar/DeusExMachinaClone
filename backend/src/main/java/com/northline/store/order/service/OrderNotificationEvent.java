package com.northline.store.order.service;

import com.northline.store.order.dto.OrderResponse;

public record OrderNotificationEvent(Type type, OrderResponse order) {
  public enum Type {
    CONFIRMED,
    SHIPPED,
    CANCELLED,
  }
}
