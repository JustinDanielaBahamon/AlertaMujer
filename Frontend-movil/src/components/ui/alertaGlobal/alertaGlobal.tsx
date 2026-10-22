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

type AlertType = "exito" | "error" | "aviso" | "peligro";
type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type DialogButton = {
  text?: string;
  onPress?: (value?: string) => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertItem = {
  title: string;
  message: string;
  buttons: DialogButton[];
  type: AlertType;
  cancelable: boolean;
};

const CONFIG: Record<
  AlertType,
  { icon: IconName; color: string; background: string }
> = {
  exito: { icon: "check", color: "#6B3FA0", background: "#F3E8FF" },
  error: { icon: "close", color: "#D32F2F", background: "#FDECEC" },
  aviso: { icon: "priority-high", color: "#BC27BE", background: "#FBE9FB" },
  peligro: { icon: "delete-outline", color: "#D32F2F", background: "#FDECEC" },
};

// Decide el icono según lo que dice el mensaje
function inferType(title: string, message: string, buttons: DialogButton[]): AlertType {
  if (buttons.some((b) => b.style === "destructive")) return "peligro";

  const text = `${title} ${message}`.toLowerCase();

  if (
    /error|erro|erreur|no se pudo|no fue posible|no est[aá] instalado|denegad|inv[aá]lid|incomplet|duplicad|l[ií]mite|denied|invalid|incomplete|duplicate|failed|impossible|n[ãa]o foi poss/.test(
      text
    )
  ) {
    return "error";
  }

  if (
    /guardad|exitos|[eé]xito|enviad|actualizad|cread|success|saved|sent|updated|enregistr|salv|succ[eè]s|sucesso/.test(
      text
    )
  ) {
    return "exito";
  }

  return "aviso";
}

// ─── Cola + conexión con el componente ───────────────────────────────────────
type Listener = (a: AlertItem) => void;
let listener: Listener | null = null;
const pendingItems: AlertItem[] = [];

function show(
  title?: string,
  message?: string,
  buttons?: DialogButton[],
  options?: { cancelable?: boolean }
) {
  const list = buttons ?? [];
  const item: AlertItem = {
    title: title ?? "",
    message: message ?? "",
    buttons: list,
    type: inferType(title ?? "", message ?? "", list),
    cancelable: options?.cancelable ?? false,
  };
  if (listener) listener(item);
  else pendingItems.push(item); // todavía no se monta el componente
}

// Cambia Alert.alert y alert() de toda la app por el diseño nuevo
Alert.alert = (title, message, buttons, options) =>
  show(title, message, buttons as DialogButton[] | undefined, options);

(globalThis as any).alert = (message?: unknown) =>
  show("", message == null ? "" : String(message));

// ─── Componente ──────────────────────────────────────────────────────────────
export default function GlobalAlertHost() {
  const { t } = useLocale();
  const [current, setCurrent] = useState<AlertItem | null>(null);

  useEffect(() => {
    listener = (item) => setCurrent(item);
    // Si hubo alertas antes de montarse, mostrar la última
    const latest = pendingItems.pop();
    pendingItems.length = 0;
    if (latest) setCurrent(latest);
    return () => {
      listener = null;
    };
  }, []);

  const close = (button?: DialogButton) => {
    setCurrent(null);
    button?.onPress?.();
  };

  if (!current) return null;

  const cfg = CONFIG[current.type];

  // Primero las acciones y al final "Cancelar"
  const buttons: DialogButton[] =
    current.buttons.length > 0
      ? [
          ...current.buttons.filter((b) => b.style !== "cancel"),
          ...current.buttons.filter((b) => b.style === "cancel"),
        ]
      : [{ text: t.modal.aceptar }];

  const cancelButton = current.buttons.find((b) => b.style === "cancel");

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Botón "atrás" de Android
        if (cancelButton) close(cancelButton);
        else if (current.cancelable || current.buttons.length <= 1) close();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: cfg.background, borderColor: cfg.color },
            ]}
          >
            <MaterialIcons name={cfg.icon} size={42} color={cfg.color} />
          </View>

          {current.title ? <Text style={styles.title}>{current.title}</Text> : null}
          {current.message ? <Text style={styles.message}>{current.message}</Text> : null}

          <View style={styles.buttons}>
            {buttons.map((b, i) => {
              const isCancel = b.style === "cancel";
              const isDanger = b.style === "destructive";
              return (
                <TouchableOpacity
                  key={`${b.text}-${i}`}
                  style={[
                    styles.button,
                    isDanger && styles.dangerButton,
                    isCancel && styles.cancelButton,
                  ]}
                  onPress={() => close(b)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, isCancel && styles.cancelButtonText]}>
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