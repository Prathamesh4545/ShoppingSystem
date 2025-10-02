package com.prathamesh.ShoppingBackend.service;

import java.util.HashMap;
import java.io.IOException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;

import com.prathamesh.ShoppingBackend.model.Cart;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.repository.CartRepo;
import com.prathamesh.ShoppingBackend.repository.UserRepo;

import io.jsonwebtoken.Jwts;

@Service
@Transactional
public class UserService {
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authManager;
    private final JWTService jwtService;
    private final CartRepo cartRepo;

    public UserService(
            UserRepo userRepo,
            AuthenticationManager authManager,
            JWTService jwtService,
            CartRepo cartRepo) {
        this.userRepo = userRepo;
        this.bCryptPasswordEncoder = new BCryptPasswordEncoder(12);
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.cartRepo = cartRepo;
    }

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Transactional(readOnly = true) // Added for better transactional management
    public User getUserById(long id) {
        return userRepo.findById(id).orElse(null);
    }

    // Fetch all users
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // Verify user credentials (login)
    public Map<String, Object> verify(User user) {
        try {
            Authentication authentication = authManager
                    .authenticate(new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                User authenticatedUser = userRepo.findByUserName(user.getUserName());
                if (authenticatedUser == null) {
                    throw new RuntimeException("User not found");
                }

                String token = jwtService.generateToken(user.getUserName());

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", authenticatedUser);
                response.put("roles", List.of(authenticatedUser.getRole().name()));

                return response;
            } else {
                throw new RuntimeException("Authentication failed");
            }
        } catch (Exception e) {
            logger.error("Login failed for user: {}", user.getUserName(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    // Register a new user
    // Modify the registerUser method to create a cart for the user
    public User registerUser(User user) {
        try {
            // Existing checks and password hashing
            Optional<User> existingUser = Optional.ofNullable(userRepo.findByUserName(user.getUserName()));
            if (existingUser.isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

            // Save the user
            User registeredUser = userRepo.save(user);

            // Create a new cart and associate it with the user
            Cart cart = new Cart();
            cart.setUser(registeredUser);
            cartRepo.save(cart);

            // Update the user's cart reference (optional but ensures consistency)
            registeredUser.setCart(cart);
            userRepo.save(registeredUser);

            logger.info("User registered successfully: {}", registeredUser.getUserName());
            return registeredUser;
        } catch (Exception e) {
            logger.error("Failed to register user: {}", user.getUserName(), e);
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    // Update an existing user
    public User updateUser(
            long id,
            String userName,
            String firstName,
            String lastName,
            String email,
            String phoneNumber,
            String password,
            MultipartFile imageFile) {
        User existingUser = userRepo.findById(id).orElse(null);
        if (existingUser == null) {
            return null; // User not found
        }

        // Update fields
        existingUser.setUserName(userName);
        existingUser.setFirstName(firstName);
        existingUser.setLastName(lastName);
        existingUser.setEmail(email);
        existingUser.setPhoneNumber(phoneNumber);
        if (password != null && !password.isEmpty()) {
            existingUser.setPassword(bCryptPasswordEncoder.encode(password));
        }

        // Handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                existingUser.setImageData(imageFile.getBytes());
                existingUser.setImageType(imageFile.getContentType());
            } catch (IOException e) {
                logger.error("Error processing image file: {}", e.getMessage());
                throw new RuntimeException("Failed to process image file", e);
            }
        }

        return userRepo.save(existingUser);
    }

    // Update user role
    public User updateUserRole(long id, User.Role role) {
        try {
            logger.info("Attempting to update user role for user with ID: {}", id);

            // Fetch the user by ID
            User user = userRepo.findById(id)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", id);
                        return new RuntimeException("User not found with ID: " + id);
                    });

            // Update the user's role
            user.setRole(role);

            // Save the updated user
            User updatedUser = userRepo.save(user);
            logger.info("User role updated successfully for user with ID: {}", id);

            return updatedUser;
        } catch (Exception e) {
            logger.error("Failed to update user role for user with ID: {}", id, e);
            throw new RuntimeException("Failed to update user role: " + e.getMessage());
        }
    }

    // Delete a user
    public User deleteUser(Long id) {
        try {
            logger.info("Attempting to delete user with ID: {}", id);

            // Fetch the user by ID
            User user = userRepo.findById(id)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", id);
                        return new RuntimeException("User not found with ID: " + id);
                    });

            // Delete the user
            userRepo.deleteById(id);
            logger.info("User deleted successfully with ID: {}", id);

            return user;
        } catch (Exception e) {
            logger.error("Failed to delete user with ID: {}", id, e);
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }

    // Generate token for a user
    public String generateToken(User user) {
        return jwtService.generateToken(user.getUserName());
    }

    // UserService.java
    public String refreshToken(String oldToken) {
        String username = jwtService.extractUserName(oldToken);
        UserDetails userDetails = (UserDetails) userRepo.findByUserName(username);

        if (jwtService.validateToken(oldToken, userDetails)) {
            return jwtService.generateToken(username);
        }
        throw new RuntimeException("Invalid or expired token");
    }
}
