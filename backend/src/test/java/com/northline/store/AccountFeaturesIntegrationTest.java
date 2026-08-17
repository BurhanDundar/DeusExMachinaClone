package com.northline.store;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northline.store.auth.repository.PasswordResetTokenRepository;
import com.northline.store.auth.repository.RefreshTokenRepository;
import com.northline.store.auth.service.TransactionalEmailService;
import com.northline.store.newsletter.repository.NewsletterSubscriberRepository;
import com.northline.store.user.entity.User;
import com.northline.store.user.repository.UserAddressRepository;
import com.northline.store.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AccountFeaturesIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Autowired
  ObjectMapper objectMapper;

  @Autowired
  UserAddressRepository addresses;

  @Autowired
  PasswordResetTokenRepository resetTokens;

  @Autowired
  RefreshTokenRepository refreshTokens;

  @Autowired
  NewsletterSubscriberRepository subscribers;

  @Autowired
  UserRepository users;

  @MockitoBean
  TransactionalEmailService emailService;

  @AfterEach
  void cleanDatabase() {
    resetTokens.deleteAll();
    refreshTokens.deleteAll();
    addresses.deleteAll();
    subscribers.deleteAll();
    users.deleteAll();
  }

  @Test
  void userCanCreateUpdateAndDeleteAnAddress() throws Exception {
    var token = registerAndGetAccessToken("address@example.com");
    var created = mvc
      .perform(
        post("/api/users/me/addresses")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(addressBody("Ev", "Kadıköy", true))
      )
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.defaultAddress").value(true))
      .andReturn()
      .getResponse()
      .getContentAsString();
    var id = objectMapper.readTree(created).get("id").asText();

    mvc
      .perform(
        put("/api/users/me/addresses/{id}", id)
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(addressBody("Atölye", "Beşiktaş", true))
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.label").value("Atölye"));

    mvc
      .perform(
        delete("/api/users/me/addresses/{id}", id).header("Authorization", "Bearer " + token)
      )
      .andExpect(status().isNoContent());
    mvc
      .perform(get("/api/users/me/addresses").header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$").isEmpty());
  }

  @Test
  void passwordResetUsesSingleUseTokenAndInvalidatesOldPassword() throws Exception {
    registerAndGetAccessToken("reset@example.com");
    when(emailService.isConfigured()).thenReturn(true);

    mvc
      .perform(
        post("/api/auth/password/forgot")
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"email\":\"reset@example.com\"}")
      )
      .andExpect(status().isNoContent());

    var token = ArgumentCaptor.forClass(String.class);
    verify(emailService).sendPasswordReset(any(User.class), token.capture());
    mvc
      .perform(
        post("/api/auth/password/reset")
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            "{\"token\":\"%s\",\"newPassword\":\"ChangedPass2\"}".formatted(token.getValue())
          )
      )
      .andExpect(status().isNoContent());
    mvc
      .perform(
        post("/api/auth/password/reset")
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            "{\"token\":\"%s\",\"newPassword\":\"AnotherPass3\"}".formatted(token.getValue())
          )
      )
      .andExpect(status().isBadRequest());
    mvc
      .perform(
        post("/api/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content(loginBody("reset@example.com", "StrongPass1"))
      )
      .andExpect(status().isUnauthorized());
    mvc
      .perform(
        post("/api/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content(loginBody("reset@example.com", "ChangedPass2"))
      )
      .andExpect(status().isOk());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void newsletterSubscriptionIsStoredAndVisibleToAdministrator() throws Exception {
    mvc
      .perform(
        post("/api/newsletter/subscriptions")
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"email\":\"news@example.com\",\"consent\":true}")
      )
      .andExpect(status().isNoContent());
    mvc
      .perform(get("/api/admin/newsletter/subscribers"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].email").value("news@example.com"));
  }

  private String registerAndGetAccessToken(String email) throws Exception {
    var response = mvc
      .perform(
        post("/api/auth/register")
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            "{\"email\":\"%s\",\"password\":\"StrongPass1\",\"firstName\":\"Alex\",\"lastName\":\"Rider\"}".formatted(
              email
            )
          )
      )
      .andExpect(status().isOk())
      .andReturn()
      .getResponse()
      .getContentAsString();
    return objectMapper.readTree(response).get("accessToken").asText();
  }

  private String addressBody(String label, String district, boolean defaultAddress) {
    return """
    {"label":"%s","firstName":"Alex","lastName":"Rider","phone":"+90 555 111 22 33",
    "addressLine1":"Örnek Mahallesi 1","addressLine2":"Daire 2","district":"%s",
    "city":"İstanbul","postalCode":"34000","country":"Türkiye","defaultAddress":%s}
    """.formatted(label, district, defaultAddress);
  }

  private String loginBody(String email, String password) {
    return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
  }
}
