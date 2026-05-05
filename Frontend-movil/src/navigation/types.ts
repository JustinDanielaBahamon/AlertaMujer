import type { Contacto } from "../models/Contacto";
import type { Alerta } from "../models/Alerta";  // ← importa el modelo

export type AuthStackParamList = {
  Index: undefined;
  Login: undefined;
  Registro: undefined;
  RecuperarContrasena: undefined;
  PoliticaTerminos: undefined;
  PoliticaPrivacidad: undefined;
};

export type MainStackParamList = {
  DrawerHome: undefined;
  Perfil: undefined;
  Activacion: undefined;
  TutorialBienvenida: undefined;
  TutorialBoton: undefined;
  TutorialMensaje: undefined;
  TutorialUbicacion: undefined;
  TutorialContacto: undefined;
  TutorialSeguridad: undefined;
  TutorialNotificacion: undefined;
  AgregarContacto: { contacto?: Contacto } | undefined;
  DetalleAlerta: { alerta: Alerta };  // ← esto faltaba
};

/** @deprecated Usar AuthStackParamList o MainStackParamList según el flujo */
export type RootStackParamList = AuthStackParamList & MainStackParamList;