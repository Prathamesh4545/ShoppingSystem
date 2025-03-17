package com.prathamesh.ShoppingBackend.Config;

import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.model.User.Role;
import com.prathamesh.ShoppingBackend.repository.DealsRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;
import com.prathamesh.ShoppingBackend.repository.UserRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Component
@Configuration
public class DataInitializer {

    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final DealsRepo dealsRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepo userRepo, ProductRepo productRepo, DealsRepo dealsRepo) {
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.dealsRepo = dealsRepo;
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }

    @PostConstruct
    public void init() {
        initializeUsers();
    }

    @Bean
    CommandLineRunner loadData() {
        return args -> {
            initializeProducts();
            initializeDeals();
        };
    }

    @Transactional
    private void initializeUsers() {
        if (userRepo.findAll().isEmpty()) {
            try {
                User admin = new User();
                admin.setUserName("admin");
                admin.setPassword(passwordEncoder.encode("adminPassword"));
                admin.setRole(Role.ADMIN);
                userRepo.save(admin);

                User user = new User();
                user.setUserName("user");
                user.setPassword(passwordEncoder.encode("userPassword"));
                user.setRole(Role.USER);
                userRepo.save(user);

                System.out.println("✅ Default users initialized.");
            } catch (Exception e) {
                System.err.println("⚠️ Error initializing users: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ Users already initialized. Skipping.");
        }
    }

    @Transactional
    private void initializeProducts() {
        if (productRepo.findAll().isEmpty()) {
            try {
                List<Product> products = Arrays.asList(
                    createProduct("Laptop", "Dell", "High performance laptop", "Electronics", LocalDate.of(2025, 3, 1)),
                    createProduct("Smartphone", "Samsung", "Latest Android smartphone", "Electronics", LocalDate.of(2025, 3, 2)),
                    createProduct("Headphones", "Sony", "Noise cancelling headphones", "Audio", LocalDate.of(2025, 3, 3)),
                    createProduct("Smartwatch", "Apple", "Fitness tracking smartwatch", "Wearable", LocalDate.of(2025, 3, 4)),
                    createProduct("Television", "LG", "4K Ultra HD TV", "Electronics", LocalDate.of(2025, 3, 5))
                );

                productRepo.saveAll(products);
                System.out.println("✅ Default products initialized.");
            } catch (Exception e) {
                System.err.println("⚠️ Error initializing products: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ Products already initialized. Skipping.");
        }
    }

    private Product createProduct(String name, String brand, String desc, String category, LocalDate releaseDate) {
        Product product = new Product();
        product.setProductName(name);
        product.setBrand(brand);
        product.setDesc(desc);
        product.setCategory(category);
        product.setReleaseDate(convertToDate(releaseDate));
        product.setAvailable(true);
        product.setQuantity(100); // Default quantity
        product.setPrice(BigDecimal.valueOf(999.99)); // Default price
        return product;
    }

    @Transactional
    private void initializeDeals() {
        if (dealsRepo.findAll().isEmpty()) {
            try {
                List<Product> products = productRepo.findAll();
                if (products.isEmpty()) {
                    System.out.println("⚠️ No products found! Skipping deals initialization.");
                    return;
                }

                // Fetch products by their productName (since IDs are auto-generated)
                Product laptop = productRepo.findByProductName("Laptop")
                    .orElseThrow(() -> new RuntimeException("Laptop not found"));
                Product smartphone = productRepo.findByProductName("Smartphone")
                    .orElseThrow(() -> new RuntimeException("Smartphone not found"));
                Product headphones = productRepo.findByProductName("Headphones")
                    .orElseThrow(() -> new RuntimeException("Headphones not found"));
                Product smartwatch = productRepo.findByProductName("Smartwatch")
                    .orElseThrow(() -> new RuntimeException("Smartwatch not found"));
                Product television = productRepo.findByProductName("Television")
                    .orElseThrow(() -> new RuntimeException("Television not found"));

                // Create deals
                List<Deals> deals = Arrays.asList(
                    createDeal("Winter Sale", "Up to 50% off on winter wear!", new BigDecimal(50), LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 31), smartwatch, television),
                    createDeal("Buy One Get One Free", "Buy one product and get another for free.", new BigDecimal(100), LocalDate.of(2025, 3, 10), LocalDate.of(2025, 3, 20), headphones),
                    createDeal("Flash Deal: 30% Off", "Flash deal! 30% off on electronics.", new BigDecimal(30), LocalDate.of(2025, 3, 12), LocalDate.of(2025, 3, 12), laptop, smartphone)
                );

                dealsRepo.saveAll(deals);
                System.out.println("✅ Default deals initialized.");
            } catch (Exception e) {
                System.err.println("⚠️ Error initializing deals: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ Deals already initialized. Skipping.");
        }
    }

    private Deals createDeal(String title, String description, BigDecimal discountPercentage, LocalDate startDate, LocalDate endDate, Product... products) {
        Deals deal = new Deals();
        deal.setTitle(title);
        deal.setDescription(description);
        deal.setDiscountPercentage(discountPercentage);
        deal.setStartDate(startDate);
        deal.setEndDate(endDate);
        for (Product product : products) {
            deal.addProduct(product);
        }
        return deal;
    }

    private static Date convertToDate(LocalDate localDate) {
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}