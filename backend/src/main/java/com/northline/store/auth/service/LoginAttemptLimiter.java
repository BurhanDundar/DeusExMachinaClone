package com.northline.store.auth.service;

import com.northline.store.common.exception.ApiException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptLimiter {

  private final ConcurrentHashMap<String, Attempts> attempts = new ConcurrentHashMap<>();
  private final int maximumAttempts;
  private final Duration window;

  public LoginAttemptLimiter(
    @Value("${app.auth.max-login-attempts:5}") int maximumAttempts,
    @Value("${app.auth.login-attempt-window-minutes:15}") long windowMinutes
  ) {
    this.maximumAttempts = maximumAttempts;
    this.window = Duration.ofMinutes(windowMinutes);
  }

  public void check(String key) {
    check(
      key,
      "LOGIN_RATE_LIMITED",
      "Çok sayıda hatalı giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin."
    );
  }

  public void check(String key, String code, String message) {
    var current = attempts.get(key);
    if (current == null) return;
    if (current.startedAt().plus(window).isBefore(Instant.now())) {
      attempts.remove(key, current);
      return;
    }
    if (current.count() >= maximumAttempts) {
      throw new ApiException(code, message, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  public void failed(String key) {
    var now = Instant.now();
    attempts.compute(key, (ignored, current) -> {
      if (current == null || current.startedAt().plus(window).isBefore(now)) {
        return new Attempts(1, now);
      }
      return new Attempts(current.count() + 1, current.startedAt());
    });
  }

  public void succeeded(String key) {
    attempts.remove(key);
  }

  @Scheduled(fixedDelayString = "${app.auth.rate-limit-cleanup-ms:900000}")
  void removeExpiredEntries() {
    var now = Instant.now();
    attempts.entrySet().removeIf(entry -> entry.getValue().startedAt().plus(window).isBefore(now));
  }

  private record Attempts(int count, Instant startedAt) {}
}
