package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Dto.CartDTO;
import com.prathamesh.ShoppingBackend.Dto.CartItemDTO;
import com.prathamesh.ShoppingBackend.Dto.ProductDTO;
import com.prathamesh.ShoppingBackend.model.*;
import com.prathamesh.ShoppingBackend.repository.CartRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private ProductRepo productRepo;

    public CartDTO getCart(User user) {
        try {
            Cart cart = cartRepo.findByUser(user).orElseGet(() -> createNewCart(user));
            return convertToCartDTO(cart);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch cart: " + e.getMessage());
        }
    }

    public CartDTO addToCart(User user, int productId, int quantity) {
        try {
            Cart cart = cartRepo.findByUser(user).orElseGet(() -> createNewCart(user));
            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Validate stock availability
            if (product.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getProductName());
            }

            // Check if the item already exists in the cart
            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId() == productId)
                    .findFirst();

            if (existingItem.isPresent()) {
                // Update quantity if the item exists
                existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
            } else {
                // Add new item to the cart
                CartItem newItem = new CartItem();
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                newItem.setCart(cart);
                cart.getItems().add(newItem);
            }

            cartRepo.save(cart);
            return convertToCartDTO(cart);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add item to cart: " + e.getMessage());
        }
    }

    private Cart createNewCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepo.save(cart);
    }

    private CartDTO convertToCartDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();

        // Convert cart items to DTOs
        List<CartItemDTO> validItems = cart.getItems().stream()
                .filter(Objects::nonNull) // Filter out null items
                .filter(item -> item.getProduct() != null) // Filter out items with null products
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());

        cartDTO.setItems(validItems);
        cartDTO.setTotalItems(validItems.size());
        cartDTO.setTotalPrice(calculateTotalPrice(validItems).doubleValue()); // Use the fixed method

        return cartDTO;
    }

    private CartItemDTO convertToCartItemDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setProduct(convertToProductDTO(item.getProduct()));
        return dto;
    }

    private ProductDTO convertToProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setBrand(product.getBrand());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        return dto;
    }

    public CartDTO removeFromCart(User user, int cartItemId) {
        try {
            System.out.println("Removing cart item with ID: " + cartItemId + " for user: " + user.getUserName()); // Debugging
            Cart cart = cartRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Cart not found"));
    
            // Find the item in the cart by cartItemId
            boolean itemExists = cart.getItems().removeIf(item -> item.getId() == cartItemId);
    
            if (!itemExists) {
                System.out.println("Item not found in cart: " + cartItemId); // Debugging
                throw new RuntimeException("Item with ID " + cartItemId + " not found in cart.");
            }
    
            cartRepo.save(cart);
            System.out.println("Cart saved successfully"); // Debugging
            return convertToCartDTO(cart); // Return the updated cart as a DTO
        } catch (Exception e) {
            System.err.println("Error in removeFromCart: " + e.getMessage()); // Debugging
            e.printStackTrace(); // Debugging
            throw e; // Re-throw the exception to be handled by the controller
        }
    }

    public CartDTO updateCartItem(User user, int itemId, int quantity) {
        try {
            Cart cart = cartRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Cart not found"));
            CartItem item = cart.getItems().stream()
                    .filter(cartItem -> cartItem.getId() == itemId)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Item not found in cart"));

            // Validate stock availability
            Product product = item.getProduct();
            if (product.getQuantity() < (item.getQuantity() + quantity)) {
                throw new RuntimeException("Insufficient stock for product: " + product.getProductName());
            }

            // Update the item quantity
            item.setQuantity(item.getQuantity() + quantity);

            cartRepo.save(cart);
            return convertToCartDTO(cart);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update item quantity: " + e.getMessage());
        }
    }

    public void clearCart(User user) {
        try {
            Cart cart = cartRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Cart not found"));
            cart.getItems().clear();
            cartRepo.save(cart);
        } catch (Exception e) {
            throw new RuntimeException("Failed to clear cart: " + e.getMessage());
        }
    }

    private BigDecimal calculateTotalPrice(List<CartItemDTO> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO; // Return 0 if the cart is empty or null
        }

        return items.stream()
                .filter(Objects::nonNull) // Filter out null items
                .filter(item -> item.getProduct() != null) // Filter out items with null products
                .map(item -> {
                    BigDecimal price = item.getProduct().getPrice(); // Get product price
                    int quantity = item.getQuantity(); // Get item quantity

                    // Validate price and quantity
                    if (price.compareTo(BigDecimal.ZERO) < 0 || quantity < 0) {
                        return BigDecimal.ZERO; // Skip invalid items (negative price or quantity)
                    }

                    return price.multiply(BigDecimal.valueOf(quantity)); // Calculate subtotal for valid items
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add); // Sum up all subtotals
    }
}