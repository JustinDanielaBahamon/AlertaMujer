import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline } from "../../../components/mapa/MapaLibre";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useAjustesViewModel } from "../../settings/viewModel/useAjustesViewModel";
import { formatearFechaRecorrido, useRecorridos } from "../../../contexts/RecorridosContext";
import { descripcionLugar, obtenerLugar } from "../../../services/geocoding.service";
import { COLOR_PUNTO_A, COLOR_PUNTO_B } from "../coloresRecorrido";
import { styles } from "../styles/HistorialRecorridos.style";
import { Alert } from "react-native";

type PuntoGPS = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Recorrido = {
  id: string;
  fecha: string;
  tiempoEstimado: string;
  distanciaEstimada: string;
  barrioInicio: string;
  barrioFin: string;
  municipio: string;
  departamento: string;
  pais: string;
  puntos: PuntoGPS[];
  cantidadPuntos: number;
  esManual: boolean;
  nombrePersonalizado?: string;
  importante: boolean;
};

// Estilos extra: acciones en vertical (estrella arriba, borrar abajo) y botón de borrar más grande
const extra = StyleSheet.create({
  accionesVertical: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginLeft: 8,
  },
  botonEstrella: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  botonBorrar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(217,70,239,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});

const formatearCoordenada = (p?: { latitude: number; longitude: number }) =>
  p ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}` : "--";

// Recorridos guardados antes de que se guardara la dirección: su etiqueta es genérica
const ETIQUETA_GENERICA = /^(punto [ab]|inicio|fin)$/i;

type Direcciones = Record<string, { inicio?: string; fin?: string }>;

/**
 * Dirección y barrio de inicio y fin de cada recorrido. Si la etiqueta guardada ya los tiene se usa
 * tal cual; si es genérica ("Punto A") se buscan con las coordenadas, una consulta por segundo.
 */
function useDireccionesRecorridos(recorridos: Recorrido[]): Direcciones {
  const [direcciones, setDirecciones] = useState<Direcciones>({});

  useEffect(() => {
    let vivo = true;
    (async () => {
      for (const r of recorridos) {
        if (r.puntos.length === 0 || direcciones[r.id]) continue;
        const buscar = async (texto: string, p: PuntoGPS) => {
          if (!ETIQUETA_GENERICA.test(texto.trim())) return texto;
          const lugar = await obtenerLugar(p.latitude, p.longitude);
          await new Promise((res) => setTimeout(res, 1100));
          return lugar ? descripcionLugar(lugar) || undefined : undefined;
        };
        const inicio = await buscar(r.barrioInicio, r.puntos[0]);
        const fin = await buscar(r.barrioFin, r.puntos[r.puntos.length - 1]);
        if (!vivo) return;
        setDirecciones((prev) => ({ ...prev, [r.id]: { inicio, fin } }));
      }
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorridos]);

  return direcciones;
}

export default function HistorialRecorridos() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();
  const { mostrarRecorridos } = useAjustesViewModel();
  const { recorridos: recorridosManuales, eliminarRecorrido, toggleImportante } = useRecorridos();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Recorrido | null>(null);
  const mapaDetalleRef = useRef<MapView>(null);

  // Encuadra todo el recorrido (inicio, fin y los puntos intermedios) en el mapa del detalle
  const encuadrarRecorrido = () => {
    const puntos = selectedItem?.puntos ?? [];
    if (puntos.length < 2) return;
    mapaDetalleRef.current?.fitToCoordinates(
      puntos.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: false },
    );
  };

  const todosLosRecorridos: Recorrido[] = recorridosManuales;
  const direcciones = useDireccionesRecorridos(todosLosRecorridos);

  // Dirección de inicio o fin para mostrar; mientras se busca, la etiqueta guardada
  const direccionDe = (r: Recorrido, extremo: "inicio" | "fin") => {
    const encontrada = direcciones[r.id]?.[extremo];
    if (encontrada) return encontrada;
    const guardada = extremo === "inicio" ? r.barrioInicio : r.barrioFin;
    if (!ETIQUETA_GENERICA.test(guardada.trim())) return guardada;
    return direcciones[r.id] ? "Dirección no disponible" : "Buscando dirección…";
  };

  const confirmarEliminar = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar recorrido",
      `¿Estás segura de que quieres eliminar el recorrido "${nombre}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const resultado = await eliminarRecorrido(id);
            if (!resultado.ok && resultado.motivo) {
              Alert.alert("No se pudo eliminar", resultado.motivo);
            }
          },
        },
      ]
    );
  };

  const toggleImportanteHandler = async (id: string) => {
    const resultado = await toggleImportante(id);
    if (!resultado.ok && resultado.motivo) {
      Alert.alert("Límite alcanzado", resultado.motivo);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER MEJORADO */}
      <LinearGradient
        colors={[theme.headercolor1, theme.headercolor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.mapa.historial_recorridos}</Text>
          <Text style={styles.headerSubtitle}>
            {t.mapa.historial_recorridos_desc}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* LISTA DE HISTORIAL */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.historial_reciente}
        </Text>

        {!mostrarRecorridos ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <MaterialIcons name="location-off" size={48} color={theme.contactSubtext} />
            <Text style={[styles.emptyStateText, { color: theme.contactSubtext }]}>
              Los recorridos están ocultos
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.contactSubtext }]}>
              Activa «Mostrar recorridos en mapa» en Ajustes
            </Text>
          </View>
        ) : (
          todosLosRecorridos.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyCard, { backgroundColor: theme.card }]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.85}
            >
              <View style={styles.historyIcon}>
                <MaterialIcons name="route" size={24} color="#7B1DB2" />
              </View>

            <View style={styles.historyInfo}>
              <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={2}>
                {item.nombrePersonalizado || `${item.barrioInicio} → ${item.barrioFin}`}
              </Text>

              <View style={styles.dateRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {formatearFechaRecorrido(item.fecha)}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <MaterialIcons name="trip-origin" size={14} color={COLOR_PUNTO_A} />
                <Text
                  style={[styles.addressText, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {direccionDe(item, "inicio")}
                </Text>
              </View>

              <View style={[styles.locationRow, { marginTop: 4 }]}>
                <MaterialIcons name="flag" size={14} color={COLOR_PUNTO_B} />
                <Text
                  style={[styles.addressText, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {direccionDe(item, "fin")}
                </Text>
              </View>
            </View>

            {/* ACCIONES: estrella y borrar, una debajo de la otra */}
            <View style={extra.accionesVertical}>
              <TouchableOpacity
                style={extra.botonEstrella}
                onPress={() => toggleImportanteHandler(item.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={item.importante ? "star" : "star-border"}
                  size={28}
                  color={item.importante ? "#FFD700" : theme.contactSubtext}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={extra.botonBorrar}
                onPress={() =>
                  confirmarEliminar(
                    item.id,
                    item.nombrePersonalizado || `${item.barrioInicio} → ${item.barrioFin}`
                  )
                }
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={30} color={COLOR_PUNTO_B} />
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL DETALLE MEJORADO */}
      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedItem && (
                  <>
                    {/* HEADER DEL MODAL */}
                    <View style={styles.modalHeaderImproved}>
                      <View style={styles.modalIcon}>
                        <MaterialIcons name="route" size={32} color="#7B1DB2" />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedItem.nombrePersonalizado || `Recorrido #${selectedItem.id}`}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="calendar-today"
                        label="Fecha"
                        value={formatearFechaRecorrido(selectedItem.fecha, true)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="trip-origin"
                        label="Inicio"
                        value={direccionDe(selectedItem, "inicio")}
                        theme={theme}
                      />
                      <InfoRow
                        icon="flag"
                        label="Fin"
                        value={direccionDe(selectedItem, "fin")}
                        theme={theme}
                      />
                      {!!selectedItem.municipio && (
                        <InfoRow
                          icon="location-city"
                          label="Municipio"
                          value={[selectedItem.municipio, selectedItem.departamento].filter(Boolean).join(", ")}
                          theme={theme}
                        />
                      )}
                      <InfoRow
                        icon="straighten"
                        label="Distancia"
                        value={selectedItem.distanciaEstimada}
                        theme={theme}
                      />
                      <InfoRow
                        icon="schedule"
                        label="Tiempo a pie"
                        value={selectedItem.tiempoEstimado}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label="Coordenadas"
                        value={`${formatearCoordenada(selectedItem.puntos[0])} → ${formatearCoordenada(
                          selectedItem.puntos[selectedItem.puntos.length - 1],
                        )}`}
                        theme={theme}
                      />
                    </View>

                    {/* MAPA PREVIEW CON POLYLINE */}
                    <View style={styles.mapPreview}>
                      <MapView
                        ref={mapaDetalleRef}
                        style={styles.map}
                        initialRegion={{
                          latitude: selectedItem.puntos[0].latitude,
                          longitude: selectedItem.puntos[0].longitude,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        }}
                        onMapReady={encuadrarRecorrido}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                      >
                        {/* Línea del recorrido */}
                        <Polyline
                          coordinates={selectedItem.puntos.map(punto => ({
                            latitude: punto.latitude,
                            longitude: punto.longitude,
                          }))}
                          strokeWidth={4}
                          strokeColor="#7B1DB2"
                        />

                        {/* Marcador de inicio */}
                        <Marker
                          coordinate={selectedItem.puntos[0]}
                          title="Inicio"
                          pinColor={COLOR_PUNTO_A}
                        />

                        {/* Marcador de fin */}
                        <Marker
                          coordinate={selectedItem.puntos[selectedItem.puntos.length - 1]}
                          title="Fin"
                          pinColor={COLOR_PUNTO_B}
                        />
                      </MapView>
                    </View>

                    {/* BOTONES DE ACCIÓN */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.modalButtonSecondary]}
                        onPress={() => setSelectedItem(null)}
                      >
                        <MaterialIcons name="close" size={20} color={theme.text} />
                        <Text style={[styles.modalActionText, { color: theme.text }]}>
                          {t.modal.cerrar}
                        </Text>
                      </TouchableOpacity>

                     
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  theme: any;
};

function InfoRow({ icon, label, value, theme }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color="#7B1DB2" />
      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}