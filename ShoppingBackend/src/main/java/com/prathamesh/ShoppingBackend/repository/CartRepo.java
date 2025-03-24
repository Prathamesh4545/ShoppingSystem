package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Cart;
import com.prathamesh.ShoppingBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepo extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}