import { createContext, useContext, useState, useEffect } from 'react';
import { themeService } from '../services/api';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        setTheme(parsed);
        applyTheme(parsed);
      }

      const data = await themeService.get();
      setTheme(data);
      localStorage.setItem('appTheme', JSON.stringify(data));
      applyTheme(data);
    } catch (error) {
      console.error('Error loading theme:', error);
      const defaultTheme = {
        color_primario: '#C0392B',
        color_secundario: '#2C2C2A',
        color_acento: '#E74C3C',
        modo_tema: 'claro',
        nombre_restaurante: 'Red Velvet',
        slogan: ''
      };
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (t) => {
    const root = document.documentElement;
    
    if (t) {
      const primary = t.color_primario || '#C0392B';
      const secondary = t.color_secundario || '#2C2C2A';
      const accent = t.color_acento || '#E74C3C';
      const mode = t.modo_tema || 'claro';
      const isDark = mode === 'oscuro';
      
      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--color-primary-hover', adjustColor(primary, -20));
      root.style.setProperty('--color-secondary', secondary);
      root.style.setProperty('--color-accent', accent);
      root.style.setProperty('--color-background', isDark ? '#1a1a2e' : '#f8f9fa');
      root.style.setProperty('--color-surface', isDark ? '#2d2d44' : '#ffffff');
      root.style.setProperty('--color-text', isDark ? '#ffffff' : '#1a1a1a');
      root.style.setProperty('--color-text-secondary', isDark ? '#a0a0a0' : '#6c757d');
      
      document.body.style.background = isDark ? '#1a1a2e' : '#f8f9fa';
      
      if (isDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  };

  const adjustColor = (hex, amount) => {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + amount));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
      const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
      return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    } catch {
      return hex;
    }
  };

  const updateTheme = async (newTheme) => {
    try {
      const updated = await themeService.update(newTheme);
      setTheme(updated);
      localStorage.setItem('appTheme', JSON.stringify(updated));
      applyTheme(updated);
      return updated;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  const refreshTheme = () => {
    loadTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme, refreshTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;