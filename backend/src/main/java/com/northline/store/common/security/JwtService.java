package com.northline.store.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey key;
  private final long accessTokenMinutes;

  public JwtService(
    @Value("${app.jwt.secret}") String secret,
    @Value("${app.jwt.access-token-minutes}") long accessTokenMinutes
  ) {
    if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
      throw new IllegalStateException("JWT secret must contain at least 32 bytes");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessTokenMinutes = accessTokenMinutes;
  }

  public String createAccessToken(UserPrincipal principal) {
    var now = Instant.now();
    return Jwts.builder()
      .subject(principal.id().toString())
      .claim("email", principal.email())
      .claim("role", principal.authorities().iterator().next().getAuthority())
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plus(accessTokenMinutes, ChronoUnit.MINUTES)))
      .signWith(key)
      .compact();
  }

  public UUID subject(String token) {
    Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    return UUID.fromString(claims.getSubject());
  }

  public long expiresInSeconds() {
    return accessTokenMinutes * 60;
  }
}
