package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Dto.AddressDTO;
import com.prathamesh.ShoppingBackend.Dto.OrderDTO;
import com.prathamesh.ShoppingBackend.Dto.OrderItemDTO;
import com.prathamesh.ShoppingBackend.Dto.OrderRequest;
import com.prathamesh.ShoppingBackend.Exception.ResourceNotFoundException;
import com.prathamesh.ShoppingBackend.model.*;
import com.prathamesh.ShoppingBackend.repository.AddressRepo;
import com.prathamesh.ShoppingBackend.repository.OrderItemRepo;
import com.prathamesh.ShoppingBackend.repository.OrderRepo;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.prathamesh.ShoppingBackend.repository.UserRepo;

@Service
@Transactional
public class OrderService {

    @Autowired
    UserRepo userRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private AddressRepo addressRepo;

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    // Get all orders
    public List<OrderDTO> getAllOrders() {
        try {
            return orderRepo.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Failed to fetch all orders", e);
            throw new RuntimeException("Failed to fetch all orders: " + e.getMessage());
        }
    }

    // Get order by ID
    public OrderDTO getOrderById(Long id) {
        try {
            Orders order = orderRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
            return convertToDTO(order);
        } catch (Exception e) {
            logger.error("Failed to fetch order by ID: {}", id, e);
            throw new RuntimeException("Failed to fetch order by ID: " + e.getMessage());
        }
    }

    // Get orders by user ID
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        // Check if the user exists
        if (!userRepo.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }

        // Fetch orders from the database
        List<Orders> orders = orderRepo.findByUserId(userId);

        // Convert orders to DTOs
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Create a new order
    public OrderDTO createOrder(OrderRequest orderRequest) {
        try {
            // Validate user ID
            if (orderRequest.getUserId() == null || orderRequest.getUserId() <= 0) {
                throw new IllegalArgumentException("Invalid user ID");
            }

            // Check if user exists
            if (!userRepo.existsById(orderRequest.getUserId())) {
                throw new ResourceNotFoundException("User not found with ID: " + orderRequest.getUserId());
            }
            // Convert OrderRequest to Orders entity
            Orders order = new Orders();
            order.setUserId(orderRequest.getUserId());
            order.setTotalAmount(BigDecimal.valueOf(orderRequest.getTotalAmount()));
            order.setStatus(Orders.OrderStatus.valueOf(orderRequest.getStatus()));
            order.setCreatedAt(LocalDate.now());
            order.setUpdatedAt(LocalDate.now());

            // Initialize the items list
            order.setItems(new ArrayList<>());

            // Save the order
            Orders savedOrder = orderRepo.save(order);

            // Save order items
            List<OrderItem> orderItems = orderRequest.getItems().stream()
                    .map(item -> convertToOrderItemEntity(item, savedOrder))
                    .collect(Collectors.toList());
            orderItemRepo.saveAll(orderItems);

            // Save address if provided
            if (orderRequest.getAddress() != null) {
                Address address = convertToAddressEntity((AddressDTO) orderRequest.getAddress());
                address.setOrders(List.of(savedOrder));
                addressRepo.save(address);
            }

            logger.info("Order created successfully for user ID: {}", orderRequest.getUserId());
            return convertToDTO(savedOrder);
        } catch (Exception e) {
            logger.error("Failed to create order for user ID: {}", orderRequest.getUserId(), e);
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    // Update an existing order
    public OrderDTO updateOrderStatus(Long orderId, String newStatus) {
        try {
            // Validate order ID
            if (orderId == null || orderId <= 0) {
                throw new IllegalArgumentException("Invalid order ID.");
            }

            // Validate new status
            if (newStatus == null || newStatus.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid order status.");
            }

            // Fetch the order from the database
            Orders order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

            // Update the order status
            order.setStatus(Orders.OrderStatus.valueOf(newStatus));
            Orders updatedOrder = orderRepo.save(order);

            // Convert the updated order to a DTO
            return convertToDTO(updatedOrder);

        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error updating order status for order ID " + orderId + ": " + e.getMessage());
            throw new RuntimeException("Failed to update order status. Please try again later.");
        }
    }

    // Delete an order
    public void deleteOrder(Long id) {
        try {
            Orders order = orderRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

            // Delete associated address
            addressRepo.deleteByOrders(order);

            // Delete associated order items
            orderItemRepo.deleteByOrder(order);

            // Delete the order
            orderRepo.delete(order);
            logger.info("Order deleted successfully with ID: {}", id);
        } catch (Exception e) {
            logger.error("Failed to delete order with ID: {}", id, e);
            throw new RuntimeException("Failed to delete order: " + e.getMessage());
        }
    }

    // Convert Orders entity to OrderDTO
    private OrderDTO convertToDTO(Orders order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setUserId(order.getUserId());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setStatus(order.getStatus().toString());
        orderDTO.setCreatedAt(LocalDateTime.of(order.getCreatedAt(), java.time.LocalTime.now()));
        orderDTO.setUpdatedAt(LocalDateTime.of(order.getUpdatedAt(), java.time.LocalTime.now()));

        // Handle null items
        List<OrderItem> items = order.getItems();
        if (items != null) {
            List<OrderItemDTO> itemDTOs = items.stream()
                    .map(this::convertToOrderItemDTO)
                    .collect(Collectors.toList());
            orderDTO.setItems(itemDTOs);
        } else {
            orderDTO.setItems(new ArrayList<>()); // Set empty list if items is null
        }

        // Convert Address to AddressDTO if exists
        if (order.getAddress() != null) {
            orderDTO.setAddress(convertToAddressDTO(order.getAddress()));
        }

        return orderDTO;
    }

    // Convert OrderItem entity to OrderItemDTO
    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setId(orderItem.getId());
        itemDTO.setProductId(orderItem.getProductId());
        itemDTO.setQuantity(orderItem.getQuantity());
        itemDTO.setPrice(orderItem.getPrice());
        return itemDTO;
    }

    // Convert Address entity to AddressDTO
    private AddressDTO convertToAddressDTO(Address address) {
        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setId(address.getId());
        addressDTO.setStreet(address.getStreet());
        addressDTO.setCity(address.getCity());
        addressDTO.setState(address.getState());
        addressDTO.setZipCode(address.getZipCode());
        addressDTO.setCountry(address.getCountry());
        return addressDTO;
    }

    // Convert OrderItemDTO to OrderItem entity
    private OrderItem convertToOrderItemEntity(OrderItemDTO itemDTO, Orders order) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProductId(itemDTO.getProductId());
        orderItem.setQuantity(itemDTO.getQuantity());
        orderItem.setPrice(itemDTO.getPrice());
        return orderItem;
    }

    // Convert AddressDTO to Address entity
    private Address convertToAddressEntity(AddressDTO addressDTO) {
        Address address = new Address();
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setZipCode(addressDTO.getZipCode());
        address.setCountry(addressDTO.getCountry());
        return address;
    }
}
