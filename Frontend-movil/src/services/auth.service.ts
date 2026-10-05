import api from './api';

export interface LoginResponse {
  token: string;
  user: Usuario;
}

export interface Usuario {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  roleId: number;
  documentNumber?: string;
  documentType?: string;
  birthdate?: string;
  createdAt: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  email?: string;
  password: string;
  telefono?: string;
  fechaNacimiento?: string;
  municipio?: string;
}

export const authService = {
  async login(correo: string, password: string): Promise<LoginResponse> {
    console.log('🔐 [auth.service] login INICIADO');
    console.log('🔐 [auth.service] correo:', correo);
    console.log('🔐 [auth.service] password:', password);

    // Conectar al backend Spring Boot
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: correo,
      password: password
    });

    console.log('✅ [auth.service] Login exitoso:', response.data);
    return response.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    console.log('🔐 [auth.service] register INICIADO');
    console.log('🔐 [auth.service] data:', data);

    // Conectar al backend Spring Boot
    // El backend espera: nombre, email, password, telefono
    const response = await api.post<LoginResponse>('/api/auth/register', {
      nombre: data.nombre,
      email: data.correo || data.email,
      password: data.password,
      telefono: data.telefono
    });

    console.log('✅ [auth.service] Registro exitoso:', response.data);
    return response.data;
  },
};