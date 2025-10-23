'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, UserPlus, MoreVertical, Mail, Phone, Loader2, Shield, Lock, UserX, Edit } from 'lucide-react';
import { usersApi, User } from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import { rolesApi } from '@/lib/api/roles';
import { UserRole, getRoleLabel, getRoleBadgeColor } from '@/lib/types/roles';

export default function UsersPage() {
    const { toast } = useToast();

    // Estados para diálogos
    const [open, setOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);

    // Estados para usuario seleccionado
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole>('Tecnico');

    // Estados para crear usuario
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserFirstName, setNewUserFirstName] = useState('');
    const [newUserMiddleName, setNewUserMiddleName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [newUserSecondSurname, setNewUserSecondSurname] = useState('');
    const [newUserPhone, setNewUserPhone] = useState('');

    // Estados para editar perfil
    const [editFirstName, setEditFirstName] = useState('');
    const [editMiddleName, setEditMiddleName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editSecondSurname, setEditSecondSurname] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Estados para restablecer contraseña
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');

    // Estados para status (ahora booleano)
    const [newStatus, setNewStatus] = useState<boolean>(true);

    // Estados de carga
    const [isCreating, setIsCreating] = useState(false);
    const [isAssigningRole, setIsAssigningRole] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Estados de error
    const [createError, setCreateError] = useState('');
    const [roleError, setRoleError] = useState('');
    const [resetPasswordError, setResetPasswordError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [profileError, setProfileError] = useState('');

    // Estados de usuarios
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setLoadError('');
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (err: any) {
            setLoadError(err.response?.data?.message || err.message || 'Error al cargar usuarios');
            console.error('Error loading users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper para obtener el primer rol del usuario
    const getUserPrimaryRole = (user: User): UserRole | null => {
        if (!user.roles || user.roles.length === 0) return null;
        return user.roles[0] as UserRole;
    };

    // Helper para obtener las iniciales del usuario desde el email
    const getUserInitials = (email: string): string => {
        const name = email.split('@')[0];
        return name.substring(0, 2).toUpperCase();
    };

    // Helper para extraer mensajes de error de validación del backend
    const getErrorMessage = (err: any): string => {
        // Formato de error de validación de ASP.NET Core:
        // { type, title, status, errors: { Campo: ["mensaje1", "mensaje2"] } }
        if (err.response?.data?.errors) {
            const errors = err.response.data.errors;
            const messages: string[] = [];

            Object.keys(errors).forEach(field => {
                const fieldErrors = errors[field];
                if (Array.isArray(fieldErrors)) {
                    messages.push(...fieldErrors);
                }
            });

            return messages.join('. ');
        }

        // Mensaje de error simple
        return err.response?.data?.message ||
            err.response?.data?.title ||
            err.message ||
            'Error en la operación';
    };

    const handleCreateUser = async () => {
        if (!newUserEmail || !newUserPassword) {
            setCreateError('El email y la contraseña son obligatorios');
            return;
        }

        if (!newUserFirstName || !newUserLastName) {
            setCreateError('El primer nombre y el primer apellido son obligatorios');
            return;
        }

        if (!newUserPhone) {
            setCreateError('El teléfono es obligatorio');
            return;
        }

        setIsCreating(true);
        setCreateError('');

        try {
            await usersApi.register({
                email: newUserEmail,
                password: newUserPassword,
                firstName: newUserFirstName,
                middleName: newUserMiddleName || undefined,
                lastName: newUserLastName,
                secondSurname: newUserSecondSurname || undefined,
                phone: newUserPhone,
            });

            // Limpiar formulario y cerrar modal
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserFirstName('');
            setNewUserMiddleName('');
            setNewUserLastName('');
            setNewUserSecondSurname('');
            setNewUserPhone('');
            setOpen(false);

            toast({
                title: "✅ Usuario creado",
                description: "El usuario ha sido creado exitosamente",
                variant: "success",
            });
            // Recargar la lista de usuarios
            await loadUsers();
        } catch (err: any) {
            setCreateError(getErrorMessage(err));
        } finally {
            setIsCreating(false);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRole) {
            setRoleError('Selecciona un usuario y un rol');
            return;
        }

        setIsAssigningRole(true);
        setRoleError('');

        try {
            await rolesApi.assignRole({
                email: selectedUser.email,
                rol: selectedRole,
            });

            setRoleDialogOpen(false);
            setSelectedUser(null);
            toast({
                title: "✅ Rol asignado",
                description: `El rol ${getRoleLabel(selectedRole)} ha sido asignado exitosamente`,
                variant: "success",
            });
            // Recargar la lista de usuarios
            await loadUsers();
        } catch (err: any) {
            setRoleError(getErrorMessage(err));
        } finally {
            setIsAssigningRole(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;

        if (!resetNewPassword || !resetConfirmPassword) {
            setResetPasswordError('Todos los campos son obligatorios');
            return;
        }

        if (resetNewPassword !== resetConfirmPassword) {
            setResetPasswordError('Las contraseñas no coinciden');
            return;
        }

        setIsResettingPassword(true);
        setResetPasswordError('');

        try {
            await usersApi.resetPassword({
                email: selectedUser.email,
                nuevaContrasenia: resetNewPassword,
                confirmarContrasenia: resetConfirmPassword,
            });

            setResetPasswordDialogOpen(false);
            setSelectedUser(null);
            setResetNewPassword('');
            setResetConfirmPassword('');
            toast({
                title: "✅ Contraseña restablecida",
                description: "La contraseña ha sido restablecida exitosamente",
                variant: "success",
            });
        } catch (err: any) {
            setResetPasswordError(getErrorMessage(err));
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedUser) return;

        setIsUpdatingStatus(true);
        setStatusError('');

        try {
            await usersApi.updateStatus({
                email: selectedUser.email,
                status: newStatus,
            });

            setStatusDialogOpen(false);
            setSelectedUser(null);
            setNewStatus(true); // Reset to default true
            toast({
                title: "✅ Estado actualizado",
                description: `El estado del usuario ha sido actualizado a ${newStatus ? 'Activo' : 'Inactivo'}`,
                variant: "success",
            });
            // Recargar la lista de usuarios
            await loadUsers();
        } catch (err: any) {
            setStatusError(getErrorMessage(err));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!selectedUser) return;

        setIsUpdatingProfile(true);
        setProfileError('');

        try {
            await usersApi.updateUserProfile({
                email: selectedUser.email,
                firstName: editFirstName || undefined,
                middleName: editMiddleName || undefined,
                lastName: editLastName || undefined,
                secondSurname: editSecondSurname || undefined,
                phone: editPhone || undefined,
                status: selectedUser.status, // Mantener el status actual
            });

            setEditProfileDialogOpen(false);
            setSelectedUser(null);
            setEditFirstName('');
            setEditMiddleName('');
            setEditLastName('');
            setEditSecondSurname('');
            setEditPhone('');
            toast({
                title: "✅ Perfil actualizado",
                description: "El perfil del usuario ha sido actualizado exitosamente",
                variant: "success",
            });
            // Recargar la lista de usuarios
            await loadUsers();
        } catch (err: any) {
            setProfileError(getErrorMessage(err));
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <ProtectedRoute permission="canManageUsers">
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                            <p className="text-muted-foreground">
                                Gestiona los usuarios de tu plataforma
                            </p>
                        </div>

                        {/* Modal para crear usuario */}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Nuevo Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                                    <DialogDescription>
                                        Ingresa la información del nuevo usuario. Los campos marcados con * son obligatorios.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {createError && (
                                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                            {createError}
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Correo Electrónico *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="usuario@example.com"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                            disabled={isCreating}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Contraseña *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Mínimo 8 caracteres (aA123456!)"
                                            value={newUserPassword}
                                            onChange={(e) => setNewUserPassword(e.target.value)}
                                            disabled={isCreating}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Debe contener mayúsculas, minúsculas, números y símbolos
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">Primer Nombre *</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="Juan"
                                                value={newUserFirstName}
                                                onChange={(e) => setNewUserFirstName(e.target.value)}
                                                disabled={isCreating}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="middleName">Segundo Nombre</Label>
                                            <Input
                                                id="middleName"
                                                placeholder="Carlos (opcional)"
                                                value={newUserMiddleName}
                                                onChange={(e) => setNewUserMiddleName(e.target.value)}
                                                disabled={isCreating}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">Primer Apellido *</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Pérez"
                                                value={newUserLastName}
                                                onChange={(e) => setNewUserLastName(e.target.value)}
                                                disabled={isCreating}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="secondSurname">Segundo Apellido</Label>
                                            <Input
                                                id="secondSurname"
                                                placeholder="García (opcional)"
                                                value={newUserSecondSurname}
                                                onChange={(e) => setNewUserSecondSurname(e.target.value)}
                                                disabled={isCreating}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Teléfono *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="12345678"
                                            value={newUserPhone}
                                            onChange={(e) => setNewUserPhone(e.target.value)}
                                            disabled={isCreating}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                        disabled={isCreating}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCreateUser}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            'Crear Usuario'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Lista de Usuarios</CardTitle>
                                    <CardDescription>
                                        Total de {users.length} usuarios registrados
                                    </CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Buscar usuarios..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
                                </div>
                            ) : loadError ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md w-full max-w-md text-center">
                                        {loadError}
                                    </div>
                                    <Button onClick={loadUsers} variant="outline">
                                        Reintentar
                                    </Button>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <p>No hay usuarios registrados</p>
                                    <p className="text-sm">Crea el primer usuario usando el botón "Nuevo Usuario"</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={user.avatar || undefined} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {getUserInitials(user.email)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex flex-col">
                                                            <p className="font-medium">{user.email}</p>
                                                            {(user.firstName || user.lastName) && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {user.firstName || ''} {user.middleName || ''} {user.lastName || ''} {user.secondSurname || ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 flex-wrap">
                                                        {getUserPrimaryRole(user) ? (
                                                            <Badge className={getRoleBadgeColor(getUserPrimaryRole(user)!)}>
                                                                {getRoleLabel(getUserPrimaryRole(user)!)}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                                                Sin rol asignado
                                                            </Badge>
                                                        )}
                                                        {user.status !== undefined && (
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    user.status
                                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                                                }
                                                            >
                                                                {user.status ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        {user.phone && (
                                                            <div className="flex items-center space-x-1">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{user.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            // Cargar datos directamente del usuario
                                                            setEditFirstName(user.firstName || '');
                                                            setEditMiddleName(user.middleName || '');
                                                            setEditLastName(user.lastName || '');
                                                            setEditSecondSurname(user.secondSurname || '');
                                                            setEditPhone(user.phone || '');
                                                            setProfileError('');
                                                            setEditProfileDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar Perfil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            const primaryRole = getUserPrimaryRole(user);
                                                            setSelectedRole(primaryRole || 'Tecnico');
                                                            setRoleDialogOpen(true);
                                                        }}
                                                    >
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Asignar Rol
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setResetNewPassword('');
                                                            setResetConfirmPassword('');
                                                            setResetPasswordError('');
                                                            setResetPasswordDialogOpen(true);
                                                        }}
                                                    >
                                                        <Lock className="h-4 w-4 mr-2" />
                                                        Restablecer Contraseña
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setNewStatus(user.status ?? true); // Default true si es undefined
                                                            setStatusError('');
                                                            setStatusDialogOpen(true);
                                                        }}
                                                    >
                                                        <UserX className="h-4 w-4 mr-2" />
                                                        Cambiar Estado
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}

                                    {/* Paginación */}
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando <span className="font-medium">1</span> a{' '}
                                            <span className="font-medium">{users.length}</span> de{' '}
                                            <span className="font-medium">{users.length}</span> usuarios
                                        </p>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" disabled>
                                                Anterior
                                            </Button>
                                            <Button variant="outline" size="sm" disabled>
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dialog for Role Assignment */}
                    <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Asignar Rol</DialogTitle>
                                <DialogDescription>
                                    Selecciona el rol para {selectedUser?.email}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {roleError && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                        {roleError}
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <select
                                        id="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                    >
                                        <option value="Administrador">Administrador</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="Tecnico">Técnico</option>
                                    </select>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRole === 'Administrador' && 'Acceso completo al sistema, gestión de usuarios y todas las funciones'}
                                        {selectedRole === 'Supervisor' && 'Puede planificar visitas y ver tablero del equipo'}
                                        {selectedRole === 'Tecnico' && 'Puede ver y registrar visitas asignadas'}
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setRoleDialogOpen(false)}
                                    disabled={isAssigningRole}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleAssignRole} disabled={isAssigningRole}>
                                    {isAssigningRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Asignar Rol
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog para Restablecer Contraseña */}
                    <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Restablecer Contraseña</DialogTitle>
                                <DialogDescription>
                                    Establece una nueva contraseña para {selectedUser?.email}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {resetPasswordError && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                        {resetPasswordError}
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={resetNewPassword}
                                        onChange={(e) => setResetNewPassword(e.target.value)}
                                        placeholder="Ingrese la nueva contraseña"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={resetConfirmPassword}
                                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                                        placeholder="Confirme la nueva contraseña"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setResetPasswordDialogOpen(false);
                                        setResetNewPassword('');
                                        setResetConfirmPassword('');
                                        setResetPasswordError('');
                                    }}
                                    disabled={isResettingPassword}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleResetPassword} disabled={isResettingPassword}>
                                    {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Restablecer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog para Actualizar Estado */}
                    <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Actualizar Estado</DialogTitle>
                                <DialogDescription>
                                    Cambiar el estado de {selectedUser?.email}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {statusError && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                        {statusError}
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <select
                                        id="status"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newStatus.toString()}
                                        onChange={(e) => setNewStatus(e.target.value === 'true')}
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                    <p className="text-sm text-muted-foreground">
                                        {newStatus ? '✅ El usuario podrá acceder al sistema' : '🚫 El usuario no podrá acceder al sistema'}
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStatusDialogOpen(false);
                                        setNewStatus(true);
                                        setStatusError('');
                                    }}
                                    disabled={isUpdatingStatus}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
                                    {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog para Editar Perfil */}
                    <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Editar Perfil</DialogTitle>
                                <DialogDescription>
                                    Actualizar información de {selectedUser?.email}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {profileError && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                        {profileError}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstName">Primer Nombre</Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={editFirstName}
                                            onChange={(e) => setEditFirstName(e.target.value)}
                                            placeholder="Ej: Juan"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="middleName">Segundo Nombre</Label>
                                        <Input
                                            id="middleName"
                                            type="text"
                                            value={editMiddleName}
                                            onChange={(e) => setEditMiddleName(e.target.value)}
                                            placeholder="Ej: Carlos (opcional)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastName">Primer Apellido</Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={editLastName}
                                            onChange={(e) => setEditLastName(e.target.value)}
                                            placeholder="Ej: Pérez"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="secondSurname">Segundo Apellido</Label>
                                        <Input
                                            id="secondSurname"
                                            type="text"
                                            value={editSecondSurname}
                                            onChange={(e) => setEditSecondSurname(e.target.value)}
                                            placeholder="Ej: García (opcional)"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        placeholder="+34 612 345 678"
                                    />
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    <p>Los nombres se combinan como: {editFirstName} {editMiddleName}</p>
                                    <p>Los apellidos se combinan como: {editLastName} {editSecondSurname}</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditProfileDialogOpen(false);
                                        setEditFirstName('');
                                        setEditMiddleName('');
                                        setEditLastName('');
                                        setEditSecondSurname('');
                                        setEditPhone('');
                                        setProfileError('');
                                    }}
                                    disabled={isUpdatingProfile}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                                    {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}