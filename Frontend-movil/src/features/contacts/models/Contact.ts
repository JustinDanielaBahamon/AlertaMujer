export type Contact = {
  id: string;
  name?: string;
  relationship?: string;
  phoneNumber: string;
  email?: string;
  photo?: string;   // ← local URI (gallery or phone contacts)
};