package com.prathamesh.ShoppingBackend.controller;

import com.prathamesh.ShoppingBackend.Dto.UserRegistrationDTO;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.model.UserPrincipal;
import com.prathamesh.ShoppingBackend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // User login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        try {
            Map<String, Object> response = userService.verify(user);
            if (response != null && response.containsKey("token") && response.containsKey("user")) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
        } catch (RuntimeException e) {
            logger.error("Login failed for user: {}", user.getEmail(), e);
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody UserRegistrationDTO userDTO) {

        User user = convertToEntity(userDTO);
        try {
            User registeredUser = userService.registerUser(user);
            if (registeredUser != null) {
                // Generate token for the newly registered user
                String token = userService.generateToken(registeredUser);
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", registeredUser); // Include the user object with ID
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Registration failed for user: {}", user.getEmail(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update an existing user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable long id,
            @RequestParam("userName") String userName,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            // Validate input
            if (userName == null || userName.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            if (email == null || email.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            if (firstName == null || firstName.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            if (lastName == null || lastName.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            // Validate image file if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String contentType = imageFile.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                if (imageFile.getSize() > 5 * 1024 * 1024) { // 5MB limit
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }

            User updatedUser = userService.updateUser(
                    id,
                    userName,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password,
                    imageFile);
            
            if (updatedUser != null) {
                return new ResponseEntity<>(updatedUser, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error updating user with ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update user role
    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable long id, @RequestBody Map<String, String> roleMap) {
        logger.info("Received request to update role for user with ID: {}", id);
        logger.info("Role value received: {}", roleMap);

        try {
            // Validate the role value
            String role = roleMap.get("role");
            if (role == null || !(role.equals("ADMIN") || role.equals("USER"))) {
                logger.error("Invalid role value: {}", role);
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            // Update the user role
            User updatedUser = userService.updateUserRole(id, User.Role.valueOf(role));
            if (updatedUser != null) {
                logger.info("Role updated successfully for user with ID: {}", id);
                return new ResponseEntity<>(updatedUser, HttpStatus.OK);
            } else {
                logger.error("User not found with ID: {}", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid role value: {}", roleMap.get("role"), e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error updating user role", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete a user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable long id) {
        logger.info("Received request to delete user with ID: {}", id);

        try {
            User user = userService.deleteUser(id);
            if (user != null) {
                logger.info("User deleted successfully with ID: {}", id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                logger.error("User not found with ID: {}", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error deleting user with ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public User convertToEntity(UserRegistrationDTO userDTO) {
        User user = new User();
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setUserName(userDTO.getUserName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword()); // Fixed extra semicolon
        user.setPhoneNumber(userDTO.getPhoneNumber());
        return user;
    }

    // UserController.java
    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String oldToken = request.get("token");
        try {
            String newToken = userService.refreshToken(oldToken);
            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<User> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = userService.getUserById(principal.getId());
            if (user != null) {
                return new ResponseEntity<>(user, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error fetching user profile", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}
