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
  nombre: ec.contact_name,
  parentesco: ec.relationship,
  telefono: ec.telephone,
  foto: undefined,
});

export function ContactosProvider({ children }: { children: React.ReactNode }) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const cargarContactos = useCallback(async () => {
    console.log('[ContactosContext] cargarContactos INICIADO');
    console.log('[ContactosContext] user:', user);
    console.log('[ContactosContext] user.id:', user?.id);
    console.log('[ContactosContext] typeof user.id:', typeof user?.id);

    if (!user?.id) {
      console.log('[ContactosContext] user.id no existe, retornando con contactos vacíos');
      setContactos([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('[ContactosContext] Llamando a contactosService.getContactos con user.id:', user.id);
      const emergencyContacts = await contactosService.getContactos(user.id);
      console.log('[ContactosContext] Respuesta recibida de getContactos:', emergencyContacts);
      console.log('[ContactosContext] Cantidad de contactos recibidos:', emergencyContacts.length);

      const contactosMapeados = emergencyContacts.map(mapearEmergencyContactAContacto);
      console.log('[ContactosContext] Contactos mapeados:', contactosMapeados);
      setContactos(contactosMapeados);
      console.log('[ContactosContext] Contactos guardados en estado:', contactosMapeados.length);
    } catch (err) {
      console.error('[ContactosContext] Error al cargar contactos:', err);
      setError("Error al cargar contactos");
      setContactos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('[ContactosContext] useEffect ejecutado, llamando a cargarContactos');
    cargarContactos();
  }, [cargarContactos]);

  const agregarContacto = useCallback(async (payload: Omit<Contacto, "id">) => {
    console.log('[ContactosContext] agregarContacto INICIADO');
    console.log('[ContactosContext] payload:', payload);
    console.log('[ContactosContext] user.id:', user?.id);

    if (!user?.id) {
      console.log('[ContactosContext] user.id no existe, no se puede agregar contacto');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nuevoContacto = await contactosService.addContacto({
        user_profile_id: user.id,
        contact_name: payload.nombre,
        telephone: payload.telefono,
        email: undefined,
        relationship: payload.parentesco,
      });

      console.log('✅ [ContactosContext] nuevoContacto recibido:', nuevoContacto);

      const contactoMapeado = mapearEmergencyContactAContacto(nuevoContacto);
      console.log('[ContactosContext] contactoMapeado:', contactoMapeado);

      setContactos((prev) => [...prev, contactoMapeado]);
      console.log('[ContactosContext] Contacto agregado al estado');
    } catch (err) {
      console.error('[ContactosContext] Error al agregar contacto:', err);
      setError("Error al agregar contacto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const actualizarContacto = useCallback(async (id: string, cambios: Omit<Contacto, "id">) => {
    console.log('[ContactosContext] actualizarContacto INICIADO');
    console.log('[ContactosContext] id:', id);
    console.log('[ContactosContext] cambios:', cambios);

    setLoading(true);
    setError(null);
    try {
      await contactosService.updateContacto(id, {
        contact_name: cambios.nombre,
        telephone: cambios.telefono,
        relationship: cambios.parentesco,
      });

      console.log('✅[ContactosContext] Contacto actualizado en servidor');

      setContactos((prev) =>
        prev.map((contacto) => (contacto.id === id ? { ...contacto, ...cambios } : contacto)),
      );
      console.log('[ContactosContext] Contacto actualizado en estado');
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