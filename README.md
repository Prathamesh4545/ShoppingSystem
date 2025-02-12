# ShoppingSystem

I highly recommend downloading and running this project. It is one of the best projects I have worked on, and although it is still in the development phase, I believe it has significant potential. Please note that there are some incomplete SQL queries within the build that may lack associated images. However, feel free to add your own data to test the functionality and explore how it operates.
Your feedback would be greatly appreciated as I continue to improve and refine the project.

This project is a full-stack application built using React for the frontend and Java Spring Boot for the backend. The goal of the project is to create a seamless and interactive shopping system while allowing me to learn and practice both React and Spring Boot.

## Project Overview

This application consists of two main components:
1. **Frontend**: A dynamic and interactive interface built using React.
2. **Backend**: A robust and scalable server-side using Java Spring Boot.

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
- Also one thing there is already have some data is in data.sql page and this doesn't have image because it is in byte formate so if you want you can add used frontend only 

## Phase 1 Completion (23-Jan-2025)

In the initial phase, the project adopts an MVC architecture with a four-layered structure comprising Controller, Service, Repository, and Model. 
The following tasks were accomplished in this phase:
- Product Entity: Developed the Product entity along with its repository, service, and controller.
- APIs: Created two APIs to fetch all data and data by ID.
- Frontend Development: Designed and implemented a front page to display the content to the client, utilizing React's functionalities such as useState hook, useEffect hook, component structuring, routing, useContext, and more.

---

This marks the successful completion of the first stage of the ShoppingSystem project, laying a solid foundation for future development.

## Phase 2 Completion (25-Jan-2025)

The second phase of the ShoppingSystem project has successfully moved forward, primarily focusing on crucial functionalities. 
Here's a summary of the tasks accomplished:
- API Development: Implemented the "add product" endpoint.
- Frontend Enhancements:
    - Designed and developed form submission handling.
    - Integrated image upload capability.
    - Fetched and displayed all necessary data.
- Route :- http://localhost:5173/
- <Route path='/' element={<Home/>}/>
- <Route path='/product/:id' element={<Product/>}/>
- <Route path='/product/add' element={<AddProduct/>}/>

---
  
Despite fewer activities than previous phases, the phase efficiently addressed vital features, ensuring a robust user experience.

## Phase 3 Completion

In Third phase of the ShoppingSystem project has successfully move forward, primarily focusing on crucial functionalities.
Here's a summary of the tasks accomplished:
- API Development:
    - Implemented the "get all product" endpoint.
    - Implemented the "update product" endpoint.
    - Implemented the "delete product" endpoint.
- Frontend Enhancements:
    - Designed a search bar with multiple categories.
    - Implements the get all products api with specific design.
    - Inside all product design i have create two button one for update and another for delete product.
- Route :- http://localhost:5173/
- <Route path='/product' element={<GetProductById/>}/>
- <Route path='/product/update/:id' element={<UpdateProduct/>}/>
  
---

Feel free to add your own data to test the functionality and explore the system's capabilities. Contributions and feedback are highly encouraged!
