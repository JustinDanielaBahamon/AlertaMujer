import type { Usuario } from "../models/Usuario";
import { authService } from "../../../services/auth.service";

/**
 * Capa de acceso a datos / API para autenticación.
 * Utiliza el servicio de autenticación que conecta al backend Spring Boot.
 */
export async function loginWithEmail(correo: string, password: string): Promise<{ usuario: Usuario; token: string }> {
  try {
    return aSesion(await authService.login(correo, password));
  } catch (error) {
    throw new Error("Error al iniciar sesión. Verifica tus credenciales.");
  }
}

/** Inicio de sesión con el ID token que entrega Google. */
export async function loginWithGoogleIdToken(idToken: string): Promise<{ usuario: Usuario; token: string }> {
  try {
    return aSesion(await authService.loginWithGoogle(idToken));
  } catch (error: any) {
    if (error?.response?.data?.message === "Account blocked") {
      throw new Error("Tu cuenta está bloqueada. Contacta al administrador.");
    }
    throw new Error("No se pudo iniciar sesión con Google. Intenta de nuevo.");
  }
}

// El backend devuelve {token, user}; se adapta al modelo Usuario del móvil
function aSesion(response: Awaited<ReturnType<typeof authService.login>>): { usuario: Usuario; token: string } {
    const backendUser = response.user;
    const usuario: Usuario = {
      id: backendUser.id,
      nombre: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
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
}