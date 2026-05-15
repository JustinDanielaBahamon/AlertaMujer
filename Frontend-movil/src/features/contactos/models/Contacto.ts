export type Contacto = {
  id: string;
  nombre: string;
  parentesco?: string;
  telefono: string;
  foto?: string;   // ← URI local (galería o agenda)
};