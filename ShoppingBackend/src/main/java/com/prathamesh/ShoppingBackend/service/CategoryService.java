package com.prathamesh.ShoppingBackend.service;

import com.prathamesh.ShoppingBackend.model.Category;
import com.prathamesh.ShoppingBackend.repository.CategoryRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepo categoryRepo;

    public CategoryService(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    public Category getCategoryByName(String name) {
        return categoryRepo.findByName(name).orElse(null);
    }

    public Category saveCategory(Category category) {
        return categoryRepo.save(category);
    }
}
