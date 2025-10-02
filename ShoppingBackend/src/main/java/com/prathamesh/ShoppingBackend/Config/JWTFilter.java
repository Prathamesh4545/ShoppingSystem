package com.prathamesh.ShoppingBackend.Config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.prathamesh.ShoppingBackend.service.CustomUserDetailsService;
import com.prathamesh.ShoppingBackend.service.JWTService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTFilter.class);

    private final JWTService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JWTFilter(JWTService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // Skip token validation for refresh-token endpoint
        if (request.getRequestURI().equals("/api/users/refresh-token")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if the Authorization header is present and valid
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Authorization header is missing or invalid for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7); // Remove "Bearer "
        logger.debug("Received token for request: {}", request.getRequestURI());

        // Validate token format
        if (token.isEmpty() || token.split("\\.").length != 3) {
            logger.warn("Invalid JWT token format for request: {}", request.getRequestURI());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid JWT token format");
            return;
        }

        try {
            username = jwtService.extractUserName(token);
            logger.debug("Extracted username: {} from token for request: {}", username, request.getRequestURI());
        } catch (MalformedJwtException e) {
            logger.warn("Malformed JWT token for request: {}: {}", request.getRequestURI(), e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Malformed JWT token");
            return;
        } catch (ExpiredJwtException e) {
            logger.warn("Expired JWT token for request: {}: {}", request.getRequestURI(), e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Expired JWT token");
            return;
        } catch (SignatureException e) {
            logger.warn("Invalid JWT signature for request: {}: {}", request.getRequestURI(), e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid JWT signature");
            return;
        } catch (UnsupportedJwtException e) {
            logger.warn("Unsupported JWT token for request: {}: {}", request.getRequestURI(), e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Unsupported JWT token");
            return;
        } catch (Exception e) {
            logger.error("Error processing JWT token for request: {}: {}", request.getRequestURI(), e.getMessage(), e);
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Error processing JWT token");
            return;
        }

        // Authenticate the user if the token is valid
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authenticated user: {} for request: {}", username, request.getRequestURI());
                } else {
                    logger.warn("Invalid or expired token for user: {} for request: {}", username, request.getRequestURI());
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
                    return;
                }
            } catch (UsernameNotFoundException e) {
                logger.error("User not found: {} for request: {}", username, request.getRequestURI(), e);
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "User not found: " + e.getMessage());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
        response.getWriter().flush();
    }
}