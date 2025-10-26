import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Diccionario de traducciones de errores comunes
const errorTranslations: Record<string, string> = {
  // Errores de red
  'Network Error': 'Error de conexión. Verifica tu conexión a internet.',
  'Request failed with status code 400': 'Solicitud incorrecta. Verifica los datos ingresados.',
  'Request failed with status code 401': 'No autorizado. Por favor inicia sesión nuevamente.',
  'Request failed with status code 403': 'Acceso denegado. No tienes permisos para realizar esta acción.',
  'Request failed with status code 404': 'Recurso no encontrado. El servidor no pudo encontrar el recurso solicitado.',
  'Request failed with status code 500': 'Error del servidor. Por favor intenta más tarde.',
  'Request failed with status code 503': 'Servicio no disponible. El servidor está temporalmente fuera de servicio.',
  
  // Errores de autenticación
  'Invalid credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
  'User not found': 'Usuario no encontrado.',
  'Email already exists': 'El correo electrónico ya está registrado.',
  'Unauthorized': 'No autorizado. Por favor inicia sesión.',
  
  // Errores de validación comunes
  'Required field': 'Este campo es requerido.',
  'Invalid email': 'El correo electrónico no es válido.',
  'Password too short': 'La contraseña es demasiado corta.',
  'Passwords do not match': 'Las contraseñas no coinciden.',
  
  // Errores de timeout
  'timeout of': 'Tiempo de espera agotado. Por favor intenta nuevamente.',
};

// Función para traducir mensajes de error comunes
function translateError(message: string): string {
  // Buscar coincidencia exacta
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(errorTranslations)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  return message;
}

export function getErrorMessage(error: unknown): string {
  const errorInfo = getErrorInfo(error);
  return errorInfo.message;
}

// Nueva función que devuelve información completa del error incluyendo el tipo
export function getErrorInfo(error: unknown): { message: string; type: 'error' | 'warning'; status?: number } {
  const err = error as {
    response?: { 
      data?: { 
        errors?: Record<string, string[]>; 
        message?: string; 
        title?: string;
      };
      status?: number;
    };
    message?: string;
  };

  // Manejar errores con response del servidor
  if (err.response?.data) {
    // Errores de validación de ASP.NET Core
    if (err.response.data.errors) {
      const firstError = Object.values(err.response.data.errors)[0];
      const errorMsg = firstError ? firstError[0] : 'Error de validación';
      return {
        message: translateError(errorMsg),
        type: 'error',
        status: err.response?.status
      };
    }
    
    // Mensaje directo del servidor
    if (err.response.data.message) {
      return {
        message: translateError(err.response.data.message),
        type: err.response?.status === 403 ? 'warning' : 'error',
        status: err.response?.status
      };
    }
    
    // Título del error
    if (err.response.data.title) {
      return {
        message: translateError(err.response.data.title),
        type: err.response?.status === 403 ? 'warning' : 'error',
        status: err.response?.status
      };
    }
  }

  // Manejar errores por código de estado HTTP
  if (err.response?.status) {
    const statusMessages: Record<number, string> = {
      400: 'Solicitud incorrecta. Verifica los datos ingresados.',
      401: 'No autorizado. Por favor inicia sesión nuevamente.',
      403: 'Acceso denegado. No tienes permisos suficientes.',
      404: 'Recurso no encontrado.',
      409: 'Conflicto. El recurso ya existe.',
      422: 'Los datos proporcionados no son válidos.',
      500: 'Error interno del servidor. Intenta más tarde.',
      502: 'Error de conexión con el servidor.',
      503: 'Servicio no disponible temporalmente.',
    };
    
    if (statusMessages[err.response.status]) {
      return {
        message: statusMessages[err.response.status],
        type: err.response.status === 403 ? 'warning' : 'error',
        status: err.response.status
      };
    }
  }

  // Mensaje de error genérico de axios o fetch
  if (err.message) {
    return {
      message: translateError(err.message),
      type: 'error'
    };
  }

  return {
    message: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.',
    type: 'error'
  };
}

// Helper para mostrar toast de error con el color correcto
export function showErrorToast(error: unknown, toast: (options: { title?: string; description: string; variant?: 'default' | 'destructive' | 'warning' }) => void) {
  const errorInfo = getErrorInfo(error);
  
  toast({
    title: errorInfo.type === 'warning' ? 'Acceso denegado' : 'Error',
    description: errorInfo.message,
    variant: errorInfo.type === 'warning' ? 'warning' : 'destructive'
  });
}
