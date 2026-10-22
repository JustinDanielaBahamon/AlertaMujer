import type { Contact } from "../features/contactos/models/Contacto";
import type { AlertRecord } from "../features/historial/models/Alerta";

export type AuthStackParamList = {
  Index: undefined;
  Login: undefined;
  SignUp: undefined;
  RecoverPassword: undefined;
  TermsPolicy: undefined;
  PrivacyPolicy: undefined;
};

export type MainStackParamList = {
  DrawerHome: undefined;
  Profile: undefined;

  Activation:
    | {
        contact?: Contact; // si viene, la alerta es solo para este contacto
        method?: "agitar" | "encendido" | "widget"; // agitar, 4 pulsaciones del botón de encendido o widget (por defecto, botón SOS)
      }
    | undefined;
  ActiveAlert:
    | {
        contact?: Contact; // si viene, la alerta es solo para este contacto
        method?: "agitar" | "encendido" | "widget";
        alertId?: number; // alerta ya creada en segundo plano: no se crea otra
      }
    | undefined;
  ReceivedAlerts: undefined;
  Trip: undefined;
  ContactAlert: {
    alertId: number;
    userName?: string;
    latitude?: number;
    longitude?: number;
    demo?: boolean; // TEMPORAL: modo de prueba con puntos simulados
    code?: string; // código de seguimiento público (llega en el push a los contactos)
  };

  WelcomeTutorial: undefined;
  ButtonTutorial: undefined;
  MessageTutorial: undefined;
  LocationTutorial: undefined;
  ContactTutorial: undefined;
  SecurityTutorial: undefined;
  NotificationTutorial: undefined;

  ActivationMethods: undefined;
  Permissions: undefined;

  Notifications: undefined;
  DataRetention: undefined;

  About: undefined;
  TermsPolicy: undefined;
  PrivacyPolicy: undefined;

  AddContact:
    | {
        contact?: Contact;
      }
    | undefined;

  AlertDetail: {
    alert: AlertRecord;
  };

  HistoryMap: {
    location: {
      id: string;
      name?: string; // Modificado a opcional
      latitude: number;
      longitude: number;
      address: string;
      neighborhood: string;
      municipality: string;
      city: string;
      department: string;
      country: string;
      date: string;
      status: "Activo" | "Inactivo";
      precision: string;
      notes?: string;
    };
  };

  SaveLocation: {
    latitude: number;
    longitude: number;
  };

  ClassifyZone:
    | {
        latitude?: number;
        longitude?: number;
        locationToEdit?: {
          id: string;
          name: string;
          notes?: string;
          riskLevel: "muy_segura" | "moderada" | "muy_insegura";
          description: string;
        };
      }
    | undefined; // Permite ir a ClasificarZona sin pasar parámetros

  SavedLocations: undefined;

  HelpZones: undefined;

  RouteHistory: undefined;

  SaveRoute: undefined;
};

/** @deprecated */
export type RootStackParamList = AuthStackParamList & MainStackParamList;