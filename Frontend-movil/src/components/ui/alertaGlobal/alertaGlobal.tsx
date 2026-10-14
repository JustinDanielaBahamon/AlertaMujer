import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "./alertaGlobal.styles";

/**
 * ALERTA GLOBAL
 * -------------
 * Reemplaza TODOS los Alert.alert(...) y alert(...) de la app por el
 * diseño morado de AlertaMujer, sin tener que tocar cada pantalla.
 *
 * Uso: se monta <AlertaGlobalHost /> una sola vez en App.tsx.
 */

type AlertaTipo = "exito" | "error" | "aviso" | "peligro";
type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type Boton = {
  text?: string;
  onPress?: (value?: string) => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertaItem = {
  titulo: string;
  mensaje: string;
  botones: Boton[];
  tipo: AlertaTipo;
  cancelable: boolean;
};

const CONFIG: Record<
  AlertaTipo,
  { icono: IconName; color: string; fondo: string }
> = {
  exito: { icono: "check", color: "#6B3FA0", fondo: "#F3E8FF" },
  error: { icono: "close", color: "#D32F2F", fondo: "#FDECEC" },
  aviso: { icono: "priority-high", color: "#BC27BE", fondo: "#FBE9FB" },
  peligro: { icono: "delete-outline", color: "#D32F2F", fondo: "#FDECEC" },
};

// Decide el icono según lo que dice el mensaje
function inferirTipo(titulo: string, mensaje: string, botones: Boton[]): AlertaTipo {
  if (botones.some((b) => b.style === "destructive")) return "peligro";

  const texto = `${titulo} ${mensaje}`.toLowerCase();

  if (
    /error|erro|erreur|no se pudo|no fue posible|no est[aá] instalado|denegad|inv[aá]lid|incomplet|duplicad|l[ií]mite|denied|invalid|incomplete|duplicate|failed|impossible|n[ãa]o foi poss/.test(
      texto
    )
  ) {
    return "error";
  }

  if (
    /guardad|exitos|[eé]xito|enviad|actualizad|cread|success|saved|sent|updated|enregistr|salv|succ[eè]s|sucesso/.test(
      texto
    )
  ) {
    return "exito";
  }

  return "aviso";
}

// ─── Cola + conexión con el componente ───────────────────────────────────────
type Listener = (a: AlertaItem) => void;
let listener: Listener | null = null;
const pendientes: AlertaItem[] = [];

function mostrar(
  titulo?: string,
  mensaje?: string,
  botones?: Boton[],
  options?: { cancelable?: boolean }
) {
  const lista = botones ?? [];
  const item: AlertaItem = {
    titulo: titulo ?? "",
    mensaje: mensaje ?? "",
    botones: lista,
    tipo: inferirTipo(titulo ?? "", mensaje ?? "", lista),
    cancelable: options?.cancelable ?? false,
  };
  if (listener) listener(item);
  else pendientes.push(item); // todavía no se monta el componente
}

// Cambia Alert.alert y alert() de toda la app por el diseño nuevo
Alert.alert = (titulo, mensaje, botones, options) =>
  mostrar(titulo, mensaje, botones as Boton[] | undefined, options);

(globalThis as any).alert = (mensaje?: unknown) =>
  mostrar("", mensaje == null ? "" : String(mensaje));

// ─── Componente ──────────────────────────────────────────────────────────────
export default function AlertaGlobalHost() {
  const { t } = useLocale();
  const [actual, setActual] = useState<AlertaItem | null>(null);

  useEffect(() => {
    listener = (item) => setActual(item);
    // Si hubo alertas antes de montarse, mostrar la última
    const ultima = pendientes.pop();
    pendientes.length = 0;
    if (ultima) setActual(ultima);
    return () => {
      listener = null;
    };
  }, []);

  const cerrar = (boton?: Boton) => {
    setActual(null);
    boton?.onPress?.();
  };

  if (!actual) return null;

  const cfg = CONFIG[actual.tipo];

  // Primero las acciones y al final "Cancelar"
  const botones: Boton[] =
    actual.botones.length > 0
      ? [
          ...actual.botones.filter((b) => b.style !== "cancel"),
          ...actual.botones.filter((b) => b.style === "cancel"),
        ]
      : [{ text: t.modal.aceptar }];

  const botonCancelar = actual.botones.find((b) => b.style === "cancel");

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Botón "atrás" de Android
        if (botonCancelar) cerrar(botonCancelar);
        else if (actual.cancelable || actual.botones.length <= 1) cerrar();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[
              styles.circuloIcono,
              { backgroundColor: cfg.fondo, borderColor: cfg.color },
            ]}
          >
            <MaterialIcons name={cfg.icono} size={42} color={cfg.color} />
          </View>

          {actual.titulo ? <Text style={styles.titulo}>{actual.titulo}</Text> : null}
          {actual.mensaje ? <Text style={styles.mensaje}>{actual.mensaje}</Text> : null}

          <View style={styles.botones}>
            {botones.map((b, i) => {
              const esCancelar = b.style === "cancel";
              const esPeligro = b.style === "destructive";
              return (
                <TouchableOpacity
                  key={`${b.text}-${i}`}
                  style={[
                    styles.boton,
                    esPeligro && styles.botonPeligro,
                    esCancelar && styles.botonCancelar,
                  ]}
                  onPress={() => cerrar(b)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.botonTexto, esCancelar && styles.botonTextoCancelar]}>
                    {b.text ?? t.modal.aceptar}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}