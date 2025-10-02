package com.prathamesh.ShoppingBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShoppingBackendApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(ShoppingBackendApplication.class);
		app.run(args);
	}

}
