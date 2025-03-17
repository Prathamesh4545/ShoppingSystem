package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Deals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DealsRepo extends JpaRepository<Deals, Integer> {
    List<Deals> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate startDate, LocalDate endDate);
}