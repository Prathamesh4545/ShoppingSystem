package com.prathamesh.ShoppingBackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "image_url")
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

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE }, fetch = FetchType.EAGER)
    @JoinTable(name = "deal_product", joinColumns = @JoinColumn(name = "deal_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<Product> products = new ArrayList<>();

    public void addProduct(Product product) {
        this.products.add(product);
        product.getDeals().add(this);
    }

    public void removeProduct(Product product) {
        this.products.remove(product);
        product.getDeals().remove(this);
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
}