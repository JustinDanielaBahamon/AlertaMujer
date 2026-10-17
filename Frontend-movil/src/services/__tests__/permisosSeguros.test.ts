jest.mock("@notifee/react-native", () => ({
  __esModule: true,
  default: {
    getNotificationSettings: jest.fn(async () => ({ authorizationStatus: 1 })),
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
  },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
}));
jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

import notifee from "@notifee/react-native";
import * as Location from "expo-location";
import { enColaDePermisos, permisoNotificaciones, permisoUbicacion } from "../permisosSeguros";

describe("permisosSeguros", () => {
  beforeEach(() => jest.clearAllMocks());

  it("no pide un permiso que ya está concedido (pedirlo puede trabar la app)", async () => {
    expect(await permisoUbicacion()).toBe(true);
    expect(await permisoNotificaciones()).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(notifee.requestPermission).not.toHaveBeenCalled();
  });

  it("lo pide si falta", async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    expect(await permisoUbicacion()).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it("nunca hace dos peticiones a la vez, aunque una falle", async () => {
    let enCurso = 0;
    let maximo = 0;
    const pedir = (falla: boolean) => () =>
      new Promise<void>((resolver, rechazar) => {
        enCurso += 1;
        maximo = Math.max(maximo, enCurso);
        setTimeout(() => {
          enCurso -= 1;
          if (falla) rechazar(new Error("x"));
          else resolver();
        }, 10);
      });

    await Promise.allSettled([
      enColaDePermisos(pedir(false)),
      enColaDePermisos(pedir(true)),
      enColaDePermisos(pedir(false)),
    ]);

    expect(maximo).toBe(1);
  });
});
