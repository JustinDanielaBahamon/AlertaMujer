/**
 * VIEWMODEL DE CONTACTOS (MVVM)
 * 
 * Maneja toda la lógica de la lista de contactos:
 * - Estado de la lista de contactos
 * - Modal de acciones (abrir/cerrar)
 * - Confirmación de borrado
 * - Navegación a agregar/editar
 * 
 * La vista (contactos.tsx) solo consume este ViewModel.
 */

import { useCallback, useState ,useMemo} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Alert, Share } from "react-native";
import { WEB_URL } from "../../../constants/enlaces";
import { useLocale } from "../../../contexts/LocaleContext";
import { contactsService, type ContactAppStatus } from "../../../services/contactos.service";
import type { Contact } from "../models/Contacto";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import { useContactsContext } from "../../../contexts/ContactosContext";

/**
 * Formatea un teléfono de 10 dígitos a formato: 317 686 6754
 */
function formatPhoneForDisplay(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  }
  return phoneNumber;
}

/** Con menos de estos contactos es fácil que nadie vea la alerta a tiempo. */
export const RECOMMENDED_CONTACTS = 5;

export function useContactsTabViewModel() {
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { contacts, removeContact, refreshContacts, loading } = useContactsContext();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  /**
   * RECARGAR AL ENFOCAR LA PANTALLA
   * Igual que en Historial: cada vez que el usuario entra a la pestaña
   * de Contactos, se vuelve a pedir la lista al backend. Así, si el
   * contacto se creó/editó/borró en otro lado (web, u otra sesión),
   * la móvil siempre muestra lo último al abrir la pantalla.
   */
  // Estado real de cada contacto (antes decía "Disponible" sin revisar nada)
  const [appStatus, setAppStatus] = useState<Record<string, ContactAppStatus>>({});
  const loadAppStatus = useCallback(() => {
    contactsService.getAppStatus().then(setAppStatus).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshContacts();
      loadAppStatus();
    }, [refreshContacts, loadAppStatus]),
  );

  /** Comparte el enlace de la app para que el contacto reciba las alertas también en su celular. */
  const inviteToApp = useCallback((contact: Contact) => {
    const message = t.contactos.invitar_mensaje
      .replace("{nombre}", (contact.name || "").split(" ")[0] || "")
      .replace("{correo}", contact.email || "")
      .replace("{url}", WEB_URL);
    Share.share({ message: message }).catch(() => {});
  }, [t]);

  /**
   * PULL TO REFRESH (deslizar hacia abajo para recargar)
   * Mismo comportamiento que tiene el módulo de Historial.
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      loadAppStatus();
      await refreshContacts();
    } finally {
      setRefreshing(false);
    }
  }, [refreshContacts, loadAppStatus]);

  const filteredContacts = useMemo(() =>
    contacts.filter(c => {
      const nameStr = (c.name || '').toLowerCase();
      const phoneStr = c.phoneNumber || '';
      return nameStr.includes(searchText.toLowerCase()) || phoneStr.includes(searchText);
    }),
    [contacts, searchText]  // ← solo recalcula cuando estos dos cambian
  );
  // Estado: ¿Está abierto el modal de acciones?
  const [modalVisible, setModalVisible] = useState(false); 

  
  // Estado: ¿Qué contacto se seleccionó?
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  /**
   * ABRIR MODAL DE ACCIONES
   * Se ejecuta cuando el usuario toca un contacto.
   */
  const openActionsModal = useCallback((contact: Contact) => {
    setSelectedContact(contact); // Guardar cuál contacto tocó
    setModalVisible(true);              // Mostrar el modal
  }, []);

  /**
   * CERRAR MODAL DE ACCIONES
   */
  const closeActionsModal = useCallback(() => {
    setModalVisible(false);
    // Esperar a que termine la animación antes de limpiar
    setTimeout(() => setSelectedContact(null), 300);
  }, []);

  /**
   * NAVEGAR A AGREGAR/EDITAR CONTACTO
   * Si recibe un contacto, abre en modo "editar" (con datos precargados).
   * Si no recibe contacto, abre en modo "crear nuevo".
   */
  const navigateAddOrEdit = useCallback(
    (contact?: Contact) => {
      const main = getMainStackNavigation(navigation);
      if (!main) {
        return;
      }
      if (contact) {
        // Modo editar: pasar el contacto como parámetro
        main.navigate("AgregarContacto", { contacto: contact });
      } else {
        // Modo crear nuevo
        main.navigate("AgregarContacto", undefined);
      }
    },
    [navigation],
  );

  /**
   * IR A AGREGAR NUEVO CONTACTO
   * Se ejecuta al tocar el botón flotante "+"
   */
  const goToAddContact = useCallback(() => {
    navigateAddOrEdit(undefined);
  }, [navigateAddOrEdit]);

  /**
   * ALERTA INDIVIDUAL
   * Inicia la alerta normal (pantalla de 5 segundos) pero solo para este contacto.
   */
  const alertContact = useCallback(
    (contact: Contact) => {
      const main = getMainStackNavigation(navigation);
      if (!main) {
        return;
      }
      main.navigate("Activacion", { contacto: contact });
    },
    [navigation],
  );

  /**
   * CONFIRMAR BORRADO
   * Muestra un Alert nativo de confirmación antes de borrar.
   */
  const confirmDelete = useCallback((contact: Contact) => {
    Alert.alert(
      "¿Eliminar contacto?",
      `${contact.name} ya no recibirá tus alertas de emergencia.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            removeContact(contact.id);
          },
        },
      ],
    );
  }, [removeContact]);

  /**
   * ACCIÓN: ACTUALIZAR
   * Se ejecuta cuando el usuario toca "Actualizar" en el modal.
   */
  const handleUpdate = useCallback(() => {
    if (selectedContact) {
      navigateAddOrEdit(selectedContact);
    }
  }, [selectedContact, navigateAddOrEdit]);

  /**
   * ACCIÓN: BORRAR
   * Se ejecuta cuando el usuario toca "Borrar" en el modal.
   */
  const handleDelete = useCallback(() => {
    if (selectedContact) {
      confirmDelete(selectedContact);
    }
  }, [selectedContact, confirmDelete]);

  /**
   * BORRAR CON SWIPE (deslizar)
   * Se ejecuta cuando el usuario desliza un contacto hacia la izquierda.
   */
  const deleteWithSwipe = useCallback((contact: Contact) => {
    confirmDelete(contact);
  }, [confirmDelete]);

  // Retornar todo lo que la vista necesita
  return {
    // Estado
    contacts: contacts,
    modalVisible,
    selectedContact: selectedContact,
    searchText: searchText,
    loading,
    refreshing,
    onRefresh,
    appStatus: appStatus,
    missingContacts: Math.max(0, RECOMMENDED_CONTACTS - contacts.length),
    inviteToApp: inviteToApp,
    
    // Funciones de utilidad
    formatPhoneForDisplay: formatPhoneForDisplay,
    filteredContacts: filteredContacts,
    // Acciones
    openActionsModal: openActionsModal,
    closeActionsModal: closeActionsModal,
    handleUpdate: handleUpdate,
    handleDelete: handleDelete,
    goToAddContact: goToAddContact,
    alertContact: alertContact,
    deleteWithSwipe: deleteWithSwipe,
    setSearchText: setSearchText
  };
}