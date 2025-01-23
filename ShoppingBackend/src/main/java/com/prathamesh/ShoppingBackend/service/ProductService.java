package com.prathamesh.ShoppingBackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;

@Service
public class ProductService {

    private ProductRepo productRepo;

    public ProductService(ProductRepo productRepo){
        this.productRepo = productRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
       return productRepo.findById(id).orElse(null);
    }


}
