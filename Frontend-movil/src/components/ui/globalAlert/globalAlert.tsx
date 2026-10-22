import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "./globalAlert.styles";

/**
 * GLOBAL ALERT
 * ------------
 * Replaces EVERY Alert.alert(...) and alert(...) in the app with the
 * AlertaMujer purple design, without touching each screen.
 *
 * Usage: <GlobalAlertHost /> is mounted once in App.tsx.
 */

type AlertType = "success" | "error" | "warning" | "danger";
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
  success: { icon: "check", color: "#6B3FA0", background: "#F3E8FF" },
  error: { icon: "close", color: "#D32F2F", background: "#FDECEC" },
  warning: { icon: "priority-high", color: "#BC27BE", background: "#FBE9FB" },
  danger: { icon: "delete-outline", color: "#D32F2F", background: "#FDECEC" },
};

// Picks the icon from what the message says
function inferType(title: string, message: string, buttons: DialogButton[]): AlertType {
  if (buttons.some((b) => b.style === "destructive")) return "danger";

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
    return "success";
  }

  return "warning";
}

// ─── Queue + connection with the component ───────────────────────────────────
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
  else pendingItems.push(item); // the component is not mounted yet
}

// Replaces Alert.alert and alert() across the app with the new design
Alert.alert = (title, message, buttons, options) =>
  show(title, message, buttons as DialogButton[] | undefined, options);

(globalThis as any).alert = (message?: unknown) =>
  show("", message == null ? "" : String(message));

// ─── Component ───────────────────────────────────────────────────────────────
export default function GlobalAlertHost() {
  const { t } = useLocale();
  const [current, setCurrent] = useState<AlertItem | null>(null);

  useEffect(() => {
    listener = (item) => setCurrent(item);
    // If there were alerts before mounting, show the last one
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

  // Actions first and "Cancel" at the end
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
        // Android "back" button
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