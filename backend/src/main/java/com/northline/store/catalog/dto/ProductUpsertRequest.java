package com.northline.store.catalog.dto;

import com.northline.store.catalog.entity.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductUpsertRequest(
  @NotNull UUID categoryId,
  @NotBlank @Size(max = 200) String name,
  @NotBlank @Size(max = 220) String slug,
  @NotBlank @Size(max = 10000) String description,
  @NotNull ProductStatus status,
  @NotNull @DecimalMin("0.00") BigDecimal price,
  @DecimalMin("0.00") BigDecimal compareAtPrice,
  @Size(max = 80) String badge,
  @NotNull Boolean featured,
  @NotNull Integer sortOrder,
  @Valid @NotEmpty List<ProductImageUpsertRequest> images,
  @Valid @NotEmpty List<ProductVariantUpsertRequest> variants
) {}
