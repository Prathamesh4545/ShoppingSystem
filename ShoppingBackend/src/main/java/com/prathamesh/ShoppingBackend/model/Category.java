package com.prathamesh.ShoppingBackend.model;

import jakarta.persistence.*;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @Column(length = 500)
    private String requiredFields;

    private String icon;

    public Category() {}

    public Category(int id, String name, String description, String requiredFields, String icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.requiredFields = requiredFields;
        this.icon = icon;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequiredFields() { return requiredFields; }
    public void setRequiredFields(String requiredFields) { this.requiredFields = requiredFields; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
