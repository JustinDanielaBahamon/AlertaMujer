

import type { Usuario } from "../models/Usuario";
import { authService } from "../../../services/auth.service";

/**
 * Capa de acceso a datos / API para autenticación.
 * Utiliza el servicio de autenticación que conecta a JSON Server.
 */
export async function loginWithEmail(correo: string, password: string): Promise<Usuario> {
  try {
    const response = await authService.login(correo, password);
    return response.usuario as Usuario;
  } catch (error) {
    throw new Error("Error al iniciar sesión. Verifica tus credenciales.");
  }
}
