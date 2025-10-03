package com.prathamesh.ShoppingBackend.Config;

import com.prathamesh.ShoppingBackend.model.Category;
import com.prathamesh.ShoppingBackend.repository.CategoryRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepo categoryRepo;

    public CategoryInitializer(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @Override
    public void run(String... args) {
        if (categoryRepo.count() == 0) {
            initializeCategories();
        }
    }

    private void initializeCategories() {
        createCategory("Electronics", "Electronic devices and gadgets", "color,warranty,weight,dimensions", "💻");
        createCategory("Clothing", "Apparel and fashion items", "color,size,material", "👕");
        createCategory("Furniture", "Home and office furniture", "color,material,dimensions,weight,warranty", "🛋️");
        createCategory("Books", "Books and publications", "material,weight,dimensions", "📚");
        createCategory("Toys", "Toys and games", "color,material,weight,warranty", "🧸");
        createCategory("Sports", "Sports equipment and gear", "color,size,material,weight", "⚽");
        createCategory("Beauty", "Beauty and personal care", "color,size,weight", "💄");
        createCategory("Food", "Food and beverages", "weight", "🍔");
        createCategory("Jewelry", "Jewelry and accessories", "color,material,weight,warranty", "💍");
        createCategory("Automotive", "Automotive parts and accessories", "color,weight,dimensions,warranty", "🚗");
        createCategory("Home & Garden", "Home improvement and garden supplies", "color,material,dimensions,weight", "🏡");
        createCategory("Health", "Health and wellness products", "weight,dimensions", "🏥");
        createCategory("Pet Supplies", "Pet food and accessories", "weight,material", "🐾");
        createCategory("Office Supplies", "Office and stationery items", "color,dimensions,weight", "📎");
        createCategory("Music", "Musical instruments and accessories", "color,weight,dimensions,warranty", "🎵");
    }

    private void createCategory(String name, String description, String requiredFields, String icon) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setRequiredFields(requiredFields);
        category.setIcon(icon);
        categoryRepo.save(category);
    }
}
