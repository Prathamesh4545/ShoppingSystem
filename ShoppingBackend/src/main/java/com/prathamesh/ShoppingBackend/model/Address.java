package com.prathamesh.ShoppingBackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "address")
public class Address {

    public enum AddressType {
        SHIPPING,
        BILLING
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    private String street;
    private String city;
    private String state;

    @Column(name = "zip_code")
    private String zipCode; // Changed to String

    private String country;

    @Enumerated(EnumType.STRING)
    private AddressType type; // Use enum for type
}