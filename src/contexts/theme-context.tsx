'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    actualTheme: 'light' | 'dark'; // El tema real aplicado (resuelve 'system')
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    // Cargar tema guardado al montar
    useEffect(() => {
        const savedTheme = localStorage.getItem('skynet-theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        }
    }, []);

    // Resolver el tema actual (system -> light/dark según preferencia del SO)
    useEffect(() => {
        const getSystemTheme = (): 'light' | 'dark' => {
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        };

        const resolveTheme = (): 'light' | 'dark' => {
            if (theme === 'system') {
                return getSystemTheme();
            }
            return theme;
        };

        const resolved = resolveTheme();
        setActualTheme(resolved);

        // Aplicar clase al documento
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);

        // Escuchar cambios en preferencias del sistema
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const newTheme = mediaQuery.matches ? 'dark' : 'light';
                setActualTheme(newTheme);
                root.classList.remove('light', 'dark');
                root.classList.add(newTheme);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('skynet-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
