'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    // Detectar si está en modo demo
    const isDemoMode = !process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_URL.includes('localhost:3001');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (!result.success) {
                setError(result.error || 'Error al iniciar sesión');
                toast({
                    title: "Error de autenticación",
                    description: result.error || 'Error al iniciar sesión',
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Inicio de sesión exitoso",
                    description: "Bienvenido de vuelta",
                    variant: "success",
                });
            }
        } catch (err) {
            const error = err as { message?: string };
            const errorMessage = error.message || 'Error inesperado al iniciar sesión';
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    const quickLogin = (demoEmail: string, demoPassword: string) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                            <Lock className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Bienvenido a SkyNet</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {isDemoMode && (
                            <div className="p-4 text-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md space-y-2">
                                <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center">
                                    <Lock className="mr-2 h-4 w-4" />
                                    Modo Demo - Sin API
                                </div>
                                <p className="text-blue-600 dark:text-blue-300">
                                    Usa estas credenciales para probar el dashboard:
                                </p>
                                <div className="space-y-1 font-mono text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-400">admin@demo.com / admin123</span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-6 text-xs"
                                            onClick={() => quickLogin('admin@demo.com', 'admin123')}
                                        >
                                            Usar
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-400">demo@demo.com / demo</span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-6 text-xs"
                                            onClick={() => quickLogin('demo@demo.com', 'demo')}
                                        >
                                            Usar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 mt-5">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
