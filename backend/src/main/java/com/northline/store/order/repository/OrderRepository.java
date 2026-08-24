package com.northline.store.order.repository;

import com.northline.store.order.entity.PaymentStatus;
import com.northline.store.order.entity.StoreOrder;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<StoreOrder, UUID> {
  List<StoreOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);
  List<StoreOrder> findAllByOrderByCreatedAtDesc();
  Optional<StoreOrder> findByClientReference(String clientReference);
  long countByUserIdAndPaymentStatusAndCreatedAtAfter(
    UUID userId,
    PaymentStatus status,
    Instant after
  );

  @Query(
    "select o.id from StoreOrder o where o.paymentStatus = com.northline.store.order.entity.PaymentStatus.PENDING and o.reservationExpiresAt <= :now"
  )
  List<UUID> findExpiredReservationIds(@Param("now") Instant now);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select o from StoreOrder o where o.id = :id")
  Optional<StoreOrder> findByIdForUpdate(@Param("id") UUID id);
}
