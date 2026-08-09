package com.northline.store.user.dto;

import com.northline.store.user.entity.User;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
  UUID id,
  String email,
  String firstName,
  String lastName,
  String phone,
  String role,
  Instant createdAt,
  Instant updatedAt
) {
  public static UserResponse from(User user) {
    return new UserResponse(
      user.getId(),
      user.getEmail(),
      user.getFirstName(),
      user.getLastName(),
      user.getPhone(),
      user.getRole().name(),
      user.getCreatedAt(),
      user.getUpdatedAt()
    );
  }
}
