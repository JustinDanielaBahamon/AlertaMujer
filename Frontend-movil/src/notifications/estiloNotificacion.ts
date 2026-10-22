import { AndroidStyle, type AndroidBigTextStyle } from "@notifee/react-native";

/** Violeta de la app para el ícono y los botones de las notificaciones. */
export const NOTIFICATION_COLOR = "#7B1DB2";

/**
 * Notificación expandida con el logo de la app. Sin el estilo de texto grande, Android muestra
 * una sola línea y el mensaje queda cortado ("...").
 */
export function bigStyle(text: string, title?: string) {
  const style: AndroidBigTextStyle = { type: AndroidStyle.BIGTEXT, text: text, ...(title ? { title: title } : {}) };
  return {
    style,
    largeIcon: require("../../assets/images/notificacion-logo.png"),
    color: NOTIFICATION_COLOR,
  };
}
