package com.northline.store.order.dto;

import com.northline.store.order.entity.StoreOrder;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
  UUID id,
  String orderNumber,
  String status,
  String paymentStatus,
  String currency,
  BigDecimal subtotal,
  BigDecimal shippingTotal,
  BigDecimal total,
  String customerEmail,
  String firstName,
  String lastName,
  String phone,
  String addressLine1,
  String addressLine2,
  String district,
  String city,
  String postalCode,
  String country,
  String shippingCarrier,
  String trackingNumber,
  Instant reservationExpiresAt,
  Instant createdAt,
  Instant paidAt,
  List<Line> items
) {
  public record Line(
    UUID variantId,
    String productName,
    String productSlug,
    String sku,
    String optionTitle,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal lineTotal
  ) {}

  public static OrderResponse from(StoreOrder order) {
    return new OrderResponse(
      order.getId(),
      order.getOrderNumber(),
      order.getStatus().name(),
      order.getPaymentStatus().name(),
      order.getCurrency(),
      order.getSubtotal(),
      order.getShippingTotal(),
      order.getTotal(),
      order.getCustomerEmail(),
      order.getFirstName(),
      order.getLastName(),
      order.getPhone(),
      order.getAddressLine1(),
      order.getAddressLine2(),
      order.getDistrict(),
      order.getCity(),
      order.getPostalCode(),
      order.getCountry(),
      order.getShippingCarrier(),
      order.getTrackingNumber(),
      order.getReservationExpiresAt(),
      order.getCreatedAt(),
      order.getPaidAt(),
      order
        .getItems()
        .stream()
        .map(item ->
          new Line(
            item.getVariant().getId(),
            item.getProductName(),
            item.getProductSlug(),
            item.getSku(),
            item.getOptionTitle(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getLineTotal()
          )
        )
        .toList()
    );
  }
}
