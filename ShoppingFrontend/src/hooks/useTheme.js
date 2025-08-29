import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

// Custom hook for consistent theme usage across the app
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  // Ensure consistent property names
  const { isDarkMode, toggleTheme, ...rest } = context;
  
  return {
    isDarkMode,
    isDark: isDarkMode, // Backward compatibility
    toggleTheme,
    ...rest
  };
};

// Theme utility functions
export const getThemeClasses = (isDarkMode) => ({
  background: isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
  
  card: isDarkMode 
    ? 'bg-gray-800/80 border-gray-700' 
    : 'bg-white/80 border-gray-200',
    
  text: {
    primary: isDarkMode ? 'text-white' : 'text-gray-900',
    secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
  },
  
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    secondary: isDarkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
  },
  
  input: isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white' 
    : 'bg-white border-gray-300 text-gray-900'
});

export default useTheme;