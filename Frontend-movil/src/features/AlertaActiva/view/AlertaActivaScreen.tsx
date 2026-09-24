import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useAlertaActivaViewModel } from "../viewModel/useAlertaActivaViewModel";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createStyles } from "../style/alertaActivaStyle";

export default function AlertaActivaScreen() {
  const vm = useAlertaActivaViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, width);

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.mainContainer, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {/* Mini-mapa con la ubicacion actual. Al tocarlo, abre el mismo mapa en pantalla completa. */}
          <View style={styles.headerMapButton}>
            {vm.location ? (
              <>
                <MapView
                  style={styles.headerMap}
                  pointerEvents="none"
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                  initialRegion={{
                    latitude: vm.location.latitude,
                    longitude: vm.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker coordinate={vm.location} pinColor={theme.icono} />
                </MapView>
                {/* Capa transparente que intercepta el toque antes de que llegue al mapa nativo,
                    asi se evita que Android abra la app de Google Maps al presionarlo. */}
                <TouchableOpacity
                  style={StyleSheet.absoluteFillObject}
                  onPress={vm.abrirMapaCompleto}
                  activeOpacity={0.85}
                />
              </>
            ) : (
              <TouchableOpacity
                style={[StyleSheet.absoluteFillObject, styles.headerMapFallback]}
                onPress={vm.abrirMapaCompleto}
                activeOpacity={0.85}
              >
                <MaterialIcons name="my-location" size={22} color={theme.icono} />
              </TouchableOpacity>
            )}
          </View>
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
      </ScrollView>

      {/* Mapa en pantalla completa (equivalente al "navegar" del modulo Mapa). Al cerrar, sigue en AlertaActiva. */}
      <Modal visible={vm.fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {vm.location && (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: vm.location.latitude,
                longitude: vm.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled
              zoomEnabled
              rotateEnabled
              pitchEnabled
              toolbarEnabled={false}
              onPress={vm.handleMapPress}
            >
              <Marker coordinate={vm.location} title={t.mapa.tu_ubicacion_marcador} pinColor={theme.icono} />
            </MapView>
          )}
          {vm.showClose && (
            <Animated.View style={[styles.botonCerrarMapa, { opacity: vm.closeOpacity }]}>
              <TouchableWithoutFeedback onPress={vm.cerrarMapaCompleto}>
                <Text style={styles.textoCerrarMapa}>{t.mapa.cerrar_mapa}</Text>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}