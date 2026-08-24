package com.northline.store.order.controller;

import com.northline.store.order.dto.OrderResponse;
import com.northline.store.order.dto.UpdateOrderFulfillmentRequest;
import com.northline.store.order.service.OrderService;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

  private final OrderService service;

  public AdminOrderController(OrderService service) {
    this.service = service;
  }

  @GetMapping
  List<OrderResponse> all() {
    return service.all();
  }

  @PutMapping("/{id}/fulfillment")
  OrderResponse updateFulfillment(
    @PathVariable UUID id,
    @RequestBody @jakarta.validation.Valid UpdateOrderFulfillmentRequest request
  ) {
    return service.updateFulfillment(id, request);
  }
}
