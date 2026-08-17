package com.northline.store.user.service;

import com.northline.store.common.exception.ApiException;
import com.northline.store.user.dto.AddressRequest;
import com.northline.store.user.dto.AddressResponse;
import com.northline.store.user.entity.UserAddress;
import com.northline.store.user.repository.UserAddressRepository;
import com.northline.store.user.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAddressService {

  private final UserAddressRepository addresses;
  private final UserRepository users;

  public UserAddressService(UserAddressRepository addresses, UserRepository users) {
    this.addresses = addresses;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<AddressResponse> list(UUID userId) {
    return addresses
      .findByUserIdOrderByDefaultAddressDescCreatedAtAsc(userId)
      .stream()
      .map(AddressResponse::from)
      .toList();
  }

  @Transactional
  public AddressResponse create(UUID userId, AddressRequest request) {
    var existing = addresses.findByUserIdOrderByDefaultAddressDescCreatedAtAsc(userId);
    var address = new UserAddress();
    address.setUser(users.findById(userId).orElseThrow());
    apply(address, request, existing.isEmpty() || request.defaultAddress(), existing);
    return AddressResponse.from(addresses.save(address));
  }

  @Transactional
  public AddressResponse update(UUID userId, UUID id, AddressRequest request) {
    var address = owned(userId, id);
    var existing = addresses.findByUserIdOrderByDefaultAddressDescCreatedAtAsc(userId);
    apply(address, request, request.defaultAddress(), existing);
    if (!request.defaultAddress() && address.isDefaultAddress()) address.setDefaultAddress(true);
    return AddressResponse.from(address);
  }

  @Transactional
  public void delete(UUID userId, UUID id) {
    var address = owned(userId, id);
    var wasDefault = address.isDefaultAddress();
    addresses.delete(address);
    addresses.flush();
    if (wasDefault) {
      addresses
        .findByUserIdOrderByDefaultAddressDescCreatedAtAsc(userId)
        .stream()
        .findFirst()
        .ifPresent(next -> next.setDefaultAddress(true));
    }
  }

  private void apply(
    UserAddress address,
    AddressRequest request,
    boolean makeDefault,
    List<UserAddress> existing
  ) {
    if (makeDefault) {
      existing
        .stream()
        .filter(item -> item != address)
        .forEach(item -> item.setDefaultAddress(false));
      addresses.flush();
    }
    address.setLabel(request.label().trim());
    address.setFirstName(request.firstName().trim());
    address.setLastName(request.lastName().trim());
    address.setPhone(request.phone().trim());
    address.setAddressLine1(request.addressLine1().trim());
    address.setAddressLine2(blankToNull(request.addressLine2()));
    address.setDistrict(request.district().trim());
    address.setCity(request.city().trim());
    address.setPostalCode(blankToNull(request.postalCode()));
    address.setCountry(request.country().trim());
    address.setDefaultAddress(makeDefault || address.isDefaultAddress());
  }

  private UserAddress owned(UUID userId, UUID id) {
    return addresses
      .findByIdAndUserId(id, userId)
      .orElseThrow(() ->
        new ApiException("ADDRESS_NOT_FOUND", "Adres bulunamadı.", HttpStatus.NOT_FOUND)
      );
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
