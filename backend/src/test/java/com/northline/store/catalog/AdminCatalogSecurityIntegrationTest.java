package com.northline.store.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCatalogSecurityIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Test
  void catalogManagementRequiresAnAdministrator() throws Exception {
    mvc.perform(get("/api/admin/catalog/products")).andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "USER")
  void regularUsersCannotAccessCatalogManagement() throws Exception {
    mvc.perform(get("/api/admin/catalog/products")).andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void administratorsCanAccessCatalogManagement() throws Exception {
    mvc.perform(get("/api/admin/catalog/products")).andExpect(status().isOk());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void administratorsCanUpdateAProductWithoutLosingItsImagesOrVariants() throws Exception {
    var category = mvc
      .perform(
        post("/api/admin/catalog/categories")
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"name\":\"Test\",\"slug\":\"test\",\"sortOrder\":0,\"active\":true}")
      )
      .andExpect(status().isCreated())
      .andReturn()
      .getResponse()
      .getContentAsString();
    var categoryId = new com.fasterxml.jackson.databind.ObjectMapper()
      .readTree(category)
      .get("id")
      .asText();

    var objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
    var product = mvc
      .perform(
        post("/api/admin/catalog/products")
          .contentType(MediaType.APPLICATION_JSON)
          .content(productBody(categoryId, "Atölye Bandanası", "atolye-bandanasi", "ATOLYE-001"))
      )
      .andExpect(status().isCreated())
      .andReturn()
      .getResponse()
      .getContentAsString();
    var productJson = objectMapper.readTree(product);
    var productId = productJson.get("id").asText();
    var imageId = productJson.get("images").get(0).get("id").asText();
    var variantId = productJson.get("variants").get(0).get("id").asText();

    mvc
      .perform(
        put("/api/admin/catalog/products/{id}", productId)
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            productBody(
              categoryId,
              "Güncellenmiş Bandana",
              "atolye-bandanasi",
              "ATOLYE-001",
              imageId,
              variantId
            )
          )
      )
      .andExpect(status().isOk());
  }

  private String productBody(String categoryId, String name, String slug, String sku) {
    return productBody(categoryId, name, slug, sku, null, null);
  }

  private String productBody(
    String categoryId,
    String name,
    String slug,
    String sku,
    String imageId,
    String variantId
  ) {
    return """
    {
      "categoryId":"%s",
      "name":"%s",
      "slug":"%s",
      "description":"Test ürün açıklaması",
      "status":"ACTIVE",
      "price":299.90,
      "featured":true,
      "sortOrder":0,
      "images":[{"id":%s,"url":"/products/test.jpg","altText":"Test görseli","sortOrder":0}],
      "variants":[{"id":%s,"title":"Standart","sku":"%s","stockQuantity":8,"active":true,"sortOrder":0}]
    }
    """.formatted(
      categoryId,
      name,
      slug,
      imageId == null ? "null" : "\"%s\"".formatted(imageId),
      variantId == null ? "null" : "\"%s\"".formatted(variantId),
      sku
    );
  }
}
