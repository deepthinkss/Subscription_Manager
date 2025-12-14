import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '@/constants';
import type { ThemeContextType, ThemeColors } from '@/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme');
        if (savedTheme) {
          setIsDark(savedTheme === 'dark');
        } else if (systemColorScheme) {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Load theme error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const newDark = !isDark;
      setIsDark(newDark);
      await AsyncStorage.setItem('app_theme', newDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Toggle theme error:', error);
    }
  };

  const colors: ThemeColors = isDark ? THEME.dark : THEME.light;

  const value: ThemeContextType = {
    isDark,
    colors,
    toggleTheme,
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
