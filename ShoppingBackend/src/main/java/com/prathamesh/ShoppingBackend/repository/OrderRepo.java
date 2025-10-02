package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface OrderRepo extends JpaRepository<Orders, Long> {
    
    @Query("SELECT COUNT(DISTINCT o.userId) FROM Orders o WHERE o.createdAt >= :date")
    long countDistinctUsersSince(@Param("date") LocalDateTime date);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Orders o")
    double calculateTotalRevenue();
    
    @Query("SELECT NEW map(CAST(o.createdAt as date) as date, " +
           "COUNT(o) as orderCount, " +
           "COALESCE(SUM(o.totalAmount), 0.0) as revenue) " +
           "FROM Orders o " +
           "WHERE o.createdAt >= :date " +
           "GROUP BY CAST(o.createdAt as date) " +
           "ORDER BY date ASC")
    List<Map<String, Object>> getDailySalesSince(@Param("date") LocalDateTime date);

    List<Orders> findByUserId(Long userId);

    @Query("SELECT COUNT(o) FROM Orders o WHERE o.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Orders o WHERE o.createdAt < :date")
    long countByCreatedAtBefore(@Param("date") LocalDateTime date);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Orders o WHERE o.createdAt BETWEEN :start AND :end")
    double findTotalAmountByOrderDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Orders o WHERE o.createdAt < :date")
    double findTotalAmountByOrderDateBefore(@Param("date") LocalDateTime date);

    @Query("SELECT NEW map(o.status as status, COUNT(o) as count) " +
           "FROM Orders o " +
           "WHERE o.userId = :userId " +
           "GROUP BY o.status")
    List<Map<String, Object>> getOrderCountByStatus(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Orders o WHERE o.status = 'CANCELLED'")
    double calculateCancelledRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Orders o WHERE o.status = :status")
    Double calculateRevenueByStatus(@Param("status") String status);
}