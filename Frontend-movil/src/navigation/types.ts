import type { Contacto } from "../features/contactos/models/Contacto";
import type { Alerta } from "../features/historial/models/Alerta";

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

  MetodosActivacion: undefined;

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
      nombre?: string; // Modificado a opcional
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

  guardarUbi: {
    latitude: number;
    longitude: number;
  };

  ClasificarZona:
    | {
        latitude?: number;
        longitude?: number;
        editarUbicacion?: {
          id: string;
          nombre: string;
          notas?: string;
          nivelRiesgo: "muy_segura" | "moderada" | "muy_insegura";
          descripcion: string;
        };
      }
    | undefined; // Permite ir a ClasificarZona sin pasar parámetros

  UbicacionesGuardadas: undefined;
};

/** @deprecated */
export type RootStackParamList = AuthStackParamList & MainStackParamList;