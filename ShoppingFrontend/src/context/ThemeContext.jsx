import { createContext, useState, useEffect, useCallback, useMemo } from "react";

export const ThemeContext = createContext();

// Update ThemeContext.jsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme first
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme;
      
      // Fall back to system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
    }
    return "light"; // Default for SSR
  });

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    isDark: theme === "dark"
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};