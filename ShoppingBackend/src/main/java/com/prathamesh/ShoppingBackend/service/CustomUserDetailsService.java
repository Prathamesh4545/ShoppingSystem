package com.prathamesh.ShoppingBackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.model.UserPrincipal;
import com.prathamesh.ShoppingBackend.repository.UserRepo;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUserName(username);

        if (user == null) {
            logger.error("User not found with username: {}", username);
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        if (user.getRole() == null) {
            logger.error("User role is null for username: {}", username);
            throw new UsernameNotFoundException("User role is null for username: " + username);
        }

        logger.info("User found with username: {}", username);

        return new UserPrincipal(user);
    }
}