import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getOrCreateDevice } from "../../../services/devices.service";
import { frequentLocationsService, type FrequentLocationApi } from "../../../services/frequent-locations.service";
import {
  alargarTrayecto,
  cancelarTrayecto,
  confirmarLlegada,
  iniciarTrayecto,
  trayectoActivo,
  type Trayecto,
} from "../../../services/safe-trips.service";

export const MINUTOS_RAPIDOS = [15, 30, 45, 60, 90];

/**
 * "Avísame si no llego": la usuaria dice a dónde va y en cuánto llega. Si no confirma a tiempo, el
 * servidor avisa a sus contactos con su última ubicación, aunque su celular se quede sin datos.
 */
export function useTrayectoViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const tr = t.trayecto;
  const { user } = useAuth();
  const [trayecto, setTrayecto] = useState<Trayecto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [destino, setDestino] = useState("");
  const [lugar, setLugar] = useState<FrequentLocationApi | null>(null);
  const [minutos, setMinutos] = useState(30);
  const [lugares, setLugares] = useState<FrequentLocationApi[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  const cargar = useCallback(() => {
    setCargando(true);
    trayectoActivo()
      .then(setTrayecto)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  useEffect(() => {
    if (!user?.id) return;
    frequentLocationsService.getByUser(user.id).then(setLugares).catch(() => {});
  }, [user?.id]);

  // Cuenta regresiva en pantalla (cada 15 s basta: se muestra en minutos)
  useEffect(() => {
    if (!trayecto) return;
    const id = setInterval(() => setAhora(Date.now()), 15000);
    return () => clearInterval(id);
  }, [trayecto]);

  const elegirLugar = (l: FrequentLocationApi) => {
    setLugar(l);
    setDestino(l.name);
  };

  const cambiarDestino = (texto: string) => {
    setDestino(texto);
    if (lugar && texto !== lugar.name) setLugar(null);
  };

  const error = (e: any) =>
    Alert.alert(tr.titulo, e?.response?.data?.message ?? tr.error_conexion);

  const empezar = async () => {
    if (!destino.trim() || ocupado) return;
    setOcupado(true);
    try {
      const device = await getOrCreateDevice();
      setTrayecto(
        await iniciarTrayecto({
          destino: destino.trim(),
          minutos,
          deviceId: device.id,
          latitude: lugar?.latitude,
          longitude: lugar?.longitude,
        }),
      );
    } catch (e) {
      error(e);
    } finally {
      setOcupado(false);
    }
  };

  const accion = async (fn: () => Promise<Trayecto>, alTerminar?: (t: Trayecto) => void) => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const actualizado = await fn();
      if (actualizado.estado === "active") setTrayecto(actualizado);
      else {
        setTrayecto(null);
        alTerminar?.(actualizado);
      }
    } catch (e) {
      error(e);
    } finally {
      setOcupado(false);
    }
  };

  const llegue = () =>
    trayecto && accion(() => confirmarLlegada(trayecto.id), () => Alert.alert(tr.llegaste_titulo, tr.llegaste_texto));

  const alargar = (min: number) => trayecto && accion(() => alargarTrayecto(trayecto.id, min));

  const cancelar = () =>
    trayecto &&
    Alert.alert(tr.cancelar_titulo, tr.cancelar_texto, [
      { text: t.modal.cancelar, style: "cancel" },
      { text: tr.cancelar_confirmar, style: "destructive", onPress: () => accion(() => cancelarTrayecto(trayecto.id)) },
    ]);

  const minutosRestantes = trayecto ? Math.ceil((trayecto.llegada.getTime() - ahora) / 60000) : 0;

  return {
    trayecto,
    cargando,
    ocupado,
    destino,
    cambiarDestino,
    lugares,
    lugar,
    elegirLugar,
    minutos,
    setMinutos,
    minutosRestantes,
    empezar,
    llegue,
    alargar,
    cancelar,
    volver: navigation.goBack,
  };
}
