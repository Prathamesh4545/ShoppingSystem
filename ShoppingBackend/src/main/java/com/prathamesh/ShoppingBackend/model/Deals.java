package com.prathamesh.ShoppingBackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Deals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @CreationTimestamp
    private LocalDate createdAt;

    @UpdateTimestamp
    private LocalDate updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "deal_product", joinColumns = @JoinColumn(name = "deal_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<Product> products;

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
        return id != null && id.equals(deal.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}