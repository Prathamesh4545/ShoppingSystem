package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.service.DealsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/deals")
@Slf4j
public class DealsController {

    private final DealsService dealsService;

    public DealsController(DealsService dealsService) {
        this.dealsService = dealsService;
    }

    @GetMapping
    @Cacheable("deals")
    public ResponseEntity<List<Deals>> getAllDeals() {
        try {
            List<Deals> deals = dealsService.getAllDeals();
            return ResponseEntity.ok(deals);
        } catch (Exception e) {
            log.error("Error fetching all deals: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/active")
    @Cacheable("activeDeals")
    public ResponseEntity<List<Deals>> getActiveDeals() {
        try {
            List<Deals> activeDeals = dealsService.getActiveDeals();
            return ResponseEntity.ok(activeDeals);
        } catch (Exception e) {
            log.error("Error fetching active deals: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deals> getDealById(@PathVariable int id) {
        try {
            Deals deal = dealsService.getDealById(id);
            return ResponseEntity.ok(deal);
        } catch (RuntimeException e) {
            log.error("Error fetching deal by ID: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getProductsByDealId(@PathVariable int id) {
        try {
            List<Product> products = dealsService.getProductsByDealId(id);
            return ResponseEntity.ok(products);
        } catch (RuntimeException e) {
            log.error("Error fetching products for deal ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<Deals> createDeal(@Validated @RequestBody Deals dealDTO) {
        try {
            Deals createdDeal = dealsService.saveDeal(dealDTO);
            return new ResponseEntity<>(createdDeal, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating deal: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deals> updateDeal(@PathVariable int id, @Validated @RequestBody Deals updatedDealDTO) {
        try {
            Deals updatedDeal = dealsService.updateDeal(id, updatedDealDTO);
            return ResponseEntity.ok(updatedDeal);
        } catch (RuntimeException e) {
            log.error("Error updating deal: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable int id) {
        try {
            dealsService.deleteDeal(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting deal: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}