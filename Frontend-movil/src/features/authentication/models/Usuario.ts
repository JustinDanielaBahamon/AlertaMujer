export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  fotoPerfil?: string;
  telefono?: string;
  fechaNacimiento?: string; // formato "DD/MM/YYYY"
  municipio?: string;       // viene del tutorial de ubicación
}