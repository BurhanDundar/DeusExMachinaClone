package com.northline.store.user.controller;

import com.northline.store.common.security.UserPrincipal;
import com.northline.store.user.dto.AddressRequest;
import com.northline.store.user.dto.AddressResponse;
import com.northline.store.user.dto.ChangePasswordRequest;
import com.northline.store.user.dto.UpdateUserRequest;
import com.northline.store.user.dto.UserResponse;
import com.northline.store.user.service.UserAddressService;
import com.northline.store.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;
  private final UserAddressService addressService;

  public UserController(UserService userService, UserAddressService addressService) {
    this.userService = userService;
    this.addressService = addressService;
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

  @GetMapping("/me/addresses")
  java.util.List<AddressResponse> addresses(@AuthenticationPrincipal UserPrincipal principal) {
    return addressService.list(principal.id());
  }

  @PostMapping("/me/addresses")
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  AddressResponse createAddress(
    @AuthenticationPrincipal UserPrincipal principal,
    @Valid @RequestBody AddressRequest request
  ) {
    return addressService.create(principal.id(), request);
  }

  @PutMapping("/me/addresses/{id}")
  AddressResponse updateAddress(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable java.util.UUID id,
    @Valid @RequestBody AddressRequest request
  ) {
    return addressService.update(principal.id(), id, request);
  }

  @DeleteMapping("/me/addresses/{id}")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  void deleteAddress(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable java.util.UUID id
  ) {
    addressService.delete(principal.id(), id);
  }
}
