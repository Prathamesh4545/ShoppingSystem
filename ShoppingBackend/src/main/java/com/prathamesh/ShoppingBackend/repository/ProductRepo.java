package com.prathamesh.ShoppingBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer>{
    
}
