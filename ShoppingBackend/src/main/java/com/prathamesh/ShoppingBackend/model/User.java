package com.prathamesh.ShoppingBackend.model;

import java.sql.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name = "`user`")
public class User {

    public enum Role {
        USER,
        ADMIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name")
    private String userName;

    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Lob
    @Column(name = "image_data")
    private byte[] imageData;

    @Column(name = "image_type")
    private String imageType;

    @Column(name = "last_name")
    private String lastName;

    private String password;

    @Column(name = "phone_number")
    private String phoneNumber;

    @CreationTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date createdAt;

    @UpdateTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'USER'")
    private Role role = Role.USER;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Address> addresses;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private Cart cart;

    public User() {}

    public User(Long id, String userName, String email, String firstName, byte[] imageData, String imageType, String lastName, String password, String phoneNumber, Date createdAt, Date updatedAt, Role role, List<Address> addresses, Cart cart) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.firstName = firstName;
        this.imageData = imageData;
        this.imageType = imageType;
        this.lastName = lastName;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.role = role;
        this.addresses = addresses;
        this.cart = cart;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public List<Address> getAddresses() { return addresses; }
    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
}