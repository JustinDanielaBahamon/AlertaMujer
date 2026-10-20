import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import { getAlertasRecibidas, getCodigoSeguimiento, type AlertaRecibida } from "../../../services/received-alerts.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Mientras hay una alerta activa la lista se actualiza sola
const REFRESCO_MS = 30_000;

/**
 * Alertas de las personas que tienen a la usuaria como contacto de emergencia: por si no alcanzó a
 * atender la alarma, aquí puede ver qué pasó y abrir el seguimiento mientras siga disponible.
 */
export function useAlertasRecibidasViewModel() {
  const navigation = useNavigation<Nav>();
  const { t } = useLocale();
  const [alertas, setAlertas] = useState<AlertaRecibida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [abriendo, setAbriendo] = useState<number | null>(null);
  const enFoco = useRef(false);

  const cargar = useCallback(async () => {
    try {
      setAlertas(await getAlertasRecibidas());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      enFoco.current = true;
      cargar();
      return () => {
        enFoco.current = false;
      };
    }, [cargar]),
  );

  const hayActivas = alertas.some((a) => a.activa);
  useEffect(() => {
    if (!hayActivas) return;
    const id = setInterval(() => enFoco.current && cargar(), REFRESCO_MS);
    return () => clearInterval(id);
  }, [hayActivas, cargar]);

  const abrir = useCallback(
    async (alerta: AlertaRecibida) => {
      if (!alerta.seguimientoDisponible || abriendo !== null) return;
      setAbriendo(alerta.id);
      try {
        const codigo = await getCodigoSeguimiento(alerta.id);
        navigation.navigate("AlertaContacto", {
          alertaId: alerta.id,
          nombreUsuaria: alerta.nombre || undefined,
          codigo,
        });
      } catch {
        Alert.alert(t.alertasRecibidas.titulo_header, t.alertasRecibidas.error_seguimiento);
        cargar();
      } finally {
        setAbriendo(null);
      }
    },
    [abriendo, navigation, t, cargar],
  );

  return {
    activas: alertas.filter((a) => a.activa),
    anteriores: alertas.filter((a) => !a.activa),
    cargando,
    error,
    abriendo,
    recargar: cargar,
    abrir,
    volver: navigation.goBack,
  };
}
