# ShoppingSystem

I am pleased to introduce the ShoppingSystem project, an innovative full-stack application currently in development. Despite being in the development phase, it has demonstrated significant potential. Please note that some SQL queries are incomplete and may lack associated images. However, you are encouraged to add your own data to test the functionality and explore its capabilities. Your feedback would be invaluable as I strive to enhance and refine the project further.

## Project Overview

The ShoppingSystem application is designed to create a seamless and interactive shopping experience. It consists of two main components:
1. **Frontend**: A dynamic and interactive interface built using React.
2. **Backend**: A robust and scalable server-side using Java Spring Boot.

- This project follows an MVC (Model-View-Controller) architecture with a four-layered structure: Controller, Service, Repository, and Model.

## Requirements

Before you get started, ensure you have the following installed on your machine:
- React.js (for running the frontend)
- Java JDK (for running the backend)
- Maven (for managing Java dependencies)
- A modern web browser

## How To Start Projects 
- 1st download
- In forntend open terminal and install node module using (npm install)
- after start the backend project 1st
- and then start frontend project using (npm run dev)
- and used this link on browser -->  http://localhost:5173/
- also if you want used postman you can used without any worried
- localhost:8080/api/products  --> this is for seen all products
- Also one thing there is already have some data is in data.sql page and this doesn't have image because it is in byte formate so if you want you can add it using admin dashboard 

## Phase 1 - Initial Setup (Completed: 23-Jan-2025)
In the first phase, the focus was on establishing a foundational architecture. The following features were developed:

- Product Entity: Implemented the Product entity with its repository, service, and controller layers.
- API Development:
  - Created endpoints to fetch all products and individual product details by ID.
- Frontend Development:
  - Developed the homepage UI using React, utilizing React hooks like useState and useEffect.
  - Incorporated routing with React Router for easy navigation between pages.

---

## Phase 2 - Core Features Implementation (Completed: 25-Jan-2025)
The second phase focused on key functionalities that are critical to the system's operation. This phase included:

- API Development:
  - Implemented the add product endpoint to allow users to add new products.
- Frontend Enhancements:
  - Created and designed a product form for submitting new products, including fields for product details and image uploads.
  - Displayed all products fetched from the backend.
  - Set up routing for different pages:
    1. GET /api/products - Fetch all products
    2. GET /api/products/{id} - Fetch product by ID
    3. POST /api/products - Add new product
 - Routing is defined as follows:
    1. / - Home Page (<Home />)
    2. /product/:id - Product Detail Page (<Product />)
    3. /product/add - Add New Product Form (<AddProduct />)
       
---

## Phase 3 - Expanded CRUD Operations (Completed)
The third phase brought expanded CRUD (Create, Read, Update, Delete) functionality, improving the system's flexibility and user experience:

 - API Development:
   - Implemented GET all products, UPDATE product, and DELETE product endpoints.
 - Frontend Enhancements:
   - Added a search bar with multiple categories to help users filter products.
   - Implemented buttons for updating and deleting products directly from the product list.
   - Enhanced product display pages with actionable buttons for Update and Delete.
 - Routing is defined as follows:
   1. /product - Product List (<GetProductById />)
   2. /product/update/:id - Update Product Form (<UpdateProduct />)
   
---

## Update version 

🚀 Features
🛍 User Authentication – Secure login and registration.
📦 Product Management – Add, update, and delete products.
🏷️ Deals Management - Add, Update, delete, and shedule deals.
🛒 Shopping Cart – Add/remove products and view the cart summary.
📜 Admin Dashboard – Manage users, orders, and products efficiently.

## future enhansment
💳 Order Processing – Secure checkout and payment integration.
📫 Address Management – Integreate billing address, Normal address.
💸 Payment Getway – Integreate Payment gatway like paypal, rubicon.

## Deployment

To deploy this project run

```bash
    1st : ShoppingBackendApplication.java run this file 
    2nd : npm run dev
```
```bash
    admin login : 
        username : admin
        password : adminPassword
```

Feel free to explore, test, and contribute to the ShoppingSystem project. Happy coding!







