// Role types and permissions
export type UserRole = 'Tecnico' | 'Administrador' | 'Supervisor';

export interface RolePermissions {
    canViewDashboard: boolean;
    canManageUsers: boolean;
    canManageClients: boolean;
    canManageVisits: boolean;
    canViewMyVisits: boolean;
    canPlanVisits: boolean;
    canViewTeamBoard: boolean;
    canViewTodayVisits: boolean;
    canAccessAllFeatures: boolean;
}

// Role-based permissions configuration
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    Administrador: {
        canViewDashboard: true,
        canManageUsers: true,
        canManageClients: true,
        canManageVisits: true,
        canViewMyVisits: true,
        canPlanVisits: true,
        canViewTeamBoard: true,
        canViewTodayVisits: true,
        canAccessAllFeatures: true,
    },
    Supervisor: {
        canViewDashboard: true,
        canManageUsers: false,
        canManageClients: true, // Supervisores gestionan clientes
        canManageVisits: true, // Supervisores gestionan visitas
        canViewMyVisits: true,
        canPlanVisits: true, // Supervisores planifican visitas
        canViewTeamBoard: true, // Supervisores ven tablero de su equipo
        canViewTodayVisits: false,
        canAccessAllFeatures: false,
    },
    Tecnico: {
        canViewDashboard: true,
        canManageUsers: false,
        canManageClients: false,
        canManageVisits: false,
        canViewMyVisits: true, // Técnicos ven sus propias visitas
        canPlanVisits: false,
        canViewTeamBoard: false,
        canViewTodayVisits: true, // Técnicos ven visitas de hoy
        canAccessAllFeatures: false,
    },
};

export interface UserWithRole {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
}

// Helper functions for role checking
export const hasPermission = (
    role: UserRole | undefined,
    permission: keyof RolePermissions
): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.[permission] || false;
};

export const isAdmin = (role: UserRole | undefined): boolean => {
    return role === 'Administrador';
};

export const isSupervisor = (role: UserRole | undefined): boolean => {
    return role === 'Supervisor';
};

export const isTecnico = (role: UserRole | undefined): boolean => {
    return role === 'Tecnico';
};

export const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        Administrador: 'Administrador',
        Supervisor: 'Supervisor',
        Tecnico: 'Técnico',
    };
    return labels[role];
};

export const getRoleBadgeColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
        Administrador: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        Supervisor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        Tecnico: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[role];
};
