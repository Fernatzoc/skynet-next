import { api } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondSurname?: string;
  phone?: string;
  status?: boolean;
  roles: string[];
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondSurname?: string;
  phone?: string;
  avatar?: string;
  status?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  expiracion: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondSurname?: string;
  phone: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondSurname?: string;
  phone?: string;
  status?: string;
}

export interface UpdateUserProfileRequest {
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondSurname?: string;
  phone?: string;
  status?: boolean;
}

export interface RoleRequest {
  email: string;
  rol: string;
}

export interface UpdateStatusRequest {
  email: string;
  status: boolean;
}

export interface ChangePasswordRequest {
  contraseniaActual: string;
  nuevaContrasenia: string;
  confirmarContrasenia: string;
}

export interface ResetPasswordRequest {
  email: string;
  nuevaContrasenia: string;
  confirmarContrasenia: string;
}

export interface Cliente {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  tercerNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  correoElectronico: string;
  latitud: number;
  longitud: number;
  direccion: string;
  estado: boolean;
}

export interface CreateClienteRequest {
  primerNombre: string;
  segundoNombre?: string;
  tercerNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  correoElectronico: string;
  latitud: number;
  longitud: number;
  direccion: string;
}

export interface Visita {
  id: number;
  idCliente: number;
  nombreCliente: string;
  idTecnico: string;
  nombreTecnico: string;
  idSupervisor?: string | null;
  nombreSupervisor?: string | null;
  idEstadoVisita: number;
  estadoVisita: string;
  idTipoVisita: number;
  tipoVisita: string;
  fechaHoraProgramada: string;
  descripcion?: string | null;
  idRegistroVisita?: number | null;
  fechaHoraInicioReal?: string | null;
  fechaHoraFinReal?: string | null;
  observaciones?: string | null;
}

export interface CrearVisitaRequest {
  idCliente: number;
  idTecnico: string;
  idSupervisor?: string;
  idEstadoVisita: number;
  idTipoVisita: number;
  fechaHoraProgramada: string;
  descripcion?: string;
}

export interface RegistrarVisitaRequest {
  fechaHoraInicioReal: string;
  fechaHoraFinReal: string;
  observaciones: string;
}

export interface VisitaDetalleResponse {
  visita: Visita;
  cliente: Cliente;
}

export const ESTADOS_VISITA = {
  PENDIENTE: 1,
  EN_PROGRESO: 2,
  COMPLETADA: 3,
  CANCELADA: 4,
} as const;

export const TIPOS_VISITA = {
  INSTALACION: 1,
  MANTENIMIENTO: 2,
  REPARACION: 3,
  INSPECCION: 4,
} as const;

export const ESTADOS_VISITA_LABELS: Record<number, string> = {
  1: 'Pendiente',
  2: 'En Progreso',
  3: 'Completada',
  4: 'Cancelada',
};

export const TIPOS_VISITA_LABELS: Record<number, string> = {
  1: 'Instalación',
  2: 'Mantenimiento',
  3: 'Reparación',
  4: 'Inspección',
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdAt: string;
}

// ==========================================
// API DE USUARIOS
// ==========================================

export const usersApi = {

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Construir el payload, solo incluir campos opcionales si tienen valor
    const payload: Record<string, unknown> = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    };


    if (data.middleName) payload.middleName = data.middleName;
    if (data.secondSurname) payload.secondSurname = data.secondSurname;

    const response = await api.post<AuthResponse>('/usuarios/registrar', payload);
    return response.data;
  },


  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/usuarios/login', {
      email,
      password
    });
    return response.data;
  },


  renewToken: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/usuarios/renovartoken');
    return response.data;
  },


  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/usuarios/miperfil');
    return response.data;
  },


  updateMyProfile: async (data: UpdateProfileRequest): Promise<void> => {
    await api.put('/usuarios/miperfil', data);
  },


  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/usuarios/todos');
    return response.data;
  },


  updateUserProfile: async (data: UpdateUserProfileRequest): Promise<void> => {
    await api.put('/usuarios/perfil', data);
  },


  assignRole: async (data: RoleRequest): Promise<void> => {
    await api.post('/usuarios/asignarrol', data);
  },

  removeRole: async (data: RoleRequest): Promise<void> => {
    await api.post('/usuarios/removerrol', data);
  },


  getMyRoles: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/usuarios/misroles');
    return response.data;
  },


  updateStatus: async (data: UpdateStatusRequest): Promise<void> => {
    await api.put('/usuarios/actualizarstatus', data);
  },


  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/usuarios/cambiarcontrasenia', data);
  },


  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.put('/usuarios/restablecercontrasenia', data);
  },


  makeAdmin: async (email: string): Promise<void> => {
    await api.post('/usuarios/haceradmin', { email });
  },


  removeAdmin: async (email: string): Promise<void> => {
    await api.post('/usuarios/removeradmin', { email });
  },


  getTecnicosAsignados: async (idSupervisor: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/usuarios/tecnicos-asignados/${idSupervisor}`);
    return response.data;
  },
};

// ==========================================
// API DE PRODUCTOS
// ==========================================

export const productsApi = {

  getAll: async () => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },


  getById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },


  create: async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const response = await api.post<Product>('/products', productData);
    return response.data;
  },


  update: async (id: string, productData: Partial<Product>) => {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
  },


  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },


  getByCategory: async (category: string) => {
    const response = await api.get<Product[]>(`/products/category/${category}`);
    return response.data;
  },
};


// ==========================================
// API DE CLIENTES
// ==========================================

export const clientesApi = {

  create: async (data: CreateClienteRequest): Promise<Cliente> => {
    const response = await api.post<Cliente>('/clientes', data);
    return response.data;
  },


  getAll: async (): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },


  getById: async (id: number): Promise<Cliente> => {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },


  update: async (id: number, data: CreateClienteRequest): Promise<void> => {
    await api.put(`/clientes/${id}`, data);
  },


  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};

// ==========================================
// API DE VISITAS
// ==========================================

export const visitasApi = {

  create: async (data: CrearVisitaRequest): Promise<Visita> => {
    const response = await api.post<Visita>('/visitas', data);
    return response.data;
  },


  getAll: async (): Promise<Visita[]> => {
    const response = await api.get<Visita[]>('/visitas');
    return response.data;
  },


  getById: async (id: number): Promise<Visita> => {
    const response = await api.get<Visita>(`/visitas/${id}`);
    return response.data;
  },


  getDetalle: async (id: number): Promise<VisitaDetalleResponse> => {
    const response = await api.get<VisitaDetalleResponse>(`/visitas/${id}/detalle`);
    return response.data;
  },


  getByCliente: async (idCliente: number): Promise<Visita[]> => {
    const response = await api.get<Visita[]>(`/visitas/cliente/${idCliente}`);
    return response.data;
  },


  getByTecnico: async (idTecnico: string): Promise<Visita[]> => {
    const response = await api.get<Visita[]>(`/visitas/tecnico/${idTecnico}`);
    return response.data;
  },


  getBySupervisor: async (idSupervisor: string): Promise<Visita[]> => {
    const response = await api.get<Visita[]>(`/visitas/supervisor/${idSupervisor}`);
    return response.data;
  },


  update: async (id: number, data: CrearVisitaRequest): Promise<void> => {
    await api.put(`/visitas/${id}`, data);
  },


  updateEstado: async (id: number, idEstado: number): Promise<void> => {
    await api.patch(`/visitas/${id}/estado/${idEstado}`);
  },


  delete: async (id: number): Promise<void> => {
    await api.delete(`/visitas/${id}`);
  },


  registrar: async (id: number, data: RegistrarVisitaRequest): Promise<number> => {
    const response = await api.post<number>(`/visitas/${id}/registrar`, data);
    return response.data;
  },
};
