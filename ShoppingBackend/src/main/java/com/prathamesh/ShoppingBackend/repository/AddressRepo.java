package com.prathamesh.ShoppingBackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Address;

@Repository
public interface AddressRepo extends JpaRepository<Address,Long>{

    List<Address> findByUserId(Long userId);
    
}
