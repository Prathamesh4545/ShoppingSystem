package com.prathamesh.ShoppingBackend.Dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
}