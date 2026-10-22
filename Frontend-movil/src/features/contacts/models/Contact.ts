export type Contact = {
  id: string;
  name?: string;
  relationship?: string;
  phoneNumber: string;
  email?: string;
  photo?: string;   // ← URI local (galería o agenda)
};