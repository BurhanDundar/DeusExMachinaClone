package com.northline.store.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northline.store.common.exception.ApiException;
import com.northline.store.user.entity.User;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class TransactionalEmailService {

  private final String apiKey;
  private final String from;
  private final String storefrontUrl;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient = HttpClient.newHttpClient();

  public TransactionalEmailService(
    @Value("${app.email.resend-api-key:}") String apiKey,
    @Value("${app.email.from:Northline Supply <onboarding@resend.dev>}") String from,
    @Value("${app.storefront-url:http://localhost:3000}") String storefrontUrl,
    ObjectMapper objectMapper
  ) {
    this.apiKey = apiKey;
    this.from = from;
    this.storefrontUrl = storefrontUrl.replaceAll("/$", "");
    this.objectMapper = objectMapper;
  }

  public boolean isConfigured() {
    return !apiKey.isBlank();
  }

  public void sendPasswordReset(User user, String rawToken) {
    var resetUrl = storefrontUrl + "/account/reset-password?token=" + rawToken;
    var name = escapeHtml(user.getFirstName());
    var html =
      "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:auto\">" +
      "<h1>Şifrenizi sıfırlayın</h1><p>Merhaba " +
      name +
      ",</p>" +
      "<p>Northline Supply hesabınız için şifre sıfırlama talebi aldık.</p>" +
      "<p><a href=\"" +
      resetUrl +
      "\" style=\"background:#111;color:#fff;padding:12px 18px;text-decoration:none\">Yeni şifre oluştur</a></p>" +
      "<p>Bu bağlantı 30 dakika geçerlidir. Talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.</p></div>";
    try {
      var body = objectMapper.writeValueAsString(
        Map.of(
          "from",
          from,
          "to",
          user.getEmail(),
          "subject",
          "Northline Supply şifre sıfırlama",
          "html",
          html
        )
      );
      var request = HttpRequest.newBuilder(URI.create("https://api.resend.com/emails"))
        .header("Authorization", "Bearer " + apiKey)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build();
      var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException("Resend returned HTTP " + response.statusCode());
      }
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new ApiException(
        "EMAIL_DELIVERY_FAILED",
        "Şifre sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    } catch (Exception exception) {
      throw new ApiException(
        "EMAIL_DELIVERY_FAILED",
        "Şifre sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  private String escapeHtml(String value) {
    return value
      .replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace("\"", "&quot;")
      .replace("'", "&#39;");
  }
}
