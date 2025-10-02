package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Dto.AddressDTO;
import com.prathamesh.ShoppingBackend.model.Address;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.model.UserPrincipal;
import com.prathamesh.ShoppingBackend.service.AddressService;
import com.prathamesh.ShoppingBackend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/address")
public class AddressController {

    private final AddressService addressService;
    private final UserService userService;

    public AddressController(AddressService addressService, UserService userService) {
        this.addressService = addressService;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Address> createAddress(
            @Valid @RequestBody AddressDTO addressDTO,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long userId = principal.getId();
        User user = userService.getUserById(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Address address = new Address();
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setZipCode(addressDTO.getZipCode());
        address.setCountry(addressDTO.getCountry());
        address.setType(addressDTO.getType());
        address.setUser(user);

        Address createdAddress = addressService.createAddress(address);
        return new ResponseEntity<>(createdAddress, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@addressService.isOwner(#id, principal.id) or hasRole('ADMIN')")
    public ResponseEntity<Address> getAddressById(@PathVariable Long id) {
        Address address = addressService.getAddressById(id);
        return new ResponseEntity<>(address, HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Address>> getAllAddresses() {
        List<Address> addresses = addressService.getAllAddresses();
        return new ResponseEntity<>(addresses, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@addressService.isOwner(#id, principal.id)")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long id,
            @RequestBody Address address,
            @AuthenticationPrincipal UserPrincipal principal) {

        Address updatedAddress = addressService.updateAddress(id, address, principal.getId());
        return new ResponseEntity<>(updatedAddress, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@addressService.isOwner(#id, principal.id) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == principal.id or hasRole('ADMIN')")
    public ResponseEntity<List<Address>> getAddressesByUserId(@PathVariable Long userId) {
        List<Address> addresses = addressService.getAddressesByUserId(userId);
        return new ResponseEntity<>(addresses, HttpStatus.OK);
    }
}