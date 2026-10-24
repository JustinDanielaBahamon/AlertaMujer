import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "../../../components/map/MapLibreMap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { LocationPoint } from "../../../services/alert-tracking.service";
import { createStyles } from "../style/activeAlertStyle";
import { useActiveAlertViewModel } from "../viewModel/useActiveAlertViewModel";
import { useChatAboveKeyboard } from "../../../hooks/useChatAboveKeyboard";
import AlertRecording from "../../recording/AlertRecording";
import AlertChat, { HER_QUICK_REPLIES } from "../../alertChat/AlertChat";
import Countdown from "./Countdown";
import CancelPinModal from "./CancelPinModal";

type Styles = ReturnType<typeof createStyles>;

// Route line + numbered pins. Used in the map popup.
function MapPins({
  points,
  lineColor,
  styles,
  trackChanges,
  label,
}: {
  points: LocationPoint[];
  lineColor: string;
  styles: Styles;
  trackChanges: boolean;
  label: string;
}) {
  return (
    <>
      {points.length > 1 && (
        <Polyline
          coordinates={points.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
          strokeColor={lineColor}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <Marker
            // The key changes when a pin stops being the last one, so it is redrawn.
            key={`${p.id}-${isLast ? "a" : "p"}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={trackChanges}
            zIndex={isLast ? 999 : i}
            title={`${label} ${i + 1}`}
          >
            <View style={isLast ? styles.currentPin : styles.pin}>
              <Text style={isLast ? styles.currentPinText : styles.pinText}>{i + 1}</Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

export default function ActiveAlertScreen() {
  const vm = useActiveAlertViewModel();
  const keyboard = useChatAboveKeyboard();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, width, height, insets);
  const tx = t.alertaContacto; // map texts (the same as "Emergency alert")

  // Custom pins are redrawn for a few moments when a new point arrives
  // or when the popup opens.
  const [trackChanges, setTrackChanges] = useState(true);
  useEffect(() => {
    setTrackChanges(true);
    const id = setTimeout(() => setTrackChanges(false), 600);
    return () => clearTimeout(id);
  }, [vm.points.length, vm.fullscreen]);

  // "hace 5s" / "5s ago" / "há 5s" / "il y a 5s": each language's text defines the order.
  const ago = tx.hace.replace("{{tiempo}}", vm.timeSinceLast);

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        ref={keyboard.scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={[styles.mainContainer, { paddingBottom: insets.bottom + 30 + keyboard.keyboardHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={keyboard.onScroll}
        scrollEventThrottle={32}
      >
        <View style={styles.wrap}>
        <View style={styles.header}>
          {/* Mini map with the current location. Tapping it opens the full map with the "Emergency alert" design. */}
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
                  <Marker coordinate={vm.location} pinColor={theme.icon} />
                </MapView>
                {/*
 * Transparent layer that catches the tap before it reaches the native map,
 * so Android does not open the Google Maps app when it is pressed.
 */}
                <TouchableOpacity
                  style={StyleSheet.absoluteFillObject}
                  onPress={vm.openFullMap}
                  activeOpacity={0.85}
                />
              </>
            ) : (
              <TouchableOpacity
                style={[StyleSheet.absoluteFillObject, styles.headerMapFallback]}
                onPress={vm.openFullMap}
                activeOpacity={0.85}
              >
                <MaterialIcons name="my-location" size={22} color={theme.icon} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.title}>{t.alertaActiva.titulo}</Text>
        <Text style={styles.subtitle}>{t.alertaActiva.subtitulo}</Text>

        {/* Delivery status: the user has to know whether her contacts were notified */}
        <View style={[deliveryStyles.box, { borderColor: theme.icon, backgroundColor: theme.icon + (vm.delivery.status === "enviada" ? "14" : "22") }]}>
          {vm.delivery.status === "enviando" ? (
            <ActivityIndicator size="small" color={theme.icon} />
          ) : (
            <MaterialIcons name={vm.delivery.status === "enviada" ? "mark-email-read" : "error-outline"} size={22} color={theme.icon} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[deliveryStyles.text, { color: theme.text }]}>
              {vm.delivery.status === "enviada"
                ? t.alertaActiva.envio_enviada
                : vm.delivery.status === "fallida"
                  ? t.alertaActiva.envio_fallida
                  : vm.delivery.attempt > 1
                    ? t.alertaActiva.envio_reintentando
                        .replace("{n}", String(vm.delivery.attempt))
                        .replace("{total}", String(vm.delivery.total))
                    : t.alertaActiva.envio_enviando}
            </Text>
            {vm.delivery.status === "fallida" && (
              <View style={deliveryStyles.actions}>
                <TouchableOpacity onPress={vm.retrySend} style={[deliveryStyles.button, { backgroundColor: theme.icon }]}>
                  <MaterialIcons name="refresh" size={16} color="#fff" />
                  <Text style={deliveryStyles.buttonText}>{t.alertaActiva.envio_reintentar}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={vm.callEmergency}
                  style={[deliveryStyles.button, { borderColor: theme.icon, borderWidth: 1.5 }]}
                >
                  <MaterialIcons name="call" size={16} color={theme.icon} />
                  <Text style={[deliveryStyles.buttonText, { color: theme.icon }]}>{t.alertaActiva.envio_llamar}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Emergency call near the top: at the end of the screen it was below the recording and the chat */}
        <TouchableOpacity style={styles.callRow} onPress={vm.callEmergency}>
          <MaterialIcons name="call" size={20} color={theme.icon} />
          <Text style={styles.callText}>{t.alertaActiva.llamar_numero.replace("{numero}", vm.emergencyNumber)}</Text>
        </TouchableOpacity>

        <View style={styles.circleWrapper}>
          <View style={styles.circle}>
            <MaterialIcons name="notifications-active" size={22} color={theme.icon} />
            <Countdown end={vm.alertEnd} durationMin={vm.maxDurationMin} style={styles.number} />
            <Text style={styles.timeLabel}>{t.alertaActiva.tiempoRestante}</Text>
          </View>
        </View>

        {/* Information about what happens when the time runs out and how to cancel. */}
        <View style={styles.messageCard}>
          <MaterialIcons name="info-outline" size={20} color={theme.icon} />
          <Text style={styles.messageText}>
            {vm.unanswered ? t.alertaActiva.sin_respuesta : t.alertaActiva.mensajeReenvio}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="verified-user" size={22} color={theme.icon} />
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
              <MaterialIcons name="location-on" size={18} color={theme.icon} />
              <Text style={styles.locationText}>{t.alertaActiva.enTiempoReal}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.locationItem}>
              <MaterialIcons name="visibility" size={18} color={theme.icon} />
              <Text style={styles.locationText}>
                {vm.views.watchingNow > 0
                  ? t.alertaActiva.viendo_ahora.replace("{n}", String(vm.views.watchingNow))
                  : `${vm.views.total} ${vm.views.total === 1 ? t.alertaActiva.vista : t.alertaActiva.vistas}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Chat with the contacts: quick messages without having to speak */}
        {/* Automatic video/audio as evidence (uploaded every 45 s) */}
        <AlertRecording alertId={vm.alertId} alertStart={vm.alertStart} />
        <View ref={keyboard.chatRef} collapsable={false}>
          <AlertChat
            participant={vm.alertId ? { type: "duena", alertId: vm.alertId } : null}
            enabled
            soyElla
            title="Mensajes a tus contactos"
            quickReplies={HER_QUICK_REPLIES}
            onFocus={keyboard.onChatFocus}
          />
        </View>

        <TouchableOpacity style={styles.okButton} onPress={vm.openConfirmation}>
          <MaterialIcons name="favorite" size={22} color={theme.headerText} />
          <Text style={styles.okButtonText}>{t.alertaActiva.estoyBien}</Text>
          <Text style={styles.okButtonSubtext}>{t.alertaActiva.estoyBienDescripcion}</Text>
        </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Confirmation dialog to cancel the alert. */}
      <Modal
        visible={vm.confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={vm.closeConfirmation}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <MaterialIcons name="favorite" size={28} color={theme.icon} />
            </View>
            <Text style={styles.confirmTitle}>{t.alertaActiva.confirmarTitulo}</Text>
            <Text style={styles.confirmDescription}>{t.alertaActiva.confirmarDescripcion}</Text>

            <TouchableOpacity style={styles.confirmButtonYes} onPress={vm.confirmCancel}>
              <Text style={styles.confirmButtonYesText}>{t.alertaActiva.confirmarSi}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButtonNo} onPress={vm.closeConfirmation}>
              <Text style={styles.confirmButtonNoText}>{t.alertaActiva.confirmarNo}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* "¿Sigues en peligro?": 5 minutes before the check-in time, until she answers */}
      <Modal visible={vm.checkInVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <MaterialIcons name="help-outline" size={28} color={theme.icon} />
            </View>
            <Text style={styles.confirmTitle}>{t.alertaActiva.pregunta_titulo}</Text>
            <Text style={styles.confirmDescription}>
              {vm.unanswered ? t.alertaActiva.sin_respuesta : t.alertaActiva.pregunta_texto}
            </Text>
            <TouchableOpacity style={styles.confirmButtonYes} onPress={vm.stillInDanger}>
              <Text style={styles.confirmButtonYesText}>{t.alertaActiva.pregunta_sigo}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButtonNo} onPress={vm.openConfirmation}>
              <Text style={styles.confirmButtonNoText}>{t.alertaActiva.pregunta_bien}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CancelPinModal
        visible={vm.pinVisible}
        error={vm.pinError}
        onSubmit={vm.submitPin}
        onClose={vm.closePin}
      />

      {/* Full-screen map (same design as the "Emergency alert" popup). On close, stays on ActiveAlert. */}
      <Modal
        visible={vm.fullscreen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={vm.closeFullMap}
      >
        <View style={styles.modalContainer}>
          {vm.lastItem && (
            <MapView
              ref={vm.fullMapRef}
              style={styles.modalMap}
              onMapReady={vm.onFullMapReady}
              toolbarEnabled={false}
              initialRegion={{
                latitude: vm.lastItem.latitude,
                longitude: vm.lastItem.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <MapPins
                points={vm.points}
                lineColor={theme.icon}
                styles={styles}
                trackChanges={trackChanges}
                label={tx.punto}
              />
            </MapView>
          )}

          {/* Top bar: close + location status */}
          <View style={styles.modalTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={vm.closeFullMap}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tx.cerrarMapa}
            >
              <MaterialIcons name="close" size={20} color={theme.icon} />
              <Text style={styles.modalCloseText}>{tx.cerrarMapa}</Text>
            </TouchableOpacity>

            <View style={styles.modalTitlePill} pointerEvents="none">
              <Text style={styles.modalTitle} numberOfLines={1}>
                {tx.ubicacionActual}
              </Text>
              <Text style={styles.modalSub} numberOfLines={1}>
                {tx.actualizada} {ago}
              </Text>
            </View>
          </View>

          {/* Last coordinate */}
          {vm.lastItem && (
            <View style={styles.modalInfo} pointerEvents="none">
              <Text style={styles.modalInfoText} numberOfLines={1}>
                {tx.punto} {vm.points.length} · {vm.lastCoords}
              </Text>
              {vm.lastNeighborhood && (
                <Text style={styles.neighborhoodInfoModal} numberOfLines={2}>
                  {vm.lastNeighborhood}
                </Text>
              )}
            </View>
          )}

          {/* Fit all the points */}
          <TouchableOpacity
            style={styles.modalFitBtn}
            onPress={vm.showAllPoints}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={tx.verTodosPuntos}
          >
            <MaterialIcons name="zoom-out-map" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* The alert ended on the server (expired, attended or cancelled): the location is no longer sent */}
      <Modal visible={!!vm.end} transparent animationType="fade" onRequestClose={vm.leaveAfterEnd}>
        <View style={endStyles.background}>
          <View style={[endStyles.card, { backgroundColor: theme.containerBackground }]}>
            <View style={[endStyles.icon, { backgroundColor: theme.icon + "22" }]}>
              <MaterialIcons name="timer-off" size={30} color={theme.icon} />
            </View>
            <Text style={[endStyles.title, { color: theme.text }]}>{t.alertaActiva.fin_titulo}</Text>
            <Text style={[endStyles.text, { color: theme.text }]}>
              {vm.end?.status === "resolved"
                ? t.alertaActiva.fin_atendida
                : vm.end?.status === "cancelled"
                  ? t.alertaActiva.fin_cancelada
                  : t.alertaActiva.fin_vencida.replace("{min}", String(vm.end?.minutes ?? ""))}
            </Text>
            <Text style={[endStyles.question, { color: theme.text }]}>{t.alertaActiva.fin_pregunta}</Text>
            <TouchableOpacity onPress={vm.activateAnotherAlert} style={[endStyles.button, { backgroundColor: theme.icon }]}>
              <MaterialIcons name="notifications-active" size={20} color="#fff" />
              <Text style={endStyles.buttonText}>{t.alertaActiva.fin_otra}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.leaveAfterEnd} style={[endStyles.secondary, { borderColor: theme.icon }]}>
              <Text style={[endStyles.secondaryText, { color: theme.icon }]}>{t.alertaActiva.fin_bien}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const endStyles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 24 },
  card: { borderRadius: 22, padding: 22, alignItems: "center" },
  icon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", marginTop: 12, textAlign: "center" },
  text: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6 },
  question: { fontSize: 15, fontWeight: "700", marginTop: 14, textAlign: "center" },
  button: { alignSelf: "stretch", flexDirection: "row", gap: 8, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 14 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secondary: { alignSelf: "stretch", height: 46, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 10 },
  secondaryText: { fontSize: 14, fontWeight: "700" },
});
const deliveryStyles = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1.5, borderRadius: 16, padding: 12, marginTop: 12, marginHorizontal: 4 },
  text: { fontSize: 13, fontWeight: "700", lineHeight: 19 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  button: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
