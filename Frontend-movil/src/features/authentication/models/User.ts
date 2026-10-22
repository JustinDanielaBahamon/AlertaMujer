export interface User {
  id: number;
  nombre: string;
  correo: string;
  email?: string;
  fotoPerfil?: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  avatarColor?: string;
  role_id?: number;
  first_name?: string;
  last_name?: string;
  fechaNacimiento?: string; // "DD/MM/YYYY" format
  municipio?: string;       // comes from the location tutorial
}