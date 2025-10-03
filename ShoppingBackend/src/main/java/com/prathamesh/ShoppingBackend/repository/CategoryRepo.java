package com.prathamesh.ShoppingBackend.repository;

import com.prathamesh.ShoppingBackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Integer> {
    Optional<Category> findByName(String name);
}
