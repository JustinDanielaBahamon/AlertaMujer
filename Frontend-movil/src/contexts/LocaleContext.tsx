import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// Importamos los archivos con los textos en cada idioma
import es from "../locales/es.json";
import en from "../locales/en.json";
import pt from "../locales/pt.json";
import fr from "../locales/fr.json";

// Los idiomas disponibles en la app
export type AppLocale = "es" | "en" | "pt" | "fr";

// Juntamos los textos en un objeto para buscar por idioma facil
const STRINGS = { es, en, pt, fr };

// Esto define que cosas puede darte el contexto
type LocaleContextValue = {
  locale: AppLocale;        // idioma activo: "es", "en", "pt" o "fr"
  t: typeof es;             // todos los textos del idioma activo
  setLocale: (l: AppLocale) => void;  // para cambiar a un idioma especifico
  toggleLocale: () => void; // para alternar entre español e ingles
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // El idioma por defecto es español
  const [locale, setLocaleState] = useState<AppLocale>("es");

  const setLocale = useCallback((l: AppLocale) => {
    setLocaleState(l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((l) => (l === "es" ? "en" : "es"));
  }, []);

  // "t" tiene todos los textos del idioma activo
  // Si locale es "es", t = es.json. Si es "en", t = en.json
  const t = STRINGS[locale];

  const value = useMemo(
    () => ({ locale, t, setLocale, toggleLocale }),
    [locale, t, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// Hook para usar el idioma en cualquier pantalla
// Ejemplo de uso: const { t, locale, setLocale } = useLocale();
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale debe usarse dentro de LocaleProvider");
  }
  return ctx;
}