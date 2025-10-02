package com.prathamesh.ShoppingBackend.Exception;

public class InvalidOrderTotalException extends RuntimeException {
    public InvalidOrderTotalException(String message) {
        super(message);
    }
}
