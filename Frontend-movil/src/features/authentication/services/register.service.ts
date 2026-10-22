import type { User } from "../models/User";
import { authService } from "../../../services/auth.service";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * Capa de acceso a datos / API para registro.
 * Utiliza el servicio de autenticación que conecta al backend Spring Boot.
 */
export async function registerWithEmail(data: RegisterData): Promise<User> {
  const response = await authService.register(data);
  
  // Verificar si la respuesta contiene un error
  if ('error' in response) {
    throw new Error(response.error);
  }
  
  // El backend devuelve {token, user}, necesitamos adaptar al modelo Usuario del móvil
  const backendUser = response.user;
  
  // Adaptar el formato del backend al modelo del móvil
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
