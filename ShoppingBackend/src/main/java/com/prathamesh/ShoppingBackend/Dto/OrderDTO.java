package com.prathamesh.ShoppingBackend.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class OrderDTO {
    @NotNull(message = "Order ID cannot be null")
    private Long id;

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Subtotal cannot be null")
    @PositiveOrZero(message = "Subtotal must be positive or zero")
    private BigDecimal subtotalAmount;

    @NotNull(message = "Shipping cost cannot be null")
    @PositiveOrZero(message = "Shipping cost must be positive or zero")
    private BigDecimal shippingCost;

    @NotNull(message = "Tax amount cannot be null")
    @PositiveOrZero(message = "Tax amount must be positive or zero")
    private BigDecimal taxAmount;

    @NotNull(message = "Total amount cannot be null")
    @PositiveOrZero(message = "Total amount must be positive or zero")
    private BigDecimal totalAmount;

    @NotBlank(message = "Status cannot be blank")
    private String status;

    @NotNull(message = "Creation date cannot be null")
    private LocalDateTime createdAt;

    @NotNull(message = "Update date cannot be null")
    private LocalDateTime updatedAt;

    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItemDTO> items;

    @NotNull(message = "Address cannot be null")
    private AddressDTO address;

    public OrderDTO() {}

    public OrderDTO(Long id, Long userId, BigDecimal subtotalAmount, BigDecimal shippingCost, BigDecimal taxAmount, BigDecimal totalAmount, String status, LocalDateTime createdAt, LocalDateTime updatedAt, List<OrderItemDTO> items, AddressDTO address) {
        this.id = id;
        this.userId = userId;
        this.subtotalAmount = subtotalAmount;
        this.shippingCost = shippingCost;
        this.taxAmount = taxAmount;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
        this.address = address;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getSubtotalAmount() { return subtotalAmount; }
    public void setSubtotalAmount(BigDecimal subtotalAmount) { this.subtotalAmount = subtotalAmount; }

    public BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }

    public AddressDTO getAddress() { return address; }
    public void setAddress(AddressDTO address) { this.address = address; }
}