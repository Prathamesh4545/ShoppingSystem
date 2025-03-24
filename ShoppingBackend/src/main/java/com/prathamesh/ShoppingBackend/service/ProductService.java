package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Exception.ResourceNotFoundException;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.model.ProductImage;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;
import com.prathamesh.ShoppingBackend.repository.ProductImageRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepo productRepo;

    private ProductImageRepository productImageRepository;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

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
        // Save the product first
        Product savedProduct = productRepo.save(product);
    
        // Save the associated images (if present)
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                // Validate file size
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new IllegalArgumentException("File size exceeds the limit of 20MB: " + file.getOriginalFilename());
                }
    
                // Create and save the image entity
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
        // Check if the product exists
        Optional<Product> existingProduct = productRepo.findById(product.getId());
        if (existingProduct.isPresent()) {
            Product updatedProduct = productRepo.save(product);

            if (imageFiles != null && !imageFiles.isEmpty()) {
                productImageRepository.deleteByProductId(product.getId());

                for (MultipartFile file : imageFiles) {
                    if (file.getSize() > MAX_FILE_SIZE) {
                        throw new IllegalArgumentException(
                                "File size exceeds the limit of 20MB: " + file.getOriginalFilename());
                    }

                    // Create and save the image entity
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
        productRepo.delete(product);
    }

    public List<Product> searchProduct(String searchField, String searchQuery) {
        if (searchField == null || searchQuery == null || searchField.isEmpty() || searchQuery.isEmpty()) {
            throw new IllegalArgumentException("Search field and query must not be empty");
        }
        return productRepo.searchProduct(searchField, searchQuery);
    }

    // private void validateImageFile(MultipartFile imageFile) throws IOException {
    //     if (imageFile == null || imageFile.isEmpty()) {
    //         throw new IOException("Image file is required.");
    //     }

    //     // Validate file type
    //     String contentType = imageFile.getContentType();
    //     if (contentType == null || !contentType.startsWith("image/")) {
    //         throw new IOException("Invalid file type. Only images are allowed.");
    //     }

    //     // Validate file size (limit to 20MB)
    //     long maxFileSize = 20 * 1024 * 1024; // 20MB
    //     if (imageFile.getSize() > maxFileSize) {
    //         throw new IOException("File size exceeds the maximum limit of 5MB.");
    //     }
    // }
}
