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

  Activacion:
    | {
        contacto?: Contacto; // si viene, la alerta es solo para este contacto
        metodo?: "agitar"; // activada al agitar el teléfono (por defecto, botón SOS)
      }
    | undefined;
  AlertaActiva:
    | {
        contacto?: Contacto; // si viene, la alerta es solo para este contacto
        metodo?: "agitar";
        alertaId?: number; // alerta ya creada en segundo plano: no se crea otra
      }
    | undefined;
  AlertaContacto: {
    alertaId: number;
    nombreUsuaria?: string;
    latitude?: number;
    longitude?: number;
    demo?: boolean; // TEMPORAL: modo de prueba con puntos simulados
    codigo?: string; // código de seguimiento público (llega en el push a los contactos)
  };

  TutorialBienvenida: undefined;
  TutorialBoton: undefined;
  TutorialMensaje: undefined;
  TutorialUbicacion: undefined;
  TutorialContacto: undefined;
  TutorialSeguridad: undefined;
  TutorialNotificacion: undefined;

  MetodosActivacion: undefined;
  Permisos: undefined;

  Notificaciones: undefined;
  RetencionDatos: undefined;

  AcercaDe: undefined;
  PoliticaTerminos: undefined;
  PoliticaPrivacidad: undefined;

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

  ZonasAuxiliares: undefined;

  HistorialRecorridos: undefined;

  GuardarRecorrido: undefined;
};

/** @deprecated */
export type RootStackParamList = AuthStackParamList & MainStackParamList;