import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Contact } from "../features/contactos/models/Contacto";
import { contactsService, type EmergencyContact } from "../services/contactos.service";
import { useAuth } from "./AuthContext";

type ContactsContextType = {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  addContactItem: (payload: Omit<Contact, "id">) => Promise<void>;
  updateContactItem: (id: string, changes: Omit<Contact, "id">) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  refreshContacts: () => Promise<void>;
};

const ContactsContext = createContext<ContactsContextType | null>(null);

const mapEmergencyContactToContact = (ec: EmergencyContact): Contact => ({
  id: String(ec.id),
  name: ec.contactName || '',
  relationship: ec.relationship,
  phoneNumber: ec.telephone,
  email: ec.email,
  photo: ec.photo ?? undefined,
});

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadContacts = useCallback(async () => {

    if (!user?.id) {
      setContacts([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const emergencyContacts = await contactsService.getContacts(user.id);

      const mappedContacts = emergencyContacts.map(mapEmergencyContactToContact);
      setContacts(mappedContacts);
    } catch (err) {
      console.error('[ContactosContext] Error al cargar contactos:', err);
      setError("Error al cargar contactos");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const addContactItem = useCallback(async (payload: Omit<Contact, "id">) => {

    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // NO enviamos userProfileId, el backend lo establece automáticamente
      const newContact = await contactsService.addContact({
        contactName: payload.name ?? '',
        telephone: payload.phoneNumber,
        email: payload.email,
        relationship: payload.relationship,
        photo: payload.photo,
      });


      const mappedContact = mapEmergencyContactToContact(newContact);

      setContacts((prev) => [...prev, mappedContact]);
    } catch (err) {
      console.error('[ContactosContext] Error al agregar contacto:', err);
      setError("Error al agregar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateContactItem = useCallback(async (id: string, changes: Omit<Contact, "id">) => {

    setLoading(true);
    setError(null);
    try {
      await contactsService.updateContact(id, {
        contactName: changes.name || '',
        telephone: changes.phoneNumber,
        email: changes.email,
        relationship: changes.relationship,
        photo: changes.photo ?? "", // sin foto = quitarla
      });


      setContacts((prev) =>
        prev.map((contact) => (contact.id === id ? { ...contact, ...changes } : contact)),
      );
    } catch (err) {
      console.error('[ContactosContext] Error al actualizar contacto:', err);
      setError("Error al actualizar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeContact = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await contactsService.deleteContact(id);
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      setError("Error al eliminar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      contacts: contacts,
      loading,
      error,
      addContactItem: addContactItem,
      updateContactItem: updateContactItem,
      removeContact: removeContact,
      refreshContacts: loadContacts,
    }),
    [contacts, loading, error, addContactItem, updateContactItem, removeContact, loadContacts],
  );

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContactsContext() {
  const ctx = useContext(ContactsContext);
  if (!ctx) {
    throw new Error("useContactosContext debe usarse dentro de ContactosProvider");
  }
  return ctx;
}