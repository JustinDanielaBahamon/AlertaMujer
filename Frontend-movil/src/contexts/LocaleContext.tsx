import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// We import the files with the texts of each language
import es from "../locales/es.json";
import en from "../locales/en.json";
import pt from "../locales/pt.json";
import fr from "../locales/fr.json";

// Languages available in the app
export type AppLocale = "es" | "en" | "pt" | "fr";

// We put the texts in one object to look them up by language easily
const STRINGS = { es, en, pt, fr };

// This defines what the context provides
type LocaleContextValue = {
  locale: AppLocale;        // active language: "es", "en", "pt" or "fr"
  t: typeof es;             // all the texts of the active language
  setLocale: (l: AppLocale) => void;  // to switch to a specific language
  toggleLocale: () => void; // to toggle between Spanish and English
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Spanish is the default language
  const [locale, setLocaleState] = useState<AppLocale>("es");

  const setLocale = useCallback((l: AppLocale) => {
    setLocaleState(l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((l) => (l === "es" ? "en" : "es"));
  }, []);

  // "t" has all the texts of the active language
  // If locale is "es", t = es.json. If it is "en", t = en.json
  const t = STRINGS[locale];

  const value = useMemo(
    () => ({ locale, t, setLocale, toggleLocale }),
    [locale, t, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// Hook to use the language on any screen
// Usage example: const { t, locale, setLocale } = useLocale();
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale debe usarse dentro de LocaleProvider");
  }
  return ctx;
}
