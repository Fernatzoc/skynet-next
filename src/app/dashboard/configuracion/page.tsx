'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { theme, setTheme, actualTheme } = useTheme();
    const { toast } = useToast();

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        toast({
            title: "Tema actualizado",
            description: `Se aplicó el tema ${newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'oscuro' : 'del sistema'}`,
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">
                        Administra las preferencias y configuraciones del sistema
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Apariencia - ÚNICA SECCIÓN FUNCIONAL */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Palette className="h-5 w-5" />
                                <CardTitle>Apariencia</CardTitle>
                            </div>
                            <CardDescription>
                                Personaliza la apariencia de la aplicación
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Label>Tema</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                            theme === 'light'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <Sun className="h-5 w-5" />
                                        <span className="text-xs font-medium">Claro</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                            theme === 'dark'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <Moon className="h-5 w-5" />
                                        <span className="text-xs font-medium">Oscuro</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('system')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                            theme === 'system'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <Monitor className="h-5 w-5" />
                                        <span className="text-xs font-medium">Sistema</span>
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Tema actual: <span className="font-medium capitalize">{actualTheme}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
