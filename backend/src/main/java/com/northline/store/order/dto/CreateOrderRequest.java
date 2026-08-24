package com.northline.store.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
  @NotBlank @Size(max = 80) String clientReference,
  @NotEmpty @Size(max = 50) List<@Valid Line> items,
  @Email @NotBlank @Size(max = 320) String email,
  @NotBlank @Size(max = 100) String firstName,
  @NotBlank @Size(max = 100) String lastName,
  @NotBlank @Size(max = 32) String phone,
  @NotBlank @Size(max = 240) String addressLine1,
  @Size(max = 240) String addressLine2,
  @NotBlank @Size(max = 120) String district,
  @NotBlank @Size(max = 120) String city,
  @Size(max = 20) String postalCode,
  @NotBlank @Size(max = 80) String country
) {
  public record Line(@NotNull UUID variantId, @Min(1) @Max(20) int quantity) {}
}
