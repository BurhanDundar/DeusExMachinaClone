package com.northline.store.user.repository;

import com.northline.store.user.entity.UserAddress;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAddressRepository extends JpaRepository<UserAddress, UUID> {
  List<UserAddress> findByUserIdOrderByDefaultAddressDescCreatedAtAsc(UUID userId);
  Optional<UserAddress> findByIdAndUserId(UUID id, UUID userId);
}
