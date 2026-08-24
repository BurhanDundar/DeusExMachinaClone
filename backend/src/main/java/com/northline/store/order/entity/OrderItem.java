package com.northline.store.order.entity;

import com.northline.store.catalog.entity.ProductVariant;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "order_items")
public class OrderItem {

  @Id
  @UuidGenerator
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id")
  private StoreOrder order;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "variant_id")
  private ProductVariant variant;

  @Column(name = "product_name", nullable = false, length = 200)
  private String productName;

  @Column(name = "product_slug", nullable = false, length = 220)
  private String productSlug;

  @Column(nullable = false, length = 100)
  private String sku;

  @Column(name = "option_title", nullable = false, length = 160)
  private String optionTitle;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;

  @Column(nullable = false)
  private int quantity;

  @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal lineTotal;

  public UUID getId() {
    return id;
  }

  public StoreOrder getOrder() {
    return order;
  }

  public void setOrder(StoreOrder value) {
    order = value;
  }

  public ProductVariant getVariant() {
    return variant;
  }

  public void setVariant(ProductVariant value) {
    variant = value;
  }

  public String getProductName() {
    return productName;
  }

  public void setProductName(String value) {
    productName = value;
  }

  public String getProductSlug() {
    return productSlug;
  }

  public void setProductSlug(String value) {
    productSlug = value;
  }

  public String getSku() {
    return sku;
  }

  public void setSku(String value) {
    sku = value;
  }

  public String getOptionTitle() {
    return optionTitle;
  }

  public void setOptionTitle(String value) {
    optionTitle = value;
  }

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public void setUnitPrice(BigDecimal value) {
    unitPrice = value;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int value) {
    quantity = value;
  }

  public BigDecimal getLineTotal() {
    return lineTotal;
  }

  public void setLineTotal(BigDecimal value) {
    lineTotal = value;
  }
}
