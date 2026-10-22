import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "../../../components/mapa/MapaLibre";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { PuntoUbicacion } from "../../../services/alert-tracking.service";
import { createStyles } from "../style/alertaActivaStyle";
import { useAlertaActivaViewModel } from "../viewModel/useAlertaActivaViewModel";
import { useChatSobreTeclado } from "../../../hooks/useChatSobreTeclado";
import GrabacionAlerta from "../../grabacion/GrabacionAlerta";
import ChatAlerta, { RAPIDOS_DE_ELLA } from "../../chatAlerta/ChatAlerta";

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
  const teclado = useChatSobreTeclado();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, width, height, insets);
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
        ref={teclado.scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={[styles.mainContainer, { paddingBottom: teclado.alturaTeclado }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={teclado.alDesplazar}
        scrollEventThrottle={32}
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

        {/* Estado del envío: la usuaria tiene que saber si sus contactos ya fueron avisados */}
        <View style={[envioEstilos.caja, { borderColor: theme.icono, backgroundColor: theme.icono + (vm.envio.estado === "enviada" ? "14" : "22") }]}>
          {vm.envio.estado === "enviando" ? (
            <ActivityIndicator size="small" color={theme.icono} />
          ) : (
            <MaterialIcons name={vm.envio.estado === "enviada" ? "mark-email-read" : "error-outline"} size={22} color={theme.icono} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[envioEstilos.texto, { color: theme.text }]}>
              {vm.envio.estado === "enviada"
                ? t.alertaActiva.envio_enviada
                : vm.envio.estado === "fallida"
                  ? t.alertaActiva.envio_fallida
                  : vm.envio.intento > 1
                    ? t.alertaActiva.envio_reintentando
                        .replace("{n}", String(vm.envio.intento))
                        .replace("{total}", String(vm.envio.total))
                    : t.alertaActiva.envio_enviando}
            </Text>
            {vm.envio.estado === "fallida" && (
              <View style={envioEstilos.acciones}>
                <TouchableOpacity onPress={vm.reintentarEnvio} style={[envioEstilos.boton, { backgroundColor: theme.icono }]}>
                  <MaterialIcons name="refresh" size={16} color="#fff" />
                  <Text style={envioEstilos.botonTexto}>{t.alertaActiva.envio_reintentar}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Linking.openURL("tel:123").catch(() => {})}
                  style={[envioEstilos.boton, { borderColor: theme.icono, borderWidth: 1.5 }]}
                >
                  <MaterialIcons name="call" size={16} color={theme.icono} />
                  <Text style={[envioEstilos.botonTexto, { color: theme.icono }]}>{t.alertaActiva.envio_llamar}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

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
              <Text style={styles.locationText}>
                {vm.vistas.viendoAhora > 0
                  ? t.alertaActiva.viendo_ahora.replace("{n}", String(vm.vistas.viendoAhora))
                  : `${vm.vistas.total} ${vm.vistas.total === 1 ? t.alertaActiva.vista : t.alertaActiva.vistas}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Chat con los contactos: mensajes rápidos sin tener que hablar */}
        {/* Video/audio automático como evidencia (se sube cada 45 s) */}
        <GrabacionAlerta alertaId={vm.alertaId} />
        <View ref={teclado.chatRef} collapsable={false}>
          <ChatAlerta
            participante={vm.alertaId ? { tipo: "duena", alertaId: vm.alertaId } : null}
            activo
            soyElla
            titulo="Mensajes a tus contactos"
            rapidos={RAPIDOS_DE_ELLA}
            alEnfocar={teclado.alEnfocarChat}
          />
        </View>

        <TouchableOpacity style={styles.okButton} onPress={vm.abrirConfirmacion}>
          <MaterialIcons name="favorite" size={22} color={theme.headerText} />
          <Text style={styles.okButtonText}>{t.alertaActiva.estoyBien}</Text>
          <Text style={styles.okButtonSubtext}>{t.alertaActiva.estoyBienDescripcion}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callRow} onPress={vm.llamarEmergencias}>
          <MaterialIcons name="call" size={18} color={theme.icono} />
          <Text style={styles.callText}>{t.alertaActiva.llamar_numero.replace("{numero}", vm.numeroEmergencia)}</Text>
        </TouchableOpacity>

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

      {/* La alerta terminó en el servidor (venció, atendida o cancelada): ya no se envía la ubicación */}
      <Modal visible={!!vm.fin} transparent animationType="fade" onRequestClose={vm.salirTrasFin}>
        <View style={finEstilos.fondo}>
          <View style={[finEstilos.tarjeta, { backgroundColor: theme.containerBackground }]}>
            <View style={[finEstilos.icono, { backgroundColor: theme.icono + "22" }]}>
              <MaterialIcons name="timer-off" size={30} color={theme.icono} />
            </View>
            <Text style={[finEstilos.titulo, { color: theme.text }]}>{t.alertaActiva.fin_titulo}</Text>
            <Text style={[finEstilos.texto, { color: theme.text }]}>
              {vm.fin?.estado === "resolved"
                ? t.alertaActiva.fin_atendida
                : vm.fin?.estado === "cancelled"
                  ? t.alertaActiva.fin_cancelada
                  : t.alertaActiva.fin_vencida.replace("{min}", String(vm.fin?.minutos ?? ""))}
            </Text>
            <Text style={[finEstilos.pregunta, { color: theme.text }]}>{t.alertaActiva.fin_pregunta}</Text>
            <TouchableOpacity onPress={vm.activarOtraAlerta} style={[finEstilos.boton, { backgroundColor: theme.icono }]}>
              <MaterialIcons name="notifications-active" size={20} color="#fff" />
              <Text style={finEstilos.botonTexto}>{t.alertaActiva.fin_otra}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.salirTrasFin} style={[finEstilos.secundario, { borderColor: theme.icono }]}>
              <Text style={[finEstilos.secundarioTexto, { color: theme.icono }]}>{t.alertaActiva.fin_bien}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const finEstilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 24 },
  tarjeta: { borderRadius: 22, padding: 22, alignItems: "center" },
  icono: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 18, fontWeight: "800", marginTop: 12, textAlign: "center" },
  texto: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6 },
  pregunta: { fontSize: 15, fontWeight: "700", marginTop: 14, textAlign: "center" },
  boton: { alignSelf: "stretch", flexDirection: "row", gap: 8, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 14 },
  botonTexto: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secundario: { alignSelf: "stretch", height: 46, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 10 },
  secundarioTexto: { fontSize: 14, fontWeight: "700" },
});
const envioEstilos = StyleSheet.create({
  caja: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1.5, borderRadius: 16, padding: 12, marginTop: 12, marginHorizontal: 4 },
  texto: { fontSize: 13, fontWeight: "700", lineHeight: 19 },
  acciones: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  boton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  botonTexto: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
