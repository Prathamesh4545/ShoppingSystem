package com.prathamesh.ShoppingBackend.Dto;

import java.math.BigDecimal;
import com.prathamesh.ShoppingBackend.model.Deals;

public class ProductDTO {
    private int id;
    private String productName;
    private String brand;
    private String desc;
    private String category;
    private BigDecimal price;
    private int quantity;
    private Deals dealInfo;

    public ProductDTO() {}

    public ProductDTO(int id, String productName, String brand, String desc, String category, BigDecimal price, int quantity, Deals dealInfo) {
        this.id = id;
        this.productName = productName;
        this.brand = brand;
        this.desc = desc;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.dealInfo = dealInfo;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public Deals getDealInfo() { return dealInfo; }
    public void setDealInfo(Deals dealInfo) { this.dealInfo = dealInfo; }
}