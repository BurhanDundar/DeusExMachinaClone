package com.northline.store.catalog.controller;

import com.northline.store.catalog.dto.CategoryResponse;
import com.northline.store.catalog.dto.ProductResponse;
import com.northline.store.catalog.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {

  private final CatalogService catalogService;

  public CatalogController(CatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/categories")
  List<CategoryResponse> categories() {
    return catalogService.categories();
  }

  @GetMapping("/products")
  List<ProductResponse> products() {
    return catalogService.products();
  }

  @GetMapping("/products/{slug}")
  ProductResponse product(@PathVariable String slug) {
    return catalogService.product(slug);
  }
}
