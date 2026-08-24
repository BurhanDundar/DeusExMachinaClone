package com.northline.store.catalog.repository;

import com.northline.store.catalog.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select v from ProductVariant v join fetch v.product where v.id = :id")
  Optional<ProductVariant> findByIdForUpdate(@Param("id") UUID id);
}
