import type { Contact } from "../features/contacts/models/Contact";
import type { AlertRecord } from "../features/history/models/AlertRecord";

export type AuthStackParamList = {
  Index: undefined;
  Login: undefined;
  SignUp: undefined;
  RecoverPassword: undefined;
  TermsPolicy: undefined;
  PrivacyPolicy: undefined;
};

export type MainStackParamList = {
  // Optionally opens a tab: { screen: "Home", params: { screen: "History" } }
  DrawerHome: { screen: "Home"; params?: { screen: string } } | undefined;
  Profile: undefined;

  Activation:
    | {
        contact?: Contact; // if it comes, the alert is only for this contact
        method?: "agitar" | "encendido" | "widget"; // shake, 4 power button presses or widget (by default, SOS button)
      }
    | undefined;
  ActiveAlert:
    | {
        contact?: Contact; // if it comes, the alert is only for this contact
        method?: "agitar" | "encendido" | "widget";
        alertId?: number; // alert already created in the background: another one is not created
      }
    | undefined;
  ReceivedAlerts: undefined;
  Trip: undefined;
  ContactAlert: {
    alertId: number;
    userName?: string;
    latitude?: number;
    longitude?: number;
    demo?: boolean; // TEMPORARY: test mode with simulated points
    code?: string; // public tracking code (arrives in the push to the contacts)
    delivery?: string; // push delivery id: opening the screen marks it seen in the user's history
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
  Inbox: undefined;

  Notifications: undefined;
  DataRetention: undefined;
  AlertSecurity: undefined;

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
      name?: string; // Changed to optional
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
    | undefined; // Allows going to ClassifyZone without params

  SavedLocations: undefined;

  HelpZones: undefined;

  RouteHistory: undefined;

  SaveRoute: undefined;
};

/** @deprecated */
export type RootStackParamList = AuthStackParamList & MainStackParamList;