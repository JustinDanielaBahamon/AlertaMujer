/**
 * CONTACTS VIEWMODEL (MVVM)
 *
 * Handles all the logic of the contact list:
 * - Contact list state
 * - Actions modal (open/close)
 * - Delete confirmation
 * - Navigation to add/edit
 *
 * The view (contacts.tsx) only consumes this ViewModel.
 */

import { useCallback, useState ,useMemo} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Alert, Share } from "react-native";
import { WEB_URL } from "../../../constants/links";
import { useLocale } from "../../../contexts/LocaleContext";
import { contactsService, type ContactAppStatus } from "../../../services/contacts.service";
import type { Contact } from "../models/Contact";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import { useContactsContext } from "../../../contexts/ContactsContext";

/**
 * Formats a 10-digit phone as: 317 686 6754
 */
function formatPhoneForDisplay(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  }
  return phoneNumber;
}

/** With fewer contacts than this it is easy for nobody to see the alert in time. */
export const RECOMMENDED_CONTACTS = 5;

export function useContactsTabViewModel() {
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { contacts, removeContact, refreshContacts, loading } = useContactsContext();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  /**
   * RELOAD WHEN THE SCREEN GETS FOCUS
   * Same as in History: every time the user opens the Contacts
   * tab, the list is requested again from the backend. That way, if a
   * contact was created/edited/deleted elsewhere (web, or another session),
   * the app always shows the latest when the screen opens.
   */
  // Real status of each contact (it used to say "Available" without checking anything)
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

  /** Shares the app link so the contact also gets the alerts on their phone. */
  const inviteToApp = useCallback((contact: Contact) => {
    const message = t.contactos.invitar_mensaje
      .replace("{nombre}", (contact.name || "").split(" ")[0] || "")
      .replace("{correo}", contact.email || "")
      .replace("{url}", WEB_URL);
    Share.share({ message: message }).catch(() => {});
  }, [t]);

  /**
   * PULL TO REFRESH (swipe down to reload)
   * Same behavior as the History module.
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
    [contacts, searchText]  // ← only recomputed when these two change
  );
  // State: is the actions modal open?
  const [modalVisible, setModalVisible] = useState(false); 

  
  // State: which contact was selected?
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  /**
   * OPEN ACTIONS MODAL
   * Runs when the user taps a contact.
   */
  const openActionsModal = useCallback((contact: Contact) => {
    setSelectedContact(contact); // Remember which contact was tapped
    setModalVisible(true);              // Show the modal
  }, []);

  /**
   * CLOSE ACTIONS MODAL
   */
  const closeActionsModal = useCallback(() => {
    setModalVisible(false);
    // Wait for the animation to end before clearing
    setTimeout(() => setSelectedContact(null), 300);
  }, []);

  /**
   * NAVIGATE TO ADD/EDIT CONTACT
   * If it receives a contact, it opens in "edit" mode (with preloaded data).
   * If it does not receive a contact, it opens in "create new" mode.
   */
  const navigateAddOrEdit = useCallback(
    (contact?: Contact) => {
      const main = getMainStackNavigation(navigation);
      if (!main) {
        return;
      }
      if (contact) {
        // Edit mode: pass the contact as a param
        main.navigate("AddContact", { contact: contact });
      } else {
        // Create-new mode
        main.navigate("AddContact", undefined);
      }
    },
    [navigation],
  );

  /**
   * GO TO ADD A NEW CONTACT
   * Runs when the floating "+" button is tapped
   */
  const goToAddContact = useCallback(() => {
    navigateAddOrEdit(undefined);
  }, [navigateAddOrEdit]);

  /**
   * INDIVIDUAL ALERT
   * Starts the normal alert (5-second screen) but only for this contact.
   */
  const alertContact = useCallback(
    (contact: Contact) => {
      const main = getMainStackNavigation(navigation);
      if (!main) {
        return;
      }
      main.navigate("Activation", { contact: contact });
    },
    [navigation],
  );

  /**
   * CONFIRM DELETION
   * Shows a native confirmation Alert before deleting.
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
   * ACTION: UPDATE
   * Runs when the user taps "Update" in the modal.
   */
  const handleUpdate = useCallback(() => {
    if (selectedContact) {
      navigateAddOrEdit(selectedContact);
    }
  }, [selectedContact, navigateAddOrEdit]);

  /**
   * ACTION: DELETE
   * Runs when the user taps "Delete" in the modal.
   */
  const handleDelete = useCallback(() => {
    if (selectedContact) {
      confirmDelete(selectedContact);
    }
  }, [selectedContact, confirmDelete]);

  /**
   * DELETE WITH SWIPE
   * Runs when the user swipes a contact to the left.
   */
  const deleteWithSwipe = useCallback((contact: Contact) => {
    confirmDelete(contact);
  }, [confirmDelete]);

  // Return everything the view needs
  return {
    // State
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
    
    // Utility functions
    formatPhoneForDisplay: formatPhoneForDisplay,
    filteredContacts: filteredContacts,
    // Actions
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