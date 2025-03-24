package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Dto.OrderDTO;
import com.prathamesh.ShoppingBackend.Dto.OrderRequest;
import com.prathamesh.ShoppingBackend.service.OrderService;

import io.jsonwebtoken.MalformedJwtException;

import com.prathamesh.ShoppingBackend.service.JWTService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JWTService jwtService; // For token validation

    @Autowired
    private UserDetailsService userDetailsService; // To fetch UserDetails for token validation

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    // Get all orders
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        try {
            // Fetch all orders
            List<OrderDTO> orders = orderService.getAllOrders();

            if (orders.isEmpty()) {
                return ResponseEntity.ok("No orders found.");
            }

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error fetching all orders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch orders. Please try again later.");
        }
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            // Extract username from token
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate token
            if (!jwtService.validateToken(token, userDetails)) {
                logger.warn("Unauthorized access attempt to fetch order by ID: {}", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            OrderDTO order = orderService.getOrderById(id);
            logger.info("Fetched order successfully with ID: {}", id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            logger.error("Failed to fetch order by ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            logger.error("Failed to fetch order by ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get orders by user ID
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable String userId) {
        try {
            Long parsedUserId = Long.parseLong(userId); // Convert to Long
            return ResponseEntity.ok(orderService.getOrdersByUserId(parsedUserId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        }
    }

    // Create a new order
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @RequestBody OrderRequest orderRequest,
            @RequestHeader("Authorization") String token) {
        try {
            logger.info("Creating order for user ID: {}", orderRequest.getUserId());
            // Validate token format
            if (token == null || token.isEmpty() || !token.startsWith("Bearer ")) {
                logger.warn("Invalid or missing token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Extract and trim the token
            token = token.replace("Bearer ", "").trim();
            logger.debug("Received token: {}", token);

            // Extract username from token
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate token
            if (!jwtService.validateToken(token, userDetails)) {
                logger.warn("Unauthorized access attempt to create an order");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Proceed with order creation
            logger.debug("Order request payload: {}", orderRequest);
            OrderDTO createdOrder = orderService.createOrder(orderRequest);
            return ResponseEntity.ok(createdOrder);
        } catch (MalformedJwtException e) {
            logger.error("Malformed JWT token: {}", token, e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            logger.error("Failed to create order for user ID: {}", orderRequest.getUserId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update an existing order
    @PutMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");

            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status cannot be empty.");
            }

            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, newStatus);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update order status: " + e.getMessage());
        }
    }

    // Delete an order
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            // Extract username from token
            String username = jwtService.extractUserName(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate token
            if (!jwtService.validateToken(token, userDetails)) {
                logger.warn("Unauthorized access attempt to delete order with ID: {}", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            orderService.deleteOrder(id);
            logger.info("Order deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Failed to delete order with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Failed to delete order with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}