package com.northline.store.order.entity;

import com.northline.store.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "orders")
public class StoreOrder {

  @Id
  @UuidGenerator
  private UUID id;

  @Column(name = "order_number", nullable = false, unique = true, length = 40)
  private String orderNumber;

  @Column(name = "client_reference", nullable = false, unique = true, length = 80)
  private String clientReference;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private OrderStatus status = OrderStatus.PAYMENT_PENDING;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_status", nullable = false, length = 32)
  private PaymentStatus paymentStatus = PaymentStatus.PENDING;

  @Column(name = "payment_reference", unique = true, length = 160)
  private String paymentReference;

  @Column(nullable = false, length = 3)
  private String currency = "TRY";

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal subtotal;

  @Column(name = "shipping_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal shippingTotal = BigDecimal.ZERO;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal total;

  @Column(name = "customer_email", nullable = false, length = 320)
  private String customerEmail;

  @Column(name = "first_name", nullable = false, length = 100)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 100)
  private String lastName;

  @Column(nullable = false, length = 32)
  private String phone;

  @Column(name = "address_line1", nullable = false, length = 240)
  private String addressLine1;

  @Column(name = "address_line2", length = 240)
  private String addressLine2;

  @Column(nullable = false, length = 120)
  private String district;

  @Column(nullable = false, length = 120)
  private String city;

  @Column(name = "postal_code", length = 20)
  private String postalCode;

  @Column(nullable = false, length = 80)
  private String country;

  @Column(name = "tracking_number", length = 120)
  private String trackingNumber;

  @Column(name = "shipping_carrier", length = 120)
  private String shippingCarrier;

  @Column(name = "reservation_expires_at")
  private Instant reservationExpiresAt;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @Column(name = "paid_at")
  private Instant paidAt;

  @PrePersist
  void onCreate() {
    var now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  public UUID getId() {
    return id;
  }

  public String getOrderNumber() {
    return orderNumber;
  }

  public void setOrderNumber(String value) {
    orderNumber = value;
  }

  public String getClientReference() {
    return clientReference;
  }

  public void setClientReference(String value) {
    clientReference = value;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User value) {
    user = value;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public void setStatus(OrderStatus value) {
    status = value;
  }

  public PaymentStatus getPaymentStatus() {
    return paymentStatus;
  }

  public void setPaymentStatus(PaymentStatus value) {
    paymentStatus = value;
  }

  public String getPaymentReference() {
    return paymentReference;
  }

  public void setPaymentReference(String value) {
    paymentReference = value;
  }

  public String getCurrency() {
    return currency;
  }

  public BigDecimal getSubtotal() {
    return subtotal;
  }

  public void setSubtotal(BigDecimal value) {
    subtotal = value;
  }

  public BigDecimal getShippingTotal() {
    return shippingTotal;
  }

  public void setShippingTotal(BigDecimal value) {
    shippingTotal = value;
  }

  public BigDecimal getTotal() {
    return total;
  }

  public void setTotal(BigDecimal value) {
    total = value;
  }

  public String getCustomerEmail() {
    return customerEmail;
  }

  public void setCustomerEmail(String value) {
    customerEmail = value;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String value) {
    firstName = value;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String value) {
    lastName = value;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String value) {
    phone = value;
  }

  public String getAddressLine1() {
    return addressLine1;
  }

  public void setAddressLine1(String value) {
    addressLine1 = value;
  }

  public String getAddressLine2() {
    return addressLine2;
  }

  public void setAddressLine2(String value) {
    addressLine2 = value;
  }

  public String getDistrict() {
    return district;
  }

  public void setDistrict(String value) {
    district = value;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String value) {
    city = value;
  }

  public String getPostalCode() {
    return postalCode;
  }

  public void setPostalCode(String value) {
    postalCode = value;
  }

  public String getCountry() {
    return country;
  }

  public void setCountry(String value) {
    country = value;
  }

  public String getTrackingNumber() {
    return trackingNumber;
  }

  public void setTrackingNumber(String value) {
    trackingNumber = value;
  }

  public String getShippingCarrier() {
    return shippingCarrier;
  }

  public void setShippingCarrier(String value) {
    shippingCarrier = value;
  }

  public Instant getReservationExpiresAt() {
    return reservationExpiresAt;
  }

  public void setReservationExpiresAt(Instant value) {
    reservationExpiresAt = value;
  }

  public List<OrderItem> getItems() {
    return items;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public Instant getPaidAt() {
    return paidAt;
  }

  public void setPaidAt(Instant value) {
    paidAt = value;
  }
}
