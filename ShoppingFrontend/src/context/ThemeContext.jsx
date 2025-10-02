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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      primary: {
        50: '#F0F9FF',
        100: '#E0F2FE',
        200: '#BAE6FD',
        300: '#7DD3FC',
        400: '#38BDF8',
        500: '#0EA5E9',
        600: '#0284C7',
        700: '#0369A1',
        800: '#075985',
        900: '#0C4A6E',
        DEFAULT: '#0EA5E9',
      },
      secondary: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        200: '#E9D5FF',
        300: '#D8B4FE',
        400: '#C084FC',
        500: '#A855F7',
        600: '#9333EA',
        700: '#7C2D12',
        800: '#6B21A8',
        900: '#581C87',
        DEFAULT: '#A855F7',
      },
      accent: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
        DEFAULT: '#10B981',
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
          secondary: '#FAFBFC',
          tertiary: '#F4F6F8',
          card: '#FFFFFF',
          surface: '#FAFBFC',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        dark: {
          primary: '#0A0E1A',
          secondary: '#151B2B',
          tertiary: '#1F2937',
          card: '#1A202C',
          surface: '#0F1419',
          gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        },
      },
      text: {
        light: {
          primary: '#0F172A',
          secondary: '#475569',
          tertiary: '#64748B',
          muted: '#94A3B8',
        },
        dark: {
          primary: '#F8FAFC',
          secondary: '#E2E8F0',
          tertiary: '#CBD5E1',
          muted: '#94A3B8',
        },
      },
      border: {
        light: {
          primary: '#E2E8F0',
          secondary: '#CBD5E1',
          accent: '#3B82F6',
        },
        dark: {
          primary: '#334155',
          secondary: '#475569',
          accent: '#60A5FA',
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
      '3xl': '5rem',
      '4xl': '7rem',
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
      sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
      md: '0 8px 24px rgba(0, 0, 0, 0.12)',
      lg: '0 16px 48px rgba(0, 0, 0, 0.16)',
      xl: '0 32px 64px rgba(0, 0, 0, 0.2)',
      '2xl': '0 48px 96px rgba(0, 0, 0, 0.25)',
      glow: '0 0 32px rgba(14, 165, 233, 0.3)',
      glowPurple: '0 0 32px rgba(168, 85, 247, 0.3)',
      card: '0 8px 32px rgba(0, 0, 0, 0.1)',
      cardHover: '0 16px 48px rgba(0, 0, 0, 0.15)',
      glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
    },
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out',
    },
    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        display: 'Inter, system-ui, sans-serif',
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
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeight: {
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
    },
    effects: {
      blur: {
        sm: 'blur(4px)',
        md: 'blur(8px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
      },
      backdrop: {
        light: 'rgba(255, 255, 255, 0.9)',
        dark: 'rgba(10, 14, 26, 0.9)',
      },
      gradients: {
        primary: 'linear-gradient(135deg, #0EA5E9 0%, #A855F7 100%)',
        secondary: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
        darkGlass: 'linear-gradient(135deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.1) 100%)',
        aurora: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        cosmic: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
    },
  };

  // Helper functions for theme usage
  theme.getColor = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], theme.colors);
  };

  theme.getShadow = (key) => theme.shadows[key];
  
  theme.getGradient = (key) => theme.effects.gradients[key];

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;