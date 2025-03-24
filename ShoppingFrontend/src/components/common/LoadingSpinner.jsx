import React from "react";
import { Spinner } from "flowbite-react";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const LoadingSpinner = () => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`flex justify-center items-center h-screen ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      <Spinner size="xl" color={isDark ? "gray" : "dark"} />
    </div>
  );
};

export default LoadingSpinner;
