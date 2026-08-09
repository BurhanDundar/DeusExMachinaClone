package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.Category;
import java.util.UUID;

public record AdminCategoryResponse(
  UUID id,
  String name,
  String slug,
  String description,
  int sortOrder,
  boolean active
) {
  public static AdminCategoryResponse from(Category category) {
    return new AdminCategoryResponse(
      category.getId(),
      category.getName(),
      category.getSlug(),
      category.getDescription(),
      category.getSortOrder(),
      category.isActive()
    );
  }
}
