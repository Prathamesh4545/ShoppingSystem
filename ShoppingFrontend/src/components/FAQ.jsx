import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'How do I place an order?',
      answer:
        'To place an order, simply browse our products, select the ones you wish to buy, and click "Add to Cart." Then, proceed to checkout to complete your order.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept various payment methods including credit cards, debit cards, PayPal, and other secure online payment gateways.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'Once your order has been shipped, you will receive a tracking number via email. You can use that tracking number to track the status of your shipment.',
    },
    {
      question: 'Can I return or exchange an item?',
      answer:
        'Yes, we offer a 30-day return and exchange policy. Please ensure the items are in their original condition, with tags and packaging intact.',
    },
    {
      question: 'Do you offer free shipping?',
      answer:
        'We offer free shipping on orders over $50 within the continental United States. For international orders, shipping fees may apply.',
    },
    {
      question: 'How do I contact customer support?',
      answer:
        'You can reach our customer support team through the "Contact Us" section of our website, or by calling our toll-free number listed on the bottom of the page.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h1>
            <p className="text-gray-600 mt-2">Find answers to the most common questions about our services and policies.</p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-gray-100 rounded-lg shadow-md">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className="text-xl font-semibold text-gray-800">{faq.question}</h3>
                  {activeIndex === index ? (
                    <FaChevronUp className="text-gray-600" />
                  ) : (
                    <FaChevronDown className="text-gray-600" />
                  )}
                </div>

                {activeIndex === index && (
                  <div className="px-4 pb-4 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
