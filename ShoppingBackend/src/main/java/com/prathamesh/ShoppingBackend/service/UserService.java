package com.prathamesh.ShoppingBackend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;

import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.repository.UserRepo;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final JWTService jwtService;
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authManager;

    public UserService(UserRepo userRepo, AuthenticationManager authManager,
            JWTService jwtService) {
        this.userRepo = userRepo;
        this.bCryptPasswordEncoder = new BCryptPasswordEncoder(12);
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    // Fetch user by ID
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

                // Generate token
                String token = jwtService.generateToken(user.getUserName());

                // Prepare response
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", authenticatedUser); // Include the full user object with ID
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
    public User registerUser(User user) {
        try {
            // Check if username already exists
            Optional<User> existingUser = Optional.ofNullable(userRepo.findByUserName(user.getUserName()));
            if (existingUser.isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }

            // Hash the password
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

            // Save the user
            User registeredUser = userRepo.save(user);

            // Generate token for the newly registered user
            String token = jwtService.generateToken(registeredUser.getUserName());

            // Log registration success
            logger.info("User registered successfully: {}", registeredUser.getUserName());

            return registeredUser;
        } catch (Exception e) {
            logger.error("Failed to register user: {}", user.getUserName(), e);
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    // Update an existing user
    public User updateUser(long id, User user) {
        try {
            User existingUser = userRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

            // Update fields if provided
            if (user.getUserName() != null) existingUser.setUserName(user.getUserName());
            if (user.getFirstName() != null) existingUser.setFirstName(user.getFirstName());
            if (user.getLastName() != null) existingUser.setLastName(user.getLastName());
            if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
            if (user.getPhoneNumber() != null) existingUser.setPhoneNumber(user.getPhoneNumber());
            if (user.getPassword() != null) existingUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            if (user.getRole() != null) existingUser.setRole(user.getRole());

            // Save the updated user
            User updatedUser = userRepo.save(existingUser);
            logger.info("User updated successfully: {}", updatedUser.getUserName());

            return updatedUser;
        } catch (Exception e) {
            logger.error("Failed to update user with ID: {}", id, e);
            throw new RuntimeException("Failed to update user: " + e.getMessage());
        }
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
}