package com.northline.store.order.service;

import com.northline.store.catalog.entity.ProductStatus;
import com.northline.store.catalog.repository.ProductVariantRepository;
import com.northline.store.common.exception.ApiException;
import com.northline.store.order.dto.*;
import com.northline.store.order.entity.*;
import com.northline.store.order.repository.OrderRepository;
import com.northline.store.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

  private final OrderRepository orders;
  private final ProductVariantRepository variants;
  private final UserRepository users;
  private final Duration reservationDuration;
  private final int maxPendingPerHour;
  private final BigDecimal shippingFlatFee;
  private final BigDecimal freeShippingThreshold;
  private final ApplicationEventPublisher events;

  public OrderService(
    OrderRepository orders,
    ProductVariantRepository variants,
    UserRepository users,
    @Value("${app.orders.reservation-minutes:30}") long reservationMinutes,
    @Value("${app.orders.max-pending-per-hour:5}") int maxPendingPerHour,
    @Value("${app.orders.shipping-flat-fee:79.90}") BigDecimal shippingFlatFee,
    @Value("${app.orders.free-shipping-threshold:1500.00}") BigDecimal freeShippingThreshold,
    ApplicationEventPublisher events
  ) {
    this.orders = orders;
    this.variants = variants;
    this.users = users;
    this.reservationDuration = Duration.ofMinutes(reservationMinutes);
    this.maxPendingPerHour = maxPendingPerHour;
    this.shippingFlatFee = shippingFlatFee;
    this.freeShippingThreshold = freeShippingThreshold;
    this.events = events;
  }

  @Transactional
  public OrderResponse create(UUID userId, CreateOrderRequest request) {
    var existing = orders.findByClientReference(request.clientReference().trim());
    if (existing.isPresent()) {
      if (!existing.get().getUser().getId().equals(userId)) throw conflict(
        "ORDER_REFERENCE_USED",
        "Sipariş referansı zaten kullanılıyor."
      );
      return OrderResponse.from(existing.get());
    }
    if (
      orders.countByUserIdAndPaymentStatusAndCreatedAtAfter(
        userId,
        PaymentStatus.PENDING,
        Instant.now().minus(Duration.ofHours(1))
      ) >= maxPendingPerHour
    ) {
      throw new ApiException(
        "ORDER_RATE_LIMITED",
        "Çok sayıda bekleyen sipariş oluşturdunuz. Lütfen daha sonra tekrar deneyin.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    var user = users
      .findById(userId)
      .orElseThrow(() -> notFound("USER_NOT_FOUND", "Kullanıcı bulunamadı."));
    var quantities = new LinkedHashMap<UUID, Integer>();
    request
      .items()
      .forEach(line -> quantities.merge(line.variantId(), line.quantity(), Integer::sum));
    if (
      quantities
        .values()
        .stream()
        .anyMatch(quantity -> quantity > 20)
    ) throw badRequest(
      "ORDER_QUANTITY_INVALID",
      "Bir ürün seçeneğinden en fazla 20 adet alınabilir."
    );

    var order = new StoreOrder();
    order.setOrderNumber(
      "BNK-" +
        LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.BASIC_ISO_DATE) +
        "-" +
        UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT)
    );
    order.setClientReference(request.clientReference().trim());
    order.setUser(user);
    order.setCustomerEmail(request.email().trim().toLowerCase(Locale.ROOT));
    order.setFirstName(request.firstName().trim());
    order.setLastName(request.lastName().trim());
    order.setPhone(request.phone().trim());
    order.setAddressLine1(request.addressLine1().trim());
    order.setAddressLine2(blank(request.addressLine2()));
    order.setDistrict(request.district().trim());
    order.setCity(request.city().trim());
    order.setPostalCode(blank(request.postalCode()));
    order.setCountry(request.country().trim());
    order.setReservationExpiresAt(Instant.now().plus(reservationDuration));

    var subtotal = BigDecimal.ZERO;
    for (var entry : quantities.entrySet()) {
      var variant = variants
        .findByIdForUpdate(entry.getKey())
        .orElseThrow(() -> notFound("VARIANT_NOT_FOUND", "Ürün seçeneği bulunamadı."));
      if (
        !variant.isActive() || variant.getProduct().getStatus() != ProductStatus.ACTIVE
      ) throw badRequest("VARIANT_NOT_AVAILABLE", "Seçtiğiniz ürün artık satışta değil.");
      if (
        variant.getStockQuantity() - variant.getReservedQuantity() < entry.getValue()
      ) throw conflict(
        "INSUFFICIENT_STOCK",
        variant.getProduct().getName() + " için yeterli stok yok."
      );
      var unitPrice =
        variant.getPrice() == null ? variant.getProduct().getBasePrice() : variant.getPrice();
      var item = new OrderItem();
      item.setOrder(order);
      item.setVariant(variant);
      item.setProductName(variant.getProduct().getName());
      item.setProductSlug(variant.getProduct().getSlug());
      item.setSku(variant.getSku());
      item.setOptionTitle(variant.getTitle());
      item.setUnitPrice(unitPrice);
      item.setQuantity(entry.getValue());
      item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(entry.getValue())));
      order.getItems().add(item);
      subtotal = subtotal.add(item.getLineTotal());
      variant.setReservedQuantity(variant.getReservedQuantity() + entry.getValue());
    }
    var shipping =
      subtotal.compareTo(freeShippingThreshold) >= 0 ? BigDecimal.ZERO : shippingFlatFee;
    order.setSubtotal(subtotal);
    order.setShippingTotal(shipping);
    order.setTotal(subtotal.add(shipping));
    return OrderResponse.from(orders.save(order));
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> mine(UUID userId) {
    return orders
      .findByUserIdOrderByCreatedAtDesc(userId)
      .stream()
      .map(OrderResponse::from)
      .toList();
  }

  @Transactional(readOnly = true)
  public OrderResponse mine(UUID userId, UUID orderId) {
    var order = orders
      .findById(orderId)
      .orElseThrow(() -> notFound("ORDER_NOT_FOUND", "Sipariş bulunamadı."));
    if (!order.getUser().getId().equals(userId)) {
      throw notFound("ORDER_NOT_FOUND", "Sipariş bulunamadı.");
    }
    return OrderResponse.from(order);
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> all() {
    return orders.findAllByOrderByCreatedAtDesc().stream().map(OrderResponse::from).toList();
  }

  @Transactional
  public OrderResponse markPaid(UUID orderId, String paymentReference) {
    var order = orders
      .findByIdForUpdate(orderId)
      .orElseThrow(() -> notFound("ORDER_NOT_FOUND", "Sipariş bulunamadı."));
    if (order.getPaymentStatus() == PaymentStatus.PAID) return OrderResponse.from(order);
    if (order.getPaymentStatus() != PaymentStatus.PENDING) throw conflict(
      "ORDER_NOT_PAYABLE",
      "Sipariş ödeme almaya uygun değil."
    );
    for (var item : order.getItems()) {
      var variant = variants
        .findByIdForUpdate(item.getVariant().getId())
        .orElseThrow(() -> notFound("VARIANT_NOT_FOUND", "Ürün seçeneği bulunamadı."));
      if (variant.getReservedQuantity() < item.getQuantity()) throw conflict(
        "ORDER_RESERVATION_MISSING",
        item.getProductName() + " için stok rezervasyonu bulunamadı."
      );
      variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
      variant.setReservedQuantity(variant.getReservedQuantity() - item.getQuantity());
    }
    order.setPaymentReference(paymentReference);
    order.setPaymentStatus(PaymentStatus.PAID);
    order.setStatus(OrderStatus.CONFIRMED);
    order.setPaidAt(Instant.now());
    order.setReservationExpiresAt(null);
    var response = OrderResponse.from(order);
    events.publishEvent(
      new OrderNotificationEvent(OrderNotificationEvent.Type.CONFIRMED, response)
    );
    return response;
  }

  @Transactional
  public OrderResponse markPaymentFailed(UUID orderId) {
    var order = orders
      .findByIdForUpdate(orderId)
      .orElseThrow(() -> notFound("ORDER_NOT_FOUND", "Sipariş bulunamadı."));
    if (order.getPaymentStatus() != PaymentStatus.PENDING) return OrderResponse.from(order);
    releaseReservation(order);
    order.setPaymentStatus(PaymentStatus.FAILED);
    order.setStatus(OrderStatus.CANCELLED);
    var response = OrderResponse.from(order);
    events.publishEvent(
      new OrderNotificationEvent(OrderNotificationEvent.Type.CANCELLED, response)
    );
    return response;
  }

  @Transactional
  public OrderResponse updateFulfillment(UUID orderId, UpdateOrderFulfillmentRequest request) {
    var order = orders
      .findByIdForUpdate(orderId)
      .orElseThrow(() -> notFound("ORDER_NOT_FOUND", "Sipariş bulunamadı."));
    var next = request.status();
    if (next == OrderStatus.CANCELLED) {
      if (order.getPaymentStatus() != PaymentStatus.PENDING) {
        throw conflict(
          "PAID_ORDER_REQUIRES_REFUND",
          "Ödenmiş sipariş, ödeme iadesi tamamlanmadan iptal edilemez."
        );
      }
      releaseReservation(order);
      order.setPaymentStatus(PaymentStatus.FAILED);
      order.setStatus(OrderStatus.CANCELLED);
      var response = OrderResponse.from(order);
      events.publishEvent(
        new OrderNotificationEvent(OrderNotificationEvent.Type.CANCELLED, response)
      );
      return response;
    }
    var allowed = switch (order.getStatus()) {
      case CONFIRMED -> next == OrderStatus.PREPARING;
      case PREPARING -> next == OrderStatus.SHIPPED;
      case SHIPPED -> next == OrderStatus.DELIVERED;
      default -> false;
    };
    if (!allowed) {
      throw conflict("ORDER_STATUS_TRANSITION_INVALID", "Sipariş durumu bu aşamaya geçirilemez.");
    }
    if (
      next == OrderStatus.SHIPPED &&
      (blank(request.trackingNumber()) == null || blank(request.shippingCarrier()) == null)
    ) {
      throw badRequest(
        "TRACKING_REQUIRED",
        "Kargoya verilen sipariş için kargo firması ve takip numarası zorunludur."
      );
    }
    order.setStatus(next);
    if (next == OrderStatus.SHIPPED) {
      order.setShippingCarrier(blank(request.shippingCarrier()));
      order.setTrackingNumber(blank(request.trackingNumber()));
    }
    var response = OrderResponse.from(order);
    if (next == OrderStatus.SHIPPED) {
      events.publishEvent(
        new OrderNotificationEvent(OrderNotificationEvent.Type.SHIPPED, response)
      );
    }
    return response;
  }

  @Transactional
  public int expirePendingReservations() {
    var expiredIds = orders.findExpiredReservationIds(Instant.now());
    var expired = 0;
    for (var id : expiredIds) {
      var order = orders.findByIdForUpdate(id).orElse(null);
      if (order == null || order.getPaymentStatus() != PaymentStatus.PENDING) continue;
      releaseReservation(order);
      order.setPaymentStatus(PaymentStatus.FAILED);
      order.setStatus(OrderStatus.CANCELLED);
      events.publishEvent(
        new OrderNotificationEvent(OrderNotificationEvent.Type.CANCELLED, OrderResponse.from(order))
      );
      expired += 1;
    }
    return expired;
  }

  public ShippingConfig shippingConfig() {
    return new ShippingConfig(
      shippingFlatFee,
      freeShippingThreshold,
      reservationDuration.toMinutes()
    );
  }

  public record ShippingConfig(
    BigDecimal shippingFlatFee,
    BigDecimal freeShippingThreshold,
    long reservationMinutes
  ) {}

  private void releaseReservation(StoreOrder order) {
    for (var item : order.getItems()) {
      var variant = variants
        .findByIdForUpdate(item.getVariant().getId())
        .orElseThrow(() -> notFound("VARIANT_NOT_FOUND", "Ürün seçeneği bulunamadı."));
      variant.setReservedQuantity(Math.max(0, variant.getReservedQuantity() - item.getQuantity()));
    }
    order.setReservationExpiresAt(null);
  }

  private ApiException notFound(String code, String message) {
    return new ApiException(code, message, HttpStatus.NOT_FOUND);
  }

  private ApiException badRequest(String code, String message) {
    return new ApiException(code, message, HttpStatus.BAD_REQUEST);
  }

  private ApiException conflict(String code, String message) {
    return new ApiException(code, message, HttpStatus.CONFLICT);
  }

  private String blank(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
