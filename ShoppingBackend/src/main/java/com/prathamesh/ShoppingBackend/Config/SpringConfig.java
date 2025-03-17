package com.prathamesh.ShoppingBackend.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SpringConfig {

    @Autowired
    private JWTFilter jwtFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(customizer -> customizer.disable()) // Disable CSRF for stateless APIs
                .cors(customizer -> customizer.configurationSource(corsConfigurationSource())) // Enable CORS
                .authorizeHttpRequests(request -> request
                        // Public endpoints
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/deals/active", // Public deals
                                "/api/products/**", // Allow all products (GET /api/products, GET /api/products/{id},
                                                    // etc.)
                                "/api/product/{id}" // Redundant (covered by /** above)
                        ).permitAll()

                        // ADMIN-specific endpoints
                        .requestMatchers(
                                "/api/users/**", // User management
                                "/api/deals/**", // Full control over deals (create, update, delete)
                                "/api/product" // Product management (create/update)
                        ).hasRole("ADMIN")

                        // USER-specific endpoints
                        .requestMatchers(
                                "/api/users/{id}", // User profile
                                "/api/addresses/**" // Address management
                        ).hasRole("USER")
                        // All other endpoints require authentication
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults()) // Enable HTTP Basic Authentication
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless
                                                                                                              // session
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) // Add JWT filter
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write(
                                    "{\"error\": \"Unauthorized\", \"message\": \"Authentication token is missing, invalid, or expired.\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write(
                                    "{\"error\": \"Forbidden\", \"message\": \"You do not have permission to access this resource.\"}");
                        }))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Allow frontend origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allow all HTTP methods
        configuration.setAllowedHeaders(List.of("*")); // Allow all headers
        configuration.setAllowCredentials(true); // Allow credentials (e.g., cookies)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all endpoints
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService); // Set custom UserDetailsService
        provider.setPasswordEncoder(passwordEncoder()); // Set password encoder
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Use BCrypt with strength 12
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager(); // Retrieve the AuthenticationManager
    }
}