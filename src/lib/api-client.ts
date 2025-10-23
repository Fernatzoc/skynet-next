import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import { tokenService, authService, API_URL } from './auth';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Interceptor de solicitudes - Agregar token JWT
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenService.getToken();

        if (token && !tokenService.isTokenExpired(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas - Manejar errores y refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Si el error es 401 y no es un reintento
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Intentar refrescar el token
                const newToken = await authService.refreshToken();

                if (newToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Si falla el refresh, cerrar sesión
                await authService.logout();
                return Promise.reject(refreshError);
            }
        }

        // Si es 403, el usuario no tiene permisos
        if (error.response?.status === 403) {
            console.error('Access denied');
        }

        return Promise.reject(error);
    }
);

// Funciones helper para hacer peticiones
export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config),
};

export default apiClient;
