package com.prathamesh.ShoppingBackend.repository;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.OrderItem;
import com.prathamesh.ShoppingBackend.model.Orders;

@Repository 
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long id);

    void deleteByOrder(Orders order);

    @Query("SELECT NEW map(oi.productId as productId, SUM(oi.quantity) as totalQuantity, " +
           "SUM(oi.price * oi.quantity) as totalRevenue) " +
           "FROM OrderItem oi " +
           "GROUP BY oi.productId " +
           "ORDER BY totalQuantity DESC")
    List<Map<String, Object>> getTopSellingProducts();

    @Query("SELECT NEW map(p.category as category, SUM(oi.quantity) as totalQuantity, " +
           "SUM(oi.price * oi.quantity) as totalRevenue) " +
           "FROM OrderItem oi " +
           "JOIN Product p ON oi.productId = p.id " +
           "WHERE p IS NOT NULL " +
           "GROUP BY p.category")
    List<Map<String, Object>> getSalesByCategory();

    @Query("SELECT NEW map(oi.productId as productId, COUNT(DISTINCT oi.order.id) as orderCount) " +
           "FROM OrderItem oi " +
           "GROUP BY oi.productId " +
           "ORDER BY orderCount DESC")
    List<Map<String, Object>> getProductOrderFrequency();
}