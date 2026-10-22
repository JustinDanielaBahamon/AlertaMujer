jest.mock("../../../services/alerts.service", () => {
  const real = jest.requireActual("../../../services/alerts.service");
  return { ...real, getMyAlerts: jest.fn() };
});

import { renderHook, waitFor } from "@testing-library/react-native";
import { ownActiveAlert, getMyAlerts } from "../../../services/alerts.service";
import { useResumeAlert } from "../useReanudarAlerta";

const alert = (id: number, status: string) => ({ id, status }) as never;

const navigation = (currentRoute: string) => ({
  isReady: () => true,
  getCurrentRoute: () => ({ name: currentRoute }),
  navigate: jest.fn(),
});

describe("reanudar alerta activa", () => {
  beforeEach(() => jest.clearAllMocks());

  it("elige la alerta propia que sigue activa", () => {
    expect(ownActiveAlert([alert(3, "cancelled"), alert(2, "ACTIVE"), alert(1, "resolved")])).toEqual(alert(2, "ACTIVE"));
    expect(ownActiveAlert([alert(1, "expired")])).toBeNull();
  });

  it("al abrir la app con una alerta activa, vuelve a la pantalla de alerta", async () => {
    (getMyAlerts as jest.Mock).mockResolvedValue([alert(9, "active")]);
    const nav = navigation("Home");

    renderHook(() => useResumeAlert(nav as never, true));

    await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith("ActiveAlert", { alertId: 9 }));
  });

  it("no navega si ya está en la alerta, ni si no hay alerta activa", async () => {
    (getMyAlerts as jest.Mock).mockResolvedValue([alert(9, "active")]);
    const inAlert = navigation("ActiveAlert");
    renderHook(() => useResumeAlert(inAlert as never, true));

    (getMyAlerts as jest.Mock).mockResolvedValue([alert(8, "cancelled")]);
    const noAlert = navigation("Home");
    renderHook(() => useResumeAlert(noAlert as never, true));

    await waitFor(() => expect(getMyAlerts).toHaveBeenCalledTimes(2));
    expect(inAlert.navigate).not.toHaveBeenCalled();
    expect(noAlert.navigate).not.toHaveBeenCalled();
  });
});
