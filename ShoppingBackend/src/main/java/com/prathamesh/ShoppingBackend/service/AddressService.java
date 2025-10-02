package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.model.Address;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.repository.AddressRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepo addressRepo;

    public AddressService(AddressRepo addressRepo) {
        this.addressRepo = addressRepo;
    }

    public Address createAddress(Address address) {
        return addressRepo.save(address);
    }

    public Address getAddressById(Long id) {
        return addressRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + id));
    }

    public List<Address> getAllAddresses() {
        return addressRepo.findAll();
    }

    public Address updateAddress(Long id, Address address, Long currentUserId) {
        Address existingAddress = getAddressById(id);
        if (!existingAddress.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized access: Address does not belong to the user");
        }
        existingAddress.setStreet(address.getStreet());
        existingAddress.setCity(address.getCity());
        existingAddress.setState(address.getState());
        existingAddress.setZipCode(address.getZipCode());
        existingAddress.setCountry(address.getCountry());
        existingAddress.setType(address.getType());
        return addressRepo.save(existingAddress);
    }

    public void deleteAddress(Long id) {
        addressRepo.deleteById(id);
    }

    public List<Address> getAddressesByUserId(Long userId) {
        User user = new User();
        user.setId(userId);
        return addressRepo.findByUser(user);
    }

    public boolean isOwner(Long addressId, Long userId) {
        Address address = getAddressById(addressId);
        return address.getUser().getId().equals(userId);
    }
}