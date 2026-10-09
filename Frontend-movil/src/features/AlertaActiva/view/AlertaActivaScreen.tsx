import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // TEMPORAL
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"; // TEMPORAL
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { MainStackParamList } from "../../../navigation/types"; // TEMPORAL
import type { PuntoUbicacion } from "../../../services/alert-tracking.service";
import { createStyles } from "../style/alertaActivaStyle";
import { useAlertaActivaViewModel } from "../viewModel/useAlertaActivaViewModel";

type Estilos = ReturnType<typeof createStyles>;

// Linea de recorrido + pines numerados. Se usa en el mapa de la ventana emergente.
function PinesMapa({
  puntos,
  colorLinea,
  styles,
  trackear,
  etiqueta,
}: {
  puntos: PuntoUbicacion[];
  colorLinea: string;
  styles: Estilos;
  trackear: boolean;
  etiqueta: string;
}) {
  return (
    <>
      {puntos.length > 1 && (
        <Polyline
          coordinates={puntos.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
          strokeColor={colorLinea}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {puntos.map((p, i) => {
        const esUltimo = i === puntos.length - 1;
        return (
          <Marker
            // La key cambia cuando un pin deja de ser el ultimo, para que se redibuje.
            key={`${p.id}-${esUltimo ? "a" : "p"}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={trackear}
            zIndex={esUltimo ? 999 : i}
            title={`${etiqueta} ${i + 1}`}
          >
            <View style={esUltimo ? styles.pinActual : styles.pin}>
              <Text style={esUltimo ? styles.pinActualText : styles.pinText}>{i + 1}</Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

export default function AlertaActivaScreen() {
  const vm = useAlertaActivaViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, width, height, insets);
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>(); // TEMPORAL
  const tx = t.alertaContacto; // textos del mapa (los mismos de "Alerta de emergencia")

  // Los pines personalizados se redibujan unos instantes cuando llega un punto nuevo
  // o cuando se abre la ventana emergente.
  const [trackear, setTrackear] = useState(true);
  useEffect(() => {
    setTrackear(true);
    const id = setTimeout(() => setTrackear(false), 600);
    return () => clearTimeout(id);
  }, [vm.puntos.length, vm.fullscreen]);

  // "hace 5s" / "5s ago" / "há 5s" / "il y a 5s": el orden lo define el texto de cada idioma.
  const hace = tx.hace.replace("{{tiempo}}", vm.tiempoDesdeUltimo);

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.mainContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrap}>
        <View style={styles.header}>
          {/* Mini-mapa con la ubicacion actual. Al tocarlo, abre el mapa completo con el diseno de "Alerta de emergencia". */}
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
            <MaterialIcons name="notifications-active" size={22} color={theme.icono} />
            <Text style={styles.number}>{vm.formattedTime}</Text>
            <Text style={styles.timeLabel}>{t.alertaActiva.tiempoRestante}</Text>
          </View>
        </View>

        {/* Mensaje informativo sobre lo que pasa al terminar el tiempo y como cancelar. */}
        <View style={styles.mensajeCard}>
          <MaterialIcons name="info-outline" size={20} color={theme.icono} />
          <Text style={styles.mensajeText}>{t.alertaActiva.mensajeReenvio}</Text>
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

        <TouchableOpacity style={styles.okButton} onPress={vm.abrirConfirmacion}>
          <MaterialIcons name="favorite" size={22} color={theme.headerText} />
          <Text style={styles.okButtonText}>{t.alertaActiva.estoyBien}</Text>
          <Text style={styles.okButtonSubtext}>{t.alertaActiva.estoyBienDescripcion}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callRow} onPress={vm.llamarEmergencias}>
          <MaterialIcons name="call" size={18} color={theme.icono} />
          <Text style={styles.callText}>{t.alertaActiva.llamar911}</Text>
        </TouchableOpacity>

        {/* ===== TEMPORAL: quitar este bloque cuando la alerta ya se envíe a los contactos ===== */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("AlertaContacto", {
              alertaId: 0,
              nombreUsuaria: "Usuaria de prueba",
              latitude: vm.location?.latitude,
              longitude: vm.location?.longitude,
              demo: true,
            })
          }
          style={{
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.icono,
          }}
        >
          <MaterialIcons name="visibility" size={14} color={theme.icono} />
          <Text style={{ fontSize: 11, fontWeight: "600", color: theme.icono }}>
            Ver pantalla de contacto (temporal)
          </Text>
        </TouchableOpacity>
        {/* ===== FIN TEMPORAL ===== */}
        </View>
      </ScrollView>

      {/* Ventana de verificacion para cancelar la alerta. */}
      <Modal
        visible={vm.confirmarVisible}
        transparent
        animationType="fade"
        onRequestClose={vm.cerrarConfirmacion}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <MaterialIcons name="favorite" size={28} color={theme.icono} />
            </View>
            <Text style={styles.confirmTitle}>{t.alertaActiva.confirmarTitulo}</Text>
            <Text style={styles.confirmDescription}>{t.alertaActiva.confirmarDescripcion}</Text>

            <TouchableOpacity style={styles.confirmButtonYes} onPress={vm.marcarEstoyBien}>
              <Text style={styles.confirmButtonYesText}>{t.alertaActiva.confirmarSi}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButtonNo} onPress={vm.cerrarConfirmacion}>
              <Text style={styles.confirmButtonNoText}>{t.alertaActiva.confirmarNo}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mapa en pantalla completa (mismo diseno que la ventana de "Alerta de emergencia"). Al cerrar, sigue en AlertaActiva. */}
      <Modal
        visible={vm.fullscreen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={vm.cerrarMapaCompleto}
      >
        <View style={styles.modalContainer}>
          {vm.ultimo && (
            <MapView
              ref={vm.mapaCompletoRef}
              style={styles.modalMap}
              onMapReady={vm.onMapaCompletoReady}
              toolbarEnabled={false}
              initialRegion={{
                latitude: vm.ultimo.latitude,
                longitude: vm.ultimo.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <PinesMapa
                puntos={vm.puntos}
                colorLinea={theme.icono}
                styles={styles}
                trackear={trackear}
                etiqueta={tx.punto}
              />
            </MapView>
          )}

          {/* Barra superior: cerrar + estado de la ubicacion */}
          <View style={styles.modalTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={vm.cerrarMapaCompleto}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tx.cerrarMapa}
            >
              <MaterialIcons name="close" size={20} color={theme.icono} />
              <Text style={styles.modalCloseText}>{tx.cerrarMapa}</Text>
            </TouchableOpacity>

            <View style={styles.modalTitlePill} pointerEvents="none">
              <Text style={styles.modalTitle} numberOfLines={1}>
                {tx.ubicacionActual}
              </Text>
              <Text style={styles.modalSub} numberOfLines={1}>
                {tx.actualizada} {hace}
              </Text>
            </View>
          </View>

          {/* Ultima coordenada */}
          {vm.ultimo && (
            <View style={styles.modalInfo} pointerEvents="none">
              <Text style={styles.modalInfoText} numberOfLines={1}>
                {tx.punto} {vm.puntos.length} · {vm.coordsUltimo}
              </Text>
              {vm.barrioUltimo && (
                <Text style={styles.modalInfoBarrio} numberOfLines={2}>
                  {vm.barrioUltimo}
                </Text>
              )}
            </View>
          )}

          {/* Encuadrar todos los puntos */}
          <TouchableOpacity
            style={styles.modalFitBtn}
            onPress={vm.verTodosLosPuntos}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={tx.verTodosPuntos}
          >
            <MaterialIcons name="zoom-out-map" size={22} color={theme.icono} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}