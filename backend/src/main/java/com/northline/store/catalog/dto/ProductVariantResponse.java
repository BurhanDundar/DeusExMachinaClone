package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.ProductVariant;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductVariantResponse(
  UUID id,
  String title,
  String sku,
  String color,
  String size,
  BigDecimal price,
  int stockQuantity,
  boolean active,
  boolean available
) {
  public static ProductVariantResponse from(ProductVariant variant) {
    return new ProductVariantResponse(
      variant.getId(),
      variant.getTitle(),
      variant.getSku(),
      variant.getColor(),
      variant.getSize(),
      variant.getPrice(),
      variant.getStockQuantity(),
      variant.isActive(),
      variant.isActive() && variant.getStockQuantity() > 0
    );
  }
}
