package com.northline.store.auth.service;

import com.northline.store.auth.dto.ForgotPasswordRequest;
import com.northline.store.auth.dto.ResetPasswordRequest;
import com.northline.store.auth.entity.PasswordResetToken;
import com.northline.store.auth.repository.PasswordResetTokenRepository;
import com.northline.store.auth.repository.RefreshTokenRepository;
import com.northline.store.common.exception.ApiException;
import com.northline.store.user.entity.User;
import com.northline.store.user.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

  private final UserRepository users;
  private final PasswordResetTokenRepository tokens;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;
  private final TransactionalEmailService emailService;
  private final SecureRandom secureRandom = new SecureRandom();

  public PasswordResetService(
    UserRepository users,
    PasswordResetTokenRepository tokens,
    RefreshTokenRepository refreshTokens,
    PasswordEncoder passwordEncoder,
    TransactionalEmailService emailService
  ) {
    this.users = users;
    this.tokens = tokens;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
    this.emailService = emailService;
  }

  @Transactional
  public void request(ForgotPasswordRequest request) {
    if (!emailService.isConfigured()) {
      throw new ApiException(
        "EMAIL_NOT_CONFIGURED",
        "E-posta servisi henüz yapılandırılmadı.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
    users.findByEmailIgnoreCase(User.normalizeEmail(request.email())).ifPresent(user -> {
      var latest = tokens.findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId());
      if (
        latest.isPresent() &&
        latest.get().getCreatedAt().isAfter(Instant.now().minus(1, ChronoUnit.MINUTES))
      ) {
        return;
      }
      tokens.findByUserIdAndUsedAtIsNull(user.getId()).forEach(PasswordResetToken::markUsed);
      var rawToken = randomToken();
      var token = new PasswordResetToken();
      token.setUser(user);
      token.setTokenHash(hash(rawToken));
      token.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
      tokens.save(token);
      emailService.sendPasswordReset(user, rawToken);
    });
  }

  @Transactional
  public void reset(ResetPasswordRequest request) {
    var token = tokens.findByTokenHash(hash(request.token())).orElseThrow(this::invalidToken);
    if (!token.isUsable(Instant.now())) throw invalidToken();
    token.markUsed();
    token.getUser().setPasswordHash(passwordEncoder.encode(request.newPassword()));
    refreshTokens
      .findByUserIdAndRevokedAtIsNull(token.getUser().getId())
      .forEach(tokenToRevoke -> tokenToRevoke.revoke());
  }

  private ApiException invalidToken() {
    return new ApiException(
      "INVALID_PASSWORD_RESET_TOKEN",
      "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
      HttpStatus.BAD_REQUEST
    );
  }

  private String randomToken() {
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
}
