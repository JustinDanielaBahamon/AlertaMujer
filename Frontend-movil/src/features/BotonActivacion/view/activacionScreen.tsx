import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useActivacionViewModel } from "../viewModel/useActivacionViewModel";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "../style/activacionStyle";

export default function Activacion() {
  const vm = useActivacionViewModel();
  const { theme } = useTheme();
  
  const backgroundColor = theme.mode === "dark" ? "#4a4a50" : theme.background;
  const styles = createStyles(theme);

  return (
    <View style={[styles.mainContainer, { backgroundColor }]}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          {/* ✅ Usa el logo del tema en lugar del hardcodeado */}
          <Image
            source={theme.imagenActivacion}
            style={styles.logo}
          />
        </View>

        <View style={styles.counterModule}>
          <View style={styles.circle}>
            <Text style={styles.number}>{vm.contador}</Text>
          </View>
          <Text style={styles.statusText}>Activando Alerta SOS...</Text>
        </View>

        <View style={styles.list}>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="location-on" size={18} color={theme.icono} />
            </View>
            <Text style={styles.itemText}>Enviando ubicación en tiempo real</Text>
          </View>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="videocam" size={18} color={theme.icono} />
            </View>
            <Text style={styles.itemText}>Iniciando grabación de video</Text>
          </View>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="call" size={18} color={theme.icono} />
            </View>
            <Text style={styles.itemText}>Llamando a tus contactos elegidos</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={vm.cancelar}>
          <Text style={styles.cancelText}>Cancelar Alerta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}