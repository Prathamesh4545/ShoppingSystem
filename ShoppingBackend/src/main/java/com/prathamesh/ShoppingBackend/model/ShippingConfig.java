package com.prathamesh.ShoppingBackend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class ShippingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private BigDecimal standardShippingFee;
    private BigDecimal expressShippingFee;
    private BigDecimal freeShippingThreshold;
    private Integer standardDeliveryDays;
    private Integer expressDeliveryDays;
    private Boolean freeShippingEnabled;

    public ShippingConfig() {}

    public ShippingConfig(int id, BigDecimal standardShippingFee, BigDecimal expressShippingFee, BigDecimal freeShippingThreshold, Integer standardDeliveryDays, Integer expressDeliveryDays, Boolean freeShippingEnabled) {
        this.id = id;
        this.standardShippingFee = standardShippingFee;
        this.expressShippingFee = expressShippingFee;
        this.freeShippingThreshold = freeShippingThreshold;
        this.standardDeliveryDays = standardDeliveryDays;
        this.expressDeliveryDays = expressDeliveryDays;
        this.freeShippingEnabled = freeShippingEnabled;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public BigDecimal getStandardShippingFee() { return standardShippingFee; }
    public void setStandardShippingFee(BigDecimal standardShippingFee) { this.standardShippingFee = standardShippingFee; }

    public BigDecimal getExpressShippingFee() { return expressShippingFee; }
    public void setExpressShippingFee(BigDecimal expressShippingFee) { this.expressShippingFee = expressShippingFee; }

    public BigDecimal getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }

    public Integer getStandardDeliveryDays() { return standardDeliveryDays; }
    public void setStandardDeliveryDays(Integer standardDeliveryDays) { this.standardDeliveryDays = standardDeliveryDays; }

    public Integer getExpressDeliveryDays() { return expressDeliveryDays; }
    public void setExpressDeliveryDays(Integer expressDeliveryDays) { this.expressDeliveryDays = expressDeliveryDays; }

    public Boolean getFreeShippingEnabled() { return freeShippingEnabled; }
    public void setFreeShippingEnabled(Boolean freeShippingEnabled) { this.freeShippingEnabled = freeShippingEnabled; }
}
