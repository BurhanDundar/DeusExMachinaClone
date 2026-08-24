package com.northline.store.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northline.store.auth.repository.RefreshTokenRepository;
import com.northline.store.catalog.entity.*;
import com.northline.store.catalog.repository.*;
import com.northline.store.order.repository.OrderRepository;
import com.northline.store.order.service.OrderService;
import com.northline.store.user.repository.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Autowired
  ObjectMapper mapper;

  @Autowired
  CategoryRepository categories;

  @Autowired
  ProductRepository products;

  @Autowired
  ProductVariantRepository variants;

  @Autowired
  OrderRepository orders;

  @Autowired
  OrderService orderService;

  @Autowired
  RefreshTokenRepository refreshTokens;

  @Autowired
  UserRepository users;

  @AfterEach
  void cleanDatabase() {
    orders.deleteAll();
    refreshTokens.deleteAll();
    users.deleteAll();
    products.deleteAll();
    categories.deleteAll();
  }

  @Test
  void paidOrderDecrementsStockExactlyOnce() throws Exception {
    var variant = productWithStock(5);
    var token = register("buyer@example.com");
    var created = mvc
      .perform(
        post("/api/orders")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(orderBody(variant.getId().toString()))
      )
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.status").value("PAYMENT_PENDING"))
      .andExpect(jsonPath("$.shippingTotal").value(79.90))
      .andExpect(jsonPath("$.total").value(977.90))
      .andExpect(jsonPath("$.reservationExpiresAt").isNotEmpty())
      .andReturn()
      .getResponse()
      .getContentAsString();
    var orderId = mapper.readTree(created).get("id").asText();
    Assertions.assertEquals(
      2,
      variants.findById(variant.getId()).orElseThrow().getReservedQuantity()
    );
    Assertions.assertEquals(5, variants.findById(variant.getId()).orElseThrow().getStockQuantity());

    var paid = orderService.markPaid(java.util.UUID.fromString(orderId), "test-payment-1");
    Assertions.assertEquals("PAID", paid.paymentStatus());
    Assertions.assertEquals("CONFIRMED", paid.status());
    Assertions.assertEquals(3, variants.findById(variant.getId()).orElseThrow().getStockQuantity());
    Assertions.assertEquals(
      0,
      variants.findById(variant.getId()).orElseThrow().getReservedQuantity()
    );

    orderService.markPaid(java.util.UUID.fromString(orderId), "test-payment-1");
    Assertions.assertEquals(3, variants.findById(variant.getId()).orElseThrow().getStockQuantity());

    mvc
      .perform(get("/api/orders").header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].orderNumber").isNotEmpty())
      .andExpect(jsonPath("$[0].items[0].productName").value("Test Bandana"));

    mvc
      .perform(
        put("/api/admin/orders/{id}/fulfillment", orderId)
          .with(
            org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(
              "admin"
            ).roles("ADMIN")
          )
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"status\":\"PREPARING\"}")
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.status").value("PREPARING"));
    mvc
      .perform(
        put("/api/admin/orders/{id}/fulfillment", orderId)
          .with(
            org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(
              "admin"
            ).roles("ADMIN")
          )
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"status\":\"SHIPPED\"}")
      )
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.code").value("TRACKING_REQUIRED"));
    mvc
      .perform(
        put("/api/admin/orders/{id}/fulfillment", orderId)
          .with(
            org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(
              "admin"
            ).roles("ADMIN")
          )
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            "{\"status\":\"SHIPPED\",\"shippingCarrier\":\"Yurtiçi Kargo\",\"trackingNumber\":\"YK123\"}"
          )
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.trackingNumber").value("YK123"));
    mvc
      .perform(
        put("/api/admin/orders/{id}/fulfillment", orderId)
          .with(
            org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(
              "admin"
            ).roles("ADMIN")
          )
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"status\":\"DELIVERED\"}")
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.status").value("DELIVERED"));
  }

  @Test
  void checkoutConfigIsPublicAndUsesServerShippingRules() throws Exception {
    mvc
      .perform(get("/api/checkout/config"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.shippingFlatFee").value(79.90))
      .andExpect(jsonPath("$.freeShippingThreshold").value(1500.00))
      .andExpect(jsonPath("$.reservationMinutes").value(30));
  }

  @Test
  void orderRejectsQuantityAboveCurrentStock() throws Exception {
    var variant = productWithStock(1);
    var token = register("stock@example.com");
    mvc
      .perform(
        post("/api/orders")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(orderBody(variant.getId().toString()))
      )
      .andExpect(status().isConflict())
      .andExpect(jsonPath("$.code").value("INSUFFICIENT_STOCK"));
  }

  @Test
  void expiredOrderReleasesReservedStock() throws Exception {
    var variant = productWithStock(4);
    var token = register("expiry@example.com");
    var created = mvc
      .perform(
        post("/api/orders")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(orderBody(variant.getId().toString()))
      )
      .andExpect(status().isCreated())
      .andReturn()
      .getResponse()
      .getContentAsString();
    var orderId = java.util.UUID.fromString(mapper.readTree(created).get("id").asText());
    var order = orders.findById(orderId).orElseThrow();
    order.setReservationExpiresAt(java.time.Instant.now().minusSeconds(1));
    orders.saveAndFlush(order);

    Assertions.assertEquals(1, orderService.expirePendingReservations());
    var expired = orders.findById(orderId).orElseThrow();
    Assertions.assertEquals("CANCELLED", expired.getStatus().name());
    Assertions.assertEquals(
      0,
      variants.findById(variant.getId()).orElseThrow().getReservedQuantity()
    );
    Assertions.assertEquals(4, variants.findById(variant.getId()).orElseThrow().getStockQuantity());
  }

  @Test
  void userCannotReadAnotherUsersOrder() throws Exception {
    var variant = productWithStock(5);
    var ownerToken = register("owner@example.com");
    var strangerToken = register("stranger@example.com");
    var created = mvc
      .perform(
        post("/api/orders")
          .header("Authorization", "Bearer " + ownerToken)
          .contentType(MediaType.APPLICATION_JSON)
          .content(orderBody(variant.getId().toString()))
      )
      .andExpect(status().isCreated())
      .andReturn()
      .getResponse()
      .getContentAsString();
    var orderId = mapper.readTree(created).get("id").asText();

    mvc
      .perform(get("/api/orders/{id}", orderId).header("Authorization", "Bearer " + strangerToken))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
  }

  private ProductVariant productWithStock(int stock) {
    var category = new Category();
    category.setName("Aksesuar");
    category.setSlug("order-accessory");
    category.setSortOrder(1);
    categories.save(category);
    var product = new Product();
    product.setCategory(category);
    product.setName("Test Bandana");
    product.setSlug("order-test-bandana");
    product.setDescription("Sipariş testi");
    product.setStatus(ProductStatus.ACTIVE);
    product.setBasePrice(new BigDecimal("449.00"));
    product.setSortOrder(1);
    var variant = new ProductVariant();
    variant.setProduct(product);
    variant.setTitle("Standart");
    variant.setSku("ORDER-TEST-STD");
    variant.setStockQuantity(stock);
    variant.setSortOrder(1);
    product.getVariants().add(variant);
    products.saveAndFlush(product);
    return variant;
  }

  private String register(String email) throws Exception {
    var response = mvc
      .perform(
        post("/api/auth/register")
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            "{\"email\":\"%s\",\"password\":\"StrongPass1\",\"firstName\":\"Burhan\",\"lastName\":\"Dündar\"}".formatted(
              email
            )
          )
      )
      .andExpect(status().isOk())
      .andReturn()
      .getResponse()
      .getContentAsString();
    return mapper.readTree(response).get("accessToken").asText();
  }

  private String orderBody(String variantId) {
    return """
    {"clientReference":"checkout-test-1","items":[{"variantId":"%s","quantity":2}],
     "email":"buyer@example.com","firstName":"Burhan","lastName":"Dündar","phone":"+905551112233",
     "addressLine1":"Örnek Mahallesi 1","district":"Kadıköy","city":"İstanbul",
     "postalCode":"34000","country":"Türkiye"}
    """.formatted(variantId);
  }
}
