package com.northline.store.order.dto;

import com.northline.store.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateOrderFulfillmentRequest(
  @NotNull OrderStatus status,
  @Size(max = 120) String shippingCarrier,
  @Size(max = 120) String trackingNumber
) {}
