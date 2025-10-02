import React, { useEffect } from "react";
import { useRouteError, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer); 
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-lg text-gray-700 mb-2">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="text-gray-500 italic mb-8">
        {error.statusText || error.message}
      </p>
      <p className="text-gray-600 mb-4">
        You will be automatically redirected to the home page in 5 seconds...
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Go Back Home Now
      </button>
    </div>
  );
};

export default ErrorPage;