package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Address;
import com.prathamesh.ShoppingBackend.model.Orders;
import com.prathamesh.ShoppingBackend.model.User;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepo extends JpaRepository<Address, Long> {

    void deleteByOrders(Orders orders);

    List<Address> findByOrders(Orders existingOrder);

    List<Address> findByUser(User user);

    @Query("SELECT a FROM Address a WHERE a.user.id = :userId")
    List<Address> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT NEW map(a.city as city, COUNT(a) as addressCount) " +
           "FROM Address a " +
           "GROUP BY a.city " +
           "ORDER BY addressCount DESC")
    List<Map<String, Object>> getAddressCountByCity();
    
    @Query("SELECT NEW map(a.state as state, COUNT(a) as addressCount) " +
           "FROM Address a " +
           "GROUP BY a.state " +
           "ORDER BY addressCount DESC")
    List<Map<String, Object>> getAddressCountByState();
    
    @Query("SELECT NEW map(a.country as country, COUNT(a) as addressCount) " +
           "FROM Address a " +
           "GROUP BY a.country " +
           "ORDER BY addressCount DESC")
    List<Map<String, Object>> getAddressCountByCountry();
    
    @Query("SELECT NEW map(a.type as type, COUNT(a) as addressCount) " +
           "FROM Address a " +
           "GROUP BY a.type")
    List<Map<String, Object>> getAddressCountByType();
}