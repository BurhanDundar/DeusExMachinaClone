package com.northline.store.user.service;

import com.northline.store.auth.repository.RefreshTokenRepository;
import com.northline.store.common.exception.ApiException;
import com.northline.store.user.dto.ChangePasswordRequest;
import com.northline.store.user.dto.UpdateUserRequest;
import com.northline.store.user.dto.UserResponse;
import com.northline.store.user.repository.UserRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;

  public UserService(
    UserRepository users,
    RefreshTokenRepository refreshTokens,
    PasswordEncoder passwordEncoder
  ) {
    this.users = users;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
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

  @Transactional
  public void changePassword(UUID id, ChangePasswordRequest request) {
    var user = requireUser(id);
    if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new ApiException(
        "INVALID_CURRENT_PASSWORD",
        "Mevcut şifre hatalı.",
        HttpStatus.BAD_REQUEST
      );
    }
    user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    refreshTokens.findByUserIdAndRevokedAtIsNull(id).forEach(token -> token.revoke());
  }

  private com.northline.store.user.entity.User requireUser(UUID id) {
    return users
      .findById(id)
      .orElseThrow(() ->
        new ApiException("USER_NOT_FOUND", "Kullanıcı hesabı bulunamadı.", HttpStatus.NOT_FOUND)
      );
  }
}
