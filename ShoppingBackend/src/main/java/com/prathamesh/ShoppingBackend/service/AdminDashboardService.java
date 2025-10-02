package com.prathamesh.ShoppingBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.prathamesh.ShoppingBackend.repository.UserRepo;
import com.prathamesh.ShoppingBackend.repository.OrderRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.sql.Date;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardService.class);
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private OrderRepo orderRepo;
    
    @Autowired
    private ProductRepo productRepo;

    public Map<String, Object> getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get total users count
            long totalUsers = userRepo.count();
            
            // Get active users (users who placed orders in last 30 days)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            long activeUsers = orderRepo.countDistinctUsersSince(thirtyDaysAgo);
            
            // Get total orders
            long totalOrders = orderRepo.count();
            
            // Get total revenue
            Double totalRevenue = orderRepo.calculateTotalRevenue();
            if (totalRevenue == null) totalRevenue = 0.0;
            
            // Get new users in last 7 days
            Date sevenDaysAgo = Date.valueOf(LocalDateTime.now().minusDays(7).toLocalDate());
            long newUsers = userRepo.countUsersRegisteredAfter(sevenDaysAgo);
            
            // Get total products
            long totalProducts = productRepo.count();
            
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("totalOrders", totalOrders);
            stats.put("totalRevenue", totalRevenue);
            stats.put("newUsers", newUsers);
            stats.put("totalProducts", totalProducts);
            
            return stats;
        } catch (Exception e) {
            logger.error("Error getting admin stats", e);
            throw new RuntimeException("Failed to fetch admin statistics: " + e.getMessage());
        }
    }

    public Map<String, Object> getSalesData() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Map<String, Object>> dailySales = orderRepo.getDailySalesSince(thirtyDaysAgo);
            
            // Ensure all required fields are present and properly formatted
            List<Map<String, Object>> formattedSales = dailySales.stream()
                .map(sale -> {
                    Map<String, Object> formatted = new HashMap<>();
                    formatted.put("date", sale.get("date"));
                    formatted.put("orderCount", sale.get("orderCount") != null ? sale.get("orderCount") : 0);
                    formatted.put("revenue", sale.get("revenue") != null ? sale.get("revenue") : 0.0);
                    return formatted;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> salesData = new HashMap<>();
            salesData.put("dailySales", formattedSales);
            return salesData;
        } catch (Exception e) {
            logger.error("Error getting sales data", e);
            throw new RuntimeException("Failed to fetch sales data: " + e.getMessage());
        }
    }

    public Object getCategoryData() {
        try {
            List<Map<String, Object>> categoryData = productRepo.getProductCountByCategory();
            
            // Ensure all required fields are present and properly formatted
            return categoryData.stream()
                .map(cat -> {
                    Map<String, Object> formatted = new HashMap<>();
                    formatted.put("category", cat.get("category") != null ? cat.get("category") : "Uncategorized");
                    formatted.put("count", cat.get("count") != null ? cat.get("count") : 0);
                    return formatted;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error getting category data", e);
            throw new RuntimeException("Failed to fetch category data: " + e.getMessage());
        }
    }
} 