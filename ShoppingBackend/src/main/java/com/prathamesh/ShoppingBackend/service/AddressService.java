package com.prathamesh.ShoppingBackend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.prathamesh.ShoppingBackend.model.Address;
import com.prathamesh.ShoppingBackend.repository.AddressRepo;

@Service
public class AddressService {
    
    private AddressRepo addressRepo;

    public AddressService(AddressRepo addressRepo){
        this.addressRepo = addressRepo;
    }

    public Address createAddress(Address address){
        return addressRepo.save(address);
    }

    public Address getAddressById(Long id){
        return addressRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: "+id));
    }

    public List<Address> getAllAddresses(){
        return addressRepo.findAll();
    }

    public Address updateAddress(Long id,Address address){
        Address existingAddress = getAddressById(id);
        existingAddress.setStreet(address.getStreet());
        existingAddress.setCity(address.getCity());
        existingAddress.setState(address.getState());
        existingAddress.setZipCode(address.getZipCode());
        existingAddress.setCountry(address.getCountry());
        existingAddress.setType(address.getType());
        return addressRepo.save(existingAddress);
    }

    public void deleteAddress(Long id){
        addressRepo.deleteById(id);
    }

    public List<Address> getAddressesByUserId(Long userId){
        return addressRepo.findByUserId(userId);
    }
    
}
