import { useTheme } from "../../src/contexts/ThemeContext";
import { useLocale } from "../../src/contexts/LocaleContext";

export const useAjustesViewModel = () => {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();

  // Aquí podrías agregar lógica extra a futuro, por ejemplo:
  // - Guardar la configuración en la base de datos o en el teléfono.
  // - Registrar analíticas de qué ajustes cambia el usuario.
  
  const obtenerTextoIdioma = () => {
    return locale === "es" ? "Español" : "English";
  };

  const obtenerIconoTema = () => {
    return theme.mode === "dark" ? "🌙 Modo Oscuro" : "☀️ Modo Claro";
  };

  return {
    theme,
    toggleTheme,
    toggleLocale,
    obtenerTextoIdioma,
    obtenerIconoTema,
  };
};