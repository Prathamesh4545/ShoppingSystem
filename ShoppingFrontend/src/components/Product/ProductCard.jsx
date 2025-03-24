import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

const ProductCard = ({ product, addToCart, isAuthenticated, discountedPrice }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    if (product.quantity <= 0) {
      toast.warning("This product is out of stock.");
      return;
    }
    addToCart(product.id, 1); // Add item with quantity 1
    toast.success(`${product.productName} added to cart!`);
  };

  return (
    <div className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.03]">
      <Link to={`/product/${product.id}`} className="block" aria-label={`View ${product.productName}`}>
        <div className="w-full h-64 overflow-hidden rounded-lg">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={
              imageError || !product.images?.length || !product.images[0]?.imageData
                ? "/images/placeholder.webp"
                : `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
            }
            alt={product.productName || "Product image"}
            loading="lazy"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)} // Reset imageError on successful load
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {product.productName || "Unnamed Product"}
          </h3>
          <p className="mt-1 text-lg font-bold text-blue-600">
            ${!isNaN(discountedPrice) ? discountedPrice.toFixed(2) : "0.00"}{" "}
            {discountedPrice < product.price && (
              <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
            )}
          </p>
        </div>
      </Link>
      <button
        className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-transform duration-300 hover:scale-105"
        onClick={handleAddToCart}
        aria-label={`Add ${product.productName} to cart`}
        disabled={product.quantity <= 0} // Disable button if out of stock
      >
        <FaShoppingCart /> {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
};

export default React.memo(ProductCard);