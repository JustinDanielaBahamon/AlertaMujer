import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { WidgetSOS } from "./WidgetSOS";

/** Android asks to draw the widget when it is added, updated or resized. */
export async function widgetTask({ widgetAction, renderWidget }: WidgetTaskHandlerProps): Promise<void> {
  if (widgetAction === "WIDGET_ADDED" || widgetAction === "WIDGET_UPDATE" || widgetAction === "WIDGET_RESIZED") {
    renderWidget(<WidgetSOS />);
  }
}
