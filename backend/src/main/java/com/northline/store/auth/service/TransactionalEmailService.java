package com.northline.store.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northline.store.common.exception.ApiException;
import com.northline.store.order.dto.OrderResponse;
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
    @Value("${app.email.from:Binks Machina <onboarding@resend.dev>}") String from,
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
      "<p>Binks Machina hesabınız için şifre sıfırlama talebi aldık.</p>" +
      "<p><a href=\"" +
      resetUrl +
      "\" style=\"background:#111;color:#fff;padding:12px 18px;text-decoration:none\">Yeni şifre oluştur</a></p>" +
      "<p>Bu bağlantı 30 dakika geçerlidir. Talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.</p></div>";
    try {
      send(user.getEmail(), "Binks Machina şifre sıfırlama", html, "password-reset-" + rawToken);
    } catch (ApiException exception) {
      throw new ApiException(
        "EMAIL_DELIVERY_FAILED",
        "Şifre sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  public void sendOrderConfirmed(OrderResponse order) {
    var html = orderTemplate(
      order,
      "Siparişiniz onaylandı",
      "Ödemeniz doğrulandı. Siparişinizi hazırlamaya başlıyoruz."
    );
    send(
      order.customerEmail(),
      order.orderNumber() + " numaralı siparişiniz onaylandı",
      html,
      "order-confirmed-" + order.id()
    );
  }

  public void sendOrderShipped(OrderResponse order) {
    var tracking = escapeHtml(order.trackingNumber() == null ? "" : order.trackingNumber());
    var carrier = escapeHtml(order.shippingCarrier() == null ? "" : order.shippingCarrier());
    var html = orderTemplate(
      order,
      "Siparişiniz kargoya verildi",
      "Kargo firması: " + carrier + "<br>Takip numarası: " + tracking
    );
    send(
      order.customerEmail(),
      order.orderNumber() + " numaralı siparişiniz kargoda",
      html,
      "order-shipped-" + order.id()
    );
  }

  public void sendOrderCancelled(OrderResponse order) {
    var html = orderTemplate(
      order,
      "Siparişiniz iptal edildi",
      "Siparişiniz iptal edildi ve ayrılan stok serbest bırakıldı."
    );
    send(
      order.customerEmail(),
      order.orderNumber() + " numaralı siparişiniz iptal edildi",
      html,
      "order-cancelled-" + order.id()
    );
  }

  private String orderTemplate(OrderResponse order, String heading, String message) {
    var detailUrl = storefrontUrl + "/account/orders/" + order.id();
    return (
      "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:auto\">" +
      "<h1>" +
      escapeHtml(heading) +
      "</h1>" +
      "<p>Merhaba " +
      escapeHtml(order.firstName()) +
      ",</p><p>" +
      message +
      "</p>" +
      "<p><strong>Sipariş:</strong> " +
      escapeHtml(order.orderNumber()) +
      "</p>" +
      "<p><a href=\"" +
      detailUrl +
      "\" style=\"background:#111;color:#fff;padding:12px 18px;text-decoration:none\">Siparişi görüntüle</a></p></div>"
    );
  }

  private void send(String to, String subject, String html, String idempotencyKey) {
    try {
      var body = objectMapper.writeValueAsString(
        Map.of("from", from, "to", to, "subject", subject, "html", html)
      );
      var request = HttpRequest.newBuilder(URI.create("https://api.resend.com/emails"))
        .header("Authorization", "Bearer " + apiKey)
        .header("Content-Type", "application/json")
        .header("Idempotency-Key", idempotencyKey)
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build();
      var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException("Resend returned HTTP " + response.statusCode());
      }
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw emailFailure();
    } catch (Exception exception) {
      throw emailFailure();
    }
  }

  private ApiException emailFailure() {
    return new ApiException(
      "EMAIL_DELIVERY_FAILED",
      "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.",
      HttpStatus.SERVICE_UNAVAILABLE
    );
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
