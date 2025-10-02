package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Exception.ResourceNotFoundException;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.model.ProductImage;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;
import com.prathamesh.ShoppingBackend.repository.ProductImageRepository;
import com.prathamesh.ShoppingBackend.repository.CartItemRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    private final ProductRepo productRepo;
    private final ProductImageRepository productImageRepository;

    @Autowired
    private CartItemRepo cartItemRepo; // Added for handling cart item deletion

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

    public ProductService(ProductRepo productRepo, ProductImageRepository productImageRepository) {
        this.productRepo = productRepo;
        this.productImageRepository = productImageRepository;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
    

    @Transactional
    public Product saveProduct(Product product, List<MultipartFile> imageFiles) throws IOException {
        Product savedProduct = productRepo.save(product);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new IllegalArgumentException("File size exceeds the limit of 20MB: " + file.getOriginalFilename());
                }

                ProductImage image = new ProductImage();
                image.setImageName(file.getOriginalFilename());
                image.setImageType(file.getContentType());
                image.setImageData(file.getBytes());
                image.setProduct(savedProduct);

                productImageRepository.save(image);
            }
        }

        return savedProduct;
    }

    @Transactional
    public Product updateProduct(Product product, List<MultipartFile> imageFiles) throws IOException {
        Optional<Product> existingProduct = productRepo.findById(product.getId());
        if (existingProduct.isPresent()) {
            Product updatedProduct = productRepo.save(product);

            if (imageFiles != null && !imageFiles.isEmpty()) {
                productImageRepository.deleteByProductId(product.getId());

                for (MultipartFile file : imageFiles) {
                    if (file.getSize() > MAX_FILE_SIZE) {
                        throw new IllegalArgumentException("File size exceeds the limit of 20MB: " + file.getOriginalFilename());
                    }

                    ProductImage image = new ProductImage();
                    image.setImageName(file.getOriginalFilename());
                    image.setImageType(file.getContentType());
                    image.setImageData(file.getBytes());
                    image.setProduct(updatedProduct);

                    productImageRepository.save(image);
                }
            }

            return updatedProduct;
        } else {
            throw new RuntimeException("Product not found with ID: " + product.getId());
        }
    }

    @Transactional
    public void deleteProduct(int id) {
        Product product = getProductById(id);
        cartItemRepo.deleteByProductId(id); // Delete associated cart items
        productRepo.delete(product);
    }

    public List<Product> searchProduct(String searchField, String searchQuery) {
        if (searchQuery == null || searchQuery.isEmpty()) {
            throw new IllegalArgumentException("Search query must not be empty");
        }
        return productRepo.searchProduct(searchQuery);
    }
}