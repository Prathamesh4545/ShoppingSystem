package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.repository.DealsRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DealsService {

    private final DealsRepo dealsRepo;

    @Autowired
    public DealsService(DealsRepo dealsRepo) {
        this.dealsRepo = dealsRepo;
    }

    @Cacheable("deals")
    public List<Deals> getAllDeals() {
        return dealsRepo.findAll();
    }

    public Deals getDealById(int id) {
        return dealsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Deal not found with id: " + id));
    }

    @Cacheable("activeDeals")
    public List<Deals> getActiveDeals() {
        LocalDate now = LocalDate.now();
        return dealsRepo.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(now, now);
    }

    public List<Product> getProductsByDealId(int id) {
        Deals deal = getDealById(id); // Fetch the deal by ID
        return deal.getProducts(); // Return the products associated with the deal
    }

    @Transactional
    @CacheEvict(value = {"deals", "activeDeals"}, allEntries = true)
    public Deals saveDeal(Deals deal) {
        validateDeal(deal);
        return dealsRepo.save(deal);
    }

    @Transactional
    @CacheEvict(value = {"deals", "activeDeals"}, allEntries = true)
    public Deals updateDeal(int id, Deals updatedDeal) {
        validateDeal(updatedDeal);
        Deals existingDeal = getDealById(id);
        existingDeal.setTitle(updatedDeal.getTitle());
        existingDeal.setDescription(updatedDeal.getDescription());
        existingDeal.setDiscountPercentage(updatedDeal.getDiscountPercentage());
        existingDeal.setImageUrl(updatedDeal.getImageUrl());
        existingDeal.setStartDate(updatedDeal.getStartDate());
        existingDeal.setEndDate(updatedDeal.getEndDate());
        existingDeal.setProducts(updatedDeal.getProducts());

        return dealsRepo.save(existingDeal);
    }

    @Transactional
    @CacheEvict(value = {"deals", "activeDeals"}, allEntries = true)
    public void deleteDeal(int id) {
        if (!dealsRepo.existsById(id)) {
            throw new RuntimeException("Deal not found with id: " + id);
        }
        dealsRepo.deleteById(id);
    }

    private void validateDeal(Deals deal) {
        Assert.notNull(deal, "Deal cannot be null");
        Assert.hasText(deal.getTitle(), "Title cannot be empty");
        Assert.isTrue(deal.getStartDate().isBefore(deal.getEndDate()), "Start date must be before end date");
    }
}