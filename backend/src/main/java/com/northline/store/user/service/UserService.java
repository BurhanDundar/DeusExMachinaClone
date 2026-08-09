package com.northline.store.user.service;

import com.northline.store.common.exception.ApiException;
import com.northline.store.user.dto.UpdateUserRequest;
import com.northline.store.user.dto.UserResponse;
import com.northline.store.user.repository.UserRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserRepository users;

  public UserService(UserRepository users) {
    this.users = users;
  }

  @Transactional(readOnly = true)
  public UserResponse get(UUID id) {
    return UserResponse.from(requireUser(id));
  }

  @Transactional
  public UserResponse update(UUID id, UpdateUserRequest request) {
    var user = requireUser(id);
    user.setFirstName(request.firstName().trim());
    user.setLastName(request.lastName().trim());
    user.setPhone(
      request.phone() == null || request.phone().isBlank() ? null : request.phone().trim()
    );
    return UserResponse.from(user);
  }

  private com.northline.store.user.entity.User requireUser(UUID id) {
    return users
      .findById(id)
      .orElseThrow(() ->
        new ApiException("USER_NOT_FOUND", "User account was not found", HttpStatus.NOT_FOUND)
      );
  }
}
