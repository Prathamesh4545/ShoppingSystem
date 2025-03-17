import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ProductContext from "./context/ProductContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Temporarily remove StrictMode for debugging
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ProductContext>
          <AuthProvider>
            <UserProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </UserProvider>
          </AuthProvider>
        </ProductContext>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);