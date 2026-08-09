package com.northline.store.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductImageUpsertRequest(
  @NotBlank @Size(max = 2048) String url,
  @Size(max = 300) String altText,
  @NotNull Integer sortOrder
) {}
