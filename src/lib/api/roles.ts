import { usersApi } from './endpoints';
import { UserRole } from '../types/roles';

export interface MyRolesResponse {
    roles: UserRole[];
    primaryRole: UserRole;
}

export interface AssignRoleRequest {
    email: string;
    rol: UserRole;
}

/**
 * API de roles - Wrapper sobre usersApi para mantener compatibilidad
 */
export const rolesApi = {
    /**
     * GET /usuarios/misroles - Obtener roles del usuario actual
     * La API devuelve: ["Administrador"] o ["Supervisor"] o ["Tecnico"]
     */
    getMyRoles: async (): Promise<MyRolesResponse> => {
        const roles = await usersApi.getMyRoles();

        // Convertir el array a nuestro formato esperado
        return {
            roles: roles as UserRole[],
            primaryRole: roles[0] as UserRole // El primer rol es el principal
        };
    },

    /**
     * POST /usuarios/asignarrol - Asignar rol a un usuario (solo admin)
     * Respuesta: 204 No Content
     */
    assignRole: async (data: AssignRoleRequest): Promise<void> => {
        await usersApi.assignRole(data);
    },

    /**
     * POST /usuarios/removerrol - Remover rol de un usuario (solo admin)
     * Respuesta: 204 No Content
     */
    removeRole: async (data: AssignRoleRequest): Promise<void> => {
        await usersApi.removeRole(data);
    },
};
