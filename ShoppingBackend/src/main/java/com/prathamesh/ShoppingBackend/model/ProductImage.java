package com.prathamesh.ShoppingBackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String imageName;
    private String imageType;

    @Lob
    private byte[] imageData;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    public ProductImage() {}

    public ProductImage(int id, String imageName, String imageType, byte[] imageData, Product product) {
        this.id = id;
        this.imageName = imageName;
        this.imageType = imageType;
        this.imageData = imageData;
        this.product = product;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    @Transient
    @JsonProperty("imageUrl")
    public String getImageUrl() {
        if (imageData == null || imageType == null) return null;
        return "data:" + imageType + ";base64," + java.util.Base64.getEncoder().encodeToString(imageData);
    }
}