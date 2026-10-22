jest.mock("@notifee/react-native", () => ({
  __esModule: true,
  default: { createChannel: jest.fn(), displayNotification: jest.fn(), cancelNotification: jest.fn() },
  AndroidCategory: { ALARM: "alarm" },
  AndroidStyle: { BIGTEXT: 1 },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  AndroidVisibility: { PUBLIC: 1 },
}));

import notifee from "@notifee/react-native";
import {
  openSosAlert,
  onSosAlertOpen,
  isEndedAlert,
  isSosAlert,
  showSosAlarm,
  showEndedAlert,
  type SosAlertData,
} from "../sosAlarm";

const data: SosAlertData = { tipo: "ALERTA_SOS", alertaId: "27", nombre: "Ana Gómez", codigo: "abc" };

describe("alarmaSos", () => {
  it("reconoce solo el push de alerta de emergencia completo", () => {
    expect(isSosAlert(data)).toBe(true);
    expect(isSosAlert({ tipo: "OTRO" })).toBe(false);
    expect(isSosAlert({ tipo: "ALERTA_SOS", alertaId: "1" })).toBe(false); // sin código
    expect(isSosAlert(undefined)).toBe(false);
  });

  it("muestra la alarma a pantalla completa con sonido en bucle", async () => {
    await showSosAlarm(data);

    const n = (notifee.displayNotification as jest.Mock).mock.calls[0][0];
    expect(n.id).toBe("sos-27");
    expect(n.body).toContain("Ana Gómez");
    expect(n.android.fullScreenAction).toEqual({ id: "default" });
    expect(n.android.loopSound).toBe(true);
    expect(n.android.channelId).toBe("alertas_sos");
  });

  it("guarda la alerta hasta que la navegación se suscribe", () => {
    openSosAlert(data); // aún no hay pantalla escuchando
    const listener = jest.fn();
    const remove = onSosAlertOpen(listener);

    expect(listener).toHaveBeenCalledWith(data);
    openSosAlert({ ...data, alertaId: "28" });
    expect(listener).toHaveBeenCalledTimes(2);
    remove();
  });

  it("al terminar la alerta apaga la alarma y deja un aviso", async () => {
    const end = { tipo: "ALERTA_FINALIZADA" as const, alertaId: "27", nombre: "Ana Gómez", estado: "resolved" };
    expect(isEndedAlert(end)).toBe(true);
    expect(isEndedAlert(data)).toBe(false);

    await showEndedAlert(end);

    expect(notifee.cancelNotification).toHaveBeenCalledWith("sos-27");
    const n = (notifee.displayNotification as jest.Mock).mock.calls.at(-1)[0];
    expect(n.id).toBe("fin-27");
    expect(n.body).toContain("atendida");
  });
});
