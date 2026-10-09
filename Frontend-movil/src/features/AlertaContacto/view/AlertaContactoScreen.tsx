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
import MapView, { Marker, Polyline } from "react-native-maps";
import { useAlertaContactoViewModel } from "../viewModel/useAlertaContactoViewModel";
import type { PuntoUbicacion } from "../../../services/alert-tracking.service";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createStyles } from "../style/alertaContactoStyle";

type Estilos = ReturnType<typeof createStyles>;

// Punto con anillo que se expande (indicador "en vivo").
function PuntoPulso({ color, size = 10 }: { color: string; size?: number }) {
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

// Línea de recorrido + pines numerados. Se usa en el mapa pequeño y en la ventana emergente.
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
          coordinates={puntos.map((p) => ({
            latitude: p.latitude,
            longitude: p.longitude,
          }))}
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
            // La key cambia cuando un pin deja de ser el último, para que se redibuje.
            key={`${p.id}-${esUltimo ? "a" : "p"}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={trackear}
            zIndex={esUltimo ? 999 : i}
            title={`${etiqueta} ${i + 1}`}
          >
            <View style={esUltimo ? styles.pinActual : styles.pin}>
              <Text style={esUltimo ? styles.pinActualText : styles.pinText}>
                {i + 1}
              </Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

export default function AlertaContactoScreen() {
  const vm = useAlertaContactoViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, width, height, insets);
  const tx = t.alertaContacto;

  // Los pines personalizados se redibujan unos instantes cuando llega un punto nuevo
  // o cuando se abre la ventana emergente.
  const [trackear, setTrackear] = useState(true);
  useEffect(() => {
    setTrackear(true);
    const id = setTimeout(() => setTrackear(false), 600);
    return () => clearTimeout(id);
  }, [vm.puntos.length, vm.mapaVisible]);

  const colorFinalizada = "#27ae60";
  // "hace 5s" / "5s ago" / "há 5s" / "il y a 5s": el orden lo define el texto de cada idioma.
  const hace = tx.hace.replace("{{tiempo}}", vm.tiempoDesdeUltimo);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrap}>
          {/* Estado de la alerta */}
          <View style={styles.badge}>
            {vm.activa ? (
              <PuntoPulso color={theme.icono} size={10} />
            ) : (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colorFinalizada,
                }}
              />
            )}
            <Text
              style={[styles.badgeText, !vm.activa && { color: colorFinalizada }]}
            >
              {vm.activa ? tx.badgeActiva : tx.badgeFinalizada}
            </Text>
          </View>

          <Text style={styles.title}>{tx.titulo}</Text>
          <Text style={styles.subtitle}>
            {tx.ubicacionDe}{" "}
            <Text style={styles.subtitleName}>
              {vm.nombreUsuaria || tx.usuariaDefault}
            </Text>
          </Text>

          {/* Mapa pequeño (vista previa): al tocarlo abre la ventana emergente */}
          <View style={styles.mapCard}>
            {vm.ultimo ? (
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

                {/* Capa transparente: intercepta el toque para abrir nuestra ventana y no Google Maps */}
                <TouchableOpacity
                  style={StyleSheet.absoluteFillObject}
                  onPress={vm.abrirMapa}
                  activeOpacity={0.9}
                />

                {/* Etiqueta superior izquierda */}
                <View style={styles.pillUbicacion} pointerEvents="none">
                  {vm.activa ? (
                    <PuntoPulso color={theme.icono} size={9} />
                  ) : (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        backgroundColor: colorFinalizada,
                      }}
                    />
                  )}
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.pillTitle} numberOfLines={1}>
                      {tx.ubicacionActual}
                    </Text>
                    <Text style={styles.pillSub} numberOfLines={1}>
                      {tx.actualizada} {hace}
                    </Text>
                    {vm.barrioUltimo && (
                      <View style={styles.pillBarrioRow}>
                        <MaterialIcons name="place" size={11} color={theme.icono} />
                        <Text style={styles.pillBarrio} numberOfLines={2}>
                          {vm.barrioUltimo}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Abrir mapa en ventana emergente */}
                <TouchableOpacity
                  style={styles.btnMaps}
                  onPress={vm.abrirMapa}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={tx.abrirMapa}
                >
                  <MaterialIcons name="open-in-full" size={16} color={theme.icono} />
                  <Text style={styles.btnMapsText}>{tx.abrirMapa}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.mapPlaceholder}>
                {vm.cargando ? (
                  <>
                    <ActivityIndicator size="large" color={theme.icono} />
                    <Text style={styles.mapPlaceholderText}>{tx.cargando}</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="location-off" size={32} color={theme.icono} />
                    <Text style={styles.mapPlaceholderText}>{tx.sinUbicaciones}</Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Última ubicación */}
          {vm.ultimo && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.cardIconWrap}>
                    <MaterialIcons name="location-on" size={18} color={theme.icono} />
                  </View>
                  <Text style={styles.cardTitle}>{tx.ultimaUbicacion}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>
                    {vm.activa ? tx.enTiempoReal : tx.finalizada}
                  </Text>
                </View>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tx.coordenadas}</Text>
                <Text style={styles.dataValueMono}>{vm.coordsUltimo}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tx.fechaHora}</Text>
                <Text style={styles.dataValue}>
                  {vm.fechaUltimo} — {vm.horaUltimo}
                </Text>
              </View>
            </View>
          )}

          {/* Aviso de estado */}
          <View style={styles.avisoCard}>
            <View style={styles.avisoIcon}>
              <MaterialIcons
                name={vm.activa ? "info" : "check-circle"}
                size={20}
                color={vm.activa ? theme.icono : colorFinalizada}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.avisoTitle, !vm.activa && { color: colorFinalizada }]}
              >
                {vm.activa ? tx.alertaActivaTitulo : tx.alertaFinalizadaTitulo}
              </Text>
              <Text style={styles.avisoText}>
                {vm.activa ? (
                  <>
                    {tx.alertaActivaDesc}{" "}
                    <Text style={styles.avisoBold}>{vm.ultimo ? hace : "—"}</Text>.
                  </>
                ) : (
                  tx.alertaFinalizadaDesc
                )}
              </Text>
              {vm.errorConexion && (
                <Text style={styles.errorText}>{tx.errorConexion}</Text>
              )}
            </View>
          </View>

          {/* Historial de ubicación */}
          <View style={styles.card}>
            <View style={styles.historialHeader}>
              <View style={styles.historialTitleRow}>
                <View style={styles.historialDot} />
                <Text style={styles.cardTitle}>{tx.historial}</Text>
              </View>
              <Text style={styles.historialSub}>{tx.ultimosRegistros}</Text>
            </View>

            {vm.historial.length === 0 ? (
              <Text style={styles.sinRegistros}>{tx.sinUbicaciones}</Text>
            ) : (
              <View style={styles.timeline}>
                <View style={styles.timelineLine} />
                {vm.historial.map((item) => (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineNode}>
                      {item.esActual && vm.activa ? (
                        <PuntoPulso color={theme.icono} size={12} />
                      ) : item.esActual ? (
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
                            item.esActual
                              ? styles.timelineTimeActual
                              : styles.timelineTime
                          }
                        >
                          {item.numero} — {item.hora}
                        </Text>
                        {item.esActual && (
                          <Text style={styles.recienteTag}>{tx.reciente}</Text>
                        )}
                      </View>
                      <Text style={styles.timelineCoords}>
                        Lat: {item.lat} • Lng: {item.lng}
                      </Text>
                      {item.barrio && (
                        <View style={styles.timelineBarrioRow}>
                          <MaterialIcons name="place" size={12} color={theme.icono} />
                          <Text style={styles.timelineBarrio} numberOfLines={2}>
                            {item.barrio}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={
                        item.esActual ? styles.timelineActual : styles.timelineOffset
                      }
                    >
                      {item.esActual ? tx.actual : item.offset}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.consejo}>{tx.consejo}</Text>

          <TouchableOpacity
            style={styles.callButton}
            onPress={vm.llamarEmergencias}
            activeOpacity={0.85}
          >
            <MaterialIcons name="call" size={20} color={theme.icono} />
            <Text style={styles.callText}>{tx.llamar911}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Ventana emergente con el mapa completo */}
      <Modal
        visible={vm.mapaVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={vm.cerrarMapa}
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

          {/* Barra superior: cerrar + a quién pertenece la ubicación */}
          <View style={styles.modalTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={vm.cerrarMapa}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tx.cerrarMapa}
            >
              <MaterialIcons name="close" size={20} color={theme.icono} />
              <Text style={styles.modalCloseText}>{tx.cerrarMapa}</Text>
            </TouchableOpacity>

            <View style={styles.modalTitlePill} pointerEvents="none">
              <Text style={styles.modalTitle} numberOfLines={1}>
                {tx.ubicacionDe} {vm.nombreUsuaria || tx.usuariaDefault}
              </Text>
              <Text style={styles.modalSub} numberOfLines={1}>
                {tx.actualizada} {hace}
              </Text>
            </View>
          </View>

          {/* Última coordenada */}
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