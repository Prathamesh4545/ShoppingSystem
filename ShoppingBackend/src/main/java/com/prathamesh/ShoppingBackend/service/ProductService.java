package com.prathamesh.ShoppingBackend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;

@Service
public class ProductService {

    private ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        validateImageFile(imageFile);

        // Set image details
        product.setImageData(imageFile.getBytes());
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());

        return productRepo.save(product);

    }

    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        Product existingProduct = getProductById(id); // Throws ResourceNotFoundException if not found

        // Update fields
        existingProduct.setProductName(product.getProductName());
        existingProduct.setDesc(product.getDesc());
        existingProduct.setPrice(product.getPrice());

        // Update image if a new file is provided
        if (imageFile != null && !imageFile.isEmpty()) {
            validateImageFile(imageFile);
            existingProduct.setImageData(imageFile.getBytes());
            existingProduct.setImageName(imageFile.getOriginalFilename());
            existingProduct.setImageType(imageFile.getContentType());
        }

        return productRepo.save(existingProduct);
    }

    public void deleteProduct(int id) {
        Product product = getProductById(id); // Throws ResourceNotFoundException if not found
        productRepo.delete(product);
    }

    public List<Product> searchProduct(String searchField, String searchQuery) {
        return productRepo.searchProducts(searchField, searchQuery);
    }

    private void validateImageFile(MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IOException("Image file is required.");
        }

        // Validate file type
        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("Invalid file type. Only images are allowed.");
        }

        // Validate file size (e.g., 5MB limit)
        long maxFileSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.getSize() > maxFileSize) {
            throw new IOException("File size exceeds the maximum limit of 5MB.");
        }
    }

}
