import api from './api';

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface User {
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
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  municipality?: string;
  /** She ticked the terms and privacy boxes (the backend stores the record). */
  acceptsTerms?: boolean;
}

/** Fields already used by another account, with the notice to show below each one. */
export type DuplicateFields = Partial<Record<"email" | "telefono" | "numeroDocumento", string>>;

export interface RegisterError {
  message: string;
  code?: string;
}

export const authService = {
  /** Password recovery: the backend sends a 6-digit code to the email. */
  async requestRecoveryCode(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email });
  },

  async verifyRecoveryCode(email: string, code: string): Promise<void> {
    await api.post('/api/auth/verify-reset-code', { email, code });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/reset-password', { email, code, newPassword });
  },

  async login(email: string, password: string): Promise<LoginResponse> {

    // Connect to the Spring Boot backend
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: email,
      password: password
    });

    return response.data;
  },

  /**
   * Google sign-in: the backend validates the Google ID token and returns the app JWT.
   * If the email is not registered, the backend creates the account.
   */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/google', { idToken });
    return response.data;
  },

  /**
   * New user sign-up with improved error handling
   * Shows friendly messages instead of "API error"
   */
  async register(data: RegisterData): Promise<LoginResponse | { error: string; campos?: DuplicateFields }> {

    try {
      const response = await api.post<LoginResponse>('/api/auth/register', {
        nombre: data.name,
        email: data.email,
        password: data.password,
        telefono: data.phoneNumber,
        tipoDocumento: data.documentType,
        numeroDocumento: data.documentNumber,
        fechaNacimiento: data.birthDate,
        aceptaTerminos: data.acceptsTerms,
      });

      return response.data;
    } catch (error: any) {
      // Improved error handling
      // Status only: the axios error includes the body sent, with the password
      if (__DEV__) console.warn('❌ [auth.service] Error en registro:', error?.response?.status ?? error?.message);
      
      // Check whether the error is a duplicate email (409 Conflict)
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
        
        // 409 with fieldErrors: email, phone or document already used by another account
        const campos: DuplicateFields | undefined = error.response.data?.fieldErrors;
        if (status === 409 && campos && Object.keys(campos).length > 0) {
          return { error: 'Algunos datos ya están registrados en otra cuenta.', campos };
        }
        if (status === 409 || errorMessage?.toLowerCase().includes('email') || errorMessage?.toLowerCase().includes('ya existe')) {
          return { error: 'El correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.' };
        }
        
        // Other backend errors
        if (status === 400) {
          return { error: errorMessage || 'Solicitud incorrecta. Verifica los datos e intenta nuevamente.' };
        }
        
        // Internal server error
        if (status === 500) {
          return { error: 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.' };
        }
      }
      
      // Network error or no response from the server
      return { error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.' };
    }
  },
};