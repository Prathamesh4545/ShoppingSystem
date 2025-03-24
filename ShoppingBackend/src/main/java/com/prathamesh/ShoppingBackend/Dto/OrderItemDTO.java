package com.prathamesh.ShoppingBackend.Dto;

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
public class OrderItemDTO {
    private long id;
    private Long productId;
    private int quantity;
    private double price;
}