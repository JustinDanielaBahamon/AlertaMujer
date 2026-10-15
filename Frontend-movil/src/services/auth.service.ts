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

export interface RegisterError {
  message: string;
  code?: string;
}

export const authService = {
  async login(correo: string, password: string): Promise<LoginResponse> {
    console.log('🔐 [auth.service] login INICIADO');
    console.log('🔐 [auth.service] correo:', correo);

    // Conectar al backend Spring Boot
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: correo,
      password: password
    });

    console.log('✅ [auth.service] Login exitoso:', response.data);
    return response.data;
  },

  /**
   * Inicio de sesión con Google: el backend valida el ID token de Google y devuelve el JWT de la app.
   * Si el correo no está registrado, el backend crea la cuenta.
   */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/google', { idToken });
    return response.data;
  },

  /**
   * Registro de nuevo usuario con manejo de errores mejorado
   * Muestra mensajes amigables en lugar de "API error"
   */
  async register(data: RegisterData): Promise<LoginResponse | { error: string }> {
    console.log('🔐 [auth.service] register INICIADO');
    console.log('🔐 [auth.service] data:', data);

    try {
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
    } catch (error: any) {
      // Manejo mejorado de errores
      console.error('❌ [auth.service] Error en registro:', error);
      
      // Verificar si el error es por correo duplicado (código 409 Conflict)
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
        
        // El backend lanza ConflictException("Email already exists") que retorna status 409
        if (status === 409 || errorMessage?.toLowerCase().includes('email') || errorMessage?.toLowerCase().includes('ya existe')) {
          return { error: 'El correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.' };
        }
        
        // Otros errores del backend
        if (status === 400) {
          return { error: errorMessage || 'Solicitud incorrecta. Verifica los datos e intenta nuevamente.' };
        }
        
        // Error de servidor interno
        if (status === 500) {
          return { error: 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.' };
        }
      }
      
      // Error de red o sin respuesta del servidor
      return { error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.' };
    }
  },
};