package com.prathamesh.ShoppingBackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;

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

    private String street;
    private String city;
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    private String country;

    @Enumerated(EnumType.STRING)
    private AddressType type;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Orders> orders;

    public Address() {}

    public Address(Long id, String street, String city, String state, String zipCode, String country, AddressType type, User user, List<Orders> orders) {
        this.id = id;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.type = type;
        this.user = user;
        this.orders = orders;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public AddressType getType() { return type; }
    public void setType(AddressType type) { this.type = type; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<Orders> getOrders() { return orders; }
    public void setOrders(List<Orders> orders) { this.orders = orders; }
}