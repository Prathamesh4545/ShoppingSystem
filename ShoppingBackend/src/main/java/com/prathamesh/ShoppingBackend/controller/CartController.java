package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Dto.CartDTO;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.repository.UserRepo;
import com.prathamesh.ShoppingBackend.service.CartService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepo userRepo;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CartDTO> getCartForCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepo.findByUserName(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            CartDTO cartDTO = cartService.getCart(user);
            return new ResponseEntity<>(cartDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CartDTO> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int productId,
            @RequestParam int quantity) {
        try {
            User user = userRepo.findByUserName(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            CartDTO cartDTO = cartService.addToCart(user, productId, quantity);
            return new ResponseEntity<>(cartDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/remove/{productId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable int productId) {
        try {
            System.out.println("Removing product with ID: " + productId); // Debugging
            User user = userRepo.findByUserName(userDetails.getUsername());
            if (user == null) {
                System.out.println("User not found"); // Debugging
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
    
            CartDTO cart = cartService.removeFromCart(user, productId);
            System.out.println("Updated cart: " + cart); // Debugging
            return new ResponseEntity<>(cart, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error removing item from cart: " + e.getMessage()); // Debugging
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error removing item from cart: " + e.getMessage()); // Debugging
            e.printStackTrace(); // Debugging
            return new ResponseEntity<>("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update/{itemId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CartDTO> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable int itemId,
            @RequestParam int quantity) {
        try {
            User user = userRepo.findByUserName(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            CartDTO cartDTO = cartService.updateCartItem(user, itemId, quantity);
            return new ResponseEntity<>(cartDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepo.findByUserName(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            cartService.clearCart(user);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}