package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Exception.DealNotFoundException;
import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.service.DealsService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<Deals> createDeal(@Valid @RequestBody Deals deal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dealsService.saveDeal(deal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deals> updateDeal(@PathVariable int id, @Valid @RequestBody Deals updatedDeal) {
        return ResponseEntity.ok(dealsService.updateDeal(id, updatedDeal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable int id) {
        dealsService.deleteDeal(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(DealNotFoundException.class)
    public ResponseEntity<String> handleDealNotFoundException(DealNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}