'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Phone, Shield, User, Lock } from 'lucide-react';
import { usersApi, UserProfile, UpdateProfileRequest } from '@/lib/api/endpoints';
import { rolesApi } from '@/lib/api/roles';
import { getRoleLabel, getRoleBadgeColor, UserRole } from '@/lib/types/roles';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Helper para extraer mensajes de error de validación de ASP.NET Core
const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string; title?: string } }; message?: string };
    if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages: string[] = [];
        Object.keys(errors).forEach(field => {
            const fieldErrors = errors[field];
            if (Array.isArray(fieldErrors)) {
                messages.push(...fieldErrors);
            }
        });
        return messages.join('. ');
    }
    return error.response?.data?.message || error.response?.data?.title || error.message || 'Error en la operación';
};

export default function ProfilePage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Estados para editar perfil
    const [isEditMode, setIsEditMode] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [secondSurname, setSecondSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    // Estados para cambiar contraseña
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            setLoadError('');
            const data = await usersApi.getMyProfile();
            setProfile(data);

            // Cargar datos para edición - ahora usando los campos correctos del backend
            setFirstName(data.firstName || '');
            setMiddleName(data.middleName || '');
            setLastName(data.lastName || '');
            setSecondSurname(data.secondSurname || '');
            setPhone(data.phone || '');
        } catch (err) {
            setLoadError(getErrorMessage(err));
            console.error('Error loading profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        setUpdateError('');

        try {
            await usersApi.updateMyProfile({
                firstName: firstName || undefined,
                middleName: middleName || undefined,
                lastName: lastName || undefined,
                secondSurname: secondSurname || undefined,
                phone: phone || undefined,
            });

            setIsEditMode(false);
            toast({
                title: "✅ Perfil actualizado",
                description: "Tu perfil ha sido actualizado exitosamente",
                variant: "success",
            });
            await loadProfile();
        } catch (err) {
            setUpdateError(getErrorMessage(err));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Todos los campos son obligatorios');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }

        setIsChangingPassword(true);
        setPasswordError('');

        try {
            await usersApi.changePassword({
                contraseniaActual: currentPassword,
                nuevaContrasenia: newPassword,
                confirmarContrasenia: confirmPassword,
            });

            setChangePasswordOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast({
                title: "✅ Contraseña actualizada",
                description: "Tu contraseña ha sido cambiada exitosamente",
                variant: "success",
            });
        } catch (err) {
            setPasswordError(getErrorMessage(err));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const getUserInitials = (email: string): string => {
        const name = email.split('@')[0];
        return name.substring(0, 2).toUpperCase();
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando perfil...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (loadError || !profile) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md w-full max-w-md text-center">
                        {loadError}
                    </div>
                    <Button onClick={loadProfile} variant="outline">
                        Reintentar
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                        <p className="text-muted-foreground">
                            Administra tu información personal
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Columna izquierda - Avatar y datos básicos */}
                    <Card className="md:col-span-1">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                                        {getUserInitials(profile.email)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-semibold">
                                        {profile.firstName || profile.lastName
                                            ? `${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''} ${profile.secondSurname || ''}`.trim()
                                            : profile.email.split('@')[0]}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>

                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {profile.roles.map((role) => (
                                            <Badge key={role} className={getRoleBadgeColor(role as UserRole)}>
                                                <Shield className="h-3 w-3 mr-1" />
                                                {getRoleLabel(role as UserRole)}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Status Badge - siempre mostrar */}
                                    <Badge
                                        variant="outline"
                                        className={
                                            profile.status === true
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400'
                                                : profile.status === false
                                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400'
                                        }
                                    >
                                        {profile.status === true
                                            ? 'Activo'
                                            : profile.status === false
                                                ? 'Inactivo'
                                                : 'Sin estado'}
                                    </Badge>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setChangePasswordOpen(true)}
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Cambiar Contraseña
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Columna derecha - Información detallada */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Información Personal</CardTitle>
                                {!isEditMode ? (
                                    <Button onClick={() => setIsEditMode(true)}>
                                        <User className="h-4 w-4 mr-2" />
                                        Editar Perfil
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setUpdateError('');
                                                // Recargar datos originales
                                                setFirstName(profile.firstName || '');
                                                setMiddleName(profile.middleName || '');
                                                setLastName(profile.lastName || '');
                                                setSecondSurname(profile.secondSurname || '');
                                                setPhone(profile.phone || '');
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Guardar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {updateError && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                    {updateError}
                                </div>
                            )}

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Primer Nombre</Label>
                                        {isEditMode ? (
                                            <Input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Ej: Juan"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {firstName || 'No especificado'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="middleName">Segundo Nombre</Label>
                                        {isEditMode ? (
                                            <Input
                                                id="middleName"
                                                value={middleName}
                                                onChange={(e) => setMiddleName(e.target.value)}
                                                placeholder="Ej: Carlos (opcional)"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {middleName || 'No especificado'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Primer Apellido</Label>
                                        {isEditMode ? (
                                            <Input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Ej: Pérez"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {lastName || 'No especificado'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="secondSurname">Segundo Apellido</Label>
                                        {isEditMode ? (
                                            <Input
                                                id="secondSurname"
                                                value={secondSurname}
                                                onChange={(e) => setSecondSurname(e.target.value)}
                                                placeholder="Ej: García (opcional)"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {secondSurname || 'No especificado'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        <Mail className="inline h-4 w-4 mr-2" />
                                        Correo Electrónico
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        El correo electrónico no se puede cambiar
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        <Phone className="inline h-4 w-4 mr-2" />
                                        Teléfono
                                    </Label>
                                    {isEditMode ? (
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+34 612 345 678"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {phone || 'No especificado'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dialog para Cambiar Contraseña */}
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Cambiar Contraseña</DialogTitle>
                            <DialogDescription>
                                Ingresa tu contraseña actual y la nueva contraseña
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {passwordError && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                    {passwordError}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña actual"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ingresa la nueva contraseña"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirma la nueva contraseña"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setChangePasswordOpen(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setPasswordError('');
                                }}
                                disabled={isChangingPassword}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cambiar Contraseña
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
