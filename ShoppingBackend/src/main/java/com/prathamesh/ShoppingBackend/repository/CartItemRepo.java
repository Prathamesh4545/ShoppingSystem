package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    void deleteByProductId(int productId);
}