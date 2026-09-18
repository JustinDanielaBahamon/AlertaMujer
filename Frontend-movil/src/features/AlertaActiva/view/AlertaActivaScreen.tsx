import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAlertaActivaViewModel } from "../viewModel/useAlertaActivaViewModel";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createStyles } from "../style/alertaActivaStyle";

export default function AlertaActivaScreen() {
  const vm = useAlertaActivaViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = createStyles(theme);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="menu" size={22} color={theme.icono} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="my-location" size={22} color={theme.icono} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{t.alertaActiva.titulo}</Text>
      <Text style={styles.subtitle}>{t.alertaActiva.subtitulo}</Text>

      <View style={styles.circleWrapper}>
        <View style={styles.circle}>
          <MaterialIcons name="notifications-active" size={28} color={theme.icono} />
          <Text style={styles.number}>{vm.formattedTime}</Text>
          <Text style={styles.timeLabel}>{t.alertaActiva.tiempoRestante}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconWrapper}>
          <MaterialIcons name="verified-user" size={22} color={theme.icono} />
        </View>
        <View style={styles.infoTextWrapper}>
          <Text style={styles.infoTitle}>{t.alertaActiva.serviciosTitulo}</Text>
          <Text style={styles.infoDescription}>{t.alertaActiva.serviciosDescripcion}</Text>
        </View>
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>{t.alertaActiva.compartiendoUbicacion}</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationItem}>
            <MaterialIcons name="location-on" size={18} color={theme.icono} />
            <Text style={styles.locationText}>{t.alertaActiva.enTiempoReal}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.locationItem}>
            <MaterialIcons name="visibility" size={18} color={theme.icono} />
            <Text style={styles.locationText}>0 {t.alertaActiva.vistas}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.okButton} onPress={vm.marcarEstoyBien}>
        <MaterialIcons name="favorite" size={22} color={theme.headerText} />
        <Text style={styles.okButtonText}>{t.alertaActiva.estoyBien}</Text>
        <Text style={styles.okButtonSubtext}>{t.alertaActiva.estoyBienDescripcion}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.callRow} onPress={vm.llamarEmergencias}>
        <MaterialIcons name="call" size={18} color={theme.icono} />
        <Text style={styles.callText}>{t.alertaActiva.llamar911}</Text>
      </TouchableOpacity>
    </View>
  );
}