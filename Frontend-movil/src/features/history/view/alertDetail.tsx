import { Feather, MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useContactsContext } from "../../../contexts/ContactsContext";
import MapView, { Marker, Polyline } from "../../../components/map/MapLibreMap";
import { POINT_A_COLOR, POINT_B_COLOR } from "../../map/routeColors";
import { MAX_ROUTE_MARKERS, useAlertDetailViewModel, type AlertStep, type RouteStop } from "../viewModel/useAlertDetailViewModel";
import NotifiedContactsModal, { STATUSES, CHANNEL_ICON } from "./NotifiedContactsModal";
import AlertEvidence from "./AlertEvidence";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../style/detail.Style";
import { getAssistanceColors, getEmergencyColors } from "../style/history.style";

type AlertDetailRouteProp = RouteProp<MainStackParamList, "AlertDetail">;
type Coordinate = { latitude: number; longitude: number };

/** Start and last location keep the colors of the rest of the app; the points in between are violet. */
const routeColor = (stop: RouteStop, total: number) =>
  stop.number === 1 ? POINT_A_COLOR : stop.number === total ? POINT_B_COLOR : "#7C3AED";

/** Many points would cover the map: keeps an even sample, always with the first and the last. */
function markersOf(route: RouteStop[]): RouteStop[] {
  if (route.length <= MAX_ROUTE_MARKERS) return route;
  const step = (route.length - 1) / (MAX_ROUTE_MARKERS - 1);
  return Array.from({ length: MAX_ROUTE_MARKERS }, (_, i) => route[Math.round(i * step)]);
}

const STEP_ICON: Record<AlertStep["icon"], keyof typeof MaterialIcons.glyphMap> = {
  alert: "notifications-active",
  location: "my-location",
  end: "check",
  ongoing: "radio-button-checked",
};

const STEP_COLOR: Record<AlertStep["icon"], string> = {
  alert: POINT_B_COLOR,
  location: "#9333EA",
  end: POINT_A_COLOR,
  ongoing: POINT_B_COLOR,
};

export default function AlertDetail() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<AlertDetailRouteProp>();
  const { alert: alert } = route.params;
  const {
    isEmergency, route: stops, sharing, shareReport, kept, savingKeep, toggleKeep, notifiedContacts, loadingContacts, contactsError,
    points, loadingDetail, address, method, message, steps,
  } = useAlertDetailViewModel(alert);
  const path = useMemo(() => points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })), [points]);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showNotified, setShowNotified] = useState(false);

  // The phone comes from the contact list (the delivery log only stores the name)
  const { contacts } = useContactsContext();
  const phoneOf = (contactId: number) =>
    contacts.find((x) => String(x.id) === String(contactId))?.phoneNumber?.replace(/\D/g, "") ?? "";
  const openWhatsApp = (phoneNumber: string, name: string) => {
    const number = phoneNumber.length === 10 ? `57${phoneNumber}` : phoneNumber;
    const text = t.detalle.whatsapp_mensaje
      .replace("{nombre}", (name || "").split(" ")[0])
      .replace("{fecha}", `${alert.date} · ${alert.time}`);
    Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`).catch(() => {});
  };
  const statusLabel = (status: string, channel?: string) =>
    ({
      pending: t.detalle.estado_pending,
      sent: t.detalle.estado_sent,
      // For the email "delivered" means she opened it; for the app, that it reached her phone
      delivered: channel === "email" ? t.detalle.estado_delivered_email : t.detalle.estado_delivered,
      seen: t.detalle.estado_seen,
      failed: t.detalle.estado_failed,
      expired: t.detalle.estado_expired,
    })[status] ?? status;
  const [alertCoordinate, setAlertCoordinate] = useState<Coordinate | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [fullScreenMap, setFullScreenMap] = useState(false);

  const emergencyColors = useMemo(() => getEmergencyColors(theme), [theme]);
  const assistanceColors = useMemo(() => getAssistanceColors(theme), [theme]);
  const alertColors = isEmergency ? emergencyColors : assistanceColors;

  // Help lines (123, Línea Púrpura...) in case she needs guidance or wants to report what happened
  const goToAssistance = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", { screen: "Home", params: { screen: "Assistance" } } as never);
  };

  const goToInternalMap = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Home",
      params: {
        screen: "Map",
        params: { targetAddress: alert.location },
      },
    } as never);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If the alert already has coordinates from the backend, use them directly
        if (path.length > 0) {
          setAlertCoordinate(path[0]);
          if (mounted) setLoadingMap(false);
          return;
        }
        if (alert.coords) {
          setAlertCoordinate(alert.coords);
          if (mounted) setLoadingMap(false);
          return;
        }

        const address = alert.location?.trim();
        if (!address) {
          if (mounted) setAlertCoordinate(null);
          return;
        }
        const results = await Location.geocodeAsync(`${address}, Colombia`);
        if (!mounted) return;
        if (results.length > 0) {
          const { latitude, longitude } = results[0];
          setAlertCoordinate({ latitude, longitude });
        } else {
          setAlertCoordinate(null);
        }
      } catch {
        if (mounted) setAlertCoordinate(null);
      } finally {
        if (mounted) setLoadingMap(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [alert.location, alert.coords, path]);

  // Fit the whole route on the small map
  useEffect(() => {
    if (!mapReady || path.length < 2) return;
    mapRef.current?.fitToCoordinates(path, {
      edgePadding: { top: 40, right: 40, bottom: 60, left: 40 },
      animated: false,
    });
  }, [mapReady, path]);

  const openFullMap = () => alertCoordinate && setFullScreenMap(true);

  return (
    <>
      <ScrollView
        style={styles.MainContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.Gradient}
        >
          <TouchableOpacity style={styles.BackButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="white" />
          </TouchableOpacity>

          <View style={styles.HeaderContent}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 25, fontWeight: "800" }}>{t.detalle.titulo}</Text>
                <Text style={{ color: "white", fontSize: 13, opacity: 0.8 }}>
                  {t.detalle.subtitulo}
                </Text>
              </View>
              <Image
                source={require("@assets/imagesAlertaMujer/ScHistorial/alertaDTLL.png")}
                style={{ width: 90, height: 69, resizeMode: "cover" }}
              />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.Body}>
          {/* SUMMARY */}
          <View style={styles.SummaryCard}>
            <View style={[styles.SummaryIcon, { backgroundColor: alertColors.iconBg }]}>
              <MaterialIcons
                name={alert.type === "Avísame si no llego" ? "directions-walk" : isEmergency ? "warning" : "medical-services"}
                size={22}
                color={alertColors.iconTint}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.SummaryType}>{alert.type}</Text>
              <View style={styles.SummaryMetaRow}>
                <MaterialIcons name="access-time" size={14} color={theme.contactSubtext} />
                <Text style={styles.SummaryMetaText}>
                  {alert.date} · {alert.time}
                </Text>
              </View>
              {!!address && (
                <View style={styles.SummaryMetaRow}>
                  <MaterialIcons name="place" size={14} color={theme.contactSubtext} />
                  <Text style={styles.SummaryMetaText} numberOfLines={2}>{address}</Text>
                </View>
              )}
              {!!method && (
                <View style={[extra.chip, { backgroundColor: `${theme.contactAccent}1A` }]}>
                  <MaterialIcons name="bolt" size={13} color={theme.contactAccent} />
                  <Text style={[extra.chipText, { color: theme.contactAccent }]}>{method}</Text>
                </View>
              )}
            </View>
            <View style={[styles.SummaryStatusBadge, { backgroundColor: alertColors.badgeBg }]}>
              <Text style={[styles.SummaryStatusBadgeText, { color: alertColors.badgeText }]}>
                {alert.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* MAP WITH THE ROUTE */}
          <View style={styles.MapCard}>
            {alertCoordinate ? (
              <MapView
                ref={mapRef}
                style={styles.MapBackground}
                initialRegion={{
                  latitude: alertCoordinate.latitude,
                  longitude: alertCoordinate.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onMapReady={() => setMapReady(true)}
                pointerEvents="none"
              >
                {path.length > 1 && (
                  <Polyline coordinates={path} strokeWidth={4} strokeColor={POINT_A_COLOR} />
                )}
                <Marker coordinate={path[0] ?? alertCoordinate} title="Inicio" pinColor={POINT_A_COLOR} />
                {path.length > 1 && (
                  <Marker coordinate={path[path.length - 1]} title="Última ubicación" pinColor={POINT_B_COLOR} />
                )}
              </MapView>
            ) : (
              <LinearGradient
                colors={theme.mode === "dark" ? ["#2a1446", "#160a29"] : ["#efe3ff", "#dcc6fb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.MapBackground, { alignItems: "center", justifyContent: "center" }]}
              >
                {loadingMap || loadingDetail ? (
                  <ActivityIndicator size="small" color={theme.contactAccent} />
                ) : (
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                    {t.detalle.no_pudo_cargar_mapa}
                  </Text>
                )}
              </LinearGradient>
            )}

            <Pressable onPress={openFullMap} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

            {alertCoordinate && (
              <View style={extra.mapFooter}>
                <TouchableOpacity style={extra.mapButton} onPress={openFullMap}>
                  <MaterialIcons name="open-in-full" size={14} color="white" />
                  <Text style={extra.mapButtonText}>
                    {path.length > 1 ? `Ver recorrido (${path.length} puntos)` : t.detalle.ver_mapa}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* TIMELINE */}
          {steps.length > 0 && (
            <>
              <Text style={styles.SectionTitle}>Qué pasó</Text>
              <View style={[extra.card, { backgroundColor: theme.containerBackground }]}>
                {steps.map((step, i) => (
                  <View key={step.title} style={extra.step}>
                    <View style={extra.stepGuide}>
                      <View style={[extra.stepDot, { backgroundColor: STEP_COLOR[step.icon] }]}>
                        <MaterialIcons name={STEP_ICON[step.icon]} size={14} color="white" />
                      </View>
                      {i < steps.length - 1 && <View style={[extra.stepLine, { backgroundColor: `${theme.contactAccent}40` }]} />}
                    </View>
                    <View style={extra.stepText}>
                      <Text style={[extra.stepTitle, { color: theme.text }]}>{step.title}</Text>
                      <Text style={[extra.stepDetail, { color: theme.contactSubtext }]}>{step.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ROUTE: every point in order, with its time and place */}
          {stops.length > 1 && (
            <>
              <Text style={styles.SectionTitle}>Recorrido</Text>
              <View style={[extra.card, { backgroundColor: theme.containerBackground }]}>
                {stops.map((stop, i) => (
                  <View key={stop.id} style={extra.step}>
                    <View style={extra.stepGuide}>
                      <View style={[extra.routeDot, { backgroundColor: routeColor(stop, stops.length) }]}>
                        <Text style={extra.routeNumber}>{stop.number}</Text>
                      </View>
                      {i < stops.length - 1 && <View style={[extra.stepLine, { backgroundColor: `${theme.contactAccent}40` }]} />}
                    </View>
                    <View style={extra.stepText}>
                      <Text style={[extra.stepTitle, { color: theme.text }]}>
                        {stop.time}
                        {i === 0 ? " · Inicio" : i === stops.length - 1 ? " · Última ubicación" : ""}
                      </Text>
                      <Text style={[extra.stepDetail, { color: theme.contactSubtext }]}>
                        {stop.place ?? `${stop.latitude.toFixed(5)}, ${stop.longitude.toFixed(5)}`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* RECORDED EVIDENCE */}
          <Text style={styles.SectionTitle}>{t.detalle.evidencias_titulo}</Text>
          <AlertEvidence alertId={Number(alert.id)} />

          {/* NOTIFIED CONTACTS */}
          <View style={extra.sectionRow}>
            <Text style={[styles.SectionTitle, extra.sectionRowTitle]} numberOfLines={2}>
              {t.detalle.notificados_titulo}
            </Text>
            {notifiedContacts.length > 0 && (
              <TouchableOpacity onPress={() => setShowNotified(true)} style={extra.seeAllButton} hitSlop={8}>
                <Text style={[extra.seeAll, { color: theme.contactAccent }]}>{t.detalle.ver_detalle}</Text>
                <MaterialIcons name="chevron-right" size={18} color={theme.contactAccent} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[extra.card, { backgroundColor: theme.containerBackground }]}>
            {loadingContacts ? (
              <ActivityIndicator size="small" color={theme.contactAccent} />
            ) : contactsError ? (
              <Text style={[extra.stepDetail, { color: theme.contactSubtext }]}>{t.detalle.notificados_error}</Text>
            ) : notifiedContacts.length === 0 ? (
              <Text style={[extra.stepDetail, { color: theme.contactSubtext }]}>{t.detalle.notificados_vacio}</Text>
            ) : (
              notifiedContacts.map((c, i) => {
                const phoneNumber = phoneOf(c.contactId);
                return (
                  <View
                    key={String(c.contactId)}
                    style={[extra.contactCard, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.contactDivider }]}
                  >
                    <View style={extra.contact}>
                      <View style={[extra.avatar, { backgroundColor: `${theme.contactAccent}1A` }]}>
                        <Text style={[extra.avatarText, { color: theme.contactAccent }]}>
                          {(c.name || "?").trim().charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[extra.stepTitle, { color: theme.text }]} numberOfLines={1}>{c.name}</Text>
                        {!!c.relationship && (
                          <Text style={[extra.stepDetail, { color: theme.contactSubtext, textTransform: "capitalize" }]}>{c.relationship}</Text>
                        )}
                      </View>
                    </View>
                    {/* How it reached them, in words: "Email · Received" */}
                    <View style={extra.channels}>
                      {c.channels.map((channel) => {
                        const status = STATUSES[channel.status] ?? STATUSES.pending;
                        // Already seen: filled strong violet so it stands out
                        const seen = channel.status === "seen";
                        const color = seen ? "#FFFFFF" : status.color;
                        return (
                          <View
                            key={channel.channel}
                            style={[
                              extra.channel,
                              seen
                                ? { backgroundColor: status.color, borderColor: status.color }
                                : { backgroundColor: `${status.color}14`, borderColor: `${status.color}66` },
                            ]}
                          >
                            <MaterialIcons name={CHANNEL_ICON[channel.channel] ?? "chat"} size={14} color={color} />
                            <Text style={[extra.channelText, { color }]}>
                              {channel.channel === "email" ? t.detalle.canal_corto_email : channel.channel === "push" ? t.detalle.canal_corto_push : channel.channel}
                              {" · "}
                              {statusLabel(channel.status, channel.channel)}
                            </Text>
                            {seen && <MaterialIcons name="visibility" size={14} color={color} />}
                          </View>
                        );
                      })}
                    </View>
                    {!!phoneNumber && (
                      <View style={extra.actions}>
                        <TouchableOpacity
                          style={[extra.action, { backgroundColor: theme.contactAccent }]}
                          onPress={() => openWhatsApp(phoneNumber, c.name)}
                          accessibilityRole="button"
                        >
                          <MaterialIcons name="chat" size={16} color="#fff" />
                          <Text style={extra.actionText}>{t.detalle.escribir_whatsapp}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[extra.action, extra.secondaryAction, { borderColor: theme.contactAccent }]}
                          onPress={() => Linking.openURL(`tel:${phoneNumber}`).catch(() => {})}
                          accessibilityRole="button"
                        >
                          <MaterialIcons name="call" size={16} color={theme.contactAccent} />
                          <Text style={[extra.actionText, { color: theme.contactAccent }]}>{t.detalle.llamar_contacto}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

          {/* ALERT NOTE */}
          {!!message && (
            <View style={styles.DescriptionCard}>
              <Text style={styles.DescriptionTitle}>{t.detalle.descripcion}</Text>
              <Text style={styles.DescriptionText}>{message}</Text>
            </View>
          )}
        </View>
        <View style={styles.Footer}>
            <Text style={styles.SectionTitle}>{t.detalle.acciones_rapidas}</Text>
            <View style={styles.ActionsRow}>
              <TouchableOpacity style={styles.ActionItem} onPress={shareReport} disabled={sharing}>
                <View style={styles.ActionCircle}>
                  <Feather name="share-2" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.ActionText}>{sharing ? t.detalle.enviando : t.detalle.compartir}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ActionItem} onPress={goToInternalMap}>
                <View style={styles.ActionCircle}>
                  <Feather name="navigation" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.ActionText}>{t.detalle.navegar}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ActionItem}
                onPress={toggleKeep}
                disabled={savingKeep}
                accessibilityRole="switch"
                accessibilityState={{ checked: kept }}
              >
                <View style={[styles.ActionCircle, kept && { backgroundColor: theme.contactAccent }]}>
                  {savingKeep ? (
                    <ActivityIndicator size="small" color={theme.contactAccent} />
                  ) : (
                    <MaterialIcons name={kept ? "lock" : "lock-open"} size={18} color={kept ? "#fff" : theme.contactAccent} />
                  )}
                </View>
                <Text style={styles.ActionText}>{kept ? "Evidencias conservadas" : "Conservar evidencias"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ActionItem} onPress={goToAssistance}>
                <View style={styles.ActionCircle}>
                  <Feather name="phone-call" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.ActionText}>Pedir ayuda</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.EndSeparator} />
          </View>
      </ScrollView>

      <Modal visible={fullScreenMap} animationType="slide" onRequestClose={() => setFullScreenMap(false)}>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          {alertCoordinate ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: alertCoordinate.latitude,
                longitude: alertCoordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {path.length > 1 && (
                <Polyline coordinates={path} strokeWidth={4} strokeColor={POINT_A_COLOR} />
              )}
              {stops.length > 1 ? (
                markersOf(stops).map((stop) => (
                  <Marker
                    key={stop.id}
                    coordinate={stop}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title={`${stop.number} · ${stop.time}`}
                    description={stop.place ?? undefined}
                    zIndex={stop.number === 1 || stop.number === stops.length ? 2 : 1}
                  >
                    <View style={[extra.routeMarker, { backgroundColor: routeColor(stop, stops.length) }]}>
                      <Text style={extra.routeNumber}>{stop.number}</Text>
                    </View>
                  </Marker>
                ))
              ) : (
                <Marker coordinate={path[0] ?? alertCoordinate} title="Inicio" pinColor={POINT_A_COLOR} />
              )}
            </MapView>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: theme.text }}>{t.detalle.no_pudo_cargar_mapa_punto}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setFullScreenMap(false)}
            style={{
              position: "absolute",
              top: 50,
              right: 16,
              backgroundColor: "rgba(17, 24, 39, 0.75)",
              borderRadius: 24,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>{t.detalle.cerrar_mapa}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <NotifiedContactsModal
        visible={showNotified}
        onClose={() => setShowNotified(false)}
        contacts={notifiedContacts}
        loading={loadingContacts}
        error={contactsError}
      />
    </>
  );
}

const extra = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  mapFooter: { position: "absolute", left: 12, right: 12, bottom: 12, flexDirection: "row" },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(76, 29, 149, 0.85)",
  },
  mapButtonText: { color: "white", fontSize: 12, fontWeight: "700" },
  card: { borderRadius: 18, padding: 16, marginBottom: 18, gap: 4 },
  step: { flexDirection: "row", minHeight: 52 },
  stepGuide: { width: 28, alignItems: "center" },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  routeDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  routeMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  routeNumber: { color: "#fff", fontSize: 12, fontWeight: "800" },
  stepLine: { flex: 1, width: 2, marginVertical: 2 },
  stepText: { flex: 1, paddingLeft: 10, paddingBottom: 10 },
  stepTitle: { fontSize: 14, fontWeight: "700" },
  stepDetail: { fontSize: 12, marginTop: 2 },
  sectionRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  // The title wraps instead of pushing "Ver detalle" out of place on narrow screens
  sectionRowTitle: { flex: 1 },
  seeAllButton: { flexDirection: "row", alignItems: "center", paddingTop: 8 },
  seeAll: { fontSize: 13, fontWeight: "700" },
  contactCard: { paddingVertical: 10, gap: 8 },
  contact: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontWeight: "800" },
  channels: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingLeft: 46 },
  channel: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  channelText: { fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, paddingLeft: 46 },
  action: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 38, borderRadius: 12 },
  secondaryAction: { borderWidth: 1.5, backgroundColor: "transparent" },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
