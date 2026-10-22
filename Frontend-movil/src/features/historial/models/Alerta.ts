export type AlertStatus = "Enviada" | "Cancelada" | "En curso";

export interface AlertRecord {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: AlertStatus;
  coords?: { latitude: number; longitude: number };
}
