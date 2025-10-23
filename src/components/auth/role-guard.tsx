'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { RolePermissions } from '@/lib/types/roles';

interface RoleGuardProps {
    children: ReactNode;
    permission: keyof RolePermissions;
    fallback?: ReactNode;
}

/**
 * Component-level role guard - hides content if user doesn't have permission
 */
export function RoleGuard({ children, permission, fallback = null }: RoleGuardProps) {
    const { can } = useAuth();

    if (!can(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
