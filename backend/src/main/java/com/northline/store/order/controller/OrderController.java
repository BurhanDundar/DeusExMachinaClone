package com.northline.store.order.controller;

import com.northline.store.common.security.UserPrincipal;
import com.northline.store.order.dto.*;
import com.northline.store.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService service;

  public OrderController(OrderService service) {
    this.service = service;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  OrderResponse create(
    @AuthenticationPrincipal UserPrincipal principal,
    @Valid @RequestBody CreateOrderRequest request
  ) {
    return service.create(principal.id(), request);
  }

  @GetMapping
  List<OrderResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
    return service.mine(principal.id());
  }

  @GetMapping("/{id}")
  OrderResponse mine(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable java.util.UUID id
  ) {
    return service.mine(principal.id(), id);
  }
}
