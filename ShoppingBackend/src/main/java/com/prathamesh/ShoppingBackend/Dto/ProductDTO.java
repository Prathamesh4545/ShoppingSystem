package com.prathamesh.ShoppingBackend.Dto;

import java.math.BigDecimal;

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
public class ProductDTO {
    private int id;
    private String productName;
    private String brand;
    private String desc;
    private String category;
    private BigDecimal price;
    private int quantity;
}