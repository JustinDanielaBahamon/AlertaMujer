import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { styles } from "../styles/MapaStyles";
import { useMapaViewModel } from "../viewModel/useMapaViewModel";
import { useAjustesViewModel } from "../../settings/viewModel/useAjustesViewModel";
import { useRecorridos } from "../../../contexts/RecorridosContext";

export default function MapaView() {
  const navigation = useNavigation<any>();
  const { mostrarRecorridos } = useAjustesViewModel();
  const { recorridos } = useRecorridos();
  const [mostrarRecorridosEnMapa, setMostrarRecorridosEnMapa] = useState(true); // Activado por defecto
  const [soloImportantes, setSoloImportantes] = useState(false); // Mostrar todos por defecto

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
    acciones: accionesViewModel,
    handleMapPress,
    formatearHora,
    refrescarUbicacion,
    reintentarPermisos,
    irAUbicacionesGuardadas,
    irAZonasAuxiliares,
    irAHistorialRecorridos,
  } = useMapaViewModel() as any;

  const irAGuardarRecorrido = () => {
    navigation.navigate("GuardarRecorrido");
  };

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

  // ─── COORDENADA CENTRO Y ACCIONES LOCALES ─────────────────────────────────
  const centroCalculado = coordenadaCentro ?? destinoAlerta?.coordenada ?? location;

  // ─── DATOS DE RECORRIDOS SIMULADOS PARA EL MAPA PRINCIPAL ─────────────────
  const recorridosSimulados = [
    {
      id: "1",
      puntos: [
        { latitude: 2.9271, longitude: -75.2874 },
        { latitude: 2.9285, longitude: -75.2859 },
        { latitude: 2.9302, longitude: -75.2841 },
        { latitude: 2.9320, longitude: -75.2825 },
        { latitude: 2.9335, longitude: -75.2808 },
      ],
    },
    {
      id: "2",
      puntos: [
        { latitude: 2.9200, longitude: -75.2900 },
        { latitude: 2.9215, longitude: -75.2883 },
        { latitude: 2.9230, longitude: -75.2866 },
        { latitude: 2.9245, longitude: -75.2849 },
      ],
    },
  ];

  const acciones = [
    {
      icono: "share",
      label: t.mapa.compartir,
      accion: () => {
        console.log("Compartir ubicación");
      },
    },
    {
      icono: "refresh",
      label: t.mapa.actualizar,
      accion: refrescarUbicacion,
    },
    {
      icono: "navigation",
      label: t.mapa.navegar,
      accion: () => {
        if (location) {
          setFullscreen(true);
        }
      },
    },
    {
      icono: "bookmark",
      label: t.mapa.guardar,
      accion: () => {
        if (!location) return;
        navigation.navigate("ClasificarZona", {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      },
    },
  ] as const;

  // ─── COMPONENTE DEL MAPA ──────────────────────────────────────────────────
  const mapComponent = (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: centroCalculado.latitude,
        longitude: centroCalculado.longitude,
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

      {historial?.map((pos: any, index: number) => (
        <Marker key={index} coordinate={pos} title={`${t.mapa.historial} ${index + 1}`} pinColor="#7B1DB2" />
      ))}

      {/* Polylines de recorridos guardados cuando están activados */}
      {mostrarRecorridosEnMapa && recorridos.length > 0 && (
        recorridos
          .filter((recorrido: any) => !soloImportantes || recorrido.importante)
          .map((recorrido: any) => (
            <React.Fragment key={recorrido.id}>
              <Polyline
                coordinates={recorrido.puntos.map((punto: any) => ({
                  latitude: punto.latitude,
                  longitude: punto.longitude,
                }))}
                strokeWidth={2}
                strokeColor="#7B1DB2"
                lineCap="round"
                lineJoin="round"
              />
              
              {/* Texto del nombre del recorrido en el punto medio */}
              <Marker
                coordinate={recorrido.puntos[Math.floor(recorrido.puntos.length / 2)]}
                title={recorrido.nombrePersonalizado || `${recorrido.barrioInicio} → ${recorrido.barrioFin}`}
                description="Recorrido guardado"
              >
                <View style={styles.routeLabelContainer}>
                  <Text style={styles.routeLabelText}>
                    {recorrido.nombrePersonalizado || `${recorrido.barrioInicio} → ${recorrido.barrioFin}`}
                  </Text>
                </View>
              </Marker>
              
              {/* Marcador de inicio pequeño */}
              <Marker
                coordinate={recorrido.puntos[0]}
                pinColor="#4CAF50"
                title="Inicio"
              />
              
              {/* Marcador de fin pequeño */}
              <Marker
                coordinate={recorrido.puntos[recorrido.puntos.length - 1]}
                pinColor="#F44336"
                title="Fin"
              />
            </React.Fragment>
          ))
      )}
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
                {location
                  ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
                  : t.mapa.obteniendo}
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

        {/* SWITCH DE RECORRIDOS */}
        <View style={[styles.switchRecorridosContainer, { backgroundColor: theme.card }]}>
          <View style={styles.switchRecorridosInfo}>
            <MaterialIcons name="route" size={20} color="#7B1DB2" />
            <View style={styles.switchRecorridosText}>
              <Text style={[styles.switchRecorridosTitle, { color: theme.text }]}>
                Mostrar recorridos
              </Text>
              <Text style={[styles.switchRecorridosSubtitle, { color: theme.contactSubtext }]}>
                {recorridos.length} recorridos guardados
              </Text>
            </View>
          </View>
          <Switch
            value={mostrarRecorridosEnMapa}
            onValueChange={(value) => {
              setMostrarRecorridosEnMapa(value);
              console.log('Switch cambiado:', value);
            }}
            trackColor={{ false: '#ccc', true: theme.tabActiveColor }}
            thumbColor="#fff"
          />
        </View>

        {/* SWITCH DE SOLO IMPORTANTES */}
        {mostrarRecorridosEnMapa && (
          <View style={[styles.switchRecorridosContainer, { backgroundColor: theme.card }]}>
            <View style={styles.switchRecorridosInfo}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <View style={styles.switchRecorridosText}>
                <Text style={[styles.switchRecorridosTitle, { color: theme.text }]}>
                  Solo importantes
                </Text>
                <Text style={[styles.switchRecorridosSubtitle, { color: theme.contactSubtext }]}>
                  {recorridos.filter((r: any) => r.importante).length} importantes
                </Text>
              </View>
            </View>
            <Switch
              value={soloImportantes}
              onValueChange={setSoloImportantes}
              trackColor={{ false: '#ccc', true: theme.tabActiveColor }}
              thumbColor="#fff"
            />
          </View>
        )}

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

        {/* ZONAS AUXILIARES */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAZonasAuxiliares}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="shield" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.zonas_auxiliares}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.zonas_auxiliares_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext}/>
        </TouchableOpacity>

           {/* GUARDAR RECORRIDO */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAGuardarRecorrido}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="add-location-alt" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>Guardar Recorrido</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              Crea rutas de punto A a punto B
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

        {/* HISTORIAL DE RECORRIDOS */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAHistorialRecorridos}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="history" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.historial_recorridos}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.historial_recorridos_desc}
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