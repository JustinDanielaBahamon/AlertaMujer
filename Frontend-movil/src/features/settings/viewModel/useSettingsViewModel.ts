import { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { AppLocale, useLocale } from "../../../contexts/LocaleContext";

// Languages available in the language modal
export const LANGUAGE_OPTIONS: { code: AppLocale; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

export const useSettingsViewModel = () => {
  const { theme, toggleTheme, setMode } = useTheme();
  const { locale, toggleLocale, setLocale, t } = useLocale();

  // Controls whether the language selection modal is visible
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Route options
  const [saveRoutes, setSaveRoutes] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const openLanguageModal = () => setLanguageModalVisible(true);
  const closeLanguageModal = () => setLanguageModalVisible(false);

  const selectLanguage = (newLocale: AppLocale) => {
    setLocale(newLocale);
    closeLanguageModal();
  };

  const getLanguageText = () => {
    const foundItem = LANGUAGE_OPTIONS.find((o) => o.code === locale);
    return foundItem ? foundItem.label : "Español";
  };

  const getThemeIcon = () => {
    if (theme.mode === "dark") return `🌙 ${t.ajustes.oscuro}`;
    if (theme.mode === "light") return `☀️ ${t.ajustes.claro}`;
    return `🎨 ${t.ajustes.tema_personalizado}`; // In case it is pink/wine
  };

  return {
    theme,
    toggleTheme,
    setMode, // We export this for the circles
    locale,
    toggleLocale,
    languageModalVisible: languageModalVisible,
    openLanguageModal: openLanguageModal,
    closeLanguageModal: closeLanguageModal,
    selectLanguage: selectLanguage,
    getLanguageText: getLanguageText,
    getThemeIcon: getThemeIcon,
    saveRoutes: saveRoutes,
    setSaveRoutes: setSaveRoutes,
    showRoutes: showRoutes,
    setShowRoutes: setShowRoutes,
  };
};