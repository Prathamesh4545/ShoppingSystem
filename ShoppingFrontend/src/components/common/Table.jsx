import React from 'react';
import { useContext } from 'react';
import ThemeContext from '../../context/ThemeContext';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const Table = ({
  columns,
  data,
  sortConfig,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  const getSortIcon = (key) => {
    if (!sortConfig) return <FaSort className="w-4 h-4 ml-1" />;
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? (
        <FaSortUp className="w-4 h-4 ml-1" />
      ) : (
        <FaSortDown className="w-4 h-4 ml-1" />
      );
    }
    return <FaSort className="w-4 h-4 ml-1" />;
  };

  const handleSort = (key) => {
    if (!onSort) return;
    const direction =
      sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSort({ key, direction });
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode
                    ? 'text-gray-300 bg-gray-800'
                    : 'text-gray-500 bg-gray-50'
                } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 