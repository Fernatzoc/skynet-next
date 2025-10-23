'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService, tokenService, JWTPayload } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { hasPermission, RolePermissions } from '@/lib/types/roles';
import { rolesApi } from '@/lib/api/roles';

export function useAuth() {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(false);
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // Siempre intentar obtener el rol desde la API si el usuario está autenticado
        // Esto asegura que el rol esté actualizado incluso si el token no lo incluye
        if (currentUser) {
            await fetchUserRole();
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const fetchUserRole = async () => {
        try {
            setRoleLoading(true);
            const rolesResponse = await rolesApi.getMyRoles();

            // La API devuelve un array: ["Administrador"]
            // getMyRoles lo convierte a { roles: ["Administrador"], primaryRole: "Administrador" }
            if (rolesResponse.primaryRole) {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        role: rolesResponse.primaryRole,
                    };
                    setUser(updatedUser);
                }
            }
        } catch (error) {
            console.error('Error al obtener rol del usuario:', error);
            // En caso de error, no actualizar el rol (usar el del token si existe)
        } finally {
            setRoleLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await authService.login(email, password);
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);

            // Siempre obtener el rol desde la API después del login
            if (currentUser) {
                await fetchUserRole();
            }

            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            const err = error as { message?: string };
            return {
                success: false,
                error: err.message || 'Error al iniciar sesión'
            };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const can = (permission: keyof RolePermissions): boolean => {
        return hasPermission(user?.role, permission);
    };

    const isAuthenticated = tokenService.isAuthenticated();

    return {
        user,
        loading,
        roleLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        can, // Helper for checking permissions
        role: user?.role,
    };
}
