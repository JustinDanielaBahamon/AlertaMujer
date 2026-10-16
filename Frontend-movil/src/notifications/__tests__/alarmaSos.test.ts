jest.mock("@notifee/react-native", () => ({
  __esModule: true,
  default: { createChannel: jest.fn(), displayNotification: jest.fn(), cancelNotification: jest.fn() },
  AndroidCategory: { ALARM: "alarm" },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  AndroidVisibility: { PUBLIC: 1 },
}));

import notifee from "@notifee/react-native";
import {
  abrirAlertaSos,
  alAbrirAlertaSos,
  esAlertaFinalizada,
  esAlertaSos,
  mostrarAlarmaSos,
  mostrarAlertaFinalizada,
  type DatosAlertaSos,
} from "../alarmaSos";

const datos: DatosAlertaSos = { tipo: "ALERTA_SOS", alertaId: "27", nombre: "Ana Gómez", codigo: "abc" };

describe("alarmaSos", () => {
  it("reconoce solo el push de alerta de emergencia completo", () => {
    expect(esAlertaSos(datos)).toBe(true);
    expect(esAlertaSos({ tipo: "OTRO" })).toBe(false);
    expect(esAlertaSos({ tipo: "ALERTA_SOS", alertaId: "1" })).toBe(false); // sin código
    expect(esAlertaSos(undefined)).toBe(false);
  });

  it("muestra la alarma a pantalla completa con sonido en bucle", async () => {
    await mostrarAlarmaSos(datos);

    const n = (notifee.displayNotification as jest.Mock).mock.calls[0][0];
    expect(n.id).toBe("sos-27");
    expect(n.body).toContain("Ana Gómez");
    expect(n.android.fullScreenAction).toEqual({ id: "default" });
    expect(n.android.loopSound).toBe(true);
    expect(n.android.channelId).toBe("alertas_sos");
  });

  it("guarda la alerta hasta que la navegación se suscribe", () => {
    abrirAlertaSos(datos); // aún no hay pantalla escuchando
    const oyente = jest.fn();
    const quitar = alAbrirAlertaSos(oyente);

    expect(oyente).toHaveBeenCalledWith(datos);
    abrirAlertaSos({ ...datos, alertaId: "28" });
    expect(oyente).toHaveBeenCalledTimes(2);
    quitar();
  });

  it("al terminar la alerta apaga la alarma y deja un aviso", async () => {
    const fin = { tipo: "ALERTA_FINALIZADA" as const, alertaId: "27", nombre: "Ana Gómez", estado: "resolved" };
    expect(esAlertaFinalizada(fin)).toBe(true);
    expect(esAlertaFinalizada(datos)).toBe(false);

    await mostrarAlertaFinalizada(fin);

    expect(notifee.cancelNotification).toHaveBeenCalledWith("sos-27");
    const n = (notifee.displayNotification as jest.Mock).mock.calls.at(-1)[0];
    expect(n.id).toBe("fin-27");
    expect(n.body).toContain("atendida");
  });
});
