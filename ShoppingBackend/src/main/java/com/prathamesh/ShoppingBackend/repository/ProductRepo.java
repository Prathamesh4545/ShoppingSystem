package com.prathamesh.ShoppingBackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer>{

    @Query("select p from Product p where "+
    "LOWER(:searchField) Like LOWER(CONCAT('%', :searchQuery, '%'))")
List<Product> searchProducts(String searchField, String searchQuery);

}
