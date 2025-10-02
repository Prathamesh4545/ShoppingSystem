package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.model.*;
import com.prathamesh.ShoppingBackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.sql.Date;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final int DEFAULT_TOP_PRODUCTS_LIMIT = 5;
    private static final int DEFAULT_SALES_MONTHS_RANGE = 6;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    public Map<String, Object> getAnalyticsData() {
        Map<String, Object> analytics = new LinkedHashMap<>(); // Maintain insertion order
        
        // Get current and previous month dates
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime previousMonthStart = currentMonthStart.minusMonths(1);

        // Convert LocalDateTime to Date
        Date currentMonthStartDate = java.sql.Date.valueOf(currentMonthStart.toLocalDate());
        Date previousMonthStartDate = java.sql.Date.valueOf(previousMonthStart.toLocalDate());

        // Calculate stats
        long totalUsers = userRepo.count();
        long totalOrders = orderRepo.count();
        BigDecimal totalRevenue = BigDecimal.valueOf(orderRepo.calculateTotalRevenue());
        long totalProducts = productRepo.count();

        // Calculate growth percentages
        double userGrowth = calculateGrowthPercentage(
            userRepo.countByCreatedAtBetween(previousMonthStartDate, currentMonthStartDate),
            userRepo.countByCreatedAtBefore(previousMonthStartDate)
        );
        
        double orderGrowth = calculateGrowthPercentage(
            orderRepo.countByCreatedAtBetween(previousMonthStart, currentMonthStart),
            orderRepo.countByCreatedAtBefore(previousMonthStart)
        );
        
        double revenueGrowth = calculateGrowthPercentage(
            orderRepo.findTotalAmountByOrderDateBetween(previousMonthStart, currentMonthStart),
            orderRepo.findTotalAmountByOrderDateBefore(previousMonthStart)
        );
        
        double productGrowth = calculateGrowthPercentage(
            productRepo.countByReleaseDateBetween(previousMonthStartDate, currentMonthStartDate),
            productRepo.countByReleaseDateBefore(previousMonthStartDate)
        );

        // Get sales data for the last N months
        List<Map<String, Object>> salesData = getSalesDataForLastMonths(DEFAULT_SALES_MONTHS_RANGE);

        // Get category distribution
        Map<String, Double> categoryData = getCategoryDistribution();

        // Get top selling products
        List<Map<String, Object>> topProducts = getTopSellingProducts(DEFAULT_TOP_PRODUCTS_LIMIT);

        // Build response
        analytics.put("stats", Map.of(
            "totalUsers", totalUsers,
            "totalOrders", totalOrders,
            "totalRevenue", totalRevenue,
            "totalProducts", totalProducts,
            "userGrowth", roundToTwoDecimals(userGrowth),
            "orderGrowth", roundToTwoDecimals(orderGrowth),
            "revenueGrowth", roundToTwoDecimals(revenueGrowth),
            "productGrowth", roundToTwoDecimals(productGrowth)
        ));

        analytics.put("salesData", Map.of(
            "labels", salesData.stream().map(data -> data.get("month")).collect(Collectors.toList()),
            "values", salesData.stream().map(data -> data.get("amount")).collect(Collectors.toList())
        ));

        analytics.put("categoryData", Map.of(
            "labels", categoryData.keySet(),
            "values", categoryData.values()
        ));

        analytics.put("topProducts", topProducts);

        return analytics;
    }

    private double calculateGrowthPercentage(double currentPeriodValue, double previousPeriodValue) {
        if (previousPeriodValue == 0) {
            return currentPeriodValue > 0 ? 100.0 : 0.0;
        }
        return ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) * 100;
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private List<Map<String, Object>> getSalesDataForLastMonths(int months) {
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> salesData = new ArrayList<>();
        
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            double amount = orderRepo.findTotalAmountByOrderDateBetween(monthStart, monthEnd);
            
            salesData.add(Map.of(
                "month", monthStart.getMonth().toString().substring(0, 3) + " " + monthStart.getYear(),
                "amount", roundToTwoDecimals(amount)
            ));
        }
        
        return salesData;
    }

    private Map<String, Double> getCategoryDistribution() {
        return orderItemRepo.getSalesByCategory().stream()
            .collect(Collectors.toMap(
                data -> (String) data.get("category"),
                data -> roundToTwoDecimals(((Number) data.get("totalRevenue")).doubleValue()),
                (existing, replacement) -> existing,
                LinkedHashMap::new // Maintain insertion order
            ));
    }

    private List<Map<String, Object>> getTopSellingProducts(int limit) {
        return orderItemRepo.getTopSellingProducts().stream()
            .limit(limit)
            .map(data -> {
                Map<String, Object> productMap = new LinkedHashMap<>();
                productMap.put("productId", data.get("productId"));
                productMap.put("totalQuantity", data.get("totalQuantity"));
                productMap.put("totalRevenue", roundToTwoDecimals(((Number) data.get("totalRevenue")).doubleValue()));
                return productMap;
            })
            .collect(Collectors.toList());
    }

    // Alternative implementation if you need more product details
    private List<Map<String, Object>> getTopSellingProductsWithDetails(int limit) {
        return orderItemRepo.getTopSellingProducts().stream()
            .limit(limit)
            .map(data -> {
                Long productId = (Long) data.get("productId");
                Optional<Product> productOpt = productRepo.findById(productId.intValue());
                
                Map<String, Object> productMap = new LinkedHashMap<>();
                productOpt.ifPresent(product -> {
                    productMap.put("name", product.getProductName());
                    productMap.put("category", product.getCategory());
                });
                productMap.put("productId", productId);
                productMap.put("sales", data.get("totalQuantity"));
                productMap.put("revenue", roundToTwoDecimals(((Number) data.get("totalRevenue")).doubleValue()));
                return productMap;
            })
            .collect(Collectors.toList());
    }
}