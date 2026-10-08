import { useNavigation } from "@react-navigation/native";
import { Vibration } from "react-native";
import { useNotificaciones } from "../../../contexts/NotificacionesContext";

export const PASO_MINUTOS = 30;
const MINUTOS_DIA = 24 * 60;

export type CampoHora = "horaInicio" | "horaFin";

export function formatearHora(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function useNotificacionesViewModel() {
  const navigation = useNavigation();
  const { config, actualizar } = useNotificaciones();

  const volver = () => navigation.goBack();

  const cambiarActivadas = (valor: boolean) => actualizar({ activadas: valor });

  // Al activar la vibración vibra una vez para que la usuaria la sienta
  const cambiarVibracion = (valor: boolean) => {
    actualizar({ vibracion: valor });
    if (valor) Vibration.vibrate(200);
  };

  const cambiarNoMolestar = (valor: boolean) =>
    actualizar({ noMolestar: valor });

  // Suma o resta 30 min a la hora de inicio o fin (da la vuelta a las 24 h)
  const moverHora = (campo: CampoHora, delta: number) => {
    actualizar({
      [campo]: (config[campo] + delta + MINUTOS_DIA) % MINUTOS_DIA,
    });
  };

  return {
    config,
    volver,
    cambiarActivadas,
    cambiarVibracion,
    cambiarNoMolestar,
    moverHora,
  };
}
