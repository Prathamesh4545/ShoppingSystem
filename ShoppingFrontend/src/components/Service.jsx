import React, { useState } from "react";
import { Button } from "flowbite-react";
import { FaPhoneAlt, FaTruck, FaUndo, FaQuestionCircle } from "react-icons/fa";

const ServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Our Services</h1>
            <p className="text-gray-600 mt-2">
              Learn more about what we offer and how we can help you!
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Customer Support Card */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-md">
              <div className="text-center mb-4">
                <FaPhoneAlt className="text-4xl text-blue-500 mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Customer Support
                </h3>
                <p className="text-gray-600 mt-2">
                  We are here to help with any questions or concerns you have.
                </p>
              </div>
              <Button color="light" className="w-full">
                Contact Support
              </Button>
            </div>

            {/* Delivery Information Card */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-md">
              <div className="text-center mb-4">
                <FaTruck className="text-4xl text-green-500 mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Delivery Information
                </h3>
                <p className="text-gray-600 mt-2">
                  Fast and reliable shipping to ensure your orders arrive on
                  time.
                </p>
              </div>
              <Button color="light" className="w-full">
                Track Order
              </Button>
            </div>

            {/* Return Policy Card */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-md">
              <div className="text-center mb-4">
                <FaUndo className="text-4xl text-yellow-500 mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Return Policy
                </h3>
                <p className="text-gray-600 mt-2">
                  No worries! We offer a hassle-free return process if you
                  change your mind.
                </p>
              </div>
              <Button color="light" className="w-full">
                Learn More
              </Button>
            </div>

            {/* FAQ Section Card */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-md">
              <div className="text-center mb-4">
                <FaQuestionCircle className="text-4xl text-purple-500 mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Frequently Asked Questions
                </h3>
                <p className="text-gray-600 mt-2">
                  Get answers to the most common questions about our products
                  and services.
                </p>
              </div>
              <Button color="light" className="w-full">
                View FAQs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
