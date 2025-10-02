package com.prathamesh.ShoppingBackend.Exception;

public class DealNotFoundException extends RuntimeException {
    public DealNotFoundException(String message) {
        super(message);
    }
}