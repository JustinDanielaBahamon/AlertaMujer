import { renderHook, waitFor } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

jest.mock("react-native-android-widget", () => ({
  FlexWidget: "FlexWidget",
  TextWidget: "TextWidget",
}));

let mockWidgetEnabled = true;
jest.mock("../../../contexts/ActivationMethodsContext", () => ({
  useActivationMethods: () => ({ config: { widget: mockWidgetEnabled }, loaded: true }),
}));

import { widgetTask } from "../widgetTask";
import { useSosLink } from "../useSosLink";

const fakeNavigation = () =>
  ({ isReady: () => true, getCurrentRoute: () => ({ name: "DrawerHome" }), navigate: jest.fn() }) as never;

describe("widget SOS", () => {
  it("se dibuja al agregarlo y no al tocarlo (el toque abre el enlace)", async () => {
    const renderWidget = jest.fn();
    await widgetTask({ widgetAction: "WIDGET_ADDED", renderWidget, widgetInfo: {} as never });
    await widgetTask({ widgetAction: "WIDGET_CLICK", renderWidget, widgetInfo: {} as never });
    expect(renderWidget).toHaveBeenCalledTimes(1);
  });

  it("al abrir la app desde el widget lleva a la cuenta regresiva", async () => {
    mockWidgetEnabled = true;
    jest.spyOn(Linking, "getInitialURL").mockResolvedValue("alertamujer://sos");
    const nav = fakeNavigation() as unknown as { navigate: jest.Mock };

    renderHook(() => useSosLink(nav as never, true));

    await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith("Activation", { method: "widget" }));
  });

  it("si el widget está desactivado en Ajustes, solo avisa", async () => {
    mockWidgetEnabled = false;
    jest.spyOn(Linking, "getInitialURL").mockResolvedValue("alertamujer://sos");
    const notice = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const nav = fakeNavigation() as unknown as { navigate: jest.Mock };

    renderHook(() => useSosLink(nav as never, true));

    await waitFor(() => expect(notice).toHaveBeenCalled());
    expect(nav.navigate).not.toHaveBeenCalled();
  });
});
