package com.prathamesh.ShoppingBackend.service;

import java.util.List;

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

    public UserService(UserRepo userRepo, AuthenticationManager authManager,JWTService jwtService) {
        this.userRepo = userRepo;
        this.bCryptPasswordEncoder = new BCryptPasswordEncoder(12);
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    public User getUserById(long id) {
        return userRepo.findById(id).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public String verify(User user) {
        Authentication authentication = authManager
                .authenticate(new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword()));

        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getUserName());
        }

        return "failed";
    }

    public User registerUser(User user) {
        try {
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            return userRepo.save(user);
        } catch (Exception e) {
            logger.error("Failed to register user", e);
            throw new RuntimeException("Failed to register user", e);
        }
    }

    public User updateUser(long id, User user) {
        User existingUser = getUserById(id);
        if (existingUser != null) {
            if (user.getUserName() != null)
                existingUser.setUserName(user.getUserName());
            if (user.getFirstName() != null)
                existingUser.setFirstName(user.getFirstName());
            if (user.getLastName() != null)
                existingUser.setLastName(user.getLastName());
            if (user.getEmail() != null)
                existingUser.setEmail(user.getEmail());
            if (user.getPhoneNumber() != null)
                existingUser.setPhoneNumber(user.getPhoneNumber());
            if (user.getPassword() != null)
                existingUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            if (user.getRole() != null)
                existingUser.setRole(user.getRole());
            if (user.getCreatedAt() != null)
                existingUser.setCreatedAt(user.getCreatedAt());
            if (user.getUpdatedAt() != null)
                existingUser.setUpdatedAt(user.getUpdatedAt());

            return userRepo.save(existingUser);
        } else {
            return null;
        }
    }

    public User deleteUser(Long id) {
        User user = getUserById(id);
        if (user != null) {
            userRepo.deleteById(id);
        }
        return user;
    }
}