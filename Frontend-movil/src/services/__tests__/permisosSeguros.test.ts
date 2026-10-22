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
import { inPermissionQueue, notificationsPermission, locationPermission } from "../permisosSeguros";

describe("permisosSeguros", () => {
  beforeEach(() => jest.clearAllMocks());

  it("no pide un permiso que ya está concedido (pedirlo puede trabar la app)", async () => {
    expect(await locationPermission()).toBe(true);
    expect(await notificationsPermission()).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(notifee.requestPermission).not.toHaveBeenCalled();
  });

  it("lo pide si falta", async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    expect(await locationPermission()).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it("nunca hace dos peticiones a la vez, aunque una falle", async () => {
    let inProgress = 0;
    let maximum = 0;
    const ask = (failure: boolean) => () =>
      new Promise<void>((resolver, reject) => {
        inProgress += 1;
        maximum = Math.max(maximum, inProgress);
        setTimeout(() => {
          inProgress -= 1;
          if (failure) reject(new Error("x"));
          else resolver();
        }, 10);
      });

    await Promise.allSettled([
      inPermissionQueue(ask(false)),
      inPermissionQueue(ask(true)),
      inPermissionQueue(ask(false)),
    ]);

    expect(maximum).toBe(1);
  });
});
