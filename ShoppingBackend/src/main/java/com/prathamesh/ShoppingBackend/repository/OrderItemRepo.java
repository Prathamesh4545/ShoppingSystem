package com.prathamesh.ShoppingBackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prathamesh.ShoppingBackend.model.OrderItem;
import com.prathamesh.ShoppingBackend.model.Orders;

public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long id);

    void deleteByOrder(Orders order);


}
