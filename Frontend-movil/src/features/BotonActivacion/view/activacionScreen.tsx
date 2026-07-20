import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useActivacionViewModel } from "../viewModel/useActivacionViewModel";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createStyles } from "../style/activacionStyle";

export default function Activacion() {
  const vm = useActivacionViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  
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
          <Text style={styles.statusText}>{t.activacion.titulo}</Text>
        </View>

        <View style={styles.list}>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="location-on" size={18} color={theme.icono} />
            </View>
            <Text style={styles.itemText}>{t.activacion.enviando_ubicacion}</Text>
          </View>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="videocam" size={18} color={theme.icono} />
            </View>
            <Text style={styles.itemText}>{t.activacion.iniciando_grabacion}</Text>
          </View>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="call" size={18} color={theme.icono} />
            </View>
            <Text style={styles.itemText}>{t.activacion.llamando_contactos}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={vm.cancelar}>
          <Text style={styles.cancelText}>{t.activacion.cancelar}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}