package com.prathamesh.ShoppingBackend.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

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

    public OrderRequest() {}

    public OrderRequest(Long userId, List<OrderItemDTO> items, double totalAmount, String status, AddressDTO address, Long addressId) {
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.address = address;
        this.addressId = addressId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public AddressDTO getAddress() { return address; }
    public void setAddress(AddressDTO address) { this.address = address; }

    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }
}