import type { Usuario } from "../../models/Usuario";

/**
 * Capa de acceso a datos / API para autenticación.
 * Sustituir por llamadas reales a `src/services/api` cuando exista backend.
 */
export async function loginWithEmail(correo: string, _password: string): Promise<Usuario> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: 1,
    nombre: correo.split("@")[0] || "Usuario",
    correo,
  };
}
