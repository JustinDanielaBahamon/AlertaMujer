import { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { AppLocale, useLocale } from "../../../contexts/LocaleContext";

// Idiomas disponibles para seleccionar en el modal de idioma
export const OPCIONES_IDIOMA: { code: AppLocale; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

export const useAjustesViewModel = () => {
  const { theme, toggleTheme, setMode } = useTheme();
  const { locale, toggleLocale, setLocale, t } = useLocale();

  // Controla si el modal de seleccion de idioma esta visible
  const [modalIdiomaVisible, setModalIdiomaVisible] = useState(false);

  // Opciones de recorridos
  const [guardarRecorridos, setGuardarRecorridos] = useState(true);
  const [mostrarRecorridos, setMostrarRecorridos] = useState(true);

  const abrirModalIdioma = () => setModalIdiomaVisible(true);
  const cerrarModalIdioma = () => setModalIdiomaVisible(false);

  const seleccionarIdioma = (nuevoLocale: AppLocale) => {
    setLocale(nuevoLocale);
    cerrarModalIdioma();
  };

  const obtenerTextoIdioma = () => {
    const encontrado = OPCIONES_IDIOMA.find((o) => o.code === locale);
    return encontrado ? encontrado.label : "Español";
  };

  const obtenerIconoTema = () => {
    if (theme.mode === "dark") return `🌙 ${t.ajustes.oscuro}`;
    if (theme.mode === "light") return `☀️ ${t.ajustes.claro}`;
    return `🎨 ${t.ajustes.tema_personalizado}`; // Por si está en rosa/vino
  };

  return {
    theme,
    toggleTheme,
    setMode, // Exportamos esto para los círculos
    locale,
    toggleLocale,
    modalIdiomaVisible,
    abrirModalIdioma,
    cerrarModalIdioma,
    seleccionarIdioma,
    obtenerTextoIdioma,
    obtenerIconoTema,
    guardarRecorridos,
    setGuardarRecorridos,
    mostrarRecorridos,
    setMostrarRecorridos,
  };
};