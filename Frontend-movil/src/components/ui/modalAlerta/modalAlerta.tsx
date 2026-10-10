import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./modalAlerta.styles";

export type AlertaTipo = "exito" | "error" | "aviso";

interface ModalAlertaProps {
  visible: boolean;
  tipo: AlertaTipo;
  titulo: string;
  mensaje: string;
  textoBoton: string;
  onCerrar: () => void;
}

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

// Icono y colores según el tipo de mensaje
const CONFIG: Record<
  AlertaTipo,
  { icono: IconName; color: string; fondo: string }
> = {
  exito: { icono: "check", color: "#6B3FA0", fondo: "#F3E8FF" },
  error: { icono: "close", color: "#D32F2F", fondo: "#FDECEC" },
  aviso: { icono: "priority-high", color: "#BC27BE", fondo: "#FBE9FB" },
};

export default function ModalAlerta({
  visible,
  tipo,
  titulo,
  mensaje,
  textoBoton,
  onCerrar,
}: ModalAlertaProps) {
  const cfg = CONFIG[tipo];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icono dentro de un círculo */}
          <View
            style={[
              styles.circuloIcono,
              { backgroundColor: cfg.fondo, borderColor: cfg.color },
            ]}
          >
            <MaterialIcons name={cfg.icono} size={42} color={cfg.color} />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <TouchableOpacity
            style={styles.boton}
            onPress={onCerrar}
            activeOpacity={0.8}
          >
            <Text style={styles.botonTexto}>{textoBoton}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
