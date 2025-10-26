'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, setTheme, actualTheme } = useTheme();

    const toggleTheme = () => {
        // Alternar entre light y dark (sin system)
        setTheme(actualTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            title={`Cambiar a modo ${actualTheme === 'light' ? 'oscuro' : 'claro'}`}
        >
            {actualTheme === 'light' ? (
                <Moon className="h-4 w-4" />
            ) : (
                <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Cambiar tema</span>
        </Button>
    );
}
