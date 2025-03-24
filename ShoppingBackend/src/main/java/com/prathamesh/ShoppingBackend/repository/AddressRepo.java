package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Address;
import com.prathamesh.ShoppingBackend.model.Orders;
import com.prathamesh.ShoppingBackend.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


public interface AddressRepo extends JpaRepository<Address, Long> {

    void deleteByOrders(Orders orders);

    List<Address> findByOrders(Orders existingOrder);

    List<Address> findByUser(User user);

    
}