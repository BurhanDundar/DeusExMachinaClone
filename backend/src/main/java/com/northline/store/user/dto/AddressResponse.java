package com.northline.store.user.dto;

import com.northline.store.user.entity.UserAddress;
import java.util.UUID;

public record AddressResponse(
  UUID id,
  String label,
  String firstName,
  String lastName,
  String phone,
  String addressLine1,
  String addressLine2,
  String district,
  String city,
  String postalCode,
  String country,
  boolean defaultAddress
) {
  public static AddressResponse from(UserAddress address) {
    return new AddressResponse(
      address.getId(),
      address.getLabel(),
      address.getFirstName(),
      address.getLastName(),
      address.getPhone(),
      address.getAddressLine1(),
      address.getAddressLine2(),
      address.getDistrict(),
      address.getCity(),
      address.getPostalCode(),
      address.getCountry(),
      address.isDefaultAddress()
    );
  }
}
