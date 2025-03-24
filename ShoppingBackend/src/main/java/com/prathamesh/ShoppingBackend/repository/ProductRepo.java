package com.prathamesh.ShoppingBackend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.productName) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :searchQuery, '%'))")
    List<Product> searchProduct(String searchField, String searchQuery);

    List<Product> findByProductNameContainingOrDescContaining(String searchQuery, String searchQuery2);

    Optional<Product> findByProductName(String productName);
}