package com.prathamesh.ShoppingBackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.prathamesh.ShoppingBackend.service.AdminDashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminDashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = dashboardService.getStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching admin stats", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch admin statistics",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSalesData() {
        try {
            Map<String, Object> salesData = dashboardService.getSalesData();
            return ResponseEntity.ok(salesData);
        } catch (Exception e) {
            logger.error("Error fetching sales data", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch sales data",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCategoryData() {
        try {
            Object categoryData = dashboardService.getCategoryData();
            return ResponseEntity.ok(categoryData);
        } catch (Exception e) {
            logger.error("Error fetching category data", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch category data",
                "message", e.getMessage()
            ));
        }
    }
} 