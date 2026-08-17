package com.northline.store.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
  @NotBlank @Size(max = 80) String label,
  @NotBlank @Size(max = 100) String firstName,
  @NotBlank @Size(max = 100) String lastName,
  @NotBlank
  @Size(max = 32)
  @Pattern(regexp = "^[+0-9() .-]{7,32}$", message = "geçerli bir telefon numarası olmalıdır")
  String phone,
  @NotBlank @Size(max = 300) String addressLine1,
  @Size(max = 300) String addressLine2,
  @NotBlank @Size(max = 120) String district,
  @NotBlank @Size(max = 120) String city,
  @Size(max = 20) String postalCode,
  @NotBlank @Size(max = 80) String country,
  boolean defaultAddress
) {}
