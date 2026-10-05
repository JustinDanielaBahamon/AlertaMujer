import type { Usuario } from "../models/Usuario";
import { authService } from "../../../services/auth.service";

export interface RegisterData {
  nombre: string;
  correo: string;
  password: string;
  telefono?: string;
}

/**
 * Capa de acceso a datos / API para registro.
 * Utiliza el servicio de autenticación que conecta al backend Spring Boot.
 */
export async function registerWithEmail(data: RegisterData): Promise<Usuario> {
  try {
    const response = await authService.register(data);
    // El backend devuelve {token, user}, necesitamos adaptar al modelo Usuario del móvil
    const backendUser = response.user;
    
    // Adaptar el formato del backend al modelo del móvil
    const usuario: Usuario = {
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
    
    return usuario;
  } catch (error) {
    throw new Error("Error al registrar usuario. Intenta de nuevo.");
  }
}
