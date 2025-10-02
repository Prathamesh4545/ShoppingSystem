package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    List<ProductImage> findByProductId(int productId);
    void deleteByProductId(int productId);
}