package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepo extends JpaRepository<Orders, Long> {
    List<Orders> findByUserId(Long userId);
}