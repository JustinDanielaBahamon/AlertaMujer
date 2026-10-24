import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "../../../components/map/MapLibreMap";
import AlertChat, { CONTACT_QUICK_REPLIES } from "../../alertChat/AlertChat";
import { useChatAboveKeyboard } from "../../../hooks/useChatAboveKeyboard";
import PartsPlayer from "../../../components/ui/partsPlayer/PartsPlayer";
import { useAuth } from "../../../contexts/AuthContext";
import { useContactAlertViewModel } from "../viewModel/useContactAlertViewModel";
import type { LocationPoint } from "../../../services/alert-tracking.service";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createStyles } from "../style/contactAlertStyle";

type Styles = ReturnType<typeof createStyles>;

// Dot with an expanding ring ("live" indicator).
function PulseDot({ color, size = 10 }: { color: string; size?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// Route line + numbered pins. Used in the small map and in the popup.
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
          coordinates={points.map((p) => ({
            latitude: p.latitude,
            longitude: p.longitude,
          }))}
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
              <Text style={isLast ? styles.currentPinText : styles.pinText}>
                {i + 1}
              </Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

export default function ContactAlertScreen() {
  const vm = useContactAlertViewModel();
  const keyboard = useChatAboveKeyboard();
  const { user } = useAuth();
  const myName = (user?.nombre ?? "").trim().split(/\s+/)[0] || "Contacto";
  const { theme } = useTheme();
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, width, height, insets);
  const tx = t.alertaContacto;

  // Custom pins are redrawn for a few moments when a new point arrives
  // or when the popup opens.
  const [trackChanges, setTrackChanges] = useState(true);
  useEffect(() => {
    setTrackChanges(true);
    const id = setTimeout(() => setTrackChanges(false), 600);
    return () => clearTimeout(id);
  }, [vm.points.length, vm.mapVisible]);

  const endedColor = "#27ae60";
  // "hace 5s" / "5s ago" / "há 5s" / "il y a 5s": each language's text defines the order.
  const ago = tx.hace.replace("{{tiempo}}", vm.timeSinceLast);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={keyboard.scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 + keyboard.keyboardHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={keyboard.onScroll}
        scrollEventThrottle={32}
      >
        <View style={styles.wrap}>
          {/* Alert status */}
          <View style={styles.badge}>
            {vm.active ? (
              <PulseDot color={theme.icon} size={10} />
            ) : (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: endedColor,
                }}
              />
            )}
            <Text
              style={[styles.badgeText, !vm.active && { color: endedColor }]}
            >
              {vm.active ? tx.badgeActiva : tx.badgeFinalizada}
            </Text>
          </View>

          <Text style={styles.title}>{tx.titulo}</Text>
          <Text style={styles.subtitle}>
            {tx.ubicacionDe}{" "}
            <Text style={styles.subtitleName}>
              {vm.userName || tx.usuariaDefault}
            </Text>
          </Text>

          {/* Small map (preview): tapping it opens the popup */}
          <View style={styles.mapCard}>
            {vm.lastItem ? (
              <>
                <MapView
                  ref={vm.mapRef}
                  style={styles.map}
                  pointerEvents="none"
                  onMapReady={vm.onMapReady}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
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

                {/* Transparent layer: catches the tap to open our popup and not Google Maps */}
                <TouchableOpacity
                  style={StyleSheet.absoluteFillObject}
                  onPress={vm.openMap}
                  activeOpacity={0.9}
                />

                {/* Top left label */}
                <View style={styles.locationPill} pointerEvents="none">
                  {vm.active ? (
                    <PulseDot color={theme.icon} size={9} />
                  ) : (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        backgroundColor: endedColor,
                      }}
                    />
                  )}
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.pillTitle} numberOfLines={1}>
                      {tx.ubicacionActual}
                    </Text>
                    <Text style={styles.pillSub} numberOfLines={1}>
                      {tx.actualizada} {ago}
                    </Text>
                    {vm.lastNeighborhood && (
                      <View style={styles.neighborhoodPillRow}>
                        <MaterialIcons name="place" size={11} color={theme.icon} />
                        <Text style={styles.neighborhoodPill} numberOfLines={2}>
                          {vm.lastNeighborhood}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Open the map in a popup */}
                <TouchableOpacity
                  style={styles.mapsBtn}
                  onPress={vm.openMap}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={tx.abrirMapa}
                >
                  <MaterialIcons name="open-in-full" size={16} color={theme.icon} />
                  <Text style={styles.mapsBtnText}>{tx.abrirMapa}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.mapPlaceholder}>
                {vm.loading ? (
                  <>
                    <ActivityIndicator size="large" color={theme.icon} />
                    <Text style={styles.mapPlaceholderText}>{tx.cargando}</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="location-off" size={32} color={theme.icon} />
                    <Text style={styles.mapPlaceholderText}>{tx.sinUbicaciones}</Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Last location */}
          {vm.lastItem && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.cardIconWrap}>
                    <MaterialIcons name="location-on" size={18} color={theme.icon} />
                  </View>
                  <Text style={styles.cardTitle}>{tx.ultimaUbicacion}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>
                    {vm.active ? tx.enTiempoReal : tx.finalizada}
                  </Text>
                </View>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tx.coordenadas}</Text>
                <Text style={styles.dataValueMono}>{vm.lastCoords}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tx.fechaHora}</Text>
                <Text style={styles.dataValue}>
                  {vm.lastDate} — {vm.lastTime}
                </Text>
              </View>
            </View>
          )}

          {/* Status notice */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeIcon}>
              <MaterialIcons
                name={vm.active ? "info" : "check-circle"}
                size={20}
                color={vm.active ? theme.icon : endedColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.noticeTitle, !vm.active && { color: endedColor }]}
              >
                {vm.active ? tx.alertaActivaTitulo : tx.alertaFinalizadaTitulo}
              </Text>
              <Text style={styles.noticeText}>
                {vm.active ? (
                  <>
                    {tx.alertaActivaDesc}{" "}
                    <Text style={styles.noticeBold}>{vm.lastItem ? ago : "—"}</Text>.
                  </>
                ) : (
                  tx.alertaFinalizadaDesc
                )}
              </Text>
              {vm.connectionError && (
                <Text style={styles.errorText}>{tx.errorConexion}</Text>
              )}
            </View>
          </View>

          {/* Location history */}
          <View style={styles.card}>
            <View style={styles.historyHeader}>
              <View style={styles.historyTitleRow}>
                <View style={styles.historyDot} />
                <Text style={styles.cardTitle}>{tx.historial}</Text>
              </View>
              <Text style={styles.historySub}>{tx.ultimosRegistros}</Text>
            </View>

            {vm.history.length === 0 ? (
              <Text style={styles.noRecords}>{tx.sinUbicaciones}</Text>
            ) : (
              <View style={styles.timeline}>
                <View style={styles.timelineLine} />
                {vm.history.map((item) => (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineNode}>
                      {item.isCurrent && vm.active ? (
                        <PulseDot color={theme.icon} size={12} />
                      ) : item.isCurrent ? (
                        <View
                          style={[
                            styles.timelineNodeSmall,
                            { opacity: 1, width: 12, height: 12, borderRadius: 6 },
                          ]}
                        />
                      ) : (
                        <View style={styles.timelineNodeSmall} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.timelineRowTop}>
                        <Text
                          style={
                            item.isCurrent
                              ? styles.timelineTimeCurrent
                              : styles.timelineTime
                          }
                        >
                          {item.number} — {item.time}
                        </Text>
                        {item.isCurrent && (
                          <Text style={styles.recentTag}>{tx.reciente}</Text>
                        )}
                      </View>
                      <Text style={styles.timelineCoords}>
                        Lat: {item.lat} • Lng: {item.lng}
                      </Text>
                      {item.neighborhood && (
                        <View style={styles.timelineNeighborhoodRow}>
                          <MaterialIcons name="place" size={12} color={theme.icon} />
                          <Text style={styles.timelineNeighborhood} numberOfLines={2}>
                            {item.neighborhood}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={
                        item.isCurrent ? styles.timelineCurrent : styles.timelineOffset
                      }
                    >
                      {item.isCurrent ? tx.actual : item.offset}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Alert recordings: played back to back, part by part */}
          {(vm.videos.length > 0 || vm.audios.length > 0) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{tx.grabaciones}</Text>
              <Text style={styles.historySub}>{tx.grabaciones_desc}</Text>
              {vm.videos.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.historySub, { fontWeight: "700" }]}>
                    {tx.grabacion_video} · {vm.videos.length} {vm.videos.length === 1 ? tx.parte : tx.partes}
                  </Text>
                  <PartsPlayer type="video" parts={vm.videos} color={theme.icon} />
                </View>
              )}
              {vm.audios.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.historySub, { fontWeight: "700" }]}>
                    {tx.grabacion_audio} · {vm.audios.length} {vm.audios.length === 1 ? tx.parte : tx.partes}
                  </Text>
                  <PartsPlayer type="audio" parts={vm.audios} color={theme.icon} />
                </View>
              )}
            </View>
          )}

          <Text style={styles.tip}>{tx.consejo}</Text>

          <TouchableOpacity
            style={styles.callButton}
            onPress={vm.callEmergency}
            activeOpacity={0.85}
          >
            <MaterialIcons name="call" size={20} color={theme.icon} />
            <Text style={styles.callText}>{tx.llamar_numero.replace("{numero}", vm.emergencyNumber)}</Text>
          </TouchableOpacity>
          {/* Chat with her: quick replies or text (with the tracking code) */}
          {!!vm.code && (
            <View ref={keyboard.chatRef} collapsable={false}>
              <AlertChat
                participant={{ type: "contacto", code: vm.code, name: myName }}
                enabled={vm.active}
                soyElla={false}
                herName={vm.userName}
                title={`Mensajes con ${vm.userName || "ella"}`}
                quickReplies={CONTACT_QUICK_REPLIES}
                onFocus={keyboard.onChatFocus}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Popup with the full map */}
      <Modal
        visible={vm.mapVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={vm.closeMap}
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

          {/* Top bar: close + whose location it is */}
          <View style={styles.modalTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={vm.closeMap}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tx.cerrarMapa}
            >
              <MaterialIcons name="close" size={20} color={theme.icon} />
              <Text style={styles.modalCloseText}>{tx.cerrarMapa}</Text>
            </TouchableOpacity>

            <View style={styles.modalTitlePill} pointerEvents="none">
              <Text style={styles.modalTitle} numberOfLines={1}>
                {tx.ubicacionDe} {vm.userName || tx.usuariaDefault}
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
    </View>
  );
}