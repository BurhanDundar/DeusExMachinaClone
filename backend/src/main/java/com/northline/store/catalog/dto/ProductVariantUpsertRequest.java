package com.northline.store.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductVariantUpsertRequest(
  UUID id,
  @NotBlank @Size(max = 160) String title,
  @NotBlank @Size(max = 100) String sku,
  @Size(max = 80) String color,
  @Size(max = 32) String size,
  @DecimalMin("0.00") BigDecimal price,
  @NotNull @Min(0) Integer stockQuantity,
  @NotNull Boolean active,
  @NotNull Integer sortOrder
) {}
