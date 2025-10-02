package com.prathamesh.ShoppingBackend.Config;

import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.model.Product;
import com.prathamesh.ShoppingBackend.model.User;
import com.prathamesh.ShoppingBackend.model.User.Role;
import com.prathamesh.ShoppingBackend.repository.DealsRepo;
import com.prathamesh.ShoppingBackend.repository.ProductRepo;
import com.prathamesh.ShoppingBackend.repository.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

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

    @Bean
    @Transactional
    public CommandLineRunner loadData() {
        return args -> {
            if (userRepo.count() == 0) {
                initializeUsers();
                System.out.println("✅ Default users initialized.");
            } else {
                System.out.println("⏩ Users already exist. Skipping initialization.");
            }

            if (productRepo.count() == 0) {
                initializeProducts();
                System.out.println("✅ Default products initialized.");
            } else {
                System.out.println("⏩ Products already exist. Skipping initialization.");
            }

            if (dealsRepo.count() == 0 && productRepo.count() > 0) {
                initializeDeals();
                System.out.println("✅ Default deals initialized.");
            } else {
                System.out.println("⏩ Deals already exist or no products available. Skipping initialization.");
            }
        };
    }

    @Transactional
    protected void initializeUsers() {
        User admin = new User();
        admin.setUserName("admin");
        admin.setPassword(passwordEncoder.encode("adminPassword"));
        admin.setRole(Role.ADMIN);  // Always set explicitly
        userRepo.save(admin);
        
        // When creating regular users
        User regularUser = new User();
        regularUser.setUserName("user");
        regularUser.setPassword(passwordEncoder.encode("userPassword"));
        regularUser.setRole(Role.USER);  // Set explicitly instead of relying on DB default
        userRepo.save(regularUser);
    }

    @Transactional
    protected void initializeProducts() {
        List<Product> products = Arrays.asList(
                createProduct("Laptop", "Dell", "High performance laptop", "Electronics",
                        LocalDate.of(2025, 3, 1)),
                createProduct("Smartphone", "Samsung", "Latest Android smartphone", "Electronics",
                        LocalDate.of(2025, 3, 2)),
                createProduct("Headphones", "Sony", "Noise cancelling headphones", "Audio",
                        LocalDate.of(2025, 3, 3)),
                createProduct("Smartwatch", "Apple", "Fitness tracking smartwatch", "Wearable",
                        LocalDate.of(2025, 3, 4)),
                createProduct("Television", "LG", "4K Ultra HD TV", "Electronics", LocalDate.of(2025, 3, 5)));

        productRepo.saveAll(products);
    }

    private Product createProduct(String name, String brand, String desc, String category, LocalDate releaseDate) {
        Product product = new Product();
        product.setProductName(name);
        product.setBrand(brand);
        product.setDesc(desc);
        product.setCategory(category);
        product.setReleaseDate(convertToDate(releaseDate));
        product.setAvailable(true);
        product.setQuantity(100);
        product.setPrice(BigDecimal.valueOf(999.99));
        return product;
    }

    @Transactional
    protected void initializeDeals() {
        List<Product> products = productRepo.findAll();
        if (products.isEmpty()) {
            System.out.println("⚠️ No products available to create deals");
            return;
        }

        List<Deals> deals = Arrays.asList(
                createDeal("Winter Sale", "Up to 50% off on winter wear!", new BigDecimal(50),
                        LocalDate.of(2025, 3, 1), LocalDate.of(2025, 4, 28),
                        LocalTime.of(0, 0), LocalTime.of(23, 59),
                        products.get(3), products.get(4)),
                createDeal("Buy One Get One Free", "Buy one product and get another for free.",
                        new BigDecimal(100), LocalDate.of(2025, 4, 10), LocalDate.of(2025, 4, 20),
                        LocalTime.of(0, 0), LocalTime.of(23, 59),
                        products.get(2)),
                createDeal("Flash Deal: 30% Off", "Flash deal! 30% off on electronics.",
                        new BigDecimal(30), LocalDate.of(2025, 4, 12), LocalDate.of(2025, 4, 12),
                        LocalTime.of(0, 0), LocalTime.of(23, 59),
                        products.get(0), products.get(1)));

        dealsRepo.saveAll(deals);
    }

    private Deals createDeal(String title, String description, BigDecimal discountPercentage,
                           LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime,
                           Product... products) {
        Deals deal = new Deals();
        deal.setTitle(title);
        deal.setDescription(description);
        deal.setDiscountPercentage(discountPercentage);
        deal.setStartDate(startDate);
        deal.setEndDate(endDate);
        deal.setStartTime(startTime);
        deal.setEndTime(endTime);
        deal.setActive(true);

        for (Product product : products) {
            deal.addProduct(product);
        }
        return deal;
    }

    private static Date convertToDate(LocalDate localDate) {
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
