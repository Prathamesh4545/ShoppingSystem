package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.model.ShippingConfig;
import com.prathamesh.ShoppingBackend.service.ShippingConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/shipping")
public class ShippingConfigController {

    private final ShippingConfigService shippingConfigService;

    public ShippingConfigController(ShippingConfigService shippingConfigService) {
        this.shippingConfigService = shippingConfigService;
    }

    @GetMapping("/config")
    public ResponseEntity<ShippingConfig> getShippingConfig() {
        return ResponseEntity.ok(shippingConfigService.getShippingConfig());
    }

    @PutMapping("/config")
    public ResponseEntity<ShippingConfig> updateShippingConfig(@RequestBody ShippingConfig config) {
        return ResponseEntity.ok(shippingConfigService.updateShippingConfig(config));
    }
}
