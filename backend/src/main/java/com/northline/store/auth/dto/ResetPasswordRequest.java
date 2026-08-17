package com.northline.store.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
  @NotBlank @Size(max = 200) String token,
  @NotBlank
  @Size(min = 8, max = 72)
  @Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    message = "büyük harf, küçük harf ve rakam içermelidir"
  )
  String newPassword
) {}
