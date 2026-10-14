export type Contacto = {
  id: string;
  nombre?: string;
  parentesco?: string;
  telefono: string;
  email?: string;
  foto?: string;   // ← URI local (galería o agenda)
};