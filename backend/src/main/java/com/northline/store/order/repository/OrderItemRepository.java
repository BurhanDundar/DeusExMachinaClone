package com.northline.store.order.repository;

import com.northline.store.order.entity.OrderItem;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
  boolean existsByVariantId(UUID variantId);
}
