package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.Dto.CartDTO;
import com.prathamesh.ShoppingBackend.Dto.CartItemDTO;
import com.prathamesh.ShoppingBackend.Dto.ProductDTO;
import com.prathamesh.ShoppingBackend.model.*;
import com.prathamesh.ShoppingBackend.repository.CartRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
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

    @Autowired
    private com.prathamesh.ShoppingBackend.repository.DealsRepo dealsRepo;

    public CartDTO getCart(User user) {
        try {
            Cart cart = cartRepo.findByUser(user).orElseGet(() -> createNewCart(user));
            CartDTO cartDTO = convertToCartDTO(cart);
            return cartDTO;
        } catch (Exception e) {
            System.err.println("Error fetching cart: " + e.getMessage());
            e.printStackTrace();
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

            Cart savedCart = cartRepo.save(cart);
            return convertToCartDTO(savedCart);
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

        // Fetch all active deals once to avoid N+1 queries
        java.util.Map<Integer, Deals> productDealsMap = new java.util.HashMap<>();
        try {
            cart.getItems().stream()
                .filter(Objects::nonNull)
                .filter(item -> item.getProduct() != null)
                .forEach(item -> {
                    try {
                        List<Deals> deals = dealsRepo.findActiveDealsForProduct(item.getProduct().getId(), new Date());
                        if (!deals.isEmpty()) {
                            productDealsMap.put(item.getProduct().getId(), deals.get(0));
                        }
                    } catch (Exception e) {
                        // Skip if deal fetch fails
                    }
                });
        } catch (Exception e) {
            // Continue without deals if fetch fails
        }

        // Convert cart items to DTOs
        List<CartItemDTO> validItems = cart.getItems().stream()
                .filter(Objects::nonNull)
                .filter(item -> item.getProduct() != null)
                .map(item -> convertToCartItemDTO(item, productDealsMap))
                .collect(Collectors.toList());

        cartDTO.setItems(validItems);
        cartDTO.setTotalItems(validItems.size());
        cartDTO.setTotalPrice(calculateTotalPrice(validItems).doubleValue());

        return cartDTO;
    }

    private CartItemDTO convertToCartItemDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setProduct(convertToProductDTO(item.getProduct(), null));
        return dto;
    }

    private CartItemDTO convertToCartItemDTO(CartItem item, java.util.Map<Integer, Deals> dealsMap) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setProduct(convertToProductDTO(item.getProduct(), dealsMap.get(item.getProduct().getId())));
        return dto;
    }

    private ProductDTO convertToProductDTO(Product product, Deals deal) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setBrand(product.getBrand());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setDealInfo(deal);
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