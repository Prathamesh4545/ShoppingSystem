// Footer.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-white rounded-lg shadow-sm m-4 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2023{" "}
          <a href="/" className="hover:underline">
            Prathamesh™
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          {!isAuthenticated && (
            <li>
              <a href="#about" className="hover:underline me-4 md:me-6">
                About
              </a>
            </li>
          )}
          <li>
            <a href="#privacy" className="hover:underline me-4 md:me-6">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="#licensing" className="hover:underline me-4 md:me-6">
              Licensing
            </a>
          </li>
          {isAuthenticated && (
            <li>
              <a href="#dashboard" className="hover:underline me-4 md:me-6">
                Dashboard
              </a>
            </li>
          )}
          <li>
            <a href="#contact" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default React.memo(Footer);