package com.northline.store.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.northline.store.catalog.entity.Category;
import com.northline.store.catalog.entity.Product;
import com.northline.store.catalog.entity.ProductImage;
import com.northline.store.catalog.entity.ProductStatus;
import com.northline.store.catalog.entity.ProductVariant;
import com.northline.store.catalog.repository.CategoryRepository;
import com.northline.store.catalog.repository.ProductRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Autowired
  CategoryRepository categories;

  @Autowired
  ProductRepository products;

  @AfterEach
  void cleanDatabase() {
    products.deleteAll();
    categories.deleteAll();
  }

  @Test
  void publicCatalogReturnsOnlyActiveProductsWithTheirVariantsAndImages() throws Exception {
    var category = category("Aksesuar", "aksesuar");
    categories.save(category);
    products.save(product(category, "Motor Atölyesi Bandanası", "motor-atolyesi-bandanasi", true));
    products.save(product(category, "Taslak Ürün", "taslak-urun", false));

    mvc
      .perform(get("/api/categories"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].name").value("Aksesuar"))
      .andExpect(jsonPath("$[0].slug").value("aksesuar"));

    mvc
      .perform(get("/api/products"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.length()").value(1))
      .andExpect(jsonPath("$[0].name").value("Motor Atölyesi Bandanası"))
      .andExpect(jsonPath("$[0].category.slug").value("aksesuar"))
      .andExpect(jsonPath("$[0].images[0].url").value("/products/binks/motor-atolyesi.jpg"))
      .andExpect(jsonPath("$[0].variants[0].available").value(true));
  }

  @Test
  void productDetailReturnsNotFoundForUnknownOrUnpublishedProducts() throws Exception {
    var category = category("Giyim", "giyim");
    categories.save(category);
    products.save(product(category, "Taslak Gömlek", "taslak-gomlek", false));

    mvc
      .perform(get("/api/products/taslak-gomlek"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
    mvc
      .perform(get("/api/products/bilinmeyen-urun"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
  }

  private Category category(String name, String slug) {
    var category = new Category();
    category.setName(name);
    category.setSlug(slug);
    category.setSortOrder(1);
    return category;
  }

  private Product product(Category category, String name, String slug, boolean active) {
    var product = new Product();
    product.setCategory(category);
    product.setName(name);
    product.setSlug(slug);
    product.setDescription("Atölyeden ilham alan günlük aksesuar.");
    product.setStatus(active ? ProductStatus.ACTIVE : ProductStatus.DRAFT);
    product.setBasePrice(new BigDecimal("449.00"));
    product.setFeatured(true);
    product.setSortOrder(1);

    var image = new ProductImage();
    image.setProduct(product);
    image.setUrl("/products/binks/motor-atolyesi.jpg");
    image.setAltText(name);
    image.setSortOrder(1);
    product.getImages().add(image);

    var variant = new ProductVariant();
    variant.setProduct(product);
    variant.setTitle("Standart");
    variant.setSku("BNK-" + slug.toUpperCase(java.util.Locale.ROOT));
    variant.setStockQuantity(12);
    variant.setSortOrder(1);
    product.getVariants().add(variant);
    return product;
  }
}
