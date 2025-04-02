import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      primary: {
        light: '#60A5FA',
        DEFAULT: '#3B82F6',
        dark: '#2563EB',
      },
      secondary: {
        light: '#A78BFA',
        DEFAULT: '#8B5CF6',
        dark: '#7C3AED',
      },
      success: {
        light: '#34D399',
        DEFAULT: '#10B981',
        dark: '#059669',
      },
      warning: {
        light: '#FBBF24',
        DEFAULT: '#F59E0B',
        dark: '#D97706',
      },
      error: {
        light: '#F87171',
        DEFAULT: '#EF4444',
        dark: '#DC2626',
      },
      background: {
        light: {
          primary: '#FFFFFF',
          secondary: '#F3F4F6',
          tertiary: '#E5E7EB',
        },
        dark: {
          primary: '#111827',
          secondary: '#1F2937',
          tertiary: '#374151',
        },
      },
      text: {
        light: {
          primary: '#111827',
          secondary: '#4B5563',
          tertiary: '#6B7280',
        },
        dark: {
          primary: '#F9FAFB',
          secondary: '#D1D5DB',
          tertiary: '#9CA3AF',
        },
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out',
    },
    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;