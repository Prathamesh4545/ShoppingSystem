package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.service.ProductService;

import java.io.*;

import com.prathamesh.ShoppingBackend.Exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

   @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String fields) {
        
        logger.info("Fetching all products");
        List<Product> products = productService.getAllProducts();
        
        if (fields != null && fields.contains("id,productName")) {
            return ResponseEntity.ok(products.stream()
                .map(p -> {
                    Product dto = new Product();
                    dto.setId(p.getId());
                    dto.setProductName(p.getProductName());
                    return dto;
                })
                .collect(Collectors.toList()));
        }
        
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id) {
        logger.info("Fetching product with ID: {}", id);
        try {
            Product product = productService.getProductById(id);
            return new ResponseEntity<>(product, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("Product not found with ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/product")
    public ResponseEntity<Product> createProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        System.out.println("Product: " + product);
        if (images != null) {
            System.out.println("Number of images: " + images.size());
        } else {
            System.out.println("No images provided");
        }
        Product savedProduct = productService.saveProduct(product, images);
        return ResponseEntity.ok(savedProduct);
    }

    

    @PutMapping("/product/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable int id,
            @RequestPart("product") Product product,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            product.setId(id);
            Product updatedProduct = productService.updateProduct(product, images);
            return ResponseEntity.ok(updatedProduct);
        } catch (IOException e) {
            logger.error("Error updating product with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error processing images: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating product with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating product: " + e.getMessage());
        }
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        logger.info("Deleting product with ID: {}", id);
        try {
            productService.deleteProduct(id);
            return new ResponseEntity<>("Product deleted successfully", HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("Product not found with ID: {}", id);
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error deleting product with ID: {}", id, e);
            return new ResponseEntity<>("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/product/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String searchField,
            @RequestParam String searchQuery) {
        logger.info("Searching products with {}: {}", searchField, searchQuery);
        if (searchField == null || searchQuery == null || searchField.isEmpty() || searchQuery.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            List<Product> products = productService.searchProduct(searchField, searchQuery);
            return products.isEmpty() ? new ResponseEntity<>(HttpStatus.NOT_FOUND)
                    : new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error searching products", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
