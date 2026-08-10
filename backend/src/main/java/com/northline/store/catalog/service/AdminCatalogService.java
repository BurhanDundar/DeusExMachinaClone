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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    syncImages(product, request.images());
    syncVariants(product, request.variants());
  }

  private void syncImages(Product product, List<ProductImageUpsertRequest> requests) {
    var existing = indexImages(product.getImages());
    var requestedIds = requestedIds(requests.stream().map(ProductImageUpsertRequest::id).toList());
    product.getImages().removeIf(image -> !requestedIds.contains(image.getId()));

    for (var request : requests) {
      var image = request.id() == null ? new ProductImage() : existing.get(request.id());
      if (image == null) {
        throw new ApiException(
          "PRODUCT_IMAGE_NOT_FOUND",
          "Product image was not found",
          HttpStatus.BAD_REQUEST
        );
      }
      if (request.id() == null) {
        image.setProduct(product);
        product.getImages().add(image);
      }
      applyImage(image, request);
    }
  }

  private void syncVariants(Product product, List<ProductVariantUpsertRequest> requests) {
    var existing = indexVariants(product.getVariants());
    var requestedIds = requestedIds(
      requests.stream().map(ProductVariantUpsertRequest::id).toList()
    );
    var removed = product
      .getVariants()
      .removeIf(variant -> !requestedIds.contains(variant.getId()));

    // A removed SKU may be re-used by a newly added variant in the same request.
    // Flush the orphan removal first so the database's unique SKU constraint is respected.
    if (removed && product.getId() != null) {
      products.flush();
    }

    for (var request : requests) {
      var variant = request.id() == null ? new ProductVariant() : existing.get(request.id());
      if (variant == null) {
        throw new ApiException(
          "PRODUCT_VARIANT_NOT_FOUND",
          "Product variant was not found",
          HttpStatus.BAD_REQUEST
        );
      }
      if (request.id() == null) {
        variant.setProduct(product);
        product.getVariants().add(variant);
      }
      applyVariant(variant, request);
    }
  }

  private Map<UUID, ProductImage> indexImages(List<ProductImage> images) {
    var result = new HashMap<UUID, ProductImage>();
    images.forEach(image -> result.put(image.getId(), image));
    return result;
  }

  private Map<UUID, ProductVariant> indexVariants(List<ProductVariant> variants) {
    var result = new HashMap<UUID, ProductVariant>();
    variants.forEach(variant -> result.put(variant.getId(), variant));
    return result;
  }

  private Set<UUID> requestedIds(List<UUID> ids) {
    return ids
      .stream()
      .filter(java.util.Objects::nonNull)
      .collect(java.util.stream.Collectors.toSet());
  }

  private void applyImage(ProductImage image, ProductImageUpsertRequest request) {
    image.setUrl(request.url().trim());
    image.setAltText(blankToNull(request.altText()));
    image.setSortOrder(request.sortOrder());
  }

  private void applyVariant(ProductVariant variant, ProductVariantUpsertRequest request) {
    variant.setTitle(request.title().trim());
    variant.setSku(request.sku().trim().toUpperCase(java.util.Locale.ROOT));
    variant.setColor(blankToNull(request.color()));
    variant.setSize(blankToNull(request.size()));
    variant.setPrice(request.price());
    variant.setStockQuantity(request.stockQuantity());
    variant.setActive(request.active());
    variant.setSortOrder(request.sortOrder());
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
