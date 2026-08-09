package com.northline.store.catalog.repository;

import com.northline.store.catalog.entity.Category;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, java.util.UUID> {
  List<Category> findByActiveTrueOrderBySortOrderAscNameAsc();

  List<Category> findAllByOrderBySortOrderAscNameAsc();
}
