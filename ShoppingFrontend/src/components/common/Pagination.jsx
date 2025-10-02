import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  size = 'md',
  showFirstLast = true,
  showPageNumbers = true,
  className = '',
}) => {
  const { isDark } = useTheme();

  const sizes = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    },
    md: {
      button: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
    },
    lg: {
      button: 'px-6 py-3 text-lg',
      icon: 'w-6 h-6',
    },
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const renderPageButton = (page, label) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`${
        sizes[size].button
      } rounded-md font-medium transition-colors duration-200 ${
        currentPage === page
          ? isDark
            ? 'bg-primary text-white'
            : 'bg-primary text-white'
          : isDark
          ? 'text-gray-300 hover:bg-gray-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label || page}
    </button>
  );

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {showFirstLast && currentPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`${
              sizes[size].button
            } rounded-md font-medium transition-colors duration-200 ${
              isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaChevronLeft className={`${sizes[size].icon} mr-1`} />
            First
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className={`${
              sizes[size].button
            } rounded-md font-medium transition-colors duration-200 ${
              isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaChevronLeft className={sizes[size].icon} />
          </button>
        </>
      )}

      {showPageNumbers && getPageNumbers().map((page) => renderPageButton(page))}

      {currentPage < totalPages && (
        <>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className={`${
              sizes[size].button
            } rounded-md font-medium transition-colors duration-200 ${
              isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaChevronRight className={sizes[size].icon} />
          </button>
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              className={`${
                sizes[size].button
              } rounded-md font-medium transition-colors duration-200 ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Last
              <FaChevronRight className={`${sizes[size].icon} ml-1`} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Pagination; 