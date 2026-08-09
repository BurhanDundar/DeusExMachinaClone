package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.Category;
import java.util.UUID;

public record CategoryResponse(UUID id, String name, String slug, String description) {
  public static CategoryResponse from(Category category) {
    return new CategoryResponse(
      category.getId(),
      category.getName(),
      category.getSlug(),
      category.getDescription()
    );
  }
}
