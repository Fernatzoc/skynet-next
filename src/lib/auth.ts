import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from './types/roles';

// Configuración - Ajusta según tu API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface JWTPayload {
    id: string;
    email: string;
    role?: UserRole;
    exp: number;
    iat: number;
}

// Gestión de tokens
export const tokenService = {
    getToken: (): string | undefined => {
        if (typeof window === 'undefined') return undefined;
        return Cookies.get(TOKEN_KEY);
    },

    setToken: (token: string, days = 7): void => {
        Cookies.set(TOKEN_KEY, token, {
            expires: days,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
    },

    removeToken: (): void => {
        Cookies.remove(TOKEN_KEY);
    },

    getRefreshToken: (): string | undefined => {
        if (typeof window === 'undefined') return undefined;
        return Cookies.get(REFRESH_TOKEN_KEY);
    },

    setRefreshToken: (token: string, days = 30): void => {
        Cookies.set(REFRESH_TOKEN_KEY, token, {
            expires: days,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
    },

    removeRefreshToken: (): void => {
        Cookies.remove(REFRESH_TOKEN_KEY);
    },

    decodeToken: (token?: string): JWTPayload | null => {
        const tokenToUse = token || tokenService.getToken();
        if (!tokenToUse) return null;

        try {
            // Intentar decodificar como JWT real
            return jwtDecode<JWTPayload>(tokenToUse);
        } catch (error) {
            // Si falla, intentar decodificar como token demo (base64)
            try {
                const decoded = JSON.parse(atob(tokenToUse));
                return decoded as JWTPayload;
            } catch {
                console.error('Error decoding token:', error);
                return null;
            }
        }
    },

    isTokenExpired: (token?: string): boolean => {
        const decoded = tokenService.decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    },

    isAuthenticated: (): boolean => {
        const token = tokenService.getToken();
        if (!token) return false;
        return !tokenService.isTokenExpired(token);
    },
};

// Servicio de autenticación
export const authService = {
    /**
     * Login de usuario
     * POST /usuarios/login
     * Respuesta: { token, expiracion }
     */
    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                let errorMessage = 'Error al iniciar sesión';
                try {
                    const error = await response.json();
                    errorMessage = error.message || error.error || errorMessage;
                } catch {
                    // No se pudo parsear el error
                }
                throw new Error(errorMessage);
            }

            // La respuesta debe ser: { token, expiracion }
            const data = await response.json();

            if (!data.token) {
                throw new Error('No se recibió token del servidor');
            }

            // Guardar el token
            tokenService.setToken(data.token);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            // Opcional: llamar endpoint de logout en el backend
            const token = tokenService.getToken();
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }).catch(() => {
                    // Ignorar errores del logout del backend
                });
            }
        } finally {
            tokenService.removeToken();
            tokenService.removeRefreshToken();

            // Redirigir al login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },

    getCurrentUser: () => {
        const token = tokenService.getToken();
        if (!token) return null;

        const decoded = tokenService.decodeToken(token);

        // Mapear campos de Microsoft Claims a nuestro formato
        if (decoded) {
            const decodedAny = decoded as unknown as Record<string, unknown>;
            const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
            return {
                id: decoded.id || (decodedAny.sub as string) || (decodedAny.nameid as string) || '',
                email: decoded.email || '',
                role: decoded.role || decodedAny[roleClaim] as UserRole | undefined,
                exp: decoded.exp,
                iat: decoded.iat,
            } as JWTPayload;
        }

        return decoded;
    },

    refreshToken: async () => {
        try {
            const currentToken = tokenService.getToken();
            if (!currentToken) {
                throw new Error('No token disponible');
            }

            // Usar GET /usuarios/renovartoken
            const response = await fetch(`${API_URL}/usuarios/renovartoken`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al renovar token');
            }

            // Respuesta: { token, expiracion }
            const data = await response.json();

            if (data.token) {
                tokenService.setToken(data.token);
            }

            return data.token;
        } catch (error) {
            console.error('Refresh token error:', error);
            tokenService.removeToken();
            throw error;
        }
    },
};

export type { JWTPayload };
