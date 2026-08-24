package com.northline.store.auth.controller;

import com.northline.store.auth.dto.AuthResponse;
import com.northline.store.auth.dto.ForgotPasswordRequest;
import com.northline.store.auth.dto.LoginRequest;
import com.northline.store.auth.dto.RegisterRequest;
import com.northline.store.auth.dto.ResetPasswordRequest;
import com.northline.store.auth.service.AuthService;
import com.northline.store.auth.service.LoginAttemptLimiter;
import com.northline.store.auth.service.PasswordResetService;
import com.northline.store.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  public static final String REFRESH_COOKIE = "northline_refresh";
  private final AuthService authService;
  private final PasswordResetService passwordResetService;
  private final LoginAttemptLimiter loginAttempts;
  private final boolean secureCookie;
  private final String sameSite;

  public AuthController(
    AuthService authService,
    PasswordResetService passwordResetService,
    LoginAttemptLimiter loginAttempts,
    @Value("${app.cookie.secure}") boolean secureCookie,
    @Value("${app.cookie.same-site}") String sameSite
  ) {
    this.authService = authService;
    this.passwordResetService = passwordResetService;
    this.loginAttempts = loginAttempts;
    this.secureCookie = secureCookie;
    this.sameSite = sameSite;
  }

  @PostMapping("/register")
  ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return sessionResponse(authService.register(request));
  }

  @PostMapping("/login")
  ResponseEntity<AuthResponse> login(
    @Valid @RequestBody LoginRequest request,
    HttpServletRequest httpRequest
  ) {
    var key = httpRequest.getRemoteAddr() + ":" + User.normalizeEmail(request.email());
    loginAttempts.check(key);
    try {
      var result = authService.login(request);
      loginAttempts.succeeded(key);
      return sessionResponse(result);
    } catch (AuthenticationException exception) {
      loginAttempts.failed(key);
      throw exception;
    }
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

  @PostMapping("/password/forgot")
  ResponseEntity<Void> forgotPassword(
    @Valid @RequestBody ForgotPasswordRequest request,
    HttpServletRequest httpRequest
  ) {
    var key =
      "password-reset:" + httpRequest.getRemoteAddr() + ":" + User.normalizeEmail(request.email());
    loginAttempts.check(
      key,
      "PASSWORD_RESET_RATE_LIMITED",
      "Çok sayıda şifre sıfırlama isteği gönderildi. Lütfen daha sonra tekrar deneyin."
    );
    loginAttempts.failed(key);
    passwordResetService.request(request);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/password/reset")
  ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    passwordResetService.reset(request);
    return ResponseEntity.noContent().build();
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
