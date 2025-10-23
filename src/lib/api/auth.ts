import { usersApi, AuthResponse, UserProfile, RegisterRequest } from './endpoints';

export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * API de autenticación
 * Usa los endpoints de usersApi para mantener consistencia
 */
export const authApi = {
    /**
     * Login de usuario
     * POST /usuarios/login
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        return await usersApi.login(credentials.email, credentials.password);
    },

    /**
     * Registrar nuevo usuario
     * POST /usuarios/registrar
     */
    register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
        return await usersApi.register(credentials);
    },

    /**
     * Renovar token
     * GET /usuarios/renovartoken
     */
    renewToken: async (): Promise<AuthResponse> => {
        return await usersApi.renewToken();
    },

    /**
     * Obtener perfil del usuario autenticado
     * GET /usuarios/miperfil
     */
    getProfile: async (): Promise<UserProfile> => {
        return await usersApi.getMyProfile();
    },

    /**
     * Obtener roles del usuario autenticado
     * GET /usuarios/misroles
     */
    getMyRoles: async (): Promise<string[]> => {
        return await usersApi.getMyRoles();
    },

    /**
     * Logout (limpia el token del localStorage)
     */
    logout: async () => {
        localStorage.removeItem('token');
    },
};
