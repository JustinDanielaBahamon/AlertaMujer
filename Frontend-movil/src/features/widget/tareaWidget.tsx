import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { WidgetSOS } from "./WidgetSOS";

/** Android pide dibujar el widget al agregarlo, actualizarlo o cambiarle el tamaño. */
export async function tareaWidget({ widgetAction, renderWidget }: WidgetTaskHandlerProps): Promise<void> {
  if (widgetAction === "WIDGET_ADDED" || widgetAction === "WIDGET_UPDATE" || widgetAction === "WIDGET_RESIZED") {
    renderWidget(<WidgetSOS />);
  }
}
