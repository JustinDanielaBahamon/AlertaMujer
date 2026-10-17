import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Contacto } from "../features/contactos/models/Contacto";
import { contactosService, type EmergencyContact } from "../services/contactos.service";
import { useAuth } from "./AuthContext";

type ContactosContextType = {
  contactos: Contacto[];
  loading: boolean;
  error: string | null;
  agregarContacto: (payload: Omit<Contacto, "id">) => Promise<void>;
  actualizarContacto: (id: string, cambios: Omit<Contacto, "id">) => Promise<void>;
  eliminarContacto: (id: string) => Promise<void>;
  refrescarContactos: () => Promise<void>;
};

const ContactosContext = createContext<ContactosContextType | null>(null);

const mapearEmergencyContactAContacto = (ec: EmergencyContact): Contacto => ({
  id: String(ec.id),
  nombre: ec.contactName || '',
  parentesco: ec.relationship,
  telefono: ec.telephone,
  email: ec.email,
  foto: ec.photo ?? undefined,
});

export function ContactosProvider({ children }: { children: React.ReactNode }) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const cargarContactos = useCallback(async () => {

    if (!user?.id) {
      setContactos([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const emergencyContacts = await contactosService.getContactos(user.id);

      const contactosMapeados = emergencyContacts.map(mapearEmergencyContactAContacto);
      setContactos(contactosMapeados);
    } catch (err) {
      console.error('[ContactosContext] Error al cargar contactos:', err);
      setError("Error al cargar contactos");
      setContactos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    cargarContactos();
  }, [cargarContactos]);

  const agregarContacto = useCallback(async (payload: Omit<Contacto, "id">) => {

    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // NO enviamos userProfileId, el backend lo establece automáticamente
      const nuevoContacto = await contactosService.addContacto({
        contactName: payload.nombre ?? '',
        telephone: payload.telefono,
        email: payload.email,
        relationship: payload.parentesco,
        photo: payload.foto,
      });


      const contactoMapeado = mapearEmergencyContactAContacto(nuevoContacto);

      setContactos((prev) => [...prev, contactoMapeado]);
    } catch (err) {
      console.error('[ContactosContext] Error al agregar contacto:', err);
      setError("Error al agregar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const actualizarContacto = useCallback(async (id: string, cambios: Omit<Contacto, "id">) => {

    setLoading(true);
    setError(null);
    try {
      await contactosService.updateContacto(id, {
        contactName: cambios.nombre || '',
        telephone: cambios.telefono,
        email: cambios.email,
        relationship: cambios.parentesco,
        photo: cambios.foto ?? "", // sin foto = quitarla
      });


      setContactos((prev) =>
        prev.map((contacto) => (contacto.id === id ? { ...contacto, ...cambios } : contacto)),
      );
    } catch (err) {
      console.error('[ContactosContext] Error al actualizar contacto:', err);
      setError("Error al actualizar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarContacto = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await contactosService.deleteContacto(id);
      setContactos((prev) => prev.filter((contacto) => contacto.id !== id));
    } catch (err) {
      setError("Error al eliminar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      contactos,
      loading,
      error,
      agregarContacto,
      actualizarContacto,
      eliminarContacto,
      refrescarContactos: cargarContactos,
    }),
    [contactos, loading, error, agregarContacto, actualizarContacto, eliminarContacto, cargarContactos],
  );

  return <ContactosContext.Provider value={value}>{children}</ContactosContext.Provider>;
}

export function useContactosContext() {
  const ctx = useContext(ContactosContext);
  if (!ctx) {
    throw new Error("useContactosContext debe usarse dentro de ContactosProvider");
  }
  return ctx;
}