import { renderHook, waitFor } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

jest.mock("react-native-android-widget", () => ({
  FlexWidget: "FlexWidget",
  TextWidget: "TextWidget",
}));

let mockWidgetActivo = true;
jest.mock("../../../contexts/MetodosActivacionContext", () => ({
  useMetodosActivacion: () => ({ config: { widget: mockWidgetActivo }, cargado: true }),
}));

import { tareaWidget } from "../tareaWidget";
import { useEnlaceSOS } from "../useEnlaceSOS";

const navegacionFalsa = () =>
  ({ isReady: () => true, getCurrentRoute: () => ({ name: "DrawerHome" }), navigate: jest.fn() }) as never;

describe("widget SOS", () => {
  it("se dibuja al agregarlo y no al tocarlo (el toque abre el enlace)", async () => {
    const renderWidget = jest.fn();
    await tareaWidget({ widgetAction: "WIDGET_ADDED", renderWidget, widgetInfo: {} as never });
    await tareaWidget({ widgetAction: "WIDGET_CLICK", renderWidget, widgetInfo: {} as never });
    expect(renderWidget).toHaveBeenCalledTimes(1);
  });

  it("al abrir la app desde el widget lleva a la cuenta regresiva", async () => {
    mockWidgetActivo = true;
    jest.spyOn(Linking, "getInitialURL").mockResolvedValue("alertamujer://sos");
    const nav = navegacionFalsa() as unknown as { navigate: jest.Mock };

    renderHook(() => useEnlaceSOS(nav as never, true));

    await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith("Activacion", { metodo: "widget" }));
  });

  it("si el widget está desactivado en Ajustes, solo avisa", async () => {
    mockWidgetActivo = false;
    jest.spyOn(Linking, "getInitialURL").mockResolvedValue("alertamujer://sos");
    const aviso = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const nav = navegacionFalsa() as unknown as { navigate: jest.Mock };

    renderHook(() => useEnlaceSOS(nav as never, true));

    await waitFor(() => expect(aviso).toHaveBeenCalled());
    expect(nav.navigate).not.toHaveBeenCalled();
  });
});
