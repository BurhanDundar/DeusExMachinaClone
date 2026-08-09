package com.northline.store.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryUpsertRequest(
  @NotBlank @Size(max = 120) String name,
  @NotBlank @Size(max = 140) String slug,
  @Size(max = 10000) String description,
  @NotNull Integer sortOrder,
  @NotNull Boolean active
) {}
