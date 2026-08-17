package com.northline.store.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
  @NotBlank @Size(max = 100) String firstName,
  @NotBlank @Size(max = 100) String lastName,
  @Pattern(regexp = "^$|^[+0-9() .-]{7,32}$", message = "geçerli bir telefon numarası olmalıdır")
  String phone
) {}
