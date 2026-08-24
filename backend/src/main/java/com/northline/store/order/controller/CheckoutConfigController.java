package com.northline.store.order.controller;

import com.northline.store.order.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutConfigController {

  private final OrderService orders;

  public CheckoutConfigController(OrderService orders) {
    this.orders = orders;
  }

  @GetMapping("/config")
  OrderService.ShippingConfig config() {
    return orders.shippingConfig();
  }
}
