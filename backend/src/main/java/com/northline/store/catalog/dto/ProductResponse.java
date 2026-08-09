package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.Product;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
  UUID id,
  String slug,
  String name,
  String description,
  CategoryResponse category,
  BigDecimal price,
  BigDecimal compareAtPrice,
  String badge,
  boolean featured,
  List<ProductImageResponse> images,
  List<ProductVariantResponse> variants
) {
  public static ProductResponse from(Product product) {
    return new ProductResponse(
      product.getId(),
      product.getSlug(),
      product.getName(),
      product.getDescription(),
      CategoryResponse.from(product.getCategory()),
      product.getBasePrice(),
      product.getCompareAtPrice(),
      product.getBadge(),
      product.isFeatured(),
      product.getImages().stream().map(ProductImageResponse::from).toList(),
      product.getVariants().stream().map(ProductVariantResponse::from).toList()
    );
  }
}
