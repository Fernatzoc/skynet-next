'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Settings,
    Calendar,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    User,
    UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { RolePermissions } from '@/lib/types/roles';

interface SidebarProps {
    className?: string;
}

interface MenuItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: keyof RolePermissions;
}

const menuItems: MenuItem[] = [
    {
        title: 'Panel de Control',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'canViewDashboard',
    },
    {
        title: 'Mi Perfil',
        href: '/dashboard/profile',
        icon: User,
        // No requiere permission específica - todos los usuarios autenticados
    },
    {
        title: 'Clientes',
        href: '/dashboard/clientes',
        icon: UserCircle,
        permission: 'canManageClients', // Supervisores y Admins
    },
    {
        title: 'Mis Visitas',
        href: '/dashboard/visitas',
        icon: Calendar,
        permission: 'canViewMyVisits', // Técnicos, Supervisores y Admins
    },
    {
        title: 'Usuarios',
        href: '/dashboard/users',
        icon: Users,
        permission: 'canManageUsers', // Solo Admins
    },
    {
        title: 'Configuración',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { can, role } = useAuth();

    // Filter menu items based on user permissions
    const visibleMenuItems = menuItems.filter(item => {
        if (!item.permission) return true; // No permission required
        return can(item.permission);
    });

    return (
        <aside
            className={cn(
                'flex flex-col border-r bg-card transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">S</span>
                        </div>
                        <span className="font-bold text-xl">SkyNet</span>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn('h-8 w-8', collapsed && 'mx-auto')}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                {visibleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                'hover:bg-accent hover:text-accent-foreground',
                                isActive
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground',
                                collapsed && 'justify-center'
                            )}
                            title={collapsed ? item.title : undefined}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <div className={cn(
                    'flex items-center space-x-3 text-sm text-muted-foreground',
                    collapsed && 'justify-center'
                )}>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {!collapsed && <span>Sistema activo</span>}
                </div>
            </div>
        </aside>
    );
}
