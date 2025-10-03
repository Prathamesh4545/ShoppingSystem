package com.prathamesh.ShoppingBackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Base64;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Deals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage;

    @Lob
    @Column(name = "image_data")
    private byte[] imageData;

    @Column(name = "image_type")
    private String imageType;

    @Transient
    private String imageUrl;

    @NotNull
    @Column(name = "start_date")
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date")
    private LocalDate endDate;

    @NotNull
    @Column(nullable = false)
    private LocalTime startTime;

    @NotNull
    @Column(nullable = false)
    private LocalTime endTime;

    @Column(name = "is_active")
    private boolean isActive = true;

    @CreatedDate
    private LocalDate createdAt;

    @LastModifiedDate
    private LocalDate updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "deal_products",
        joinColumns = @JoinColumn(name = "deal_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @JsonIgnoreProperties("deals")
    private List<Product> products = new ArrayList<>();

    public String getImageUrl() {
        if (imageData == null || imageType == null) return null;
        return "data:" + imageType + ";base64," + Base64.getEncoder().encodeToString(imageData);
    }

    public void addProduct(Product product) {
        if (!products.contains(product)) {
            products.add(product);
            if (product.getDeals() != null && !product.getDeals().contains(this)) {
                product.getDeals().add(this);
            }
        }
    }

    public void removeProduct(Product product) {
        if (products.remove(product)) {
            if (product.getDeals() != null) {
                product.getDeals().remove(this);
            }
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Deals deal = (Deals) o;
        return id != 0 && id == deal.id;
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    public Deals() {}

    public Deals(int id, String title, String description, BigDecimal discountPercentage, byte[] imageData, String imageType, String imageUrl, LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime, boolean isActive, LocalDate createdAt, LocalDate updatedAt, String createdBy, String updatedBy, List<Product> products) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.discountPercentage = discountPercentage;
        this.imageData = imageData;
        this.imageType = imageType;
        this.imageUrl = imageUrl;
        this.startDate = startDate;
        this.endDate = endDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.products = products;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }

    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}