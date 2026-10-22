import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

/** Widget name in app.config.js (react-native-android-widget). */
export const WIDGET_NAME = "AlertaSOS";
/** Link the widget opens: the app receives it and shows the 5 s countdown. */
export const SOS_LINK = "alertamujer://sos";

/**
 * Home screen widget: a violet SOS button. Tapping it opens the app on the
 * countdown (it can be cancelled if it was an accidental tap, for example in a pocket).
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
