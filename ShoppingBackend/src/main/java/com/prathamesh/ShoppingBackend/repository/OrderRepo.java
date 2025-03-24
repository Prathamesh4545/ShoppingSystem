package com.prathamesh.ShoppingBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.Orders;
import java.util.List;


@Repository
public interface OrderRepo extends JpaRepository<Orders,Long>{
    List<Orders> findByUserId(Long userId);
}
