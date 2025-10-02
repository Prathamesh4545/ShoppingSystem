package com.prathamesh.ShoppingBackend.Dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CartDTO {
    private List<CartItemDTO> items = new ArrayList<>();
    private int totalItems;
    private double totalPrice;

    // Add null safety for items
    public List<CartItemDTO> getItems() {
        return items != null ? items : Collections.emptyList();
    }
}