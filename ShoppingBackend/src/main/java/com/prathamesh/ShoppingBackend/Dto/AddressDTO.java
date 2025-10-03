package com.prathamesh.ShoppingBackend.Dto;

import com.prathamesh.ShoppingBackend.model.Address;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AddressDTO {

    private Long id;
    @NotBlank(message = "Street cannot be blank")
    private String street;

    @NotBlank(message = "City cannot be blank")
    private String city;

    @NotBlank(message = "State cannot be blank")
    private String state;

    @NotBlank(message = "Zip code cannot be blank")
    private String zipCode;

    @NotBlank(message = "Country cannot be blank")
    private String country;

    @NotNull(message = "Address type cannot be null")
    private Address.AddressType type;

    public AddressDTO() {}

    public AddressDTO(Long id, String street, String city, String state, String zipCode, String country, Address.AddressType type) {
        this.id = id;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.type = type;
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

    public Address.AddressType getType() { return type; }
    public void setType(Address.AddressType type) { this.type = type; }
}