import type { Contacto } from "../models/Contacto";
import type { Alerta } from "../models/Alerta";

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

  AgregarContacto:
    | {
        contacto?: Contacto;
      }
    | undefined;

  DetalleAlerta: {
    alerta: Alerta;
  };

  historialMapa: {
    ubicacion: {
      id: string;

      latitude: number;
      longitude: number;

      direccion: string;
      barrio: string;

      municipio: string;

      ciudad: string;
      departamento: string;
      pais: string;

      fecha: string;

      estado: "Activo" | "Inactivo";

      precision: string;

      notas?: string;
    };
  };
};

/** @deprecated */
export type RootStackParamList =
  AuthStackParamList &
  MainStackParamList;