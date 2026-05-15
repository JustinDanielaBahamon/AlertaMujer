import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";

export const useAjustesViewModel = () => {
  const { theme, toggleTheme, setMode } = useTheme();
  const { locale, toggleLocale } = useLocale();

  const obtenerTextoIdioma = () => {
    return locale === "es" ? "Español" : "English";
  };

  const obtenerIconoTema = () => {
    if (theme.mode === "dark") return "🌙 Modo Oscuro";
    if (theme.mode === "light") return "☀️ Modo Claro";
    return "🎨 Tema Personalizado"; // Por si está en rosa/vino
  };

  return {
    theme,
    toggleTheme,
    setMode, // Exportamos esto para los círculos
    toggleLocale,
    obtenerTextoIdioma,
    obtenerIconoTema,
  };
};