package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Exception.DealNotFoundException;
import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.service.DealsService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/deals")
public class DealsController {

    private final DealsService dealsService;

    public DealsController(DealsService dealsService) {
        this.dealsService = dealsService;
    }

    @GetMapping
    public ResponseEntity<List<Deals>> getAllDeals() {
        return ResponseEntity.ok(dealsService.getAllDeals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deals> getDealById(@PathVariable int id) {
        return ResponseEntity.ok(dealsService.getDealById(id));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Deals>> getActiveDeals() {
        return ResponseEntity.ok(dealsService.getActiveDeals());
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getProductsByDealId(@PathVariable int id) {
        return ResponseEntity.ok(dealsService.getProductsByDealId(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Deals> createDeal(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal discountPercentage,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam boolean isActive,
            @RequestParam List<Integer> productIds,
            @RequestParam(required = false) MultipartFile image) throws IOException {

        Deals deal = new Deals();
        deal.setTitle(title);
        deal.setDescription(description);
        deal.setDiscountPercentage(discountPercentage);
        deal.setStartDate(startDate);
        deal.setEndDate(endDate);
        deal.setStartTime(LocalTime.parse(startTime));
        deal.setEndTime(LocalTime.parse(endTime));
        deal.setActive(isActive);

        if (image != null) {
            deal.setImageData(image.getBytes());
            deal.setImageType(image.getContentType());
        }

        // Set products
        List<Product> products = productIds.stream()
                .map(productId -> {
                    Product product = new Product();
                    product.setId(productId);
                    return product;
                })
                .collect(Collectors.toList());
        deal.setProducts(products);

        return ResponseEntity.status(HttpStatus.CREATED).body(dealsService.saveDeal(deal));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Deals> updateDeal(
        @PathVariable int id,
        @RequestParam String title,
        @RequestParam String description,
        @RequestParam BigDecimal discountPercentage,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam String startTime,
        @RequestParam String endTime,
        @RequestParam boolean isActive,
        @RequestParam List<Integer> productIds,
        @RequestParam(required = false) MultipartFile image) throws IOException {
        
        Deals updatedDeal = new Deals();
        updatedDeal.setId(id);
        updatedDeal.setTitle(title);
        updatedDeal.setDescription(description);
        updatedDeal.setDiscountPercentage(discountPercentage);
        updatedDeal.setStartDate(startDate);
        updatedDeal.setEndDate(endDate);
        updatedDeal.setStartTime(LocalTime.parse(startTime));
        updatedDeal.setEndTime(LocalTime.parse(endTime));
        updatedDeal.setActive(isActive);
    
        if (image != null) {
            updatedDeal.setImageData(image.getBytes());
            updatedDeal.setImageType(image.getContentType());
        }
    
        // Set products
        List<Product> products = productIds.stream()
            .map(productId -> {
                Product product = new Product();
                product.setId(productId);
                return product;
            })
            .collect(Collectors.toList());
        updatedDeal.setProducts(products);
    
        return ResponseEntity.ok(dealsService.updateDeal(id, updatedDeal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable int id) {
        dealsService.deleteDeal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/update-expired")
    public ResponseEntity<Void> updateExpiredDeals() {
        dealsService.updateExpiredDeals();
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Deals> toggleDealStatus(@PathVariable int id, @RequestParam boolean isActive) {
        Deals deal = dealsService.getDealById(id);
        deal.setActive(isActive);
        return ResponseEntity.ok(dealsService.updateDeal(id, deal));
    }

    @ExceptionHandler(DealNotFoundException.class)
    public ResponseEntity<String> handleDealNotFoundException(DealNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}