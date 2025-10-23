'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Lock, Globe, Palette, Database, Shield } from 'lucide-react';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">
                        Administra las preferencias y configuraciones de tu cuenta
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Perfil */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <CardTitle>Perfil de Usuario</CardTitle>
                            </div>
                            <CardDescription>
                                Actualiza tu información personal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre completo</Label>
                                <Input id="name" placeholder="Tu nombre" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input id="email" type="email" placeholder="tu@email.com" />
                            </div>
                            <Button className="w-full">Guardar cambios</Button>
                        </CardContent>
                    </Card>

                    {/* Seguridad */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Lock className="h-5 w-5" />
                                <CardTitle>Seguridad</CardTitle>
                            </div>
                            <CardDescription>
                                Gestiona la seguridad de tu cuenta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Contraseña actual</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nueva contraseña</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <Button className="w-full">Cambiar contraseña</Button>
                        </CardContent>
                    </Card>

                    {/* Notificaciones */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <CardTitle>Notificaciones</CardTitle>
                            </div>
                            <CardDescription>
                                Configura cómo deseas recibir notificaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Notificaciones por email</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Recibir actualizaciones por correo
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Notificaciones push</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Notificaciones en tiempo real
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Reportes semanales</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Resumen semanal de actividad
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferencias */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Palette className="h-5 w-5" />
                                <CardTitle>Preferencias</CardTitle>
                            </div>
                            <CardDescription>
                                Personaliza la apariencia de la aplicación
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Idioma</Label>
                                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option>Español</option>
                                    <option>English</option>
                                    <option>Français</option>
                                </select>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Modo oscuro</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Tema oscuro automático
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    {/* API */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Database className="h-5 w-5" />
                                <CardTitle>Configuración de API</CardTitle>
                            </div>
                            <CardDescription>
                                Gestiona las claves y configuración de la API externa
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">API Key</p>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Activa
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        sk_test_••••••••••••••••••••1234
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Regenerar
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api-url">URL de la API</Label>
                                <Input
                                    id="api-url"
                                    placeholder="https://api.tudominio.com"
                                    defaultValue={process.env.NEXT_PUBLIC_API_URL}
                                />
                            </div>

                            <Button>Guardar configuración</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
