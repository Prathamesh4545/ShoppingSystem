package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.repository.DealsRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Slf4j
public class DealsService {

    private final DealsRepo dealsRepo;
    private final ProductRepo productRepo;

    public DealsService(DealsRepo dealsRepo, ProductRepo productRepo) {
        this.dealsRepo = dealsRepo;
        this.productRepo = productRepo;
    }

    @Cacheable("deals")
    public List<Deals> getAllDeals() {
        return dealsRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Deals getDealById(int id) {
        return dealsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Deal not found with id: " + id));
    }

    @Cacheable("activeDeals")
    public List<Deals> getActiveDeals() {
        LocalDate now = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        return dealsRepo.findActiveDeals(now, currentTime);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByDealId(int id) {
        Deals deal = getDealById(id);
        return deal.getProducts();
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public Deals saveDeal(Deals deal) {
        log.info("Saving deal: {}", deal);
        validateDeal(deal);

        // Fetch products by their IDs and validate
        List<Integer> productIds = deal.getProducts().stream().map(Product::getId).toList();
        log.info("Product IDs: {}", productIds);
        List<Product> products = productRepo.findAllById(productIds);
        log.info("Found products: {}", products);

        if (products.size() != deal.getProducts().size()) {
            throw new IllegalArgumentException("Invalid product IDs provided.");
        }
        deal.setProducts(products);
        deal.setActive(deal.isActive());

        return dealsRepo.save(deal);
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public Deals updateDeal(int id, Deals updatedDeal) {
        validateDeal(updatedDeal);
        Deals existingDeal = getDealById(id);

        // Fetch products by their IDs and validate
        List<Product> products = productRepo
                .findAllById(updatedDeal.getProducts().stream().map(Product::getId).toList());
        if (products.size() != updatedDeal.getProducts().size()) {
            throw new IllegalArgumentException("Invalid product IDs provided.");
        }
        existingDeal.setProducts(products);

        // Update all fields
        existingDeal.setTitle(updatedDeal.getTitle());
        existingDeal.setDescription(updatedDeal.getDescription());
        existingDeal.setDiscountPercentage(updatedDeal.getDiscountPercentage());
        existingDeal.setImageUrl(updatedDeal.getImageUrl());
        existingDeal.setStartDate(updatedDeal.getStartDate());
        existingDeal.setEndDate(updatedDeal.getEndDate());
        existingDeal.setStartTime(updatedDeal.getStartTime());
        existingDeal.setEndTime(updatedDeal.getEndTime());
        existingDeal.setActive(updatedDeal.isActive());

        return dealsRepo.save(existingDeal);
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public void deleteDeal(int id) {
        if (!dealsRepo.existsById(id)) {
            throw new RuntimeException("Deal not found with id: " + id);
        }
        dealsRepo.deleteById(id);
    }

    private void validateDeal(Deals deal) {
        Assert.notNull(deal, "Deal cannot be null");
        Assert.hasText(deal.getTitle(), "Title cannot be empty");

        // Validate start date is before or equal to end date
        Assert.isTrue(deal.getStartDate().isBefore(deal.getEndDate()) ||
                deal.getStartDate().isEqual(deal.getEndDate()),
                "Start date must be before or equal to end date");

        // Validate start time is before end time if the dates are the same
        if (deal.getStartDate().isEqual(deal.getEndDate())) {
            Assert.isTrue(deal.getStartTime().isBefore(deal.getEndTime()),
                    "Start time must be before end time on the same day");
        }
    }
}