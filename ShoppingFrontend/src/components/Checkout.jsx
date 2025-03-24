import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AddressForm from "../components/Addresses/AddressForm";
import { API_URL } from "../config/constants";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Checkout = () => {
  const { isDark } = useContext(ThemeContext);
  const [address, setAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { user, token, refreshToken, isTokenExpired, logout } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      toast.error("Please log in to proceed with checkout");
      navigate("/login");
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id || !token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/address/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load addresses");
        const data = await response.json();
        setAddresses(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchAddresses();
  }, [user?.id, token]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (cart.length === 0) throw new Error("Cart is empty");
      if (!address) throw new Error("Please select or add an address");

      // Validate user ID
      if (!user?.id) {
        throw new Error("User ID is missing. Please log in again.");
      }

      // Ensure userId is a number
      const userId = Number(user.id);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID format");
      }

      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          return;
        }
      }

      const payload = {
        userId: userId, // Use the validated number
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: Number(totalPrice),
        status: "PENDING",
        address: address,
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      await clearCart();
      toast.success("Order placed successfully");
      navigate("/my-orders");
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isAuthLoading) return <LoadingSpinner />;

  return (
    <div className={`pt-10 min-h-screen p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="pt-20 max-w-4xl mx-auto">
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Shipping Address
          </h2>

          <AddressForm
            userId={user?.id}
            onAddressSubmit={(newAddress) => {
              setAddresses((prev) => [...prev, newAddress]);
              setAddress(newAddress);
            }}
          />

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Select Address
            </h2>
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 border rounded-lg mb-4 cursor-pointer ${
                    address?.id === addr.id ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => {
                    console.log("Address Selected:", addr); // Debugging
                    setAddress(addr);
                  }}
                >
                  <p>
                    <strong>Street:</strong> {addr.street}
                  </p>
                  <p>
                    <strong>City:</strong> {addr.city}
                  </p>
                  <p>
                    <strong>State:</strong> {addr.state}
                  </p>
                  <p>
                    <strong>Zip Code:</strong> {addr.zipCode}
                  </p>
                  <p>
                    <strong>Country:</strong> {addr.country}
                  </p>
                  <p>
                    <strong>Type:</strong> {addr.type}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No addresses saved yet.</p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !address || cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
