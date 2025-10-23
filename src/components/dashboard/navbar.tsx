'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/use-auth';
import { getRoleLabel, getRoleBadgeColor } from '@/lib/types/roles';

interface NavbarProps {
    onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const { user, logout, role, roleLoading } = useAuth();

    const userInitials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    return (
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={onMenuClick}
            >
                <Menu className="h-6 w-6" />
            </Button>

            <div className="flex-1 flex items-center space-x-4">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar..."
                        className="pl-10 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notificaciones */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                                3
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                                <div className="font-medium">Nuevo usuario registrado</div>
                                <div className="text-sm text-muted-foreground">Hace 5 minutos</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                                <div className="font-medium">Reporte mensual disponible</div>
                                <div className="text-sm text-muted-foreground">Hace 1 hora</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                                <div className="font-medium">Actualización del sistema</div>
                                <div className="text-sm text-muted-foreground">Hace 2 horas</div>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="w-full text-center justify-center cursor-pointer">
                            Ver todas las notificaciones
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Perfil de usuario */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="/avatars/user.png" alt={user?.email} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.email}</p>
                                {role && (
                                    <Badge className={`${getRoleBadgeColor(role)} mt-1 w-fit`}>
                                        {getRoleLabel(role)}
                                    </Badge>
                                )}
                                {roleLoading && (
                                    <p className="text-xs leading-none text-muted-foreground">
                                        Cargando rol...
                                    </p>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            Mi Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            Configuración
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            Ayuda
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 dark:text-red-400"
                            onClick={logout}
                        >
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
