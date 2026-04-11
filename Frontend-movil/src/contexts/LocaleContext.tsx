import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AppLocale = "es" | "en";

type Strings = {
  appTitle: string;
  menu: string;
  theme: string;
  language: string;
  languageEs: string;
  languageEn: string;
  themeLight: string;
  themeDark: string;
};

const STRINGS: Record<AppLocale, Strings> = {
  es: {
    appTitle: "Alerta Mujer",
    menu: "Menú",
    theme: "Tema",
    language: "Idioma",
    languageEs: "Español",
    languageEn: "English",
    themeLight: "Claro",
    themeDark: "Oscuro",
  },
  en: {
    appTitle: "Alerta Mujer",
    menu: "Menu",
    theme: "Theme",
    language: "Language",
    languageEs: "Spanish",
    languageEn: "English",
    themeLight: "Light",
    themeDark: "Dark",
  },
};

type LocaleContextValue = {
  locale: AppLocale;
  t: Strings;
  setLocale: (l: AppLocale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("es");

  const setLocale = useCallback((l: AppLocale) => {
    setLocaleState(l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((l) => (l === "es" ? "en" : "es"));
  }, []);

  const t = STRINGS[locale];

  const value = useMemo(
    () => ({ locale, t, setLocale, toggleLocale }),
    [locale, t, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale debe usarse dentro de LocaleProvider");
  }
  return ctx;
}
