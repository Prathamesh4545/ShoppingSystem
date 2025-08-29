package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Exception.DealNotFoundException;
import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.repository.DealsRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
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
        log.debug("Fetching all deals");
        List<Deals> allDeals = dealsRepo.findAll();
        log.debug("Found {} deals", allDeals.size());
        return allDeals;
    }

    @Transactional(readOnly = true)
    public Deals getDealById(int id) {
        log.debug("Fetching deal by id: {}", id);
        return dealsRepo.findById(id)
                .orElseThrow(() -> new DealNotFoundException("Deal not found with id: " + id));
    }

    @Cacheable("activeDeals")
    public List<Deals> getActiveDeals() {
        log.debug("Fetching active deals");
        LocalDate now = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        return dealsRepo.findActiveDeals(now, currentTime);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByDealId(int id) {
        log.debug("Fetching products by deal id: {}", id);
        Deals deal = getDealById(id);
        return deal.getProducts();
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public Deals saveDeal(Deals deal) {
        log.info("Saving deal: {}", deal);
        validateDeal(deal);

        List<Product> managedProducts = productRepo
                .findAllById(deal.getProducts().stream().map(Product::getId).toList());

        if (managedProducts.size() != deal.getProducts().size()) {
            throw new IllegalArgumentException("Invalid product IDs provided.");
        }

        deal.setProducts(managedProducts);
        return dealsRepo.save(deal);
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public Deals updateDeal(int id, Deals updatedDeal) {
        log.info("Updating deal with id: {}", id);
        validateDeal(updatedDeal);

        List<Product> products = productRepo
                .findAllById(updatedDeal.getProducts().stream().map(Product::getId).toList());
        if (products.size() != updatedDeal.getProducts().size()) {
            throw new IllegalArgumentException("Invalid product IDs provided.");
        }
        updatedDeal.setProducts(products);

        return dealsRepo.save(updatedDeal);
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public Deals updateDealStatus(int id, boolean isActive) {
        log.info("Updating deal status with id: {} to {}", id, isActive);
        Deals deal = getDealById(id);
        deal.setActive(isActive);
        return dealsRepo.save(deal);
    }

    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public void deleteDeal(int id) {
        log.info("Deleting deal with id: {}", id);
        Deals deal = dealsRepo.findById(id)
                .orElseThrow(() -> new DealNotFoundException("Deal not found with id: " + id));
        dealsRepo.delete(deal);
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional
    @CacheEvict(value = { "deals", "activeDeals" }, allEntries = true)
    public void updateExpiredDeals() {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        List<Deals> expiredDeals = dealsRepo.findExpiredActiveDeals(currentDate);
        expiredDeals.addAll(dealsRepo.findExpiredActiveDealsByTime(currentDate, currentTime));
        
        if (!expiredDeals.isEmpty()) {
            expiredDeals.forEach(deal -> deal.setActive(false));
            dealsRepo.saveAll(expiredDeals);
            log.info("Auto-deactivated {} expired deals", expiredDeals.size());
        }
    }

    public static void validateDeal(Deals deal) {
        Assert.notNull(deal, "Deal cannot be null");
        Assert.hasText(deal.getTitle(), "Title cannot be empty");
        Assert.hasText(deal.getDescription(), "Description cannot be empty");
        Assert.notNull(deal.getDiscountPercentage(), "Discount percentage cannot be null");
        Assert.isTrue(deal.getDiscountPercentage().compareTo(BigDecimal.ZERO) >= 0 && 
                     deal.getDiscountPercentage().compareTo(BigDecimal.valueOf(100)) <= 0,
                     "Discount percentage must be between 0 and 100");
        Assert.notNull(deal.getStartDate(), "Start date cannot be null");
        Assert.notNull(deal.getEndDate(), "End date cannot be null");
        Assert.notNull(deal.getStartTime(), "Start time cannot be null");
        Assert.notNull(deal.getEndTime(), "End time cannot be null");
        Assert.isTrue(deal.getStartDate().isBefore(deal.getEndDate()) ||
                deal.getStartDate().isEqual(deal.getEndDate()),
                "Start date must be before or equal to end date");
        if (deal.getStartDate().isEqual(deal.getEndDate())) {
            Assert.isTrue(deal.getStartTime().isBefore(deal.getEndTime()),
                    "Start time must be before end time on the same day");
        }
        // Skip product validation here as it's handled in controller
    }
}