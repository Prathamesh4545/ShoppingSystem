package com.prathamesh.ShoppingBackend.Dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CartDTO {
    private List<CartItemDTO> items = new ArrayList<>();
    private int totalItems;
    private double totalPrice;

    public CartDTO() {}

    public CartDTO(List<CartItemDTO> items, int totalItems, double totalPrice) {
        this.items = items;
        this.totalItems = totalItems;
        this.totalPrice = totalPrice;
    }

    public List<CartItemDTO> getItems() {
        return items != null ? items : Collections.emptyList();
    }

    public void setItems(List<CartItemDTO> items) { this.items = items; }

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
}