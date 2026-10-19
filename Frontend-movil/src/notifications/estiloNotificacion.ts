import { AndroidStyle, type AndroidBigTextStyle } from "@notifee/react-native";

/** Violeta de la app para el ícono y los botones de las notificaciones. */
export const COLOR_NOTIFICACION = "#7B1DB2";

/**
 * Notificación expandida con el logo de la app. Sin el estilo de texto grande, Android muestra
 * una sola línea y el mensaje queda cortado ("...").
 */
export function estiloGrande(texto: string, titulo?: string) {
  const style: AndroidBigTextStyle = { type: AndroidStyle.BIGTEXT, text: texto, ...(titulo ? { title: titulo } : {}) };
  return {
    style,
    largeIcon: require("../../assets/images/notificacion-logo.png"),
    color: COLOR_NOTIFICACION,
  };
}
