package com.northline.store.catalog.controller;

import com.northline.store.catalog.dto.AdminCategoryResponse;
import com.northline.store.catalog.dto.AdminProductResponse;
import com.northline.store.catalog.dto.CategoryUpsertRequest;
import com.northline.store.catalog.dto.ProductUpsertRequest;
import com.northline.store.catalog.service.AdminCatalogService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/catalog")
public class AdminCatalogController {

  private final AdminCatalogService catalog;

  public AdminCatalogController(AdminCatalogService catalog) {
    this.catalog = catalog;
  }

  @GetMapping("/categories")
  List<AdminCategoryResponse> categories() {
    return catalog.categories();
  }

  @PostMapping("/categories")
  @ResponseStatus(HttpStatus.CREATED)
  AdminCategoryResponse createCategory(@Valid @RequestBody CategoryUpsertRequest request) {
    return catalog.createCategory(request);
  }

  @PutMapping("/categories/{id}")
  AdminCategoryResponse updateCategory(
    @PathVariable UUID id,
    @Valid @RequestBody CategoryUpsertRequest request
  ) {
    return catalog.updateCategory(id, request);
  }

  @GetMapping("/products")
  List<AdminProductResponse> products() {
    return catalog.products();
  }

  @PostMapping("/products")
  @ResponseStatus(HttpStatus.CREATED)
  AdminProductResponse createProduct(@Valid @RequestBody ProductUpsertRequest request) {
    return catalog.createProduct(request);
  }

  @PutMapping("/products/{id}")
  AdminProductResponse updateProduct(
    @PathVariable UUID id,
    @Valid @RequestBody ProductUpsertRequest request
  ) {
    return catalog.updateProduct(id, request);
  }

  @DeleteMapping("/products/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void archiveProduct(@PathVariable UUID id) {
    catalog.archiveProduct(id);
  }
}
