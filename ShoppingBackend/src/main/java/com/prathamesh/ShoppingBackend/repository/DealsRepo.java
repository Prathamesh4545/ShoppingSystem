package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Deals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DealsRepo extends JpaRepository<Deals, Integer> {

    @Query("SELECT d FROM Deals d WHERE d.isActive = true " +
            "AND ((" +
            "  (d.startDate < :currentDate AND d.endDate > :currentDate) " +
            "  OR (d.startDate = :currentDate AND d.startTime <= :currentTime) " +
            "  OR (d.endDate = :currentDate AND d.endTime >= :currentTime)" +
            "))")
    List<Deals> findActiveDeals(@Param("currentDate") LocalDate currentDate,
                                @Param("currentTime") LocalTime currentTime);

    Optional<Deals> findById(int id);
    
    @Query("SELECT DISTINCT d FROM Deals d LEFT JOIN FETCH d.products p WHERE p.id = :productId " +
            "AND d.isActive = true AND d.endDate >= :currentDate")
    List<Deals> findActiveDealsForProduct(@Param("productId") int productId, 
                                          @Param("currentDate") java.util.Date currentDate);
}