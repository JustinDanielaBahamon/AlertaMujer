import type { User } from "../models/User";
import { authService } from "../../../services/auth.service";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * Data access / API layer for sign-up.
 * Uses the authentication service that connects to the Spring Boot backend.
 */
export async function registerWithEmail(data: RegisterData): Promise<User> {
  const response = await authService.register(data);
  
  // Check whether the response contains an error
  if ('error' in response) {
    throw new Error(response.error);
  }
  
  // The backend returns {token, user}; we need to adapt it to the mobile User model
  const backendUser = response.user;
  
  // Adapt the backend format to the mobile model
  const user: User = {
    id: backendUser.id,
    nombre: `${backendUser.firstName} ${backendUser.lastName}`,
    correo: backendUser.email,
    email: backendUser.email,
    telefono: backendUser.telephone,
    rol: backendUser.roleId === 2 ? 'Admin' : 'Usuaria',
    estado: 'Activa',
    role_id: backendUser.roleId,
    first_name: backendUser.firstName,
    last_name: backendUser.lastName,
  };
  
  return user;
}
