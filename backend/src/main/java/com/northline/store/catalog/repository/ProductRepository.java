package com.northline.store.catalog.repository;

import com.northline.store.catalog.entity.Product;
import com.northline.store.catalog.entity.ProductStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, java.util.UUID> {
  List<Product> findByStatusOrderByFeaturedDescSortOrderAscNameAsc(ProductStatus status);

  Optional<Product> findBySlugAndStatus(String slug, ProductStatus status);
}
