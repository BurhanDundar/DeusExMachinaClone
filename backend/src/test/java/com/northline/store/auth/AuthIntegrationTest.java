package com.northline.store.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.northline.store.auth.controller.AuthController;
import com.northline.store.auth.repository.RefreshTokenRepository;
import com.northline.store.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Autowired
  ObjectMapper objectMapper;

  @Autowired
  UserRepository users;

  @Autowired
  RefreshTokenRepository refreshTokens;

  @AfterEach
  void cleanDatabase() {
    refreshTokens.deleteAll();
    users.deleteAll();
  }

  @Test
  void registrationCreatesAccountAndSession() throws Exception {
    var result = register("rider@example.com")
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.accessToken").isNotEmpty())
      .andExpect(jsonPath("$.user.email").value("rider@example.com"))
      .andReturn();
    assertThat(result.getResponse().getCookie(AuthController.REFRESH_COOKIE)).isNotNull();
    assertThat(result.getResponse().getCookie(AuthController.REFRESH_COOKIE).isHttpOnly()).isTrue();
    assertThat(users.count()).isEqualTo(1);
  }

  @Test
  void duplicateRegistrationReturnsStableConflict() throws Exception {
    register("duplicate@example.com").andExpect(status().isOk());
    register("DUPLICATE@example.com")
      .andExpect(status().isConflict())
      .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
  }

  @Test
  void loginRejectsBadPasswordAndAcceptsCorrectPassword() throws Exception {
    register("login@example.com").andExpect(status().isOk());
    mvc
      .perform(
        post("/api/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content(loginBody("login@example.com", "WrongPass1"))
      )
      .andExpect(status().isUnauthorized())
      .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    mvc
      .perform(
        post("/api/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content(loginBody("login@example.com", "StrongPass1"))
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.accessToken").isNotEmpty());
  }

  @Test
  void currentUserRequiresBearerToken() throws Exception {
    mvc
      .perform(get("/api/users/me"))
      .andExpect(status().isUnauthorized())
      .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));

    var registration = register("me@example.com").andReturn();
    JsonNode json = objectMapper.readTree(registration.getResponse().getContentAsString());
    mvc
      .perform(
        get("/api/users/me").header("Authorization", "Bearer " + json.get("accessToken").asText())
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.email").value("me@example.com"));
  }

  @Test
  void tokenForDeletedAccountIsRejectedAsUnauthorized() throws Exception {
    var registration = register("deleted@example.com").andReturn();
    var accessToken = objectMapper
      .readTree(registration.getResponse().getContentAsString())
      .get("accessToken")
      .asText();
    refreshTokens.deleteAll();
    users.deleteAll();

    mvc
      .perform(get("/api/users/me").header("Authorization", "Bearer " + accessToken))
      .andExpect(status().isUnauthorized())
      .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
  }

  @Test
  void refreshRotatesCookieAndRestoresSessionAfterPageReload() throws Exception {
    var registration = register("refresh@example.com").andReturn();
    Cookie first = registration.getResponse().getCookie(AuthController.REFRESH_COOKIE);
    var refreshed = mvc
      .perform(post("/api/auth/refresh").cookie(first))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.accessToken").isNotEmpty())
      .andReturn();
    Cookie rotated = refreshed.getResponse().getCookie(AuthController.REFRESH_COOKIE);
    assertThat(rotated).isNotNull();
    assertThat(rotated.getValue()).isNotEqualTo(first.getValue());
    mvc.perform(post("/api/auth/refresh").cookie(first)).andExpect(status().isUnauthorized());
  }

  @Test
  void logoutRevokesRefreshTokenAndExpiresCookie() throws Exception {
    Cookie cookie = register("logout@example.com")
      .andReturn()
      .getResponse()
      .getCookie(AuthController.REFRESH_COOKIE);
    mvc
      .perform(post("/api/auth/logout").cookie(cookie))
      .andExpect(status().isNoContent())
      .andExpect(cookie().maxAge(AuthController.REFRESH_COOKIE, 0));
    mvc.perform(post("/api/auth/refresh").cookie(cookie)).andExpect(status().isUnauthorized());
  }

  private org.springframework.test.web.servlet.ResultActions register(String email)
    throws Exception {
    return mvc.perform(
      post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(
          """
          {"email":"%s","password":"StrongPass1","firstName":"Alex","lastName":"Rider"}
          """.formatted(email)
        )
    );
  }

  private String loginBody(String email, String password) {
    return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
  }
}
