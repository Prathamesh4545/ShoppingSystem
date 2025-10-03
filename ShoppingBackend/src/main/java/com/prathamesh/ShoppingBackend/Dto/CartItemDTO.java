package com.prathamesh.ShoppingBackend.Dto;

public class CartItemDTO {
    private Long id;
    private ProductDTO product;
    private int quantity;

    public CartItemDTO() {}

    public CartItemDTO(Long id, ProductDTO product, int quantity) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductDTO getProduct() { return product; }
    public void setProduct(ProductDTO product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
