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
                if (file.isEmpty() || file.getSize() == 0) {
                    continue;
                }
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new IllegalArgumentException("File size exceeds the limit of 20MB: " + file.getOriginalFilename());
                }
                if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                    continue;
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
        Product existingProduct = productRepo.findById(product.getId())
            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + product.getId()));
        
        existingProduct.setProductName(product.getProductName());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setDesc(product.getDesc());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setAvailable(product.isAvailable());
        existingProduct.setReleaseDate(product.getReleaseDate());
        
        Product updatedProduct = productRepo.save(existingProduct);

            if (imageFiles != null && !imageFiles.isEmpty()) {
                boolean hasValidImages = imageFiles.stream()
                    .anyMatch(file -> !file.isEmpty() && file.getSize() > 0 && file.getContentType() != null && file.getContentType().startsWith("image/"));
                
                if (hasValidImages) {
                    productImageRepository.deleteByProductId(product.getId());

                    for (MultipartFile file : imageFiles) {
                        if (file.isEmpty() || file.getSize() == 0) {
                            continue;
                        }
                        if (file.getSize() > MAX_FILE_SIZE) {
                            throw new IllegalArgumentException("File size exceeds the limit of 20MB: " + file.getOriginalFilename());
                        }
                        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                            continue;
                        }

                        ProductImage image = new ProductImage();
                        image.setImageName(file.getOriginalFilename());
                        image.setImageType(file.getContentType());
                        image.setImageData(file.getBytes());
                        image.setProduct(updatedProduct);

                        productImageRepository.save(image);
                    }
                }
            }

        return updatedProduct;
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