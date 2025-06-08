import { useEffect } from 'react';
import { useWorkoutStore } from '@/shared/model';

/**
 * Custom hook for managing theme (dark/light mode)
 * Handles theme application to DOM and provides theme state and controls
 */
export const useTheme = () => {
  const { settings, updateSettings } = useWorkoutStore();
  const isDarkMode = settings.darkMode;

  // Apply theme to document element when dark mode changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Store theme preference in localStorage for persistence
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize theme from localStorage on first load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Use saved theme or system preference if no saved theme
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if (shouldBeDark !== isDarkMode) {
      updateSettings({ darkMode: shouldBeDark });
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if no manual theme is set
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        updateSettings({ darkMode: e.matches });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [updateSettings]);

  const toggleTheme = () => {
    updateSettings({ darkMode: !isDarkMode });
  };

  const setTheme = (dark: boolean) => {
    updateSettings({ darkMode: dark });
  };

  return {
    isDarkMode,
    theme: isDarkMode ? 'dark' : 'light',
    toggleTheme,
    setTheme,
    setDarkMode: (dark: boolean) => setTheme(dark),
    setLightMode: () => setTheme(false)
  };
};
