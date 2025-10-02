package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalyticsData() {
        return ResponseEntity.ok(analyticsService.getAnalyticsData());
    }
} 