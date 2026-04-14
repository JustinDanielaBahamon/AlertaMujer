import type { Contacto } from "../models/Contacto";

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
  Activacion: undefined;
  TutorialBienvenida: undefined;
  TutorialBoton: undefined;
  TutorialMensaje: undefined;
  TutorialUbicacion: undefined;
  TutorialContacto: undefined;
  TutorialSeguridad: undefined;
  TutorialNotificacion: undefined;
  /** Sin `contacto` = alta; con `contacto` = edición */
  AgregarContacto: { contacto?: Contacto } | undefined;
};

/** @deprecated Usar AuthStackParamList o MainStackParamList según el flujo */
export type RootStackParamList = AuthStackParamList & MainStackParamList;
