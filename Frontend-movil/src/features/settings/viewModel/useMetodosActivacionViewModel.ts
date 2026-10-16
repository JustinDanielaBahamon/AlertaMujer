import { useNavigation } from "@react-navigation/native";
import { Alert, Linking } from "react-native";
import { conflictoDeEsteTelefono } from "../../agitar/gestosDelFabricante";
import { useLocale } from "../../../contexts/LocaleContext";
import {
  MetodoId,
  useMetodosActivacion,
} from "../../../contexts/MetodosActivacionContext";

export interface PasoMetodo {
  texto: string;
}

export interface MetodoActivacion {
  id: MetodoId;
  icono: string;
  titulo: string;
  descripcion: string;
  pasos: PasoMetodo[];
  activo: boolean;
  // true = por ahora solo se guarda la preferencia (la función llega en una próxima versión)
  pendiente: boolean;
  /** Consejos para que el método funcione bien en el teléfono de la usuaria. */
  recomendaciones?: string[];
  /** Consejo destacado para la marca del teléfono (p. ej. gestos de Motorola). */
  recomendacionMarca?: string;
}

function armarMetodo(
  m: Record<string, string>,
  id: MetodoId,
  icono: string,
  prefijo: string,
  totalPasos: number,
  activo: boolean,
  pendiente: boolean,
): MetodoActivacion {
  return {
    id,
    icono,
    titulo: m[`${prefijo}_titulo`],
    descripcion: m[`${prefijo}_desc`],
    pasos: Array.from({ length: totalPasos }, (_, i) => ({
      texto: m[`${prefijo}_paso${i + 1}`],
    })),
    activo,
    pendiente,
  };
}

export function useMetodosActivacionViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const { config, cambiar } = useMetodosActivacion();
  const m = t.metodosActivacion as unknown as Record<string, string>;
  const conflicto = conflictoDeEsteTelefono();

  const metodos: MetodoActivacion[] = [
    armarMetodo(m, "boton", "radio-button-on-outline", "boton", 3, config.boton, false),
    armarMetodo(m, "contacto", "person-circle-outline", "contacto", 3, config.contacto, false),
    {
      ...armarMetodo(m, "agitar", "phone-portrait-outline", "agitar", 4, config.agitar, false),
      recomendaciones: [m.agitar_rec1, m.agitar_rec2, m.agitar_rec3, m.agitar_rec4],
      recomendacionMarca: conflicto === "motorola" ? m.agitar_rec_motorola : undefined,
    },
    armarMetodo(m, "bloqueo", "lock-closed-outline", "popup", 4, config.bloqueo, true),
    armarMetodo(m, "widget", "apps-outline", "widget", 3, config.widget, true),
  ];

  const activos = metodos.filter((x) => x.activo).length;

  const cambiarMetodo = (id: MetodoId, valor: boolean) => {
    cambiar(id, valor);
    // Al encender "agitar" en un teléfono cuyo sistema también reacciona a la sacudida
    if (id === "agitar" && valor && conflicto === "motorola") {
      Alert.alert(m.gestos_alerta_titulo, m.gestos_alerta_msg, [
        { text: m.entendido, style: "cancel" },
        {
          text: m.abrir_ajustes,
          onPress: () => Linking.sendIntent("android.settings.SETTINGS").catch(() => Linking.openSettings()),
        },
      ]);
    }
  };

  const volver = () => {
    navigation.goBack();
  };

  return { metodos, activos, total: metodos.length, cambiarMetodo, volver };
}