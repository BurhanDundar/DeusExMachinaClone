package com.northline.store.catalog.service;

import com.northline.store.catalog.dto.CategoryResponse;
import com.northline.store.catalog.dto.ProductResponse;
import com.northline.store.catalog.entity.ProductStatus;
import com.northline.store.catalog.repository.CategoryRepository;
import com.northline.store.catalog.repository.ProductRepository;
import com.northline.store.common.exception.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

  private final CategoryRepository categories;
  private final ProductRepository products;

  public CatalogService(CategoryRepository categories, ProductRepository products) {
    this.categories = categories;
    this.products = products;
  }

  @Transactional(readOnly = true)
  public List<CategoryResponse> categories() {
    return categories
      .findByActiveTrueOrderBySortOrderAscNameAsc()
      .stream()
      .map(CategoryResponse::from)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<ProductResponse> products() {
    return products
      .findByStatusOrderByFeaturedDescSortOrderAscNameAsc(ProductStatus.ACTIVE)
      .stream()
      .map(ProductResponse::from)
      .toList();
  }

  @Transactional(readOnly = true)
  public ProductResponse product(String slug) {
    return products
      .findBySlugAndStatus(slug, ProductStatus.ACTIVE)
      .map(ProductResponse::from)
      .orElseThrow(() ->
        new ApiException("PRODUCT_NOT_FOUND", "Product was not found", HttpStatus.NOT_FOUND)
      );
  }
}
