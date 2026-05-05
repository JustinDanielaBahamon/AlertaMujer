export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  fotoPerfil?: string;  // ← solo agrega esta línea
}