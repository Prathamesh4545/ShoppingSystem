package com.prathamesh.ShoppingBackend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.prathamesh.ShoppingBackend.model.CartItem;
import com.prathamesh.ShoppingBackend.model.Cart;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
       Optional<CartItem> findByCartIdAndProductId(Long cartId, int productId);

       void deleteByProductId(int productId);

       List<CartItem> findByCart(Cart cart);

       @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId")
       List<CartItem> findByCartId(@Param("cartId") Long cartId);

       @Query("SELECT NEW map(p.category as category, SUM(ci.quantity) as totalQuantity) " +
                     "FROM CartItem ci " +
                     "JOIN ci.product p " +
                     "GROUP BY p.category")
       List<Map<String, Object>> getMostAddedProducts();

       @Query("SELECT NEW map(p.category as category, SUM(ci.quantity) as totalQuantity) " +
                     "FROM CartItem ci, Product p " +
                     "WHERE ci.product.id = p.id " +
                     "GROUP BY p.category")
       List<Map<String, Object>> getCartItemsQuantityByCategory();

       @Query("SELECT NEW map(p.id as productId, COUNT(DISTINCT ci.cart.id) as cartCount) " +
                     "FROM CartItem ci JOIN ci.product p " +
                     "GROUP BY p.id " +
                     "ORDER BY cartCount DESC")
       List<Map<String, Object>> getProductCartFrequency();
}
