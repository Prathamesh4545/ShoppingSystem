package com.prathamesh.ShoppingBackend.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {

    @NotNull(message = "User id cannot be null")
    @Min(value = 1, message = "User id must be greater than 0")
    private Long userId;
    
    @NotEmpty(message = "Items cannot be empty")
    private List<@Valid OrderItemDTO> items;

    @NotNull(message = "Total amount cannot be null")
    private double totalAmount;

    @NotNull(message = "Status cannot be null")
    private String status;

    private AddressDTO address;

    private Long addressId; 
}