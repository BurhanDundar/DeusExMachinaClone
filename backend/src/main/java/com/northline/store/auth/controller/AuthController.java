package com.northline.store.auth.controller;

import com.northline.store.auth.dto.AuthResponse;
import com.northline.store.auth.dto.LoginRequest;
import com.northline.store.auth.dto.RegisterRequest;
import com.northline.store.auth.service.AuthService;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  public static final String REFRESH_COOKIE = "northline_refresh";
  private final AuthService authService;
  private final boolean secureCookie;
  private final String sameSite;

  public AuthController(
    AuthService authService,
    @Value("${app.cookie.secure}") boolean secureCookie,
    @Value("${app.cookie.same-site}") String sameSite
  ) {
    this.authService = authService;
    this.secureCookie = secureCookie;
    this.sameSite = sameSite;
  }

  @PostMapping("/register")
  ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return sessionResponse(authService.register(request));
  }

  @PostMapping("/login")
  ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return sessionResponse(authService.login(request));
  }

  @PostMapping("/refresh")
  ResponseEntity<AuthResponse> refresh(
    @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken
  ) {
    return sessionResponse(authService.refresh(refreshToken));
  }

  @PostMapping("/logout")
  ResponseEntity<Void> logout(
    @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken
  ) {
    authService.logout(refreshToken);
    return ResponseEntity.noContent()
      .header(HttpHeaders.SET_COOKIE, clearCookie().toString())
      .build();
  }

  private ResponseEntity<AuthResponse> sessionResponse(AuthService.SessionResult result) {
    var cookie = ResponseCookie.from(REFRESH_COOKIE, result.refreshToken())
      .httpOnly(true)
      .secure(secureCookie)
      .sameSite(sameSite)
      .path("/api/auth")
      .maxAge(Duration.ofSeconds(result.refreshMaxAgeSeconds()))
      .build();
    return ResponseEntity.ok()
      .header(HttpHeaders.SET_COOKIE, cookie.toString())
      .body(result.response());
  }

  private ResponseCookie clearCookie() {
    return ResponseCookie.from(REFRESH_COOKIE, "")
      .httpOnly(true)
      .secure(secureCookie)
      .sameSite(sameSite)
      .path("/api/auth")
      .maxAge(Duration.ZERO)
      .build();
  }
}
