import { useTheme } from "../../contexts/ThemeContext";

export type DialogColors = {
  card: { backgroundColor: string };
  title: { color: string };
  text: { color: string };
  /** Secondary buttons drawn as a white box with a border. */
  secondary: { backgroundColor: string };
  secondaryText: { color: string };
};

const LIGHT: DialogColors = {
  card: { backgroundColor: "#FFFFFF" },
  title: { color: "#2E1065" },
  text: { color: "#666666" },
  secondary: { backgroundColor: "#FFFFFF" },
  secondaryText: { color: "#6B3FA0" },
};

/**
 * Colors of the shared dialogs (alerts, confirmations, permissions). They were fixed white, so in
 * dark mode they showed as a white block: with the dark theme they take its surface and text colors.
 */
export function useDialogColors(): DialogColors {
  const { theme } = useTheme();
  if (theme.mode !== "dark") return LIGHT;
  return {
    card: { backgroundColor: theme.containerBackground },
    title: { color: theme.text },
    text: { color: theme.contactSubtext },
    secondary: { backgroundColor: "transparent" },
    secondaryText: { color: theme.contactAccent },
  };
}
