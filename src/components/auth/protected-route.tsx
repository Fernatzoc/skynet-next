'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { RolePermissions } from '@/lib/types/roles';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: ReactNode;
    permission?: keyof RolePermissions;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, permission, fallback }: ProtectedRouteProps) {
    const { can, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (permission && !can(permission)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
                    <p className="text-muted-foreground mb-4">
                        No tienes permisos para acceder a esta página
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                        Volver al Panel de Control
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
