package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Dto.*;
import com.prathamesh.ShoppingBackend.service.*;
import com.prathamesh.ShoppingBackend.Exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

import io.jsonwebtoken.MalformedJwtException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private JWTService jwtService;
    @Autowired
    private UserDetailsService userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<OrderDTO> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders.isEmpty() ? "No orders found." : orders);
        } catch (Exception e) {
            logger.error("Error fetching all orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch orders. Please try again later.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.validateToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (RuntimeException e) {
            logger.error("Order not found with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching order with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByUserId(Long.parseLong(userId)));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            logger.error("Error fetching orders for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch user orders");
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest orderRequest,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            token = token.replace("Bearer ", "").trim();
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.validateToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (orderRequest.getAddressId() == null) {
                return ResponseEntity.badRequest().body("Shipping address is required");
            }

            return ResponseEntity.ok(orderService.createOrder(orderRequest));
        } catch (MalformedJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            logger.error("Error creating order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create order: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status cannot be empty");
            }
            return ResponseEntity.ok(orderService.updateOrderStatus(orderId, newStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating order status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update order status");
        }
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatusPut(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status cannot be empty");
            }
            return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating order status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update order status");
        }
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatusPatch(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        return updateOrderStatusPut(orderId, request);
    }

    @GetMapping("/user/{userId}/status-counts")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getOrderCountsByStatusForUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(orderService.getOrderCountByStatusForUser(Long.parseLong(userId)));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error getting order counts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get order counts");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.validateToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            orderService.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete order");
        }
    }

    @GetMapping("/{orderId}/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getOrderByIdWithUserVerification(
            @PathVariable Long orderId,
            @PathVariable Long userId,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            token = token.replace("Bearer ", "").trim();
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.validateToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
            }
            
            if (!order.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied to this order");
            }

            return ResponseEntity.ok(order);
        } catch (MalformedJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch order");
        }
    }

    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            token = token.replace("Bearer ", "").trim();
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.validateToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            return ResponseEntity.ok(orderService.cancelOrder(orderId));
        } catch (MalformedJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error cancelling order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to cancel order");
        }
    }
}