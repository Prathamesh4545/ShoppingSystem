package com.prathamesh.ShoppingBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.prathamesh.ShoppingBackend.repository.OrderRepo;
import com.prathamesh.ShoppingBackend.model.Orders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class RevenueTrackingService {
    
    private static final Logger logger = LoggerFactory.getLogger(RevenueTrackingService.class);
    
    @Autowired
    private OrderRepo orderRepo;
    
    /**
     * Get comprehensive revenue breakdown
     */
    public Map<String, Object> getRevenueBreakdown() {
        Map<String, Object> breakdown = new HashMap<>();
        
        try {
            // Active revenue (non-cancelled orders)
            double activeRevenue = orderRepo.calculateTotalRevenue();
            
            // Cancelled revenue
            double cancelledRevenue = orderRepo.calculateCancelledRevenue();
            
            // Gross revenue (total of all orders)
            double grossRevenue = activeRevenue + cancelledRevenue;
            
            // Revenue by status
            Map<String, Double> revenueByStatus = getRevenueByStatus();
            
            breakdown.put("activeRevenue", activeRevenue);
            breakdown.put("cancelledRevenue", cancelledRevenue);
            breakdown.put("grossRevenue", grossRevenue);
            breakdown.put("revenueByStatus", revenueByStatus);
            breakdown.put("lastUpdated", LocalDateTime.now());
            
            logger.info("Revenue breakdown calculated - Active: ₹{}, Cancelled: ₹{}, Gross: ₹{}", 
                       activeRevenue, cancelledRevenue, grossRevenue);
            
        } catch (Exception e) {
            logger.error("Error calculating revenue breakdown", e);
            throw new RuntimeException("Failed to calculate revenue breakdown: " + e.getMessage());
        }
        
        return breakdown;
    }
    
    /**
     * Get revenue breakdown by order status
     */
    private Map<String, Double> getRevenueByStatus() {
        Map<String, Double> revenueByStatus = new HashMap<>();
        
        for (Orders.OrderStatus status : Orders.OrderStatus.values()) {
            try {
                Double revenue = orderRepo.calculateRevenueByStatus(status.name());
                revenueByStatus.put(status.name(), revenue != null ? revenue : 0.0);
            } catch (Exception e) {
                logger.warn("Error calculating revenue for status {}: {}", status, e.getMessage());
                revenueByStatus.put(status.name(), 0.0);
            }
        }
        
        return revenueByStatus;
    }
    
    /**
     * Calculate revenue impact of status change
     */
    public Map<String, Object> calculateStatusChangeImpact(Long orderId, String oldStatus, String newStatus) {
        Map<String, Object> impact = new HashMap<>();
        
        try {
            Orders order = orderRepo.findById(orderId).orElse(null);
            if (order == null) {
                throw new RuntimeException("Order not found");
            }
            
            BigDecimal orderAmount = order.getTotalAmount();
            boolean wasRevenueCounted = !oldStatus.equals("CANCELLED");
            boolean willBeRevenueCounted = !newStatus.equals("CANCELLED");
            
            double revenueImpact = 0.0;
            String impactType = "NO_CHANGE";
            
            if (wasRevenueCounted && !willBeRevenueCounted) {
                // Order being cancelled - negative impact
                revenueImpact = -orderAmount.doubleValue();
                impactType = "REVENUE_DECREASE";
            } else if (!wasRevenueCounted && willBeRevenueCounted) {
                // Order being reactivated - positive impact
                revenueImpact = orderAmount.doubleValue();
                impactType = "REVENUE_INCREASE";
            }
            
            impact.put("orderId", orderId);
            impact.put("orderAmount", orderAmount.doubleValue());
            impact.put("oldStatus", oldStatus);
            impact.put("newStatus", newStatus);
            impact.put("revenueImpact", revenueImpact);
            impact.put("impactType", impactType);
            impact.put("timestamp", LocalDateTime.now());
            
            logger.info("Status change impact calculated for order {}: {} (₹{})", 
                       orderId, impactType, Math.abs(revenueImpact));
            
        } catch (Exception e) {
            logger.error("Error calculating status change impact for order {}", orderId, e);
            throw new RuntimeException("Failed to calculate impact: " + e.getMessage());
        }
        
        return impact;
    }
}