# ShoppingSystem

Welcome to **ShoppingSystem**, an advanced full-stack application designed to enhance the shopping experience. While the project is still in development, it demonstrates significant potential. This document serves as a comprehensive guide to the system’s features, functionalities, and instructions for getting started.

Your feedback is highly valued, and we encourage you to explore, test, and contribute to the project to help refine and improve the application.

---

## Project Overview

**ShoppingSystem** is designed to provide a seamless and engaging shopping experience. The application consists of two primary components:

1. **Frontend**: A responsive and user-friendly interface developed using React.
2. **Backend**: A robust and scalable backend powered by Java Spring Boot.

The system follows the **Model-View-Controller (MVC)** architecture, utilizing a four-layered structure: Controller, Service, Repository, and Model.

---

## Requirements

To run this project, the following software must be installed on your system:

- **React.js** – For the frontend.
- **Java JDK** – For the backend.
- **Maven** – For managing Java dependencies.
- **Modern Web Browser** – For exploring the application.

---

## Getting Started

### Setup Instructions

1. Clone the repository.
2. Make Changes on postgresql database name as well as username and password - **application.properties**

   📂 File Located : **Spring Projects\Shopping-System\ShoppingBackend\src\main\resources**
   ```bash
   spring.datasource.url=jdbc:postgresql://localhost:5432/ShoppingSystemDB
   spring.datasource.username= add your username which associated with your postgresql
   spring.datasource.password= add your password as well
   ```
4. Navigate to the **frontend** directory and install the required dependencies:
   ```bash
   cd ShoppingFrontend
   npm install
   ```
Perform all operations that are available only within the admin panel.
   Note: Preloaded data is available in the `DataInitializer.java` file. Product images are in byte format so that it will not include in preload file, and also you can add or update images via the admin dashboard.

---

## Development Phases

### Phase 1: Initial Starting (Completed on 23-Jan-2025)

Implemented the Product entity, along with repository, service, and controller layers.

Developed APIs to:
- Fetch all products.
- Retrieve product details by ID.

Created the homepage using React, incorporating React hooks for state and effect management.
Integrated React Router to facilitate navigation between pages.

### Phase 2: Core Features (Completed on 25-Jan-2025)

Enhanced functionality:
- Added product submission forms with image upload support.
- Established routing for the following key pages:
  - `/` – Homepage
  - `/product/:id` – Product Details
  - `/product/add` – Add New Product

### Phase 3: CRUD Operations

Expanded API functionality to include:
- GET, UPDATE, and DELETE operations for products.

Improved the user interface:
- Implemented a search bar with category filters.
- Added actionable buttons for product update and deletion.

### Phase 4 to Phase 13: Enhancements and Deployment

- Migrated the database from H2 to PostgreSQL.
- Developed an Admin Dashboard for efficient management of users, orders, and products.
- Introduced role-based access control:
  - **Admin** – Manages system settings (without the ability to make purchases).
  - **User** – Adds items to the cart, manages profiles, and processes orders.
- Integrated Docker for simplified deployment.
- Resolved various server-side issues, including HTTP status errors (500, 403, 401).

---

## Key Features

- 🔒 **User Authentication** – Secure login and registration processes.
- 🛍️ **Product Management** – Add, update, and delete products.
- 🏷️ **Deals Management** – Schedule, add, update, and delete promotional deals.
- 📜 **Admin Dashboard** – Comprehensive system management tools.
- 🛒 **Shopping Cart** – Add and remove products, and view summaries.

---

## Planned Future Enhancements

The following features are planned for future releases:
- 💳 **Order Processing** – Secure checkout and payment gateway integration.
- 💸 **Payment Gateway Integration** – Integration with payment platforms such as PayPal and Razorpay.

---

## Deployment Instructions

To deploy the project, follow these steps:

1. Start the backend application by executing `ShoppingBackendApplication.java`.
2. Launch the frontend:
   ```bash
   npm run dev
   ```
3. We have already done 1 admin and 1 user to manage or test application 
   ```bash
   i) Add new employees through the dashboard.
   ii) Assign admin privileges to employees as needed.
   ```
4. Admin
   ```bash
   i) Username - admin.
   ii) Password - adminPassword.
   ```
5. Then make registration and test application.

We encourage you to explore, test, and contribute to ShoppingSystem to help enhance its functionality and user experience. Thank you for your participation, and happy coding! 🚀
