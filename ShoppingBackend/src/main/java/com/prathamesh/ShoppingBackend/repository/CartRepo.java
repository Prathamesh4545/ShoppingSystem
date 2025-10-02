package com.prathamesh.ShoppingBackend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Cart;
import com.prathamesh.ShoppingBackend.model.User;

@Repository
public interface CartRepo extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT NEW map(c.user.id as userId, COUNT(ci) as itemCount, " +
           "SUM(ci.quantity * ci.product.price) as totalAmount) " +
           "FROM Cart c " +
           "LEFT JOIN CartItem ci ON ci.cart = c " +
           "LEFT JOIN ci.product p " +
           "GROUP BY c.user.id")
    List<Map<String, Object>> getCartAnalytics();
    
    @Query("SELECT NEW map(p.category as category, COUNT(ci) as itemCount) " +
           "FROM Cart c " +
           "LEFT JOIN CartItem ci ON ci.cart = c " +
           "LEFT JOIN ci.product p " +
           "GROUP BY p.category")
    List<Map<String, Object>> getCartItemsByCategory();
}