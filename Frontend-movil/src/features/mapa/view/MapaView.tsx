import React from "react";
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles/MapaStyles";
import { useMapaViewModel } from "../viewModel/useMapaViewModel";

export default function MapaView() {
  const {
    theme,
    t,
    location,
    fullscreen,
    setFullscreen,
    showClose,
    historial,
    destinoAlerta,
    coordenadaCentro,
    closeOpacity,
    ultimaActualizacion,
    acciones,
    handleMapPress,
    formatearHora,
    reintentarPermisos,
    irAClasificarZona,
    irAUbicacionesGuardadas,
  } = useMapaViewModel();

  // ─── PANTALLA DE CARGA ────────────────────────────────────────────────────
  if (!location) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons name="location-searching" size={48} color="#7B1DB2" />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {t.mapa.cargando}
        </Text>
        <TouchableOpacity style={styles.botonReintentar} onPress={reintentarPermisos}>
          <Text style={styles.botonReintentarTexto}>{t.mapa.intentar_nuevo}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── COMPONENTE MAPA ──────────────────────────────────────────────────────
  const mapComponent = (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: coordenadaCentro.latitude,
        longitude: coordenadaCentro.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      scrollEnabled={fullscreen}
      zoomEnabled={fullscreen}
      rotateEnabled={fullscreen}
      pitchEnabled={fullscreen}
      onPress={fullscreen ? handleMapPress : () => setFullscreen(true)}
    >
      <Marker coordinate={location} title={t.mapa.tu_ubicacion_marcador} pinColor="red" />

      {destinoAlerta && (
        <Marker
          coordinate={destinoAlerta.coordenada}
          title={t.mapa.direccion_alerta_marcador}
          description={destinoAlerta.direccion}
          pinColor="#7B1DB2"
        />
      )}

      {historial.map((pos, index) => (
        <Marker key={index} coordinate={pos} title={`${t.mapa.historial} ${index + 1}`} pinColor="#7B1DB2" />
      ))}
    </MapView>
  );

  return (
    <View style={[styles.contenedorPrincipal, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER GRADIENTE */}
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradiente}
        >
          <View style={styles.headerContenido}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloHeader}>{t.mapa.titulo}</Text>
              <Text style={styles.SubtituloHeader}>{t.mapa.subtitulo}</Text>
              <View style={styles.filaUbicacion}>
                <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.subtituloHeader}>
                  {location
                    ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
                    : t.mapa.obteniendo}
                </Text>
              </View>
            </View>
            <Image
              source={require("../../../../assets/imagesAlertaMujer/ScMapa/iconoUbi.png")}
              style={{ width: 100, height: 85, resizeMode: "cover" }}
            />
          </View>
        </LinearGradient>

        {/* MAPA */}
        <View style={styles.contenedorMapa}>{mapComponent}</View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.filaBotones}>
          {acciones.map((a) => (
            <TouchableOpacity key={a.label} style={styles.botonAccion} onPress={a.accion}>
              <View style={styles.circuloBoton}>
                <MaterialIcons name={a.icono} size={22} color="#7B1DB2" />
              </View>
              <Text style={[styles.labelBoton, { color: theme.text }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TARJETA COORDENADAS */}
        <View style={[styles.tarjetaCoordenadas, { backgroundColor: theme.card }]}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.columnaCoord}>
              <Text style={[styles.labelCoord, { color: theme.contactSubtext }]}>{t.mapa.latitud}</Text>
              <Text style={[styles.valorCoord, { color: theme.text }]}>{location.latitude.toFixed(5)}</Text>
            </View>
            <View style={styles.columnaCoord}>
              <Text style={[styles.labelCoord, { color: theme.contactSubtext }]}>{t.mapa.longitud}</Text>
              <Text style={[styles.valorCoord, { color: theme.text }]}>{location.longitude.toFixed(5)}</Text>
            </View>
          </View>

          <View style={styles.filaActivo}>
            <Text style={[styles.textoActualizacion, { color: theme.contactSubtext }]}>
              {t.mapa.ultima_actualizacion}{" "}
              {ultimaActualizacion ? `${t.inicio.hoy}, ${formatearHora(ultimaActualizacion)}` : "--"}
            </Text>
            <View style={styles.badgeActivo}>
              <View style={styles.puntoActivo} />
              <Text style={styles.textoActivo}>{t.mapa.activo}</Text>
            </View>
          </View>
        </View>

        {/* TÍTULO ACCIONES ADICIONALES */}
        <Text style={[styles.tituloHistorial, { color: theme.text }]}>
          {t.mapa.acciones_adicionales}
        </Text>

        {/* CLASIFICAR ZONAS */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAClasificarZona}
          activeOpacity={0.85}
          
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="flag" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.clasificar_zonas}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.clasificar_zonas_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

        {/* UBICACIONES GUARDADAS */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAUbicacionesGuardadas}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="bookmark" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.ubicaciones_guardadas}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.ubicaciones_guardadas_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL PANTALLA COMPLETA */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {mapComponent}
          {showClose && (
            <Animated.View style={[styles.botonCerrarMapa, { opacity: closeOpacity }]}>
              <TouchableWithoutFeedback onPress={() => setFullscreen(false)}>
                <Text style={styles.textoCerrar}>{t.mapa.cerrar_mapa}</Text>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}