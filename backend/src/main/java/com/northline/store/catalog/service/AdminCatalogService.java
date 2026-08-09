package com.northline.store.catalog.service;

import com.northline.store.catalog.dto.AdminCategoryResponse;
import com.northline.store.catalog.dto.AdminProductResponse;
import com.northline.store.catalog.dto.CategoryUpsertRequest;
import com.northline.store.catalog.dto.ProductImageUpsertRequest;
import com.northline.store.catalog.dto.ProductUpsertRequest;
import com.northline.store.catalog.dto.ProductVariantUpsertRequest;
import com.northline.store.catalog.entity.Category;
import com.northline.store.catalog.entity.Product;
import com.northline.store.catalog.entity.ProductImage;
import com.northline.store.catalog.entity.ProductStatus;
import com.northline.store.catalog.entity.ProductVariant;
import com.northline.store.catalog.repository.CategoryRepository;
import com.northline.store.catalog.repository.ProductRepository;
import com.northline.store.common.exception.ApiException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCatalogService {

  private final CategoryRepository categories;
  private final ProductRepository products;

  public AdminCatalogService(CategoryRepository categories, ProductRepository products) {
    this.categories = categories;
    this.products = products;
  }

  @Transactional(readOnly = true)
  public List<AdminCategoryResponse> categories() {
    return categories
      .findAllByOrderBySortOrderAscNameAsc()
      .stream()
      .map(AdminCategoryResponse::from)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<AdminProductResponse> products() {
    return products
      .findAllByOrderBySortOrderAscNameAsc()
      .stream()
      .map(AdminProductResponse::from)
      .toList();
  }

  @Transactional
  public AdminCategoryResponse createCategory(CategoryUpsertRequest request) {
    var category = new Category();
    applyCategory(category, request);
    return AdminCategoryResponse.from(categories.save(category));
  }

  @Transactional
  public AdminCategoryResponse updateCategory(UUID id, CategoryUpsertRequest request) {
    var category = category(id);
    applyCategory(category, request);
    return AdminCategoryResponse.from(category);
  }

  @Transactional
  public AdminProductResponse createProduct(ProductUpsertRequest request) {
    var product = new Product();
    applyProduct(product, request);
    return AdminProductResponse.from(products.save(product));
  }

  @Transactional
  public AdminProductResponse updateProduct(UUID id, ProductUpsertRequest request) {
    var product = product(id);
    applyProduct(product, request);
    return AdminProductResponse.from(product);
  }

  @Transactional
  public void archiveProduct(UUID id) {
    product(id).setStatus(ProductStatus.ARCHIVED);
  }

  private void applyCategory(Category category, CategoryUpsertRequest request) {
    category.setName(request.name().trim());
    category.setSlug(normalizeSlug(request.slug()));
    category.setDescription(blankToNull(request.description()));
    category.setSortOrder(request.sortOrder());
    category.setActive(request.active());
  }

  private void applyProduct(Product product, ProductUpsertRequest request) {
    product.setCategory(category(request.categoryId()));
    product.setName(request.name().trim());
    product.setSlug(normalizeSlug(request.slug()));
    product.setDescription(request.description().trim());
    product.setStatus(request.status());
    product.setBasePrice(request.price());
    product.setCompareAtPrice(request.compareAtPrice());
    product.setBadge(blankToNull(request.badge()));
    product.setFeatured(request.featured());
    product.setSortOrder(request.sortOrder());

    product.getImages().clear();
    request.images().forEach(imageRequest -> product.getImages().add(image(product, imageRequest)));
    product.getVariants().clear();
    request
      .variants()
      .forEach(variantRequest -> product.getVariants().add(variant(product, variantRequest)));
  }

  private ProductImage image(Product product, ProductImageUpsertRequest request) {
    var image = new ProductImage();
    image.setProduct(product);
    image.setUrl(request.url().trim());
    image.setAltText(blankToNull(request.altText()));
    image.setSortOrder(request.sortOrder());
    return image;
  }

  private ProductVariant variant(Product product, ProductVariantUpsertRequest request) {
    var variant = new ProductVariant();
    variant.setProduct(product);
    variant.setTitle(request.title().trim());
    variant.setSku(request.sku().trim().toUpperCase(java.util.Locale.ROOT));
    variant.setColor(blankToNull(request.color()));
    variant.setSize(blankToNull(request.size()));
    variant.setPrice(request.price());
    variant.setStockQuantity(request.stockQuantity());
    variant.setActive(request.active());
    variant.setSortOrder(request.sortOrder());
    return variant;
  }

  private Category category(UUID id) {
    return categories
      .findById(id)
      .orElseThrow(() ->
        new ApiException("CATEGORY_NOT_FOUND", "Category was not found", HttpStatus.NOT_FOUND)
      );
  }

  private Product product(UUID id) {
    return products
      .findById(id)
      .orElseThrow(() ->
        new ApiException("PRODUCT_NOT_FOUND", "Product was not found", HttpStatus.NOT_FOUND)
      );
  }

  private String normalizeSlug(String value) {
    return value.trim().toLowerCase(java.util.Locale.ROOT);
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
