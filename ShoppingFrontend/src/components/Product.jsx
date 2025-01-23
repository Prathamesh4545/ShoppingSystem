import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Product = () => {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      console.log("No id parameter found in the URL"); // Add this line to log a message if no id parameter is found
    }
  }, [id]);

  useEffect(() => {
    if (product.quantity === 0) {
      setQuantity(0);
    }
  }, [product.quantity]);

    
  const checkStock = () => {
    if(product.quantity > 0){
      return "In Stock"
    }else{
      return "Out of Stock"
    }
  }


  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/product/${id}`
      );
      setProduct(response.data);
    } catch (error) {
      setError("Failed to fetch product data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="m-8">
      <div
        href="#"
        className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <img
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
          src=""
          alt="product image"
        />
        <div className="flex flex-col justify-between p-4 leading-normal">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {product.category}
          </span>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {product.name}
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {product.desc}
          </p>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
             ${product.price}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
           Product Listed On : {product.releaseDate}
          </span>
          
          <div className="shadow-xl text-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            { checkStock()} 
          </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
