export interface Usuario {
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
  fechaNacimiento?: string; // formato "DD/MM/YYYY"
  municipio?: string;       // viene del tutorial de ubicación
}