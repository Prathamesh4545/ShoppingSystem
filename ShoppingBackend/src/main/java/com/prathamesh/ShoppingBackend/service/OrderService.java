package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Dto.*;
import com.prathamesh.ShoppingBackend.Exception.*;
import com.prathamesh.ShoppingBackend.model.*;
import com.prathamesh.ShoppingBackend.repository.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import javax.security.auth.login.AccountNotFoundException;

@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    private static final BigDecimal TAX_RATE = BigDecimal.ZERO;
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("1000");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("100");
    private static final BigDecimal MAX_TOTAL_VARIANCE = new BigDecimal("0.01");

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final UserRepo userRepo;
    private final AddressRepo addressRepo;
    private final ProductRepo productRepo;

    public OrderService(OrderRepo orderRepo, OrderItemRepo orderItemRepo, 
                      UserRepo userRepo, AddressRepo addressRepo,
                      ProductRepo productRepo) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.userRepo = userRepo;
        this.addressRepo = addressRepo;
        this.productRepo = productRepo;
    }

    public List<OrderDTO> getAllOrders() {
        try {
            return orderRepo.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Failed to fetch all orders", e);
            throw new OrderProcessingException("Failed to fetch all orders");
        }
    }

    public OrderDTO getOrderById(Long id) {
        try {
            Orders order = orderRepo.findById(id)
                    .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
            return convertToDTO(order);
        } catch (Exception e) {
            logger.error("Failed to fetch order by ID: {}", id, e);
            throw new OrderProcessingException("Failed to fetch order by ID");
        }
    }

    public List<OrderDTO> getOrdersByUserId(Long userId) {
        try {
            if (!userRepo.existsById(userId)) {
                throw new UserNotFoundException("User not found with ID: " + userId);
            }

            return orderRepo.findByUserId(userId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Failed to fetch orders for user: {}", userId, e);
            throw new OrderProcessingException("Failed to fetch user orders");
        }
    }

    public OrderDTO createOrder(OrderRequest orderRequest) {
        try {
            User user = userRepo.findById(orderRequest.getUserId())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            Address shippingAddress = addressRepo.findById(orderRequest.getAddressId())
                    .orElseThrow(() -> new AccountNotFoundException("Shipping address not found"));
            
            if (!shippingAddress.getUser().getId().equals(user.getId())) {
                throw new SecurityException("Shipping address does not belong to the user");
            }

            if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
                throw new InvalidOrderException("Order must contain at least one item");
            }

            // Validate all products exist
            for (OrderItemDTO item : orderRequest.getItems()) {
                if (!productRepo.existsById(item.getProductId().intValue())) {
                    throw new ProductNotFoundException("Product not found with ID: " + item.getProductId());
                }
            }

            BigDecimal calculatedSubtotal = calculateSubtotal(orderRequest.getItems());
            BigDecimal receivedSubtotal = BigDecimal.valueOf(orderRequest.getTotalAmount());
            
            validateOrderTotals(calculatedSubtotal, receivedSubtotal);

            BigDecimal shipping = calculateShipping(calculatedSubtotal);
            BigDecimal tax = calculateTax(calculatedSubtotal);
            BigDecimal finalTotal = calculateFinalTotal(calculatedSubtotal, shipping, tax);

            Orders order = buildOrder(user, shippingAddress, calculatedSubtotal, 
                                     shipping, tax, finalTotal, orderRequest.getItems());
            
            Orders savedOrder = orderRepo.save(order);
            return convertToDTO(savedOrder);

        } catch (Exception e) {
            logger.error("Failed to create order: {}", e.getMessage());
            throw new OrderProcessingException("Failed to create order: " + e.getMessage());
        }
    }

    public OrderDTO updateOrderStatus(Long orderId, String newStatus) {
        try {
            validateOrderId(orderId);
            validateStatus(newStatus);

            Orders order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

            order.setStatus(Orders.OrderStatus.valueOf(newStatus));
            order.setUpdatedAt(LocalDateTime.now());

            return convertToDTO(orderRepo.save(order));
        } catch (Exception e) {
            logger.error("Failed to update order status: {}", e.getMessage());
            throw new OrderProcessingException("Failed to update order status");
        }
    }

    public void deleteOrder(Long id) {
        try {
            Orders order = orderRepo.findById(id)
                    .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));

            orderItemRepo.deleteByOrder(order);
            orderRepo.delete(order);
            
            logger.info("Order deleted successfully: {}", id);
        } catch (Exception e) {
            logger.error("Failed to delete order: {}", id, e);
            throw new OrderProcessingException("Failed to delete order");
        }
    }

    public OrderDTO cancelOrder(Long orderId) {
        try {
            Orders order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

            if (order.getStatus() == Orders.OrderStatus.CANCELLED) {
                throw new InvalidOrderException("Order is already cancelled");
            }

            if (order.getStatus() == Orders.OrderStatus.DELIVERED) {
                throw new InvalidOrderException("Cannot cancel a delivered order");
            }

            order.setStatus(Orders.OrderStatus.CANCELLED);
            order.setUpdatedAt(LocalDateTime.now());

            return convertToDTO(orderRepo.save(order));
        } catch (Exception e) {
            logger.error("Failed to cancel order: {}", orderId, e);
            throw new OrderProcessingException("Failed to cancel order: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getOrderCountByStatusForUser(Long userId) {
        try {
            if (!userRepo.existsById(userId)) {
                throw new UserNotFoundException("User not found with ID: " + userId);
            }
            return orderRepo.getOrderCountByStatus(userId);
        } catch (Exception e) {
            logger.error("Failed to get order counts by status for user: {}", userId, e);
            throw new OrderProcessingException("Failed to get order status counts");
        }
    }

    private BigDecimal calculateSubtotal(List<OrderItemDTO> items) {
        return items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validateOrderTotals(BigDecimal calculated, BigDecimal received) {
        BigDecimal variance = calculated.subtract(received).abs();
        if (variance.compareTo(MAX_TOTAL_VARIANCE) > 0) {
            throw new InvalidOrderTotalException(
                String.format("Order total validation failed. Calculated: %s, Received: %s", 
                calculated, received));
        }
    }

    private BigDecimal calculateShipping(BigDecimal subtotal) {
        return subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 
                ? BigDecimal.ZERO 
                : SHIPPING_COST;
    }

    private BigDecimal calculateTax(BigDecimal subtotal) {
        return subtotal.multiply(TAX_RATE)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateFinalTotal(BigDecimal subtotal, BigDecimal shipping, BigDecimal tax) {
        return subtotal.add(shipping).add(tax)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private Orders buildOrder(User user, Address address, BigDecimal subtotal,
                            BigDecimal shipping, BigDecimal tax, BigDecimal total,
                            List<OrderItemDTO> items) {
        Orders order = new Orders();
        order.setUserId(user.getId());
        order.setAddress(address);
        order.setSubtotalAmount(subtotal);
        order.setShippingCost(shipping);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);
        order.setStatus(Orders.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        List<OrderItem> orderItems = items.stream()
                .map(item -> buildOrderItem(order, item))
                .collect(Collectors.toList());
        
        order.setItems(orderItems);
        return order;
    }

    private OrderItem buildOrderItem(Orders order, OrderItemDTO item) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProductId(item.getProductId());
        orderItem.setQuantity(item.getQuantity());
        orderItem.setPrice(item.getPrice());
        return orderItem;
    }

    private void validateOrderId(Long orderId) {
        if (orderId == null || orderId <= 0) {
            throw new InvalidOrderException("Invalid order ID");
        }
    }

    private void validateStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new InvalidOrderException("Status cannot be empty");
        }
        try {
            Orders.OrderStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new InvalidOrderException("Invalid order status: " + status);
        }
    }

    private OrderDTO convertToDTO(Orders order) {
        if (order == null) {
            return null;
        }

        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setSubtotalAmount(order.getSubtotalAmount());
        dto.setShippingCost(order.getShippingCost());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                    .map(this::convertToOrderItemDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setItems(new ArrayList<>());
        }

        if (order.getAddress() != null) {
            dto.setAddress(convertToAddressDTO(order.getAddress()));
        }

        return dto;
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProductId());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

    private AddressDTO convertToAddressDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setZipCode(address.getZipCode());
        dto.setCountry(address.getCountry());
        dto.setType(address.getType());
        return dto;
    }
}