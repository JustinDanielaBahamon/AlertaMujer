import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

/** Nombre del widget en app.config.js (react-native-android-widget). */
export const WIDGET_NAME = "AlertaSOS";
/** Enlace que abre el widget: la app lo recibe y muestra la cuenta regresiva de 5 s. */
export const SOS_LINK = "alertamujer://sos";

/**
 * Widget de la pantalla de inicio: un botón SOS violeta. Al tocarlo abre la app en la cuenta
 * regresiva (se puede cancelar si fue un toque accidental, por ejemplo en el bolsillo).
 */
export function WidgetSOS() {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: SOS_LINK }}
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        backgroundGradient: { from: "#a855f7", to: "#4c1d95", orientation: "TL_BR" },
        padding: 8,
      }}
    >
      <FlexWidget
        style={{
          height: 68,
          width: 68,
          borderRadius: 34,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextWidget text="SOS" style={{ fontSize: 22, fontWeight: "bold", color: "#7c3aed" }} />
      </FlexWidget>
      <TextWidget
        text="Toca para alertar"
        style={{ fontSize: 12, color: "#ffffff", marginTop: 8, fontWeight: "600" }}
      />
    </FlexWidget>
  );
}
