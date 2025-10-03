package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.model.ShippingConfig;
import com.prathamesh.ShoppingBackend.repository.ShippingConfigRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class ShippingConfigService {

    private final ShippingConfigRepo shippingConfigRepo;

    public ShippingConfigService(ShippingConfigRepo shippingConfigRepo) {
        this.shippingConfigRepo = shippingConfigRepo;
    }

    public ShippingConfig getShippingConfig() {
        return shippingConfigRepo.findAll().stream().findFirst()
                .orElseGet(() -> createDefaultConfig());
    }

    public ShippingConfig updateShippingConfig(ShippingConfig config) {
        ShippingConfig existing = getShippingConfig();
        config.setId(existing.getId());
        return shippingConfigRepo.save(config);
    }

    private ShippingConfig createDefaultConfig() {
        ShippingConfig config = new ShippingConfig();
        config.setStandardShippingFee(new BigDecimal("50.00"));
        config.setExpressShippingFee(new BigDecimal("150.00"));
        config.setFreeShippingThreshold(new BigDecimal("500.00"));
        config.setStandardDeliveryDays(5);
        config.setExpressDeliveryDays(2);
        config.setFreeShippingEnabled(true);
        return shippingConfigRepo.save(config);
    }
}
