package com.northline.store.auth.service;

import com.northline.store.auth.dto.AuthResponse;
import com.northline.store.auth.dto.LoginRequest;
import com.northline.store.auth.dto.RegisterRequest;
import com.northline.store.auth.entity.RefreshToken;
import com.northline.store.auth.repository.RefreshTokenRepository;
import com.northline.store.common.exception.ApiException;
import com.northline.store.common.security.JwtService;
import com.northline.store.common.security.UserPrincipal;
import com.northline.store.user.dto.UserResponse;
import com.northline.store.user.entity.User;
import com.northline.store.user.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final long refreshTokenDays;
  private final SecureRandom secureRandom = new SecureRandom();

  public AuthService(
    UserRepository users,
    RefreshTokenRepository refreshTokens,
    PasswordEncoder passwordEncoder,
    AuthenticationManager authenticationManager,
    JwtService jwtService,
    @Value("${app.jwt.refresh-token-days}") long refreshTokenDays
  ) {
    this.users = users;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.refreshTokenDays = refreshTokenDays;
  }

  @Transactional
  public SessionResult register(RegisterRequest request) {
    var email = User.normalizeEmail(request.email());
    if (users.existsByEmailIgnoreCase(email)) {
      throw new ApiException(
        "EMAIL_ALREADY_REGISTERED",
        "Bu e-posta adresiyle kayıtlı bir hesap zaten var.",
        HttpStatus.CONFLICT
      );
    }
    var user = new User();
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setFirstName(request.firstName().trim());
    user.setLastName(request.lastName().trim());
    try {
      users.saveAndFlush(user);
    } catch (DataIntegrityViolationException exception) {
      throw new ApiException(
        "EMAIL_ALREADY_REGISTERED",
        "Bu e-posta adresiyle kayıtlı bir hesap zaten var.",
        HttpStatus.CONFLICT
      );
    }
    return issueSession(user);
  }

  @Transactional
  public SessionResult login(LoginRequest request) {
    var email = User.normalizeEmail(request.email());
    authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(email, request.password())
    );
    var user = users
      .findByEmailIgnoreCase(email)
      .orElseThrow(() ->
        new ApiException(
          "INVALID_CREDENTIALS",
          "E-posta veya şifre hatalı.",
          HttpStatus.UNAUTHORIZED
        )
      );
    return issueSession(user);
  }

  @Transactional
  public SessionResult refresh(String rawToken) {
    if (rawToken == null || rawToken.isBlank()) {
      throw new ApiException(
        "INVALID_REFRESH_TOKEN",
        "Oturum yenilenemedi.",
        HttpStatus.UNAUTHORIZED
      );
    }
    var stored = refreshTokens
      .findByTokenHash(hash(rawToken))
      .orElseThrow(() ->
        new ApiException("INVALID_REFRESH_TOKEN", "Oturum yenilenemedi.", HttpStatus.UNAUTHORIZED)
      );
    if (!stored.isUsable(Instant.now()) || !stored.getUser().isEnabled()) {
      throw new ApiException(
        "INVALID_REFRESH_TOKEN",
        "Oturum yenilenemedi.",
        HttpStatus.UNAUTHORIZED
      );
    }
    stored.revoke();
    return issueSession(stored.getUser());
  }

  @Transactional
  public void logout(String rawToken) {
    if (rawToken == null || rawToken.isBlank()) return;
    refreshTokens.findByTokenHash(hash(rawToken)).ifPresent(RefreshToken::revoke);
  }

  private SessionResult issueSession(User user) {
    var principal = UserPrincipal.from(user);
    var accessToken = jwtService.createAccessToken(principal);
    var rawRefresh = randomRefreshToken();
    var refresh = new RefreshToken();
    refresh.setUser(user);
    refresh.setTokenHash(hash(rawRefresh));
    refresh.setExpiresAt(Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS));
    refreshTokens.save(refresh);
    var response = new AuthResponse(
      accessToken,
      "Bearer",
      jwtService.expiresInSeconds(),
      UserResponse.from(user)
    );
    return new SessionResult(response, rawRefresh, refreshTokenDays * 24 * 60 * 60);
  }

  private String randomRefreshToken() {
    var bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String hash(String value) {
    try {
      var digest = MessageDigest.getInstance("SHA-256").digest(
        value.getBytes(StandardCharsets.UTF_8)
      );
      return java.util.HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is unavailable", exception);
    }
  }

  public record SessionResult(
    AuthResponse response,
    String refreshToken,
    long refreshMaxAgeSeconds
  ) {}
}
