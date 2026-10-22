import type { User } from "../models/Usuario";

export type Session = { user: User; token: string; refreshToken?: string };
import { authService } from "../../../services/auth.service";

/**
 * Capa de acceso a datos / API para autenticación.
 * Utiliza el servicio de autenticación que conecta al backend Spring Boot.
 */
export async function loginWithEmail(email: string, password: string): Promise<Session> {
  try {
    return toSession(await authService.login(email, password));
  } catch (error) {
    throw new Error("Error al iniciar sesión. Verifica tus credenciales.");
  }
}

/** Inicio de sesión con el ID token que entrega Google. */
export async function loginWithGoogleIdToken(idToken: string): Promise<Session> {
  try {
    return toSession(await authService.loginWithGoogle(idToken));
  } catch (error: any) {
    if (error?.response?.data?.message === "Account blocked") {
      throw new Error("Tu cuenta está bloqueada. Contacta al administrador.");
    }
    throw new Error("No se pudo iniciar sesión con Google. Intenta de nuevo.");
  }
}

// El backend devuelve {token, user}; se adapta al modelo Usuario del móvil
function toSession(response: Awaited<ReturnType<typeof authService.login>>): Session {
    const backendUser = response.user;
    const user: User = {
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
      user,
      token: response.token,
      refreshToken: response.refreshToken,
    };
}