package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.ShippingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingConfigRepo extends JpaRepository<ShippingConfig, Integer> {
}
