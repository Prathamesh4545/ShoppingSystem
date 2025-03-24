package com.prathamesh.ShoppingBackend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Orders {

    public enum OrderStatus {
        PENDING,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "created_at", updatable = false)
    private LocalDate createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;
}