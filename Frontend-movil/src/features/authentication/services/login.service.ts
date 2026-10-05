import type { Usuario } from "../models/Usuario";
import { authService } from "../../../services/auth.service";

/**
 * Capa de acceso a datos / API para autenticación.
 * Utiliza el servicio de autenticación que conecta al backend Spring Boot.
 */
export async function loginWithEmail(correo: string, password: string): Promise<{ usuario: Usuario; token: string }> {
  try {
    const response = await authService.login(correo, password);
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
    
    return {
      usuario,
      token: response.token
    };
  } catch (error) {
    throw new Error("Error al iniciar sesión. Verifica tus credenciales.");
  }
}