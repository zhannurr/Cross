import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
export const lightTheme = {
  primary: '#4a90e2',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  card: '#ffffff',
  cardBorder: '#e0e0e0',
  input: '#f0f0f0',
  inputText: '#333333',
  button: '#4a90e2',
  buttonText: '#ffffff',
  error: '#ff3b30',
  success: '#34c759',
  warning: '#ff9500',
  tabBarBackground: '#ffffff',
  tabBarActiveTint: '#4a90e2',
  tabBarInactiveTint: '#999999',
};

export const darkTheme = {
  primary: '#4a90e2',
  background: '#25292e',
  surface: '#3a3f47',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: '#3a3f47',
  card: '#3a3f47',
  cardBorder: '#4a4f57',
  input: '#3a3f47',
  inputText: '#ffffff',
  button: '#4a90e2',
  buttonText: '#ffffff',
  error: '#ff453a',
  success: '#32d74b',
  warning: '#ff9f0a',
  tabBarBackground: '#1c1c1e',
  tabBarActiveTint: '#4a90e2',
  tabBarInactiveTint: '#888888',
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme === 'dark') {
          setIsDarkMode(true);
          setTheme(darkTheme);
        } else if (savedTheme === 'light') {
          setIsDarkMode(false);
          setTheme(lightTheme);
        } else {
          // fallback to system theme
          const systemIsDark = systemColorScheme === 'dark';
          setIsDarkMode(systemIsDark);
          setTheme(systemIsDark ? darkTheme : lightTheme);
        }
      } catch (e) {
        console.error('Error loading theme:', e);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Toggle theme and save preference
  const toggleTheme = async () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    setTheme(newIsDark ? darkTheme : lightTheme);
    await AsyncStorage.setItem('appTheme', newIsDark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
