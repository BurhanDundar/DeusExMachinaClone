package com.northline.store.user.controller;

import com.northline.store.common.security.UserPrincipal;
import com.northline.store.user.dto.ChangePasswordRequest;
import com.northline.store.user.dto.UpdateUserRequest;
import com.northline.store.user.dto.UserResponse;
import com.northline.store.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
    return userService.get(principal.id());
  }

  @PutMapping("/me")
  UserResponse update(
    @AuthenticationPrincipal UserPrincipal principal,
    @Valid @RequestBody UpdateUserRequest request
  ) {
    return userService.update(principal.id(), request);
  }

  @PutMapping("/me/password")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  void changePassword(
    @AuthenticationPrincipal UserPrincipal principal,
    @Valid @RequestBody ChangePasswordRequest request
  ) {
    userService.changePassword(principal.id(), request);
  }
}
