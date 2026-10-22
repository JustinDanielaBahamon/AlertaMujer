import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useActivationViewModel } from "../viewModel/useActivacionViewModel";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createStyles } from "../style/activacionStyle";

// Texto de la grabación de audio (el de video ya existe en los idiomas como "iniciando_grabacion")
const AUDIO_TEXT = {
  es: "Iniciando grabación de audio",
  en: "Starting audio recording",
  fr: "Démarrage de l'enregistrement audio",
  pt: "Iniciando gravação de áudio",
};

export default function Activacion() {
  const vm = useActivationViewModel();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  
  const backgroundColor = theme.mode === "dark" ? "#4a4a50" : theme.background;
  const styles = createStyles(theme);

  return (
    <View style={[styles.mainContainer, { backgroundColor }]}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          {/* ✅ Usa el logo del tema en lugar del hardcodeado */}
          <Image
            source={theme.activationImage}
            style={styles.logo}
            fadeDuration={0}
          />
        </View>

        <View style={styles.counterModule}>
          <View style={styles.circle}>
            <Text style={styles.number}>{vm.counter}</Text>
          </View>
          <Text style={styles.statusText}>{t.activacion.titulo}</Text>
        </View>

        <View style={styles.list}>
          <View style={styles.itemRow}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="location-on" size={18} color={theme.icon} />
            </View>
            <Text style={styles.itemText}>{t.activacion.enviando_ubicacion}</Text>
          </View>
          {/* Solo se muestra lo que la usuaria activó en Ajustes (video, audio o ambos) */}
          {vm.recordVideo && (
            <View style={styles.itemRow}>
              <View style={styles.iconBackground}>
                <MaterialIcons name="videocam" size={18} color={theme.icon} />
              </View>
              <Text style={styles.itemText}>{t.activacion.iniciando_grabacion}</Text>
            </View>
          )}
          {vm.recordAudio && (
            <View style={styles.itemRow}>
              <View style={styles.iconBackground}>
                <MaterialIcons name="mic" size={18} color={theme.icon} />
              </View>
              <Text style={styles.itemText}>{AUDIO_TEXT[locale]}</Text>
            </View>
          )}
        </View>

        {/* Salta el conteo y pasa directo a la alerta activa */}
        <TouchableOpacity style={styles.activateButton} onPress={vm.activateNow}>
          <MaterialIcons name="flash-on" size={20} color="#ffffff" />
          <Text style={styles.activateText}>{t.activacion.activar_ahora}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={vm.cancel}>
          <Text style={styles.cancelText}>{t.activacion.cancelar}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}