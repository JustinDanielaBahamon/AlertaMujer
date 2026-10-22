import { AndroidStyle, type AndroidBigTextStyle } from "@notifee/react-native";

/** App violet for the notification icon and buttons. */
export const NOTIFICATION_COLOR = "#7B1DB2";

/**
 * Expanded notification with the app logo. Without the big text style, Android shows
 * a single line and the message is cut off ("...").
 */
export function bigStyle(text: string, title?: string) {
  const style: AndroidBigTextStyle = { type: AndroidStyle.BIGTEXT, text: text, ...(title ? { title: title } : {}) };
  return {
    style,
    largeIcon: require("../../assets/images/notificacion-logo.png"),
    color: NOTIFICATION_COLOR,
  };
}
