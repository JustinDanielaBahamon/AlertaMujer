import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Contacto } from "../features/contactos/models/Contacto";

type ContactosContextType = {
  contactos: Contacto[];
  agregarContacto: (payload: Omit<Contacto, "id">) => Contacto;
  actualizarContacto: (id: string, cambios: Omit<Contacto, "id">) => void;
  eliminarContacto: (id: string) => void;
};

const CONTACTOS_MOCK_INICIAL: Contacto[] = [
  {
    id: "1",
    nombre: "Tatiana Montero",
    parentesco: "Hermana",
    telefono: "3176866754",
  },
];

const ContactosContext = createContext<ContactosContextType | null>(null);

export function ContactosProvider({ children }: { children: React.ReactNode }) {
  const [contactos, setContactos] = useState<Contacto[]>(CONTACTOS_MOCK_INICIAL);

  const agregarContacto = useCallback((payload: Omit<Contacto, "id">) => {
    const nuevoContacto: Contacto = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...payload,
    };

    setContactos((prev) => [...prev, nuevoContacto]);
    return nuevoContacto;
  }, []);

  const actualizarContacto = useCallback((id: string, cambios: Omit<Contacto, "id">) => {
    setContactos((prev) =>
      prev.map((contacto) => (contacto.id === id ? { ...contacto, ...cambios } : contacto)),
    );
  }, []);

  const eliminarContacto = useCallback((id: string) => {
    setContactos((prev) => prev.filter((contacto) => contacto.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      contactos,
      agregarContacto,
      actualizarContacto,
      eliminarContacto,
    }),
    [contactos, agregarContacto, actualizarContacto, eliminarContacto],
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
