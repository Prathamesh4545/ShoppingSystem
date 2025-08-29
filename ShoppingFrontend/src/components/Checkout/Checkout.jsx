import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useGuest } from "../../context/GuestContext";
import { toast } from "react-toastify";
import ThemeContext from "../../context/ThemeContext";
import OrderSummary from "../Cart/OrderSummary";
import AddressForm from "../Addresses/AddressForm";
import GuestCheckoutForm from "./GuestCheckoutForm";
import { API_URL } from "../../config/constants";
import { FaMapMarkerAlt, FaCreditCard, FaLock, FaUser, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Checkout = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { cart, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const { guestUser, createGuestUser } = useGuest();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(!isAuthenticated);
  const [selectedPayment, setSelectedPayment] = useState("cod");

  // Calculate total savings from deals
  const totalSavings = cart.reduce((total, item) => {
    const product = item.product;
    if (product?.dealInfo && new Date(product.dealInfo.endDate) > new Date()) {
      const originalPrice = product.price * item.quantity;
      const discountedPrice = originalPrice * (1 - product.dealInfo.discountPercentage / 100);
      return total + (originalPrice - discountedPrice);
    }
    return total;
  }, 0);

  // Fetch user's addresses if authenticated
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated || !user?.id) return;

      try {
        const response = await fetch(`${API_URL}/address/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch addresses: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        try {
          const data = JSON.parse(responseText);
          setAddresses(data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', responseText);
          throw new Error('Invalid JSON response from server');
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error(error.message || "Failed to load addresses");
      }
    };

    fetchAddresses();
  }, [isAuthenticated, user?.id, token]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleGuestProceed = (guestData) => {
    setShowGuestForm(false);
    toast.success("Guest information saved successfully");
  };

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map(item => {
        const product = item.product;
        let price = product.price;
        
        // Apply deal discount if applicable
        if (product?.dealInfo && new Date(product.dealInfo.endDate) > new Date()) {
          price = price * (1 - product.dealInfo.discountPercentage / 100);
        }

        return {
          productId: product.id,
          quantity: item.quantity,
          price: price,
          originalPrice: product.price // Include original price for reference
        };
      });

      // Calculate total amount with discounts
      const calculatedTotal = orderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const orderRequest = {
        userId: isAuthenticated ? user.id : guestUser.id,
        items: orderItems,
        totalAmount: calculatedTotal,
        status: "PENDING",
        addressId: selectedAddress.id,
        isGuestOrder: !isAuthenticated,
        guestInfo: !isAuthenticated ? {
          name: guestUser.name,
          email: guestUser.email,
          phone: guestUser.phone
        } : null,
        paymentMethod: selectedPayment
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAuthenticated && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
      }

      const order = await response.json();
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentChange = (e) => {
    setSelectedPayment(e.target.value);
  };

  return (
    <div className={`pt-16 min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
              isDarkMode 
                ? "from-sky-400 via-purple-400 to-sky-400" 
                : "from-sky-600 via-purple-600 to-sky-600"
            }`}>
              Checkout
            </h1>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guest Checkout Form */}
            <AnimatePresence>
              {showGuestForm && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <GuestCheckoutForm onProceed={handleGuestProceed} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delivery Address Section */}
            <AnimatePresence>
              {!showGuestForm && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`rounded-xl p-6 shadow-lg backdrop-blur-lg ${
                    isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    Delivery Address
                  </h2>

                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <motion.div
                          key={address.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedAddress?.id === address.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                              : isDarkMode
                              ? "border-gray-700 hover:border-gray-600"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleAddressSelect(address)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {address.type}
                            </span>
                            {selectedAddress?.id === address.id && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-blue-500"
                              >
                                Selected
                              </motion.span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {address.street}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {address.country}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No addresses found. Please add a delivery address.
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddressForm(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                  >
                    <FaMapMarkerAlt className="text-sm" />
                    Add New Address
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment Section */}
            <AnimatePresence>
              {!showGuestForm && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`rounded-xl p-6 shadow-lg backdrop-blur-lg ${
                    isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FaCreditCard className="text-blue-500" />
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedPayment === "cod"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : isDarkMode
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        id="cod"
                        checked={selectedPayment === "cod"}
                        onChange={handlePaymentChange}
                        value="cod"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="cod" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                        Cash on Delivery
                      </label>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedPayment === "card"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : isDarkMode
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        id="card"
                        checked={selectedPayment === "card"}
                        onChange={handlePaymentChange}
                        value="card"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="card" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                        Credit/Debit Card
                      </label>
                    </motion.div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FaShieldAlt className="text-sm" />
                    <span>Your payment information is secure</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <OrderSummary
                totalPrice={totalPrice}
                totalSavings={totalSavings}
                handleCheckout={() => {}}
                handlePlaceOrder={handleCreateOrder}
                cart={cart}
                showCheckoutButton={false}
                loading={loading}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`rounded-xl p-6 shadow-xl max-w-md w-full ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Add New Address
              </h2>
              <AddressForm
                onAddressAdded={(newAddress) => {
                  setAddresses([...addresses, newAddress]);
                  setShowAddressForm(false);
                }}
                onClose={() => setShowAddressForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout; 