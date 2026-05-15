export type EstadoAlerta = "Enviada" | "Cancelada" | "En curso";

export interface Alerta {
  id: string;
  tipo: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  estado: EstadoAlerta;
}
