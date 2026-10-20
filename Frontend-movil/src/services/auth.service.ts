import api from './api';

export interface LoginResponse {
  token: string;
  refreshToken?: string;
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
  tipoDocumento?: string;
  numeroDocumento?: string;
  fechaNacimiento?: string;
  municipio?: string;
  /** Marcó las casillas de términos y privacidad (el backend guarda la constancia). */
  aceptaTerminos?: boolean;
}

/** Campos que ya usa otra cuenta, con el aviso para mostrar debajo de cada uno. */
export type CamposRepetidos = Partial<Record<"email" | "telefono" | "numeroDocumento", string>>;

export interface RegisterError {
  message: string;
  code?: string;
}

export const authService = {
  /** Recuperación de contraseña: el backend envía un código de 6 dígitos al correo. */
  async pedirCodigoRecuperacion(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email });
  },

  async verificarCodigoRecuperacion(email: string, code: string): Promise<void> {
    await api.post('/api/auth/verify-reset-code', { email, code });
  },

  async restablecerContrasena(email: string, code: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/reset-password', { email, code, newPassword });
  },

  async login(correo: string, password: string): Promise<LoginResponse> {

    // Conectar al backend Spring Boot
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: correo,
      password: password
    });

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
  async register(data: RegisterData): Promise<LoginResponse | { error: string; campos?: CamposRepetidos }> {

    try {
      const response = await api.post<LoginResponse>('/api/auth/register', {
        nombre: data.nombre,
        email: data.correo || data.email,
        password: data.password,
        telefono: data.telefono,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        fechaNacimiento: data.fechaNacimiento,
        aceptaTerminos: data.aceptaTerminos,
      });

      return response.data;
    } catch (error: any) {
      // Manejo mejorado de errores
      // Solo el estado: el error de axios incluye el cuerpo enviado, con la contraseña
      if (__DEV__) console.warn('❌ [auth.service] Error en registro:', error?.response?.status ?? error?.message);
      
      // Verificar si el error es por correo duplicado (código 409 Conflict)
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
        
        // 409 con fieldErrors: correo, teléfono o documento que ya usa otra cuenta
        const campos: CamposRepetidos | undefined = error.response.data?.fieldErrors;
        if (status === 409 && campos && Object.keys(campos).length > 0) {
          return { error: 'Algunos datos ya están registrados en otra cuenta.', campos };
        }
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