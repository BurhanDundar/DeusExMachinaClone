package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.Product;
import com.northline.store.catalog.entity.ProductStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AdminProductResponse(
  UUID id,
  String slug,
  String name,
  String description,
  AdminCategoryResponse category,
  ProductStatus status,
  BigDecimal price,
  BigDecimal compareAtPrice,
  String badge,
  boolean featured,
  int sortOrder,
  List<ProductImageResponse> images,
  List<ProductVariantResponse> variants
) {
  public static AdminProductResponse from(Product product) {
    return new AdminProductResponse(
      product.getId(),
      product.getSlug(),
      product.getName(),
      product.getDescription(),
      AdminCategoryResponse.from(product.getCategory()),
      product.getStatus(),
      product.getBasePrice(),
      product.getCompareAtPrice(),
      product.getBadge(),
      product.isFeatured(),
      product.getSortOrder(),
      product.getImages().stream().map(ProductImageResponse::from).toList(),
      product.getVariants().stream().map(ProductVariantResponse::from).toList()
    );
  }
}
