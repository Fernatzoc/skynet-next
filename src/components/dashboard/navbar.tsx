'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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

            </div>

            <div className="flex items-center space-x-4">
                {/* Toggle de tema */}
                <ThemeToggle />

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
