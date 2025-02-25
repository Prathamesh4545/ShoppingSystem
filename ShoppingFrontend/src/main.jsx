import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ProductContext from "./context/ProductContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ProductContext>
    <CartProvider>
        <App />
    </CartProvider>
  </ProductContext>
  </BrowserRouter>
);
