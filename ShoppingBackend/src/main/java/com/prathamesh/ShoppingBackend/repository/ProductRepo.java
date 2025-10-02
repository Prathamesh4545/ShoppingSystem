package com.prathamesh.ShoppingBackend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Orders;
import com.prathamesh.ShoppingBackend.model.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.productName) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :searchQuery, '%'))")
    List<Product> searchProduct(@Param("searchQuery") String searchQuery);

    List<Product> findByProductNameContainingOrDescContaining(String searchQuery, String searchQuery2);

    Optional<Product> findByProductName(String productName);

    @Query("SELECT NEW map(p.category as category, COUNT(p) as count) " +
            "FROM Product p GROUP BY p.category")
    List<Map<String, Object>> getProductCountByCategory();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.releaseDate BETWEEN :start AND :end")
    long countByReleaseDateBetween(@Param("start") Date start, @Param("end") Date end);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.releaseDate < :date")
    long countByReleaseDateBefore(@Param("date") Date date);

    @Query("SELECT NEW map(p.category as category, SUM(p.quantity) as totalQuantity) " +
            "FROM Product p GROUP BY p.category")
    List<Map<String, Object>> getTotalQuantityByCategory();

    @Query("SELECT NEW map(p.category as category, COUNT(p) as count, SUM(p.quantity) as totalQuantity) " +
            "FROM Product p WHERE p.available = true GROUP BY p.category")
    List<Map<String, Object>> getAvailableProductsByCategory();

    List<Product> findByCategory(String category);
    
    @Query("SELECT NEW map(p.category as category, COUNT(p) as totalProducts, " +
           "SUM(p.quantity) as totalQuantity, AVG(p.price) as avgPrice) " +
           "FROM Product p " +
           "GROUP BY p.category")
    List<Map<String, Object>> getProductStatsByCategory();
    
    @Query("SELECT NEW map(p.category as category, COUNT(p) as productCount) " +
           "FROM Product p " +
           "WHERE p.quantity = 0 " +
           "GROUP BY p.category")
    List<Map<String, Object>> getOutOfStockProductsByCategory();
    
    @Query("SELECT NEW map(p.category as category, COUNT(p) as productCount) " +
           "FROM Product p " +
           "WHERE p.quantity < :threshold " +
           "GROUP BY p.category")
    List<Map<String, Object>> getLowStockProductsByCategory(@Param("threshold") int threshold);
    
    @Query("SELECT NEW map(p.category as category, AVG(p.price) as avgPrice) " +
           "FROM Product p " +
           "GROUP BY p.category")
    List<Map<String, Object>> getAveragePriceByCategory();
    
    @Query("SELECT NEW map(p.category as category, COUNT(p) as productCount, " +
           "SUM(p.quantity) as totalQuantity, SUM(p.quantity * p.price) as totalValue) " +
           "FROM Product p " +
           "GROUP BY p.category")
    List<Map<String, Object>> getInventoryValueByCategory();

    @Query("SELECT p FROM Product p WHERE p.quantity < :threshold")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

}