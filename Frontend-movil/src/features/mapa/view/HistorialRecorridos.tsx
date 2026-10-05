import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useAjustesViewModel } from "../../settings/viewModel/useAjustesViewModel";
import { useRecorridos } from "../../../contexts/RecorridosContext";
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

export default function HistorialRecorridos() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();
  const { mostrarRecorridos } = useAjustesViewModel();
  const { recorridos: recorridosManuales, eliminarRecorrido, toggleImportante } = useRecorridos();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Recorrido | null>(null);

  const todosLosRecorridos: Recorrido[] = recorridosManuales;

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
          onPress: () => eliminarRecorrido(id),
        },
      ]
    );
  };

  const toggleImportanteHandler = (id: string) => {
    toggleImportante(id);
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

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            // Navegar al mapa principal para ver recorridos
            navigation.navigate("DrawerHome", {
              screen: "Inicio",
              params: { screen: "Mapa" },
            } as never);
          }}
        >
          <MaterialIcons name="map" size={24} color="#fff" />
        </TouchableOpacity>
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
              Activa "Mostrar recorridos en mapa" en Ajustes
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
              <View style={styles.dateRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {item.fecha}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <MaterialIcons
                  name="schedule"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {item.tiempoEstimado}
                </Text>
                <MaterialIcons
                  name="straighten"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {item.distanciaEstimada}
                </Text>
              </View>

              <Text style={[styles.locationText, { color: "black" }]}>
                {item.nombrePersonalizado || `${item.barrioInicio} → ${item.barrioFin}`}
              </Text>

              <View style={styles.locationRow}>
                <MaterialIcons
                  name="place"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.dateText, { color: theme.contactSubtext }]}>
                  {formatearFecha(item.fecha)}
                </Text>
                
              </View>

              <View style={styles.locationRow}>
                <MaterialIcons
                  name="my-location"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.addressText, { color: "black" }]}>
                  {item.municipio}, {item.departamento}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleImportanteHandler(item.id)}
              >
                <MaterialIcons
                  name={item.importante ? "star" : "star-border"}
                  size={20}
                  color={item.importante ? "#FFD700" : theme.contactSubtext}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => confirmarEliminar(item.id, item.nombrePersonalizado || `${item.barrioInicio} → ${item.barrioFin}`)}
              >
                <MaterialIcons
                  name="delete"
                  size={20}
                  color="#F44336"
                />
              </TouchableOpacity>

              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.contactSubtext}
              />
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
                        value={formatearFecha(selectedItem.fecha)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="schedule"
                        label="Tiempo estimado"
                        value={selectedItem.tiempoEstimado}
                        theme={theme}
                      />
                      <InfoRow
                        icon="straighten"
                        label="Distancia"
                        value={selectedItem.distanciaEstimada}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label="Puntos registrados"
                        value={selectedItem.cantidadPuntos.toString()}
                        theme={theme}
                      />
                      <InfoRow
                        icon="home"
                        label="Barrio inicial"
                        value={selectedItem.barrioInicio}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-on"
                        label="Barrio final"
                        value={selectedItem.barrioFin}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-city"
                        label="Municipio"
                        value={`${selectedItem.municipio}, ${selectedItem.departamento}`}
                        theme={theme}
                      />
                    </View>

                    {/* MAPA PREVIEW CON POLYLINE */}
                    <View style={styles.mapPreview}>
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: selectedItem.puntos[0].latitude,
                          longitude: selectedItem.puntos[0].longitude,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        }}
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
                          pinColor="#4CAF50"
                        />

                        {/* Marcador de fin */}
                        <Marker
                          coordinate={selectedItem.puntos[selectedItem.puntos.length - 1]}
                          title="Fin"
                          pinColor="#F44336"
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
