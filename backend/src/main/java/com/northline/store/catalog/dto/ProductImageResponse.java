package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.ProductImage;
import java.util.UUID;

public record ProductImageResponse(UUID id, String url, String altText) {
  public static ProductImageResponse from(ProductImage image) {
    return new ProductImageResponse(image.getId(), image.getUrl(), image.getAltText());
  }
}
