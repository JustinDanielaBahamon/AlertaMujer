jest.mock("../../../services/alerts.service", () => {
  const real = jest.requireActual("../../../services/alerts.service");
  return { ...real, getMisAlertas: jest.fn() };
});

import { renderHook, waitFor } from "@testing-library/react-native";
import { alertaActivaPropia, getMisAlertas } from "../../../services/alerts.service";
import { useReanudarAlerta } from "../useReanudarAlerta";

const alerta = (id: number, status: string) => ({ id, status }) as never;

const navegacion = (rutaActual: string) => ({
  isReady: () => true,
  getCurrentRoute: () => ({ name: rutaActual }),
  navigate: jest.fn(),
});

describe("reanudar alerta activa", () => {
  beforeEach(() => jest.clearAllMocks());

  it("elige la alerta propia que sigue activa", () => {
    expect(alertaActivaPropia([alerta(3, "cancelled"), alerta(2, "ACTIVE"), alerta(1, "resolved")])).toEqual(alerta(2, "ACTIVE"));
    expect(alertaActivaPropia([alerta(1, "expired")])).toBeNull();
  });

  it("al abrir la app con una alerta activa, vuelve a la pantalla de alerta", async () => {
    (getMisAlertas as jest.Mock).mockResolvedValue([alerta(9, "active")]);
    const nav = navegacion("Inicio");

    renderHook(() => useReanudarAlerta(nav as never, true));

    await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith("AlertaActiva", { alertaId: 9 }));
  });

  it("no navega si ya está en la alerta, ni si no hay alerta activa", async () => {
    (getMisAlertas as jest.Mock).mockResolvedValue([alerta(9, "active")]);
    const enAlerta = navegacion("AlertaActiva");
    renderHook(() => useReanudarAlerta(enAlerta as never, true));

    (getMisAlertas as jest.Mock).mockResolvedValue([alerta(8, "cancelled")]);
    const sinAlerta = navegacion("Inicio");
    renderHook(() => useReanudarAlerta(sinAlerta as never, true));

    await waitFor(() => expect(getMisAlertas).toHaveBeenCalledTimes(2));
    expect(enAlerta.navigate).not.toHaveBeenCalled();
    expect(sinAlerta.navigate).not.toHaveBeenCalled();
  });
});
