package com.prathamesh.ShoppingBackend.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String productName;
    private String brand;

    @Column(name = "`desc`")
    private String desc;

    private String category;
    private Date releaseDate;
    private boolean available;
    private int quantity;
    private BigDecimal price;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductImage> images;

    @ManyToMany(mappedBy = "products", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Deals> deals;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CartItem> cartItems;

    public Product() {}

    public Product(int id, String productName, String brand, String desc, String category, Date releaseDate, boolean available, int quantity, BigDecimal price, List<ProductImage> images, List<Deals> deals, List<CartItem> cartItems) {
        this.id = id;
        this.productName = productName;
        this.brand = brand;
        this.desc = desc;
        this.category = category;
        this.releaseDate = releaseDate;
        this.available = available;
        this.quantity = quantity;
        this.price = price;
        this.images = images;
        this.deals = deals;
        this.cartItems = cartItems;
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

    public Date getReleaseDate() { return releaseDate; }
    public void setReleaseDate(Date releaseDate) { this.releaseDate = releaseDate; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }

    public List<Deals> getDeals() { return deals; }
    public void setDeals(List<Deals> deals) { this.deals = deals; }

    public List<CartItem> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }
}